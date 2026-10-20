package com.mint.rebuilt;

import android.util.Base64;
import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.Closeable;
import java.io.EOFException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.IDN;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import javax.net.ssl.SSLHandshakeException;
import javax.net.ssl.SSLParameters;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;

/** App-scoped HTTP bridge for authenticated HTTP, HTTPS and SOCKS5 proxies. */
final class UpstreamProxy implements Closeable {
    private static final int MAX_CONNECTIONS=64;
    private static final int MAX_HEADER_BYTES=32768;
    private static final int IDLE_TIMEOUT_MS=300000;
    private final String protocol,host,authorization;
    private final int upstreamPort;
    private final byte[] username,password;
    private final ServerSocket listener;
    private final ExecutorService clients=pool("MintProxyRequest");
    private final ExecutorService responses=pool("MintProxyResponse");
    private final Set<Socket> sockets=Collections.newSetFromMap(new ConcurrentHashMap<Socket,Boolean>());
    private volatile boolean closed;
    private Thread acceptThread;

    static UpstreamProxy start(ProxyConfig config) throws IOException {
        final UpstreamProxy proxy=new UpstreamProxy(config);
        proxy.acceptThread=new Thread(new Runnable() {
            public void run() { proxy.accept(); }
        },"MintProxyAccept");
        proxy.acceptThread.setDaemon(true);
        proxy.acceptThread.start();
        return proxy;
    }

    private UpstreamProxy(ProxyConfig config) throws IOException {
        if(config==null)throw new IOException("Proxy configuration missing");
        protocol=config.protocol==null?"":config.protocol.toLowerCase(Locale.US);
        if(!"http".equals(protocol)&&!"https".equals(protocol)&&!"socks5".equals(protocol))throw new IOException("Unsupported proxy protocol");
        host=normalizeHost(config.host);
        upstreamPort=config.port;
        if(upstreamPort<1||upstreamPort>65535)throw new IOException("Invalid proxy port");
        String user=config.username==null?"":config.username;
        String pass=config.password==null?"":config.password;
        username=user.getBytes(StandardCharsets.UTF_8);
        password=pass.getBytes(StandardCharsets.UTF_8);
        if("socks5".equals(protocol)) {
            if((username.length!=0||password.length!=0)&&(username.length<1||username.length>255||password.length<1||password.length>255))
                throw new IOException("SOCKS5 credentials must contain 1 to 255 UTF-8 bytes each");
            authorization=null;
        } else {
            if(user.indexOf(':')>=0)throw new IOException("HTTP proxy username cannot contain a colon");
            if(username.length+password.length>8192)throw new IOException("Proxy credentials too long");
            authorization=(username.length==0&&password.length==0)?null:
                "Basic "+Base64.encodeToString((user+":"+pass).getBytes(StandardCharsets.UTF_8),Base64.NO_WRAP);
        }
        listener=new ServerSocket();
        try {
            listener.setReuseAddress(false);
            listener.bind(new InetSocketAddress(InetAddress.getByAddress(new byte[]{127,0,0,1}),0),32);
        } catch(IOException failure) { quiet(listener);throw failure; }
    }

    int port() { return listener.getLocalPort(); }

    private static ExecutorService pool(final String name) {
        final AtomicInteger count=new AtomicInteger();
        return new ThreadPoolExecutor(0,MAX_CONNECTIONS,30,TimeUnit.SECONDS,
            new SynchronousQueue<Runnable>(),new ThreadFactory() {
                public Thread newThread(Runnable action) {
                    Thread thread=new Thread(action,name+"-"+count.incrementAndGet());
                    thread.setDaemon(true);return thread;
                }
            },new ThreadPoolExecutor.AbortPolicy());
    }

    private void accept() {
        while(!closed) {
            try {
                final Socket client=listener.accept();
                if(closed) { quiet(client);break; }
                sockets.add(client);
                try { clients.execute(new Runnable() { public void run() { serve(client); } }); }
                catch(RejectedExecutionException busy) { error(client,503,"Busy");sockets.remove(client);quiet(client); }
            } catch(IOException unavailable) { if(!closed)close();break; }
        }
    }

    private void serve(final Socket client) {
        Channel remote=null;boolean connected=false;
        try {
            client.setTcpNoDelay(true);client.setSoTimeout(15000);
            final InputStream browserInput=new BufferedInputStream(client.getInputStream(),8192);
            String[] lines=readHeader(browserInput).split("\\r\\n");
            if(lines.length==0)throw new IOException("Missing request");
            final String[] request=lines[0].split(" ",3);
            if(request.length!=3||!request[0].matches("[A-Z!#$%&'*+.^_`|~-]+")
                ||!("HTTP/1.1".equals(request[2])||"HTTP/1.0".equals(request[2])))throw new IOException("Invalid request");
            final boolean tunnel="CONNECT".equals(request[0]);
            String destination;int destinationPort;URI uri=null;
            if(tunnel) {
                URI authority=new URI("https://"+request[1]);
                if(authority.getRawUserInfo()!=null||authority.getRawQuery()!=null||authority.getRawFragment()!=null
                    ||(authority.getRawPath()!=null&&!authority.getRawPath().isEmpty()))throw new IOException("Invalid CONNECT authority");
                destination=authority.getHost();destinationPort=authority.getPort()<0?443:authority.getPort();
            } else {
                uri=new URI(request[1]);
                if(!("http".equalsIgnoreCase(uri.getScheme())||"ws".equalsIgnoreCase(uri.getScheme()))
                    ||uri.getRawUserInfo()!=null||uri.getRawFragment()!=null)throw new IOException("Unsupported proxy request");
                destination=uri.getHost();destinationPort=uri.getPort()<0?80:uri.getPort();
            }
            destination=normalizeHost(destination);
            if(destinationPort<1||destinationPort>65535)throw new IOException("Invalid destination port");
            final boolean socks="socks5".equals(protocol);
            String outgoing=tunnel?null:forwardRequest(request,lines,uri,destination,destinationPort,!socks);
            remote=openProxy();
            if(socks)socksConnect(remote,destination,destinationPort);
            else if(tunnel)httpConnect(remote,destination,destinationPort);
            if(closed)throw new IOException("Proxy stopped");
            final Channel upstream=remote;
            if(tunnel) {
                client.getOutputStream().write("HTTP/1.1 200 Connection Established\r\n\r\n".getBytes(StandardCharsets.ISO_8859_1));
                client.getOutputStream().flush();
            } else {
                upstream.output.write(outgoing.getBytes(StandardCharsets.ISO_8859_1));upstream.output.flush();
            }
            upstream.socket.setSoTimeout(IDLE_TIMEOUT_MS);
            connected=true;client.setSoTimeout(0);
            final Future<?> response=responses.submit(new Runnable() {
                public void run() {
                    try {
                        if(!tunnel) {
                            // Forward informational responses immediately so
                            // Expect:100-continue uploads remain full duplex.
                            for(int interim=0;;interim++) {
                                if(interim>16)throw new IOException("Too many informational responses");
                                String first=readHeader(upstream.input);int code=status(first);
                                if(!socks&&code==407) { error(client,502,"Proxy authentication failed");return; }
                                client.getOutputStream().write(first.getBytes(StandardCharsets.ISO_8859_1));
                                client.getOutputStream().flush();
                                if(code<100||code>=200||code==101)break;
                            }
                        }
                        copy(upstream.input,client.getOutputStream());
                    } catch(IOException stopped) { }
                    finally { quiet(upstream.socket);quiet(client); }
                }
            });
            try {
                copy(browserInput,upstream.output);
                // TLS sockets may not support half-close; preserve a pending
                // response even when shutdownOutput is unavailable.
                try { upstream.socket.shutdownOutput(); } catch(IOException unsupported) { } catch(UnsupportedOperationException unsupportedTlsHalfClose) { }
                try { response.get(); } catch(Exception stopped) { }
            } finally { quiet(upstream.socket);quiet(client);response.cancel(true); }
        } catch(Exception failure) {
            if(!connected)error(client,502,"Configured proxy unavailable");
        } finally {
            sockets.remove(client);quiet(client);
            if(remote!=null) { sockets.remove(remote.socket);quiet(remote.socket); }
        }
    }

    private Channel openProxy() throws IOException {
        if(closed)throw new IOException("Proxy stopped");
        final long deadline=System.nanoTime()+TimeUnit.SECONDS.toNanos(15);
        Socket socket=new Socket();sockets.add(socket);
        try {
            socket.setTcpNoDelay(true);
            // Resolve only the configured upstream endpoint locally. The
            // destination hostname is always handed to that proxy unchanged.
            socket.connect(new InetSocketAddress(host,upstreamPort),remainingMillis(deadline,8000));
            socket.setSoTimeout(remainingMillis(deadline,8000));
            if("https".equals(protocol)) {
                Socket raw=socket;
                SSLSocket tls=(SSLSocket)((SSLSocketFactory)SSLSocketFactory.getDefault()).createSocket(raw,host,upstreamPort,true);
                socket=tls;sockets.add(socket);sockets.remove(raw);
                tls.setSoTimeout(remainingMillis(deadline,8000));
                // The API24 endpoint check is supplemented by explicit SAN
                // verification below, including on Android21-23.
                try {
                    SSLParameters parameters=tls.getSSLParameters();
                    SSLParameters.class.getMethod("setEndpointIdentificationAlgorithm",String.class).invoke(parameters,"HTTPS");
                    tls.setSSLParameters(parameters);
                } catch(ReflectiveOperationException unavailable) { }
                tls.startHandshake();
                verifyHostname(host,tls.getSession());
            }
            return new Channel(socket,deadline);
        } catch(IOException failure) { sockets.remove(socket);quiet(socket);throw failure; }
        catch(RuntimeException failure) { sockets.remove(socket);quiet(socket);throw failure; }
    }

    private void httpConnect(Channel upstream,String destination,int port) throws IOException {
        String authority=authority(destination,port);
        StringBuilder out=new StringBuilder("CONNECT ").append(authority).append(" HTTP/1.1\r\nHost: ").append(authority).append("\r\n");
        if(authorization!=null)out.append("Proxy-Authorization: ").append(authorization).append("\r\n");
        out.append("\r\n");
        upstream.socket.setSoTimeout(remainingMillis(upstream.deadline,8000));
        upstream.output.write(out.toString().getBytes(StandardCharsets.ISO_8859_1));upstream.output.flush();
        int code=status(readHeader(upstream.input));
        if(code<200||code>299)throw new IOException(code==407?"Proxy authentication failed":"Proxy CONNECT rejected");
    }

    private void socksConnect(Channel upstream,String destination,int port) throws IOException {
        boolean auth=username.length!=0||password.length!=0;
        OutputStream out=upstream.output;InputStream in=upstream.input;
        upstream.socket.setSoTimeout(remainingMillis(upstream.deadline,8000));
        out.write(new byte[]{5,1,(byte)(auth?2:0)});out.flush();
        if(readByte(in)!=5||readByte(in)!=(auth?2:0))throw new IOException("SOCKS5 authentication method rejected");
        if(auth) {
            ByteArrayOutputStream credentials=new ByteArrayOutputStream(username.length+password.length+3);
            credentials.write(1);credentials.write(username.length);credentials.write(username,0,username.length);
            credentials.write(password.length);credentials.write(password,0,password.length);
            out.write(credentials.toByteArray());out.flush();
            if(readByte(in)!=1||readByte(in)!=0)throw new IOException("SOCKS5 authentication failed");
        }
        upstream.socket.setSoTimeout(remainingMillis(upstream.deadline,8000));
        ByteArrayOutputStream command=new ByteArrayOutputStream(260);
        command.write(5);command.write(1);command.write(0);
        byte[] literal=numericAddress(destination);
        if(literal!=null) { command.write(literal.length==4?1:4);command.write(literal,0,literal.length); }
        else {
            byte[] domain=destination.getBytes(StandardCharsets.US_ASCII);
            if(domain.length<1||domain.length>255)throw new IOException("SOCKS5 destination too long");
            command.write(3);command.write(domain.length);command.write(domain,0,domain.length);
        }
        command.write((port>>>8)&255);command.write(port&255);out.write(command.toByteArray());out.flush();
        int version=readByte(in),reply=readByte(in),reserved=readByte(in),type=readByte(in);
        if(version!=5||reserved!=0||reply!=0)throw new IOException("SOCKS5 connection rejected");
        int length=type==1?4:type==4?16:type==3?readByte(in):-1;
        if(length<0)throw new IOException("Invalid SOCKS5 response");
        for(int i=0;i<length+2;i++)readByte(in);
    }

    private String forwardRequest(String[] request,String[] lines,URI uri,String destination,int port,boolean proxyForm) throws IOException {
        String path=uri.getRawPath();if(path==null||path.isEmpty())path="/";
        if(uri.getRawQuery()!=null)path+="?"+uri.getRawQuery();
        String hostHeader=destination.indexOf(':')>=0?"["+destination+"]":destination;
        if(port!=80)hostHeader+=":"+port;
        String target=proxyForm?"http://"+hostHeader+path:path;
        boolean upgrade=false,contentLength=false,transferEncoding=false;
        for(int i=1;i<lines.length;i++) {
            int colon=lines[i].indexOf(':');
            if(colon<1||Character.isWhitespace(lines[i].charAt(0)))throw new IOException("Invalid header");
            String key=lines[i].substring(0,colon).toLowerCase(Locale.US);
            if("upgrade".equals(key))upgrade=true;
            if("content-length".equals(key))contentLength=true;
            if("transfer-encoding".equals(key))transferEncoding=true;
        }
        if(contentLength&&transferEncoding)throw new IOException("Ambiguous body framing");
        StringBuilder out=new StringBuilder(request[0]).append(' ').append(target).append(' ').append(request[2]).append("\r\nHost: ").append(hostHeader).append("\r\n");
        for(int i=1;i<lines.length;i++) {
            String key=lines[i].substring(0,lines[i].indexOf(':')).toLowerCase(Locale.US);
            if("host".equals(key)||"proxy-connection".equals(key)||"proxy-authorization".equals(key)
                ||"keep-alive".equals(key)||(!upgrade&&"connection".equals(key)))continue;
            out.append(lines[i]).append("\r\n");
        }
        if(proxyForm&&authorization!=null)out.append("Proxy-Authorization: ").append(authorization).append("\r\n");
        if(!upgrade)out.append("Connection: close\r\n");
        return out.append("\r\n").toString();
    }

    private static String normalizeHost(String input) throws IOException {
        if(input==null)throw new IOException("Missing proxy host");
        String host=input.trim();
        if(host.startsWith("[")&&host.endsWith("]"))host=host.substring(1,host.length()-1);
        if(host.isEmpty()||host.length()>253||host.indexOf('/')>=0||host.indexOf('@')>=0||host.indexOf('?')>=0||host.indexOf('#')>=0)
            throw new IOException("Invalid proxy host");
        if(host.indexOf(':')>=0) {
            if(host.indexOf('%')>=0||!host.matches("[0-9a-fA-F:.]+")||numericAddress(host)==null)throw new IOException("Invalid IPv6 address");
            return host.toLowerCase(Locale.US);
        }
        try { return IDN.toASCII(host,IDN.USE_STD3_ASCII_RULES).toLowerCase(Locale.US); }
        catch(IllegalArgumentException invalid) { throw new IOException("Invalid proxy host",invalid); }
    }

    private static byte[] numericAddress(String host) throws IOException {
        if(host.indexOf(':')>=0) {
            if(host.indexOf('%')>=0||!host.matches("[0-9a-fA-F:.]+"))throw new IOException("Invalid IPv6 address");
            return InetAddress.getByName(host).getAddress(); // Literal only, never origin DNS.
        }
        if(!host.matches("[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+"))return null;
        String[] pieces=host.split("\\.");byte[] address=new byte[4];
        try { for(int i=0;i<4;i++) { int value=Integer.parseInt(pieces[i]);if(value>255)throw new NumberFormatException();address[i]=(byte)value; } }
        catch(NumberFormatException invalid) { throw new IOException("Invalid IPv4 address",invalid); }
        return address;
    }

    /** Default trust manager validates the chain; this validates the endpoint. */
    private static void verifyHostname(String host,SSLSession session) throws IOException {
        try {
            Certificate[] chain=session.getPeerCertificates();
            if(chain.length==0||!(chain[0] instanceof X509Certificate))throw new SSLHandshakeException("Missing proxy certificate");
            Collection<List<?>> names=((X509Certificate)chain[0]).getSubjectAlternativeNames();
            byte[] address=numericAddress(host);
            if(names!=null)for(List<?> name:names) {
                if(name.size()<2||!(name.get(0) instanceof Integer))continue;
                int type=((Integer)name.get(0)).intValue();Object value=name.get(1);
                if(address!=null&&type==7) {
                    byte[] certificateAddress=value instanceof byte[]?(byte[])value:value instanceof String?numericAddress((String)value):null;
                    if(certificateAddress!=null&&Arrays.equals(address,certificateAddress))return;
                } else if(address==null&&type==2&&value instanceof String&&matchesDns(host,(String)value))return;
            }
            throw new SSLHandshakeException("Proxy certificate hostname mismatch");
        } catch(IOException failure) { throw failure; }
        catch(Exception invalid) { throw new SSLHandshakeException("Invalid proxy certificate"); }
    }

    private static boolean matchesDns(String host,String pattern) {
        String name=host.toLowerCase(Locale.US),candidate=pattern.toLowerCase(Locale.US);
        if(name.endsWith("."))name=name.substring(0,name.length()-1);
        if(candidate.endsWith("."))candidate=candidate.substring(0,candidate.length()-1);
        if(!candidate.contains("*"))return name.equals(candidate);
        if(!candidate.startsWith("*.")||candidate.indexOf('*',1)>=0)return false;
        String suffix=candidate.substring(1);
        if(suffix.indexOf('.',1)<0||!name.endsWith(suffix))return false;
        String first=name.substring(0,name.length()-suffix.length());
        return !first.isEmpty()&&first.indexOf('.')<0;
    }

    private static String authority(String host,int port) { return (host.indexOf(':')>=0?"["+host+"]":host)+":"+port; }
    private static int status(String header) throws IOException {
        String first=header.substring(0,header.indexOf("\r\n"));String[] pieces=first.split(" ",3);
        if(pieces.length<2||!("HTTP/1.1".equals(pieces[0])||"HTTP/1.0".equals(pieces[0])))throw new IOException("Invalid proxy response");
        try { int result=Integer.parseInt(pieces[1]);if(result<100||result>599)throw new NumberFormatException();return result; }
        catch(NumberFormatException invalid) { throw new IOException("Invalid proxy status"); }
    }
    private static int readByte(InputStream input) throws IOException { int value=input.read();if(value<0)throw new EOFException("Proxy disconnected");return value; }
    private static String readHeader(InputStream input) throws IOException {
        ByteArrayOutputStream out=new ByteArrayOutputStream(1024);int tail=0;
        while(out.size()<MAX_HEADER_BYTES) {
            int value=readByte(input);if(value==0)throw new IOException("Invalid request byte");
            out.write(value);tail=(tail<<8)|(value&255);
            if(tail==0x0d0a0d0a)return new String(out.toByteArray(),StandardCharsets.ISO_8859_1);
        }
        throw new IOException("Header too large");
    }
    private static int remainingMillis(long deadline,int cap) throws IOException {
        long remaining=deadline-System.nanoTime();if(remaining<=0)throw new IOException("Proxy connection timed out");
        return (int)Math.min(cap,Math.max(1,TimeUnit.NANOSECONDS.toMillis(remaining)));
    }
    private static void copy(InputStream input,OutputStream output) throws IOException {
        byte[] buffer=new byte[32768];int count;
        while((count=input.read(buffer))!=-1)if(count>0) { output.write(buffer,0,count);output.flush(); }
    }
    private static void error(Socket client,int code,String message) {
        try {
            String response="HTTP/1.1 "+code+" "+message+"\r\nConnection: close\r\nContent-Length: 0\r\n\r\n";
            client.getOutputStream().write(response.getBytes(StandardCharsets.ISO_8859_1));client.getOutputStream().flush();
        } catch(IOException ignored) { }
    }
    public void close() {
        if(closed)return;closed=true;quiet(listener);
        for(Socket socket:sockets)quiet(socket);sockets.clear();clients.shutdownNow();responses.shutdownNow();
        if(acceptThread!=null)acceptThread.interrupt();
    }
    private static void quiet(Closeable resource) { if(resource!=null)try { resource.close(); } catch(IOException ignored) { } }
    private static final class Channel {
        final Socket socket;final InputStream input;final OutputStream output;final long deadline;
        Channel(Socket socket,long deadline) throws IOException {
            this.socket=socket;this.deadline=deadline;input=new BufferedInputStream(socket.getInputStream(),8192);output=socket.getOutputStream();
        }
    }
}

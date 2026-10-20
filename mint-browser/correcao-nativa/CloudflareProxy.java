package com.mint.rebuilt;

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
import java.net.Proxy;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
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
import java.util.concurrent.locks.ReentrantLock;
import javax.net.ssl.HttpsURLConnection;

/**
 * In-process transport for WebView's app-scoped proxy override. Only DNS is sent
 * to Cloudflare. HTTPS traffic remains an opaque, end-to-end TLS byte stream.
 * There is deliberately no platform-DNS fallback while the override is enabled.
 */
final class CloudflareProxy implements Closeable {
    private static final int MAX_CONNECTIONS = 64;
    private static final int MAX_HEADER_BYTES = 32768;
    private static final int IDLE_TIMEOUT_MS = 300000;
    private final ServerSocket listener;
    private final ExecutorService clients = pool("MintDnsRequest");
    private final ExecutorService responses = pool("MintDnsResponse");
    private final Set<Socket> sockets = Collections.newSetFromMap(new ConcurrentHashMap<Socket,Boolean>());
    private final Resolver resolver = new Resolver();
    private volatile boolean closed;
    private Thread acceptThread;

    static CloudflareProxy start() throws IOException {
        CloudflareProxy proxy = new CloudflareProxy();
        proxy.acceptThread = new Thread(new Runnable() {
            public void run() { proxy.accept(); }
        }, "MintDnsAccept");
        proxy.acceptThread.setDaemon(true);
        proxy.acceptThread.start();
        return proxy;
    }

    private CloudflareProxy() throws IOException {
        listener = new ServerSocket();
        try {
            listener.setReuseAddress(false);
            listener.bind(new InetSocketAddress(InetAddress.getByAddress(new byte[]{127,0,0,1}),0),32);
        } catch(IOException failure) {
            quiet(listener);
            throw failure;
        }
    }

    int port() { return listener.getLocalPort(); }

    private static ExecutorService pool(final String name) {
        final AtomicInteger count = new AtomicInteger();
        return new ThreadPoolExecutor(0,MAX_CONNECTIONS,30,TimeUnit.SECONDS,
            new SynchronousQueue<Runnable>(),new ThreadFactory() {
                public Thread newThread(Runnable action) {
                    Thread thread = new Thread(action,name+"-"+count.incrementAndGet());
                    thread.setDaemon(true);
                    return thread;
                }
            },new ThreadPoolExecutor.AbortPolicy());
    }

    private void accept() {
        while(!closed) {
            try {
                final Socket client = listener.accept();
                if(closed) { quiet(client);break; }
                sockets.add(client);
                try {
                    clients.execute(new Runnable() {
                        public void run() { serve(client); }
                    });
                } catch(RejectedExecutionException busy) {
                    error(client,503,"Busy");
                    sockets.remove(client);
                    quiet(client);
                }
            } catch(IOException unavailable) {
                if(!closed) close();
                break;
            }
        }
    }

    private void serve(final Socket client) {
        Socket remote = null;
        boolean connected = false;
        try {
            client.setTcpNoDelay(true);
            client.setSoTimeout(15000);
            final InputStream browserInput = new BufferedInputStream(client.getInputStream(),8192);
            String header = readHeader(browserInput);
            String[] lines = header.split("\\r\\n");
            if(lines.length==0)throw new IOException("Missing request");
            String[] request = lines[0].split(" ",3);
            if(request.length!=3||!request[0].matches("[A-Z!#$%&'*+.^_`|~-]+")
                ||!("HTTP/1.1".equals(request[2])||"HTTP/1.0".equals(request[2])))throw new IOException("Invalid request");
            final boolean tunnel = "CONNECT".equals(request[0]);
            String host;
            int port;
            URI uri = null;
            if(tunnel) {
                URI authority = new URI("https://"+request[1]);
                if(authority.getRawUserInfo()!=null||authority.getRawQuery()!=null||authority.getRawFragment()!=null
                    ||(authority.getRawPath()!=null&&!authority.getRawPath().isEmpty()))throw new IOException("Invalid authority");
                host = authority.getHost();
                port = authority.getPort()<0?443:authority.getPort();
            } else {
                uri = new URI(request[1]);
                if(!("http".equalsIgnoreCase(uri.getScheme())||"ws".equalsIgnoreCase(uri.getScheme()))||uri.getRawUserInfo()!=null||uri.getRawFragment()!=null)
                    throw new IOException("Unsupported proxy scheme");
                host = uri.getHost();
                port = uri.getPort()<0?80:uri.getPort();
            }
            if(host==null||host.isEmpty()||port<1||port>65535)throw new IOException("Invalid destination");
            if(host.startsWith("[")&&host.endsWith("]"))host=host.substring(1,host.length()-1);
            final String originHeader = tunnel?null:originRequest(request,lines,uri,host,port);
            remote = connect(host,port);
            if(closed)throw new IOException("Proxy stopped");
            sockets.add(remote);
            final Socket upstream = remote;
            if(tunnel) {
                client.getOutputStream().write("HTTP/1.1 200 Connection Established\r\n\r\n".getBytes(StandardCharsets.ISO_8859_1));
                client.getOutputStream().flush();
            } else {
                remote.getOutputStream().write(originHeader.getBytes(StandardCharsets.ISO_8859_1));
                remote.getOutputStream().flush();
            }
            connected=true;
            client.setSoTimeout(0);
            final Future<?> response = responses.submit(new Runnable() {
                public void run() {
                    try { copy(upstream.getInputStream(),client.getOutputStream()); }
                    catch(IOException stopped) { }
                    finally { quiet(upstream);quiet(client); }
                }
            });
            try {
                copy(browserInput,upstream.getOutputStream());
                try { upstream.shutdownOutput(); } catch(IOException alreadyClosed) { }
                // Preserve the response if the browser half-closes its request.
                try { response.get(); } catch(Exception stopped) { }
            } finally {
                quiet(upstream);
                quiet(client);
                response.cancel(true);
            }
        } catch(Exception failure) {
            if(!connected)error(client,502,"Cloudflare DNS unavailable");
        } finally {
            sockets.remove(client);
            if(remote!=null)sockets.remove(remote);
            quiet(remote);
            quiet(client);
        }
    }

    private Socket connect(String host,int port) throws IOException {
        final long deadline=System.nanoTime()+TimeUnit.SECONDS.toNanos(12);
        IOException failure=null;
        InetAddress numeric=Resolver.numeric(host);
        if(numeric!=null)return connectAddress(numeric,port,deadline,8000);
        List<InetAddress> ipv4=Collections.emptyList(),ipv6=Collections.emptyList();
        try { ipv4=resolver.lookup(host,1,deadline); }
        catch(IOException unavailable) { failure=unavailable; }
        int next4=0;
        // Give one IPv4 address a short head start, then try IPv6. Never spend
        // eight seconds on every A record before reaching a working IPv6 route.
        if(!ipv4.isEmpty()) {
            try { return connectAddress(ipv4.get(next4++),port,deadline,1500); }
            catch(IOException unavailable) { failure=unavailable; }
        }
        try { ipv6=resolver.lookup(host,28,deadline); }
        catch(IOException unavailable) { failure=unavailable; }
        int next6=0;
        while(next4<ipv4.size()||next6<ipv6.size()) {
            remainingMillis(deadline,2000);
            if(next6<ipv6.size()) {
                try { return connectAddress(ipv6.get(next6++),port,deadline,2000); }
                catch(IOException unavailable) { failure=unavailable; }
            }
            if(next4<ipv4.size()) {
                try { return connectAddress(ipv4.get(next4++),port,deadline,2000); }
                catch(IOException unavailable) { failure=unavailable; }
            }
        }
        throw failure!=null?failure:new IOException("DNS returned no usable address");
    }

    private Socket connectAddress(InetAddress address,int port,long deadline,int attemptTimeout) throws IOException {
        if(closed)throw new IOException("Proxy stopped");
        Socket socket=new Socket();
        sockets.add(socket);
        try {
            socket.setTcpNoDelay(true);
            socket.connect(new InetSocketAddress(address,port),remainingMillis(deadline,attemptTimeout));
            socket.setSoTimeout(IDLE_TIMEOUT_MS);
            return socket;
        } catch(IOException failure) {
            sockets.remove(socket);
            quiet(socket);
            throw failure;
        }
    }

    private static int remainingMillis(long deadline,int cap) throws IOException {
        long nanos=deadline-System.nanoTime();
        if(nanos<=0)throw new IOException("Cloudflare connection budget exhausted");
        long millis=TimeUnit.NANOSECONDS.toMillis(nanos);
        return (int)Math.min(cap,Math.max(1,millis));
    }

    private static String originRequest(String[] request,String[] lines,URI uri,String host,int port) throws IOException {
        String path=uri.getRawPath();if(path==null||path.isEmpty())path="/";
        if(uri.getRawQuery()!=null)path+="?"+uri.getRawQuery();
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
        String authority=host.indexOf(':')>=0?"["+host+"]":host;
        if(port!=80)authority+=":"+port;
        StringBuilder out=new StringBuilder(request[0]).append(' ').append(path).append(' ').append(request[2]).append("\r\nHost: ").append(authority).append("\r\n");
        for(int i=1;i<lines.length;i++) {
            String key=lines[i].substring(0,lines[i].indexOf(':')).toLowerCase(Locale.US);
            if("host".equals(key)||"proxy-connection".equals(key)||"proxy-authorization".equals(key)
                ||"keep-alive".equals(key)||(!upgrade&&"connection".equals(key)))continue;
            out.append(lines[i]).append("\r\n");
        }
        if(!upgrade)out.append("Connection: close\r\n");
        return out.append("\r\n").toString();
    }

    private static String readHeader(InputStream input) throws IOException {
        ByteArrayOutputStream out=new ByteArrayOutputStream(1024);
        int tail=0;
        while(out.size()<MAX_HEADER_BYTES) {
            int value=input.read();if(value<0)throw new EOFException("Incomplete request");
            if(value==0)throw new IOException("Invalid request byte");
            out.write(value);tail=(tail<<8)|(value&255);
            if(tail==0x0d0a0d0a)return new String(out.toByteArray(),StandardCharsets.ISO_8859_1);
        }
        throw new IOException("Request header too large");
    }

    private static void copy(InputStream input,OutputStream output) throws IOException {
        byte[] buffer=new byte[32768];int count;
        while((count=input.read(buffer))!=-1) {
            if(count>0) { output.write(buffer,0,count);output.flush(); }
        }
    }

    private static void error(Socket client,int code,String message) {
        try {
            String response="HTTP/1.1 "+code+" "+message+"\r\nConnection: close\r\nContent-Length: 0\r\n\r\n";
            client.getOutputStream().write(response.getBytes(StandardCharsets.ISO_8859_1));
            client.getOutputStream().flush();
        } catch(IOException ignored) { }
    }

    public void close() {
        if(closed)return;
        closed=true;
        quiet(listener);
        for(Socket socket:sockets)quiet(socket);
        sockets.clear();
        clients.shutdownNow();responses.shutdownNow();
        resolver.clear();
        if(acceptThread!=null)acceptThread.interrupt();
    }

    private static void quiet(Closeable resource) { if(resource!=null)try { resource.close(); } catch(IOException ignored) { } }

    /** Wire-format DNS avoids an external JSON/DNS library and bootstrap DNS. */
    private static final class Resolver {
        private final AtomicInteger ids=new AtomicInteger((int)System.nanoTime());
        private final Map<String,Answer> cache=new LinkedHashMap<String,Answer>(64,0.75f,true);
        private final ReentrantLock[] locks=new ReentrantLock[32];
        Resolver() { for(int i=0;i<locks.length;i++)locks[i]=new ReentrantLock(); }
        void clear() { synchronized(cache) { cache.clear(); } }
        List<InetAddress> lookup(String input,int type,long deadline) throws IOException {
            final String host;
            try { host=IDN.toASCII(input,IDN.USE_STD3_ASCII_RULES).toLowerCase(Locale.US); }
            catch(IllegalArgumentException invalid) { throw new IOException("Invalid DNS name",invalid); }
            String key=host+":"+type;
            ReentrantLock lock=locks[(key.hashCode()&0x7fffffff)%locks.length];
            try {
                long remaining=deadline-System.nanoTime();
                if(remaining<=0||!lock.tryLock(remaining,TimeUnit.NANOSECONDS))throw new IOException("DNS budget exhausted");
            } catch(InterruptedException interrupted) {
                Thread.currentThread().interrupt();throw new IOException("DNS interrupted",interrupted);
            }
            try {
                synchronized(cache) {
                    Answer hit=cache.get(key);
                    if(hit!=null&&System.nanoTime()<hit.expires)return hit.addresses;
                    cache.remove(key);
                }
                int id=ids.incrementAndGet()&65535;
                byte[] query=query(host,type,id);
                Answer answer=null;IOException failure=null;
                for(String endpoint:new String[]{"1.1.1.1","[2606:4700:4700::1111]","1.0.0.1","[2606:4700:4700::1001]"}) {
                    try { remainingMillis(deadline,2000);answer=parse(exchange(endpoint,query,deadline),id,type);break; }
                    catch(IOException unavailable) { failure=unavailable; }
                }
                if(answer==null)throw failure!=null?failure:new IOException("Cloudflare unavailable");
                if(answer.expires>System.nanoTime())synchronized(cache) {
                    cache.put(key,answer);
                    while(cache.size()>512)cache.remove(cache.keySet().iterator().next());
                }
                return answer.addresses;
            } finally { lock.unlock(); }
        }
        private static byte[] exchange(String endpoint,byte[] query,long deadline) throws IOException {
            HttpsURLConnection connection=(HttpsURLConnection)new URL("https://"+endpoint+"/dns-query").openConnection(Proxy.NO_PROXY);
            try {
                connection.setConnectTimeout(remainingMillis(deadline,1500));connection.setReadTimeout(remainingMillis(deadline,2000));
                connection.setRequestMethod("POST");connection.setDoOutput(true);connection.setUseCaches(false);
                connection.setInstanceFollowRedirects(false);
                connection.setRequestProperty("Accept","application/dns-message");
                connection.setRequestProperty("Content-Type","application/dns-message");
                connection.setFixedLengthStreamingMode(query.length);
                OutputStream output=connection.getOutputStream();
                try { output.write(query); } finally { output.close(); }
                connection.setReadTimeout(remainingMillis(deadline,2000));
                if(connection.getResponseCode()!=200)throw new IOException("DoH HTTP "+connection.getResponseCode());
                String contentType=connection.getContentType();
                if(contentType==null||!contentType.toLowerCase(Locale.US).startsWith("application/dns-message"))throw new IOException("Unexpected DoH content type");
                InputStream input=connection.getInputStream();
                try {
                    ByteArrayOutputStream out=new ByteArrayOutputStream(512);byte[] bytes=new byte[2048];int count;
                    while(true) {
                        connection.setReadTimeout(remainingMillis(deadline,2000));
                        count=input.read(bytes);if(count==-1)break;
                        if(out.size()+count>65535)throw new IOException("DNS response too large");
                        out.write(bytes,0,count);
                    }
                    return out.toByteArray();
                } finally { input.close(); }
            } finally { connection.disconnect(); }
        }
        private static byte[] query(String host,int type,int id) throws IOException {
            if(host.endsWith("."))host=host.substring(0,host.length()-1);
            if(host.isEmpty()||host.length()>253)throw new IOException("Invalid DNS length");
            ByteArrayOutputStream out=new ByteArrayOutputStream(256);
            word(out,id);word(out,0x0100);word(out,1);word(out,0);word(out,0);word(out,0);
            for(String label:host.split("\\.",-1)) {
                byte[] bytes=label.getBytes(StandardCharsets.US_ASCII);
                if(bytes.length==0||bytes.length>63)throw new IOException("Invalid DNS label");
                out.write(bytes.length);out.write(bytes,0,bytes.length);
            }
            out.write(0);word(out,type);word(out,1);return out.toByteArray();
        }
        private static Answer parse(byte[] message,int id,int type) throws IOException {
            if(message.length<12||u16(message,0)!=id||(u16(message,2)&0x8000)==0||(u16(message,2)&0x0200)!=0)throw new IOException("Invalid DNS response");
            int status=u16(message,2)&15;
            if(status!=0&&status!=3)throw new IOException("DNS status "+status);
            int offset=12;
            for(int i=0;i<u16(message,4);i++) { offset=skipName(message,offset);need(message,offset,4);offset+=4; }
            List<InetAddress> addresses=new ArrayList<InetAddress>();long ttl=300;
            for(int i=0;i<u16(message,6);i++) {
                offset=skipName(message,offset);need(message,offset,10);
                int recordType=u16(message,offset),recordClass=u16(message,offset+2);
                long recordTtl=((long)(message[offset+4]&255)<<24)|((long)(message[offset+5]&255)<<16)|((long)(message[offset+6]&255)<<8)|(message[offset+7]&255);
                int length=u16(message,offset+8);offset+=10;need(message,offset,length);
                if(recordClass==1)ttl=Math.min(ttl,recordTtl);
                if(recordClass==1&&recordType==type&&length==(type==1?4:16)) {
                    byte[] address=new byte[length];System.arraycopy(message,offset,address,0,length);
                    InetAddress numeric=InetAddress.getByAddress(address);
                    if(!addresses.contains(numeric))addresses.add(numeric);
                }
                offset+=length;
            }
            if(status==3||addresses.isEmpty())ttl=Math.min(ttl,15);
            return new Answer(Collections.unmodifiableList(addresses),System.nanoTime()+TimeUnit.SECONDS.toNanos(ttl));
        }
        private static int skipName(byte[] message,int offset) throws IOException {
            int labels=0;
            while(true) {
                need(message,offset,1);int count=message[offset++]&255;
                if(count==0)return offset;
                if((count&0xc0)==0xc0) {
                    need(message,offset,1);
                    int pointer=((count&63)<<8)|(message[offset]&255);
                    if(pointer>=message.length)throw new IOException("Invalid DNS compression");
                    return offset+1;
                }
                if((count&0xc0)!=0||++labels>127)throw new IOException("Invalid DNS name");
                need(message,offset,count);offset+=count;
            }
        }
        private static void need(byte[] message,int offset,int length) throws IOException {
            if(offset<0||length<0||offset>message.length-length)throw new IOException("Truncated DNS response");
        }
        private static int u16(byte[] message,int offset) throws IOException { need(message,offset,2);return ((message[offset]&255)<<8)|(message[offset+1]&255); }
        private static void word(ByteArrayOutputStream out,int value) { out.write((value>>>8)&255);out.write(value&255); }
        static InetAddress numeric(String host) throws IOException {
            if(host.indexOf(':')>=0) {
                if(host.indexOf('%')>=0||!host.matches("[0-9a-fA-F:.]+"))throw new IOException("Invalid IPv6 literal");
                return InetAddress.getByName(host); // The colon guarantees literal parsing; never a DNS lookup.
            }
            if(!host.matches("[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+"))return null;
            String[] pieces=host.split("\\.");byte[] address=new byte[4];
            try {
                for(int i=0;i<4;i++) { int value=Integer.parseInt(pieces[i]);if(value>255)throw new NumberFormatException();address[i]=(byte)value; }
            } catch(NumberFormatException invalid) { throw new IOException("Invalid IPv4 literal"); }
            return InetAddress.getByAddress(address);
        }
    }
    private static final class Answer {
        final List<InetAddress> addresses;final long expires;
        Answer(List<InetAddress> addresses,long expires) { this.addresses=addresses;this.expires=expires; }
    }
}

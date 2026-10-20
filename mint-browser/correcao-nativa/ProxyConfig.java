package com.mint.rebuilt;

import android.content.Context;
import java.net.IDN;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import org.json.JSONException;
import org.json.JSONObject;

/** Native-only immutable proxy settings. Never expose this object to page JavaScript. */
public final class ProxyConfig {
    public final boolean enabled;
    public final String protocol, host, username, password;
    public final int port;

    public ProxyConfig(String protocol, String host, int port, String username, String password) {
        this(true, protocol, host, port, username, password);
    }
    public ProxyConfig(boolean enabled, String protocol, String host, int port, String username, String password) {
        this.enabled=enabled;
        this.protocol=protocol==null?"http":protocol.trim().toLowerCase(Locale.US);
        if(!this.protocol.equals("http")&&!this.protocol.equals("https")&&!this.protocol.equals("socks5"))throw new IllegalArgumentException("Escolha HTTP, HTTPS ou SOCKS5.");
        this.host=normalizeHost(host);
        if(this.host.length()>0&&(port<1||port>65535))throw new IllegalArgumentException("Use uma porta de 1 a 65535.");
        if(this.host.length()==0&&(enabled||port<0||port>65535))throw new IllegalArgumentException("Defina o host e a porta do proxy antes de ativar.");
        this.port=port;
        this.username=username==null?"":username;
        this.password=password==null?"":password;
        if(this.username.length()>1024||this.password.length()>1024)throw new IllegalArgumentException("As credenciais do proxy devem ter até 1024 caracteres.");
        if(this.protocol.equals("socks5")) {
            int userBytes=this.username.getBytes(StandardCharsets.UTF_8).length, passBytes=this.password.getBytes(StandardCharsets.UTF_8).length;
            if(userBytes>255||passBytes>255||((userBytes==0)!=(passBytes==0)))throw new IllegalArgumentException("SOCKS5: informe usuário e senha juntos, com até 255 bytes UTF-8 em cada campo, ou deixe ambos vazios.");
        } else if(this.username.indexOf(':')>=0) throw new IllegalArgumentException("O usuário de um proxy HTTP ou HTTPS não pode conter dois-pontos.");
    }
    private static String normalizeHost(String raw) {
        String value=raw==null?"":raw.trim();
        if(value.length()==0)return "";
        if(value.startsWith("[")&&value.endsWith("]"))value=value.substring(1,value.length()-1);
        for(int i=0;i<value.length();i++)if(Character.isWhitespace(value.charAt(i))||Character.isISOControl(value.charAt(i)))throw new IllegalArgumentException("Informe somente o host ou IP, sem espaços.");
        if(value.indexOf('/')>=0||value.indexOf('\\')>=0||value.indexOf('@')>=0||value.indexOf('?')>=0||value.indexOf('#')>=0||value.indexOf('%')>=0)throw new IllegalArgumentException("Informe somente o host ou IP, sem protocolo, caminho ou credenciais.");
        try {
            if(value.indexOf(':')>=0) {
                URI ip=new URI("http://["+value+"]:1");
                if(ip.getHost()==null)throw new IllegalArgumentException();
                return value.toLowerCase(Locale.US);
            }
            String ascii=IDN.toASCII(value,IDN.USE_STD3_ASCII_RULES).toLowerCase(Locale.US);
            if(ascii.length()==0||ascii.length()>253)throw new IllegalArgumentException();
            return ascii;
        } catch(Exception invalid) { throw new IllegalArgumentException("Informe um host ou IP válido, sem incluir a porta."); }
    }
    public static ProxyConfig from(Context context) throws JSONException { return fromJson(new JSONObject(ConfigNative.json(context))); }
    public static ProxyConfig from(JSONObject json) throws JSONException { return fromJson(json); }
    public static ProxyConfig fromJson(JSONObject json) throws JSONException {
        Object enabled=json.has("proxyEnabled")?json.get("proxyEnabled"):Boolean.FALSE;
        Object port=json.has("proxyPort")?json.get("proxyPort"):Integer.valueOf(0);
        if(!(enabled instanceof Boolean)||!(port instanceof Integer))throw new IllegalArgumentException("Configuração de proxy inválida.");
        return new ProxyConfig(((Boolean)enabled).booleanValue(), string(json,"proxyProtocol","http"),string(json,"proxyHost",""),((Integer)port).intValue(),string(json,"proxyUsername",""),string(json,"proxyPassword",""));
    }
    private static String string(JSONObject json,String key,String fallback) throws JSONException {
        Object value=json.has(key)?json.get(key):fallback;
        if(!(value instanceof String))throw new IllegalArgumentException("Configuração de proxy inválida.");
        return (String)value;
    }
    public void writeTo(JSONObject json) throws JSONException {
        json.put("proxyEnabled",enabled);json.put("proxyProtocol",protocol);json.put("proxyHost",host);json.put("proxyPort",port);json.put("proxyUsername",username);json.put("proxyPassword",password);
    }
    public boolean sameSettings(ProxyConfig other) {
        return other!=null&&enabled==other.enabled&&port==other.port&&protocol.equals(other.protocol)&&host.equals(other.host)&&username.equals(other.username)&&password.equals(other.password);
    }
}

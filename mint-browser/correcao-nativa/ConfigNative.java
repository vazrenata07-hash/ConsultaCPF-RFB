package com.mint.rebuilt;

import android.app.Activity;
import android.content.Context;
import android.net.Uri;
import android.webkit.WebView;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Locale;
import org.json.JSONObject;

/** Native settings retain schema 2; page snapshots contain only explicitly allowed mod keys. */
public final class ConfigNative {
    private static String prefix;
    private static final String DEFAULT = "{\"usernameEnabled\":true,\"usernameLength\":15,\"usernameAlphanumeric\":true,\"passwordEnabled\":true,\"password\":\"\",\"pinEnabled\":true,\"pin\":\"\",\"historyEnabled\":true,\"historyRounds\":10,\"wagerEnabled\":true,\"proxyEnabled\":false,\"proxyProtocol\":\"http\",\"proxyHost\":\"\",\"proxyPort\":0,\"proxyUsername\":\"\",\"proxyPassword\":\"\"}";
    private static final String[] PROXY_KEYS={"proxyEnabled","proxyProtocol","proxyHost","proxyPort","proxyUsername","proxyPassword"};
    private ConfigNative() {}
    public static synchronized String json(Context c) {
        try {
            android.content.SharedPreferences prefs=c.getSharedPreferences("mint_custom_config",0);
            JSONObject current=new JSONObject(prefs.getString("json",DEFAULT));
            JSONObject defaults=new JSONObject(DEFAULT);
            boolean changed=false;
            // Preserve the existing one-time schema-2 credential migration.
            if(prefs.getInt("config_schema",0)<2) {current.put("password","");current.put("pin","");changed=true;}
            Object rounds=current.opt("historyRounds");
            if(!(rounds instanceof Integer)||((Integer)rounds).intValue()<1||((Integer)rounds).intValue()>100) {current.put("historyRounds",10);changed=true;}
            if(current.has("cloudflareDnsEnabled")){current.remove("cloudflareDnsEnabled");changed=true;}
            for(String key:PROXY_KEYS)if(!current.has(key)){current.put(key,defaults.get(key));changed=true;}
            String value=current.toString();
            if(changed)prefs.edit().putString("json",value).putInt("config_schema",2).commit();
            return value.replace("<","\\u003c");
        } catch(Exception invalid) {return DEFAULT;}
    }
    public static boolean restoreDefaults(Activity a){return save(a,DEFAULT);}
    public static synchronized boolean save(Activity a,String text) {
        try {
            JSONObject input=new JSONObject(text),previous=new JSONObject(json(a)),next=new JSONObject();
            String[] flags={"usernameEnabled","usernameAlphanumeric","passwordEnabled","pinEnabled","historyEnabled","wagerEnabled"};
            for(String key:flags){Object value=input.has(key)?input.get(key):previous.has(key)?previous.get(key):Boolean.TRUE;if(!(value instanceof Boolean))return false;next.put(key,value);}
            Object length=input.has("usernameLength")?input.get("usernameLength"):previous.opt("usernameLength");
            if(length==null)length=Integer.valueOf(15);
            if(!(length instanceof Integer)||((Integer)length).intValue()<1||((Integer)length).intValue()>64)return false;
            next.put("usernameLength",length);
            Object rounds=input.has("historyRounds")?input.get("historyRounds"):previous.opt("historyRounds");
            if(!(rounds instanceof Integer)||((Integer)rounds).intValue()<1||((Integer)rounds).intValue()>100)return false;
            next.put("historyRounds",rounds);
            Object password=input.has("password")?input.get("password"):previous.optString("password","");
            Object pin=input.has("pin")?input.get("pin"):previous.optString("pin","");
            if(!(password instanceof String)||!(pin instanceof String)||!(((String)pin).isEmpty()||((String)pin).matches("[0-9]{6}")))return false;
            next.put("password",password);next.put("pin",pin);
            JSONObject proxyValues=new JSONObject();
            for(String key:PROXY_KEYS)proxyValues.put(key,input.has(key)?input.get(key):previous.get(key));
            ProxyConfig proxy=ProxyConfig.fromJson(proxyValues),oldProxy=ProxyConfig.fromJson(previous);
            proxy.writeTo(next);
            if(!a.getSharedPreferences("mint_custom_config",0).edit().putString("json",next.toString()).putInt("config_schema",2).commit())return false;
            if(!proxy.sameSettings(oldProxy)) {
                boolean applied=false;
                try {applied=BrowserProxy.apply(a,proxy.enabled);}catch(Exception unavailable){}
                if(!applied) {
                    // Revert only proxy settings; other saved customizations stay intact.
                    oldProxy.writeTo(next);
                    a.getSharedPreferences("mint_custom_config",0).edit().putString("json",next.toString()).commit();
                    try {ConfigRegistry.changed(a);}catch(Exception ignored){}
                    return false;
                }
            }
            try {ConfigRegistry.changed(a);}catch(Exception ignored){}
            return true;
        }catch(Exception invalid){return false;}
    }
    private static String pageJson(Context context,boolean gameOnly) throws Exception {
        JSONObject input=new JSONObject(json(context)),safe=new JSONObject();
        if(!gameOnly){
            safe.put("usernameEnabled",input.optBoolean("usernameEnabled",true));safe.put("usernameLength",input.optInt("usernameLength",15));safe.put("usernameAlphanumeric",input.optBoolean("usernameAlphanumeric",true));
            safe.put("passwordEnabled",input.optBoolean("passwordEnabled",true));safe.put("password",input.optString("password",""));safe.put("pinEnabled",input.optBoolean("pinEnabled",true));safe.put("pin",input.optString("pin",""));
        }
        safe.put("historyEnabled",input.optBoolean("historyEnabled",true));safe.put("historyRounds",input.optInt("historyRounds",10));safe.put("wagerEnabled",input.optBoolean("wagerEnabled",true));
        // No proxy host, port, protocol, credentials or native-only flags enter page code.
        return safe.toString().replace("<","\\u003c");
    }
    public static String profile(WebView view,String source,boolean gameOnly) {
        try {
            if(prefix==null){InputStream in=view.getContext().getAssets().open("mint-config-prefix.js");try{ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] bytes=new byte[4096];int n;while((n=in.read(bytes))!=-1)out.write(bytes,0,n);prefix=out.toString("UTF-8");}finally{in.close();}}
            return prefix.replace("__MINT_CONFIG__",pageJson(view.getContext(),gameOnly))+source;
        }catch(Exception unavailable){return source;}
    }
    public static String prefixed(WebView view,String source) {
        try {String url=view.getUrl();if(url==null)return source;Uri uri=Uri.parse(url);String scheme=uri.getScheme();if(!"https".equalsIgnoreCase(scheme)&&!"http".equalsIgnoreCase(scheme))return source;String host=uri.getHost();if(host==null)return source;host=host.toLowerCase(Locale.US);if(host.equals("888pg.cc")||host.endsWith(".888pg.cc"))return profile(view,source,false);if(host.equals("brteachcor.com")||host.endsWith(".brteachcor.com"))return profile(view,source,true);}catch(Exception ignored){}
        return source;
    }
}

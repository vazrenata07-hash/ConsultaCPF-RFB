package com.mint.rebuilt;

import android.app.Activity;
import android.content.Context;
import android.net.Uri;
import android.webkit.WebView;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Locale;
import org.json.JSONObject;

/** Same JSON preference format as V26, shared by native controls and script snapshots. */
public final class ConfigNative {
    private static String prefix;
    private static final String DEFAULT = "{\"usernameEnabled\":true,\"usernameLength\":15,\"usernameAlphanumeric\":true,\"passwordEnabled\":true,\"password\":\"\",\"pinEnabled\":true,\"pin\":\"\",\"historyEnabled\":true,\"historyRounds\":10,\"wagerEnabled\":true,\"cloudflareDnsEnabled\":false}";
    private ConfigNative() {}
    public static synchronized String json(Context c) {
        try {
            android.content.SharedPreferences prefs=c.getSharedPreferences("mint_custom_config",0);
            String value=prefs.getString("json",DEFAULT);
            JSONObject current=new JSONObject(value);
            // Keep the existing schema-2 migration marker; V26.3 never clears
            // already-applied credentials or changes any existing switch value.
            boolean changed=false;
            if(prefs.getInt("config_schema",0)<2) {
                current.put("password","");current.put("pin","");changed=true;
            }
            Object rounds=current.opt("historyRounds");
            if(!(rounds instanceof Integer)||((Integer)rounds).intValue()<1||((Integer)rounds).intValue()>100) {
                current.put("historyRounds",10);changed=true;
            }
            if(!(current.opt("cloudflareDnsEnabled") instanceof Boolean)) {
                current.put("cloudflareDnsEnabled",false);changed=true;
            }
            value=current.toString();
            if(changed) prefs.edit().putString("json",value).putInt("config_schema",2).commit();
            return value.replace("<","\\u003c");
        } catch(Exception invalid) { return DEFAULT; }
    }
    public static boolean restoreDefaults(Activity a) { return save(a,DEFAULT); }
    public static synchronized boolean save(Activity a,String text) {
        try {
            JSONObject input=new JSONObject(text),previous=new JSONObject(json(a)),next=new JSONObject();
            String[] flags={"usernameEnabled","usernameAlphanumeric","passwordEnabled","pinEnabled","historyEnabled","wagerEnabled"};
            for(String key:flags) {
                Object value=input.has(key)?input.get(key):previous.has(key)?previous.get(key):Boolean.TRUE;
                if(!(value instanceof Boolean))return false;
                next.put(key,((Boolean)value).booleanValue());
            }
            Object length=input.has("usernameLength")?input.get("usernameLength"):previous.opt("usernameLength");
            if(length==null)length=Integer.valueOf(15);
            if(!(length instanceof Integer))return false;
            int count=((Integer)length).intValue();
            if(count<1||count>64)return false;
            next.put("usernameLength",count);
            Object rounds=input.has("historyRounds")?input.get("historyRounds"):previous.opt("historyRounds");
            if(!(rounds instanceof Integer))return false;
            int historyRounds=((Integer)rounds).intValue();
            if(historyRounds<1||historyRounds>100)return false;
            next.put("historyRounds",historyRounds);
            Object dns=input.has("cloudflareDnsEnabled")?input.get("cloudflareDnsEnabled"):previous.opt("cloudflareDnsEnabled");
            if(!(dns instanceof Boolean))return false;
            boolean dnsEnabled=((Boolean)dns).booleanValue();
            boolean dnsChanged=dnsEnabled!=previous.optBoolean("cloudflareDnsEnabled",false);
            next.put("cloudflareDnsEnabled",dnsEnabled);
            Object password=input.has("password")?input.get("password"):previous.optString("password","");
            Object pin=input.has("pin")?input.get("pin"):previous.optString("pin","");
            if(!(password instanceof String))return false;
            if(!(pin instanceof String)||!(((String)pin).isEmpty()||((String)pin).matches("[0-9]{6}")))return false;
            next.put("password",password);next.put("pin",pin);
            if(!a.getSharedPreferences("mint_custom_config",0).edit().putString("json",next.toString()).putInt("config_schema",2).commit())return false;
            if(dnsChanged && !BrowserDns.apply(a,dnsEnabled)) {
                // The preference listener must retain its previous checked state
                // if the installed WebView cannot support the actual DNS route.
                next.put("cloudflareDnsEnabled",previous.optBoolean("cloudflareDnsEnabled",false));
                a.getSharedPreferences("mint_custom_config",0).edit().putString("json",next.toString()).commit();
                try { ConfigRegistry.changed(a); } catch(Exception ignored) {}
                return false;
            }
            try { ConfigRegistry.changed(a); } catch(Exception liveUpdateUnavailable) { /* Persisted values also apply to new pages. */ }
            return true;
        } catch(Exception invalid) { return false; }
    }
    public static String profile(WebView view,String source,boolean gameOnly) {
        try {
            if(prefix==null) {
                InputStream in=view.getContext().getAssets().open("mint-config-prefix.js");
                try {
                    ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] bytes=new byte[4096];int n;
                    while((n=in.read(bytes))!=-1)out.write(bytes,0,n);
                    prefix=out.toString("UTF-8");
                } finally { in.close(); }
            }
            String value=json(view.getContext());
            if(gameOnly) {
                JSONObject input=new JSONObject(value),flags=new JSONObject();
                flags.put("historyEnabled",input.optBoolean("historyEnabled",true));
                flags.put("historyRounds",input.optInt("historyRounds",10));
                flags.put("wagerEnabled",input.optBoolean("wagerEnabled",true));
                value=flags.toString();
            }
            return prefix.replace("__MINT_CONFIG__",value)+source;
        } catch(Exception unavailable) { return source; }
    }
    public static String prefixed(WebView view,String source) {
        try {
            String url=view.getUrl();if(url==null)return source;
            Uri uri=Uri.parse(url);String scheme=uri.getScheme();
            if(!"https".equalsIgnoreCase(scheme)&&!"http".equalsIgnoreCase(scheme))return source;
            String host=uri.getHost();if(host==null)return source;host=host.toLowerCase(Locale.US);
            if(host.equals("888pg.cc")||host.endsWith(".888pg.cc"))return profile(view,source,false);
            if(host.equals("brteachcor.com")||host.endsWith(".brteachcor.com"))return profile(view,source,true);
        } catch(Exception unavailable) { }
        return source;
    }
}

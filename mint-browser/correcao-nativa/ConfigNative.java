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
    private static final String DEFAULT = "{\"usernameEnabled\":true,\"usernameLength\":15,\"usernameAlphanumeric\":true,\"passwordEnabled\":true,\"password\":\"\",\"pinEnabled\":true,\"pin\":\"\",\"historyEnabled\":true,\"wagerEnabled\":true}";
    private ConfigNative() {}
    public static synchronized String json(Context c) {
        try {
            android.content.SharedPreferences prefs=c.getSharedPreferences("mint_custom_config",0);
            String value=prefs.getString("json",DEFAULT);
            JSONObject current=new JSONObject(value);
            // This update starts both credential fields empty once. Later applied
            // credentials, switches and this marker survive the app's cleanup.
            if(prefs.getInt("config_schema",0)<2) {
                current.put("password","");current.put("pin","");
                value=current.toString();
                prefs.edit().putString("json",value).putInt("config_schema",2).commit();
            }
            return value.replace("<","\\u003c");
        } catch(Exception invalid) { return DEFAULT; }
    }
    public static boolean restoreDefaults(Activity a) { return save(a,DEFAULT); }
    public static synchronized boolean save(Activity a,String text) {
        try {
            JSONObject input=new JSONObject(text),next=new JSONObject();
            String[] flags={"usernameEnabled","usernameAlphanumeric","passwordEnabled","pinEnabled","historyEnabled","wagerEnabled"};
            for(String key:flags) {
                Object value=input.has(key)?input.get(key):Boolean.TRUE;
                if(!(value instanceof Boolean))return false;
                next.put(key,((Boolean)value).booleanValue());
            }
            Object length=input.has("usernameLength")?input.get("usernameLength"):Integer.valueOf(15);
            if(!(length instanceof Integer))return false;
            int count=((Integer)length).intValue();
            if(count<1||count>64)return false;
            next.put("usernameLength",count);
            Object password=input.has("password")?input.get("password"):"";
            Object pin=input.has("pin")?input.get("pin"):"";
            if(!(password instanceof String))return false;
            if(!(pin instanceof String)||!(((String)pin).isEmpty()||((String)pin).matches("[0-9]{6}")))return false;
            next.put("password",password);next.put("pin",pin);
            if(!a.getSharedPreferences("mint_custom_config",0).edit().putString("json",next.toString()).putInt("config_schema",2).commit())return false;
            try { ConfigRegistry.changed(a); } catch(RuntimeException liveUpdateUnavailable) { /* Persisted values also apply to new pages. */ }
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

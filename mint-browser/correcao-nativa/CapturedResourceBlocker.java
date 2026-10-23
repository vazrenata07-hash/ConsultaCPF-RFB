package com.mint.rebuilt;

import android.content.Context;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.WeakHashMap;
import org.json.JSONArray;
import org.json.JSONObject;

/** Exact captured image paths only; independent of the browser's native adblock switch. */
public final class CapturedResourceBlocker {
    private static final WeakHashMap<WebView,Boolean> TOP=new WeakHashMap<WebView,Boolean>();
    private static volatile Set<String> rules;
    private CapturedResourceBlocker(){}

    /** UI thread only. Never call WebView.getUrl from shouldInterceptRequest. */
    public static void track(WebView view){
        if(view==null)return;
        try{pageStarted(view,view.getUrl());}catch(Exception unavailable){}
    }
    /** The native page-start callback supplies the URL on the UI thread. */
    public static void pageStarted(WebView view,String url){
        if(view==null)return;
        boolean allowed=false;
        try{allowed=origin888(Uri.parse(url==null?"":url));}catch(Exception ignored){}
        synchronized(TOP){TOP.put(view,Boolean.valueOf(allowed));}
    }
    private static boolean origin888(Uri uri){
        String scheme=uri.getScheme(),host=uri.getHost();
        if((!"https".equalsIgnoreCase(scheme)&&!"http".equalsIgnoreCase(scheme))||host==null)return false;
        host=host.toLowerCase(Locale.US);
        return host.equals("888pg.cc")||host.endsWith(".888pg.cc");
    }
    private static boolean safeImagePath(String path){
        if(path==null||path.length()==0||path.charAt(0)!='/')return false;
        String lower=path.toLowerCase(Locale.US);
        if(lower.contains("geetest")||lower.contains("captcha")||lower.contains("turnstile")||lower.contains("hcaptcha")||lower.contains("yidun"))return false;
        return lower.endsWith(".png")||lower.endsWith(".jpg")||lower.endsWith(".jpeg")||lower.endsWith(".gif")||lower.endsWith(".webp")||lower.endsWith(".avif")||lower.endsWith(".svg");
    }
    public static WebResourceResponse intercept(WebView view,WebResourceRequest request){
        try{
            if(view==null||request==null||request.isForMainFrame())return null;
            String method=request.getMethod();
            if(!"GET".equalsIgnoreCase(method)&&!"HEAD".equalsIgnoreCase(method))return null;
            Uri url=request.getUrl();if(url==null)return null;
            String scheme=url.getScheme(),host=url.getHost(),path=url.getEncodedPath();
            if((!"https".equalsIgnoreCase(scheme)&&!"http".equalsIgnoreCase(scheme))||host==null||!safeImagePath(path))return null;
            host=host.toLowerCase(Locale.US);
            if(host.contains("geetest")||host.contains("captcha")||host.contains("turnstile")||host.contains("hcaptcha"))return null;
            Boolean top; synchronized(TOP){top=TOP.get(view);}
            if(Boolean.FALSE.equals(top))return null;
            boolean refAllowed=false,refPresent=false;
            Map<String,String> headers=request.getRequestHeaders();
            if(headers!=null)for(Map.Entry<String,String> header:headers.entrySet())if("referer".equalsIgnoreCase(header.getKey())){
                String value=header.getValue();if(value!=null&&value.length()>0){refPresent=true;refAllowed=origin888(Uri.parse(value));}break;
            }
            if(refPresent&&!refAllowed)return null;
            if(!Boolean.TRUE.equals(top)&&!refAllowed)return null;
            if(!load(view.getContext()).contains(host+"\n"+path))return null;
            Map<String,String> responseHeaders=new HashMap<String,String>();
            responseHeaders.put("Cache-Control","no-store");responseHeaders.put("Content-Length","0");
            return new WebResourceResponse("application/octet-stream","UTF-8",204,"No Content",responseHeaders,new ByteArrayInputStream(new byte[0]));
        }catch(Exception unavailable){return null;}
    }
    private static Set<String> load(Context context){
        Set<String> ready=rules;if(ready!=null)return ready;
        synchronized(CapturedResourceBlocker.class){
            if(rules!=null)return rules;
            Set<String> loaded=new HashSet<String>();
            try{
                InputStream in=context.getAssets().open("captured-resource-rules.json");
                String text;
                try{ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] buffer=new byte[2048];int count;while((count=in.read(buffer))!=-1){if(out.size()+count>65536)throw new IllegalArgumentException("Resource rules too large");out.write(buffer,0,count);}text=out.toString("UTF-8");}finally{in.close();}
                JSONArray entries=new JSONObject(text).getJSONArray("rules");
                for(int i=0;i<entries.length();i++){
                    JSONObject rule=entries.getJSONObject(i);String host=rule.getString("host").toLowerCase(Locale.US),path=rule.getString("path");
                    if(host.length()==0||host.contains("*")||host.contains("/")||host.contains(":")||host.contains("\n")||host.contains("\r")||!safeImagePath(path)||path.indexOf('?')>=0||path.indexOf('#')>=0)continue;
                    loaded.add(host+"\n"+path);
                }
            }catch(Exception unavailable){loaded.clear();}
            rules=Collections.unmodifiableSet(loaded);return rules;
        }
    }
}

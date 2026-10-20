package com.mint.rebuilt;

import android.app.Activity;
import android.content.Context;
import android.content.ContextWrapper;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.webkit.WebView;
import android.widget.Toast;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.WeakHashMap;
import java.util.concurrent.Executor;
import org.json.JSONObject;

/** Routes this application's WebViews through the configured upstream proxy. */
public final class BrowserProxy {
    private static boolean restored;
    private static volatile boolean pending, applied;
    private static int generation;
    private static UpstreamProxy running;
    private static ProxyConfig route;
    private static final Set<UpstreamProxy> servers = new HashSet<UpstreamProxy>();
    private static Object boundary;
    private static Class<?> boundaryType;
    private static final WeakHashMap<WebView,Runnable> waiting = new WeakHashMap<WebView,Runnable>();
    private static final Executor MAIN = new Executor() {
        public void execute(Runnable action) { new Handler(Looper.getMainLooper()).post(action); }
    };
    private BrowserProxy() {}

    public static boolean isEnabled(Context context) { return applied && !pending && running != null; }
    public static boolean isPending() { return pending; }

    public static synchronized void restore(Context context) {
        if (restored || context == null) return;
        restored = true;
        try {
            ProxyConfig config = ProxyConfig.from(context);
            if (config.enabled && !change(context,true)) persistOff(context);
        } catch (Exception unavailable) {
            persistOff(context);
            message(context,"Não foi possível carregar a configuração do proxy.");
        }
    }

    public static synchronized boolean apply(Context context, boolean enabled) {
        restored = true;
        return change(context,enabled);
    }

    public static void toggle(Context context) {
        Activity activity = activity(context);
        if (activity == null) { message(context,"Abra as configurações de proxy para continuar."); return; }
        try {
            ProxyConfig config = ProxyConfig.from(activity);
            if (!config.enabled && (config.host.length()==0 || config.port<1 || config.port>65535)) {
                ProxySettings.show(activity); return;
            }
            JSONObject next = new JSONObject(ConfigNative.json(activity));
            next.put("proxyEnabled",!config.enabled);
            if (ConfigNative.save(activity,next.toString())) {
                message(activity,config.enabled?"Proxy desativado. Recarregue a página.":"Ativando proxy. Recarregue a página.");
            }
        } catch (Exception invalid) {
            message(activity,"Confira a configuração do proxy.");
        }
    }

    public static Activity activity(Context context) {
        for(int i=0; context!=null && i<12; i++) {
            if(context instanceof Activity) return (Activity)context;
            if(!(context instanceof ContextWrapper)) break;
            Context next=((ContextWrapper)context).getBaseContext();
            if(next==context) break;
            context=next;
        }
        return null;
    }

    private static boolean same(ProxyConfig a, ProxyConfig b) {
        return a!=null && b!=null && a.port==b.port && a.protocol.equalsIgnoreCase(b.protocol)
            && a.host.equals(b.host) && a.username.equals(b.username) && a.password.equals(b.password);
    }

    private static boolean change(final Context context, boolean enabled) {
        UpstreamProxy candidate=null;
        final int previousGeneration=generation;
        final boolean wasPending=pending,wasApplied=applied;
        final UpstreamProxy previous=running;
        final ProxyConfig previousRoute=route;
        try {
            if(enabled) {
                final ProxyConfig config=ProxyConfig.from(context);
                if(running!=null && same(route,config)) return true;
                ensureBoundary();
                candidate=UpstreamProxy.start(config);
                final UpstreamProxy next=candidate;
                final int token=++generation;
                pending=true; applied=false;
                servers.add(next);
                String[][] rules=new String[][]{{"*","http://127.0.0.1:"+next.port()}};
                boundaryType.getMethod("setProxyOverride",String[][].class,String[].class,Runnable.class,Executor.class)
                    .invoke(boundary,rules,new String[0],new Runnable() {
                        public void run() { complete(token,next,true); }
                    },MAIN);
                running=next;route=config;
            } else {
                if(running==null && !pending && !applied) return true;
                ensureBoundary();
                final int token=++generation;
                pending=true;applied=false;
                boundaryType.getMethod("clearProxyOverride",Runnable.class,Executor.class)
                    .invoke(boundary,new Runnable() {
                        public void run() { complete(token,null,false); }
                    },MAIN);
                running=null;route=null;
            }
            ProxyToolbar.refresh(false);
            return true;
        } catch(Exception unavailable) {
            if(candidate!=null) { servers.remove(candidate);candidate.close(); }
            generation=previousGeneration;pending=wasPending;applied=wasApplied;
            running=previous;route=previousRoute;
            ProxyToolbar.refresh(isEnabled(context));
            // Avoid logging endpoint or credentials, including exception text.
            Log.w("MintBrowserProxy","WebView proxy configuration could not be applied");
            message(context,"Não foi possível aplicar o proxy. Confira a configuração e o Android System WebView.");
            return false;
        }
    }

    private static synchronized void complete(int token,UpstreamProxy current,boolean enabled) {
        if(token!=generation) return;
        pending=false;applied=enabled;running=current;
        for(UpstreamProxy server:new ArrayList<UpstreamProxy>(servers)) {
            if(server!=current) { server.close();servers.remove(server); }
        }
        ProxyToolbar.refresh(enabled);
        ArrayList<Runnable> ready=new ArrayList<Runnable>(waiting.values());waiting.clear();
        for(Runnable navigation:ready) try { navigation.run(); } catch(RuntimeException viewDestroyed) {
            Log.w("MintBrowserProxy","Deferred page no longer available");
        }
    }

    private static synchronized boolean defer(WebView view,Runnable action) {
        if(!pending) return false;
        waiting.put(view,action);return true;
    }

    // Defer only during the provider's asynchronous proxy transition. There is
    // no fixed delay; normal navigation and all script timings stay unchanged.
    public static boolean deferUrl(final WebView view, final String url, Map<String,String> headers) {
        if (!pending || url == null || url.regionMatches(true,0,"javascript:",0,11)) return false;
        final Map<String,String> copy = headers == null ? null : new HashMap<String,String>(headers);
        return defer(view, new Runnable() {
            public void run() { if (copy == null) view.loadUrl(url); else view.loadUrl(url, copy); }
        });
    }
    public static boolean deferRawData(final WebView view, final String data, final String mime, final String encoding) {
        if (!pending) return false;
        return defer(view, new Runnable() {
            public void run() { view.loadData(data,mime,encoding); }
        });
    }
    public static boolean deferData(final WebView view, final String base, final String data, final String mime, final String encoding, final String history) {
        if (!pending) return false;
        return defer(view, new Runnable() {
            public void run() { view.loadDataWithBaseURL(base,data,mime,encoding,history); }
        });
    }
    public static boolean deferPost(final WebView view, final String url, final byte[] data) {
        if (!pending) return false;
        return defer(view, new Runnable() { public void run() { view.postUrl(url,data); } });
    }
    public static void restoreOrQueue(final WebView view, final Bundle state) {
        if (!deferRestore(view,state)) view.restoreState(state);
    }
    public static boolean deferRestore(final WebView view, final Bundle state) {
        if (!pending) return false;
        return defer(view, new Runnable() { public void run() { view.restoreState(state); } });
    }
    public static boolean deferReload(final WebView view) {
        if (!pending) return false;
        return defer(view, new Runnable() { public void run() { view.reload(); } });
    }

    private static void ensureBoundary() throws Exception {
        if (boundary != null) return;
        // This is the same provider adapter used by PageScripts in this APK.
        Class<?> glue = Class.forName("androidx.webkit.c.e");
        Method factoryMethod = glue.getDeclaredMethod("d");
        factoryMethod.setAccessible(true);
        Object adapter = factoryMethod.invoke(null);
        Field field = adapter.getClass().getDeclaredField("a");
        field.setAccessible(true);
        Object factory = field.get(adapter);
        Class<?> factoryType = Class.forName("org.chromium.support_lib_boundary.WebViewProviderFactoryBoundaryInterface");
        String[] features = (String[])factoryType.getMethod("getSupportedFeatures").invoke(factory);
        boolean supported = false;
        for (String feature : features) {
            if ("PROXY_OVERRIDE".equals(feature) || "PROXY_OVERRIDE:3".equals(feature)) supported = true;
        }
        if (!supported) throw new UnsupportedOperationException("WebView PROXY_OVERRIDE unavailable");
        InvocationHandler handler = (InvocationHandler)factoryType.getMethod("getProxyController").invoke(factory);
        Class<?> type = Class.forName("org.chromium.support_lib_boundary.ProxyControllerBoundaryInterface");
        Object controller = Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type}, handler);
        boundaryType = type;
        boundary = controller;
    }

    private static void persistOff(Context context) {
        try {
            JSONObject config=new JSONObject(ConfigNative.json(context));
            config.put("proxyEnabled",false);
            context.getSharedPreferences("mint_custom_config",0).edit().putString("json",config.toString()).commit();
        } catch(Exception ignored) {}
        ProxyToolbar.refresh(false);
    }
    private static void message(final Context context,final String text) {
        if(context==null)return;
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            public void run() { Toast.makeText(context.getApplicationContext(),text,Toast.LENGTH_LONG).show(); }
        });
    }
}

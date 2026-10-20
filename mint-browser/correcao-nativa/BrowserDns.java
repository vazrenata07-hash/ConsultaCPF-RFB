package com.mint.rebuilt;

import android.app.Activity;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;
import android.widget.Toast;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.concurrent.Executor;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.WeakHashMap;
import org.json.JSONObject;

/** App-scoped WebView proxy; DNS is resolved by CloudflareProxy, never by script. */
public final class BrowserDns {
    private static boolean restored;
    private static CloudflareProxy running;
    private static Object boundary;
    private static Class<?> boundaryType;
    private static boolean pending;
    private static int generation;
    private static final WeakHashMap<WebView,Runnable> waiting = new WeakHashMap<WebView,Runnable>();
    private static final Executor MAIN = new Executor() {
        public void execute(Runnable command) { new Handler(Looper.getMainLooper()).post(command); }
    };
    private BrowserDns() {}

    /** Called from the WebView constructor hook, before its first navigation. */
    public static synchronized void restore(Context context) {
        if (restored || context == null) return;
        restored = true;
        try {
            if (new JSONObject(ConfigNative.json(context)).optBoolean("cloudflareDnsEnabled", false)) {
                if (!change(context, true)) persistOff(context);
            }
        } catch (Exception unavailable) {
            Log.w("MintBrowserDns", "DNS configuration unavailable", unavailable);
        }
    }

    /** Return false when the provider cannot apply the requested setting. */
    public static synchronized boolean apply(Activity activity, boolean enabled) {
        restored = true;
        return change(activity, enabled);
    }

    private static boolean change(final Context context, boolean enabled) {
        CloudflareProxy candidate = null;
        final int token = ++generation;
        try {
            if (enabled) {
                if (running != null) { --generation; return true; }
                ensureBoundary();
                candidate = CloudflareProxy.start();
                pending = true;
                String[][] rules = new String[][]{{"*", "http://127.0.0.1:" + candidate.port()}};
                boundaryType.getMethod("setProxyOverride", String[][].class, String[].class, Runnable.class, Executor.class)
                    .invoke(boundary, rules, new String[0], new Runnable() {
                        public void run() { complete(token); }
                    }, MAIN);
                running = candidate;
                return true;
            }
            if (running == null) { --generation; return true; }
            final CloudflareProxy previous = running;
            pending = true;
            boundaryType.getMethod("clearProxyOverride", Runnable.class, Executor.class)
                .invoke(boundary, new Runnable() {
                    public void run() { previous.close(); complete(token); }
                }, MAIN);
            running = null;
            return true;
        } catch (Exception unavailable) {
            if (candidate != null) candidate.close();
            complete(token);
            Log.w("MintBrowserDns", "WebView DNS proxy could not be changed", unavailable);
            new Handler(Looper.getMainLooper()).post(new Runnable() {
                public void run() {
                    Toast.makeText(context.getApplicationContext(),
                        "DNS Cloudflare indisponível. Atualize o Android System WebView e tente novamente.",
                        Toast.LENGTH_LONG).show();
                }
            });
            return false;
        }
    }

    private static synchronized void complete(int token) {
        if (token != generation) return;
        pending = false;
        ArrayList<Runnable> ready = new ArrayList<Runnable>(waiting.values());
        waiting.clear();
        // The proxy callbacks and native navigation hooks run on the UI thread.
        // Replay in this callback so a later navigation cannot be overwritten by
        // an older action posted back to the same event queue.
        for (Runnable navigation : ready) {
            try { navigation.run(); }
            catch (RuntimeException viewDestroyed) { Log.w("MintBrowserDns", "Deferred view unavailable", viewDestroyed); }
        }
    }

    private static synchronized boolean defer(WebView view, Runnable action) {
        if (!pending) return false;
        waiting.put(view, action);
        return true;
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
            JSONObject config = new JSONObject(ConfigNative.json(context));
            config.put("cloudflareDnsEnabled", false);
            context.getSharedPreferences("mint_custom_config", 0).edit().putString("json", config.toString()).commit();
        } catch (Exception ignored) {}
    }
}

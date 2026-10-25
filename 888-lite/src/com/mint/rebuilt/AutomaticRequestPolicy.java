package com.mint.rebuilt;

import android.net.Uri;
import android.os.SystemClock;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import java.io.ByteArrayInputStream;
import java.lang.ref.WeakReference;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Locale;
import java.util.Map;
import java.util.WeakHashMap;

/** Four exact automatic promotion requests; explicit manual actions get short permits. */
public final class AutomaticRequestPolicy {
    private static final Object LOCK = new Object();
    private static final long PERMIT_MS = 8000;
    private static final int LIMIT = 256;
    private static final String HOST = "cdnapiif.ppa888pg.vip";
    private static final String[] PATHS = {
        "/hall/api/active/tasks/newcomer_benefit_pop",
        "/hall/api/active/coupon/popList",
        "/hall/api/active/popRegressActive",
        "/hall/api/active/cutADeal/cut_a_deal_announcement"
    };
    private static final WeakHashMap<WebView,String> PAGES = new WeakHashMap<WebView,String>();
    private static final WeakHashMap<WebView,Boolean> ATTACHED = new WeakHashMap<WebView,Boolean>();
    private static final WeakHashMap<WebView,HashMap<String,Permit>> VIEW_PERMITS = new WeakHashMap<WebView,HashMap<String,Permit>>();
    private static final HashMap<String,Permit> WORKER_PERMITS = new HashMap<String,Permit>();
    private static final WeakHashMap<WebResourceRequest,Boolean> DECISIONS = new WeakHashMap<WebResourceRequest,Boolean>();
    private static final class Permit {
        final long expires;
        boolean nativeActual, nativeOptions, workerActual, workerOptions;
        Permit(long value) { expires = value; }
    }
    private AutomaticRequestPolicy() {}

    private static boolean page888(String value) { return PortScope.trusted(value); }
    private static String candidate(String value) {
        if (value == null || value.length() > 8192) return null;
        try {
            Uri uri = Uri.parse(value); String scheme = uri.getScheme();
            if ((!"https".equalsIgnoreCase(scheme) && !"http".equalsIgnoreCase(scheme)) || !PortScope.apiHost(uri.getHost())) return null;
            String path = uri.getEncodedPath();
            for (String expected : PATHS) if (expected.equals(path)) return HOST + "\n" + path;
        } catch (Exception invalid) { }
        return null;
    }
    private static String verb(String method) { return method == null ? "GET" : method.trim().toUpperCase(Locale.US); }
    private static String header(WebResourceRequest request, String name) {
        Map<String,String> headers = request.getRequestHeaders();
        if (headers != null) for (Map.Entry<String,String> entry : headers.entrySet()) if (name.equalsIgnoreCase(entry.getKey())) return entry.getValue();
        return null;
    }
    private static void purge(Map<String,Permit> permits, long now) {
        Iterator<Map.Entry<String,Permit>> iterator = permits.entrySet().iterator();
        while (iterator.hasNext()) if (iterator.next().getValue().expires <= now) iterator.remove();
    }
    public static void attach(WebView view) {
        if (view == null) return;
        synchronized (LOCK) {
            if (Boolean.TRUE.equals(ATTACHED.get(view))) return;
            ATTACHED.put(view, Boolean.TRUE);
            if (!PAGES.containsKey(view)) PAGES.put(view, "");
        }
        view.addJavascriptInterface(new Bridge(view), "MintAutomaticRequests");
    }
    /** Authoritative UI callback: never replace this with background getUrl(). */
    public static void pageStarted(WebView view, String url) {
        if (view == null) return;
        synchronized (LOCK) {
            String previous = PAGES.get(view);
            PAGES.put(view, url == null ? "" : url);
            if (previous == null || !previous.equals(url)) VIEW_PERMITS.remove(view);
            purge(WORKER_PERMITS, SystemClock.elapsedRealtime());
        }
    }
    private static boolean issue(WebView view, String url, String method) {
        String target = candidate(url), actual = verb(method);
        if (view == null || target == null || (!"GET".equals(actual) && !"POST".equals(actual) && !"HEAD".equals(actual))) return false;
        synchronized (LOCK) {
            if (!page888(PAGES.get(view))) return false;
            long now = SystemClock.elapsedRealtime();
            HashMap<String,Permit> permits = VIEW_PERMITS.get(view);
            if (permits == null) { permits = new HashMap<String,Permit>(); VIEW_PERMITS.put(view, permits); }
            purge(permits, now); purge(WORKER_PERMITS, now);
            String key = actual + "\n" + target;
            if ((!permits.containsKey(key) && permits.size() >= LIMIT) || (!WORKER_PERMITS.containsKey(key) && WORKER_PERMITS.size() >= LIMIT)) return false;
            Permit permit = new Permit(now + PERMIT_MS);
            permits.put(key, permit); WORKER_PERMITS.put(key, permit);
            return true;
        }
    }
    private static boolean consume(Map<String,Permit> permits, String target, String method, String preflightMethod, boolean worker) {
        long now = SystemClock.elapsedRealtime(); purge(permits, now);
        boolean options = "OPTIONS".equals(method);
        String actual = options ? verb(preflightMethod) : method;
        if (options && (preflightMethod == null || preflightMethod.length() == 0)) return false;
        Permit permit = permits.get(actual + "\n" + target);
        if (permit == null || permit.expires <= now) return false;
        // A single logical request can cross both WebView and service-worker
        // interception. Each layer acknowledges it once; OPTIONS is separate.
        if (worker) {
            if (options) { if (permit.workerOptions) return false; permit.workerOptions = true; }
            else { if (permit.workerActual) return false; permit.workerActual = true; }
        } else {
            if (options) { if (permit.nativeOptions) return false; permit.nativeOptions = true; }
            else { if (permit.nativeActual) return false; permit.nativeActual = true; }
        }
        return true;
    }
    public static WebResourceResponse intercept(WebView view, WebResourceRequest request) {
        try {
            if (view == null || request == null || request.isForMainFrame()) return null;
            Uri uri = request.getUrl(); String target = candidate(uri == null ? null : uri.toString());
            if (target == null) return null;
            synchronized (LOCK) {
                if (!page888(PAGES.get(view))) return null;
                Boolean prior = DECISIONS.get(request);
                if (prior != null) return prior.booleanValue() ? null : blockedResponse();
                HashMap<String,Permit> permits = VIEW_PERMITS.get(view);
                String method = verb(request.getMethod());
                boolean allowed = permits != null && consume(permits, target, method, header(request, "Access-Control-Request-Method"), false);
                DECISIONS.put(request, Boolean.valueOf(allowed));
                return allowed ? null : blockedResponse();
            }
        } catch (Exception unavailable) { return null; }
    }
    public static WebResourceResponse interceptWorker(WebResourceRequest request) {
        try {
            if (request == null || request.isForMainFrame() || !page888(header(request, "Referer"))) return null;
            Uri uri = request.getUrl(); String target = candidate(uri == null ? null : uri.toString());
            if (target == null) return null;
            synchronized (LOCK) {
                Boolean prior = DECISIONS.get(request);
                if (prior != null) return prior.booleanValue() ? null : blockedResponse();
                boolean allowed = consume(WORKER_PERMITS, target, verb(request.getMethod()), header(request, "Access-Control-Request-Method"), true);
                DECISIONS.put(request, Boolean.valueOf(allowed));
                return allowed ? null : blockedResponse();
            }
        } catch (Exception unavailable) { return null; }
    }
    private static WebResourceResponse blockedResponse() {
        byte[] body = "{\"blockedBy\":\"MintAutomaticRequests\"}".getBytes(StandardCharsets.UTF_8);
        HashMap<String,String> headers = new HashMap<String,String>();
        headers.put("Cache-Control", "no-store"); headers.put("Content-Length", String.valueOf(body.length));
        return new WebResourceResponse("application/json", "UTF-8", 403, "Blocked by Mint", headers, new ByteArrayInputStream(body));
    }
    public static final class Bridge {
        private final WeakReference<WebView> owner;
        Bridge(WebView view) { owner = new WeakReference<WebView>(view); }
        @JavascriptInterface public boolean permit(String url, String method) { return issue(owner.get(), url, method); }
    }
}

package com.mint.rebuilt;

import android.net.Uri;
import android.os.Build;
import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;
import java.util.Locale;
import java.util.Map;
import java.util.WeakHashMap;
import java.util.concurrent.ConcurrentHashMap;

/** The existing MintAdResources bridge, seeded with the replacement capture. */
public final class AdResources {
    private static final ConcurrentHashMap<String,Boolean> learned = new ConcurrentHashMap<String,Boolean>();
    private static final Set<String> captured = new HashSet<String>();
    private static volatile boolean workerInstalled;
    private static final WeakHashMap<WebView,Boolean> topPages = new WeakHashMap<WebView,Boolean>();
    static {
        String[] paths = {
            "/common/upload/1975778841919414274.avif",
            "/common/upload/2074396334160871425.avif",
            "/active/ActiveImg6209349987905338.avif",
            "/active/ActiveImg16149321187557365.avif",
            "/common/upload/1960623849435095042.avif",
            "/active/ActiveImg11755836762171453.avif",
            "/siteadmin/upload/img/1896064761045774337.avif",
            "/siteadmin/upload/img/1925138707392065538.avif",
            "/siteadmin/upload/img/1893861292589678593.avif",
            "/siteadmin/upload/img/1925138707392065538.gif",
            "/siteadmin/skin/lobby_asset/common/common/login/icon_zccgtc_yh.avif",
            "/siteadmin/skin/lobby_asset/common/common/login/icon_zccgtc_cz.avif"
        };
        for (String path : paths) {
            String normalized = "cdntoos.cf888pg.com\n" + path;
            captured.add(normalized);
            learned.put(normalized, Boolean.TRUE);
        }
    }
    public AdResources() {
        if (Build.VERSION.SDK_INT >= 24 && !workerInstalled) {
            synchronized (AdResources.class) {
                if (!workerInstalled) try { Api24.install(); workerInstalled = true; } catch (Throwable unavailable) { }
            }
        }
    }
    /** API isolation keeps the existing WebView path usable before Android 7. */
    private static final class Api24 {
        static void install() {
            ServiceWorkerController.getInstance().setServiceWorkerClient(new ServiceWorkerClient() {
                @Override public WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {
                    try {
                        WebResourceResponse policyResponse = AutomaticRequestPolicy.interceptWorker(request);
                        if (policyResponse != null) return policyResponse;
                        if (request == null || request.isForMainFrame()) return null;
                        String method = request.getMethod();
                        if (!"GET".equalsIgnoreCase(method) && !"HEAD".equalsIgnoreCase(method)) return null;
                        Uri uri = request.getUrl();
                        String normalized = key(uri == null ? null : uri.toString());
                        // A service worker has no WebView parameter. Only the twelve
                        // specific capture paths are eligible here; never learned URLs.
                        return normalized != null && captured.contains(normalized) ? response() : null;
                    } catch (Exception unavailable) { return null; }
                }
            });
        }
    }

    private static boolean origin888(String value) { return PortScope.trusted(value); }
    private static String key(String value) {
        if (value == null || value.length() == 0 || value.length() > 2048) return null;
        try {
            String lower = value.toLowerCase(Locale.US);
            if (lower.contains("captcha") || lower.contains("geetest") || lower.contains("geevisit") || lower.contains("turnstile") || lower.contains("yidun")) return null;
            Uri uri = Uri.parse(value);
            String scheme = uri.getScheme(), host = uri.getHost(), path = uri.getEncodedPath();
            if ((!"https".equalsIgnoreCase(scheme) && !"http".equalsIgnoreCase(scheme)) || host == null || path == null) return null;
            String suffix = path.toLowerCase(Locale.US);
            if (!(suffix.endsWith(".png") || suffix.endsWith(".jpg") || suffix.endsWith(".jpeg") || suffix.endsWith(".gif") || suffix.endsWith(".webp") || suffix.endsWith(".avif") || suffix.endsWith(".svg"))) return null;
            // The capture omits queries; generated cache/version parameters must not
            // evade exact captured artwork paths. Path case remains unchanged.
            String seeded = "cdntoos.cf888pg.com\n" + path;
            if (captured.contains(seeded)) return seeded;
            return host.toLowerCase(Locale.US) + "\n" + path;
        } catch (Exception invalid) { return null; }
    }
    @JavascriptInterface public void remember(String value) {
        String normalized = key(value);
        if (normalized == null || learned.containsKey(normalized)) return;
        synchronized (AdResources.class) {
            if (learned.size() < 2048) learned.put(normalized, Boolean.TRUE);
        }
    }
    /** Compatible with the original native adblock callback. */
    public static boolean blocked(String resource, String page) {
        String normalized = key(resource);
        return normalized != null && origin888(page) && learned.containsKey(normalized);
    }
    /** Called on the UI thread using the URL from the native page callback. */
    public static void pageStarted(WebView view, String page) {
        AutomaticRequestPolicy.pageStarted(view, page);
        if (view != null) synchronized (topPages) { topPages.put(view, Boolean.valueOf(origin888(page))); }
    }
    /** Request callbacks run off the UI thread: never read WebView.getUrl here. */
    public static WebResourceResponse intercept(WebView view, WebResourceRequest request) {
        try {
            WebResourceResponse policyResponse = AutomaticRequestPolicy.intercept(view, request);
            if (policyResponse != null) return policyResponse;
            if (view == null || request == null || request.isForMainFrame()) return null;
            String method = request.getMethod();
            if (!"GET".equalsIgnoreCase(method) && !"HEAD".equalsIgnoreCase(method)) return null;
            Uri uri = request.getUrl();
            String normalized = key(uri == null ? null : uri.toString());
            if (normalized == null || !learned.containsKey(normalized)) return null;
            Boolean top;
            synchronized (topPages) { top = topPages.get(view); }
            if (Boolean.FALSE.equals(top)) return null;
            // A CDN stylesheet may be its image's Referer. When the top page is
            // known to be 888, a different Referer must not disable the filter.
            if (!Boolean.TRUE.equals(top)) {
                boolean allowed = false;
                Map<String,String> headers = request.getRequestHeaders();
                if (headers != null) for (Map.Entry<String,String> header : headers.entrySet()) {
                    if ("referer".equalsIgnoreCase(header.getKey())) { allowed = origin888(header.getValue()); break; }
                }
                if (!allowed) return null;
            }
            return response();
        } catch (Exception unavailable) { return null; }
    }
    public static WebResourceResponse response() {
        Map<String,String> headers = new HashMap<String,String>();
        headers.put("Cache-Control", "no-store");
        headers.put("Content-Length", "0");
        if (Build.VERSION.SDK_INT < 21) return new WebResourceResponse("application/octet-stream", "UTF-8", new ByteArrayInputStream(new byte[0]));
        return new WebResourceResponse("application/octet-stream", "UTF-8", 204, "No Content", headers, new ByteArrayInputStream(new byte[0]));
    }
}

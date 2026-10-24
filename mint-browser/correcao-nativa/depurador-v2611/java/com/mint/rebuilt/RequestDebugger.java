package com.mint.rebuilt;

import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import java.io.ByteArrayInputStream;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.WeakHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.json.JSONArray;
import org.json.JSONObject;

/** App-local request/timer capture. This class never refreshes the page scripts. */
public final class RequestDebugger {
    private static final Object LOCK = new Object();
    private static final WeakHashMap<WebView,String> VIEWS = new WeakHashMap<WebView,String>();
    private static final WeakHashMap<WebView,Boolean> ATTACHED = new WeakHashMap<WebView,Boolean>();
    private static final ArrayList<JSONObject> EVENTS = new ArrayList<JSONObject>();
    private static final Pattern URL_IN_TEXT = Pattern.compile("https?://[^\\s\\\"'<>]+", Pattern.CASE_INSENSITIVE);
    private static Context app;
    private static boolean initialized, capture;
    private static JSONArray rules = new JSONArray();
    private static String page = "";
    private static long sequence;
    private RequestDebugger() {}

    private static void ensure(Context context) {
        synchronized (LOCK) {
            if (app == null && context != null) {
                app = context.getApplicationContext();
                if (app == null) app = context;
            }
            if (initialized || app == null) return;
            SharedPreferences prefs = app.getSharedPreferences("mint_custom_config", Context.MODE_PRIVATE);
            capture = prefs.getBoolean("debugger_capture", false);
            JSONArray loaded;
            try { loaded = new JSONArray(prefs.getString("debugger_rules", "[]")); }
            catch (Exception invalid) { loaded = new JSONArray(); }
            JSONArray valid = new JSONArray();
            for (int i = 0; i < loaded.length() && valid.length() < 256; i++) {
                try { valid.put(validate(loaded.getJSONObject(i))); } catch (Exception invalid) { }
            }
            rules = valid;
            initialized = true;
        }
    }
    private static String bounded(String text, int length) {
        if (text == null) return "";
        return text.length() > length ? text.substring(0, length) : text;
    }
    private static boolean origin888(String value) {
        try {
            Uri uri = Uri.parse(value == null ? "" : value);
            String scheme = uri.getScheme(), host = uri.getHost();
            if ((!"https".equalsIgnoreCase(scheme) && !"http".equalsIgnoreCase(scheme)) || host == null) return false;
            host = host.toLowerCase(Locale.US);
            return host.equals("888pg.cc") || host.endsWith(".888pg.cc");
        } catch (Exception invalid) { return false; }
    }
    /** Keeps host/path and query keys, removes credentials, query values and fragments. */
    private static String displayUrl(String value) {
        if (value == null || value.length() == 0) return "";
        try {
            Uri uri = Uri.parse(value);
            String scheme = uri.getScheme(), host = uri.getHost();
            if ((!"https".equalsIgnoreCase(scheme) && !"http".equalsIgnoreCase(scheme)) || host == null) {
                if ("data".equalsIgnoreCase(scheme)) return "data:[omitted]";
                if ("blob".equalsIgnoreCase(scheme)) return "blob:[omitted]";
                return bounded(value.split("[?#]", 2)[0], 2048);
            }
            StringBuilder out = new StringBuilder(scheme.toLowerCase(Locale.US)).append("://").append(host.toLowerCase(Locale.US));
            if (uri.getPort() != -1) out.append(':').append(uri.getPort());
            String path = uri.getEncodedPath(); out.append(path == null || path.length() == 0 ? "/" : path);
            String query = uri.getEncodedQuery();
            if (query != null && query.length() > 0) {
                String[] parts = query.split("&");
                for (int i = 0; i < parts.length && i < 32; i++) {
                    String key = parts[i].split("=", 2)[0];
                    out.append(i == 0 ? '?' : '&').append(bounded(key, 80)).append("=[redacted]");
                }
            }
            return bounded(out.toString(), 2048);
        } catch (Exception invalid) { return "[invalid URL]"; }
    }
    private static String displayText(String value, int length) {
        String text = bounded(value, length);
        Matcher matcher = URL_IN_TEXT.matcher(text);
        StringBuffer out = new StringBuffer();
        while (matcher.find()) matcher.appendReplacement(out, Matcher.quoteReplacement(displayUrl(matcher.group())));
        matcher.appendTail(out);
        return bounded(out.toString(), length);
    }
    private static JSONObject validate(JSONObject input) throws Exception {
        if (input == null) throw new IllegalArgumentException("Regra vazia");
        JSONObject rule = new JSONObject();
        String id = input.optString("id", "");
        if (id.length() == 0) id = UUID.randomUUID().toString();
        if (!id.matches("[A-Za-z0-9_.:-]{1,80}")) throw new IllegalArgumentException("ID inválido");
        String kind = input.optString("kind", "request");
        if (!"request".equals(kind) && !"timer".equals(kind)) throw new IllegalArgumentException("Tipo inválido");
        rule.put("id", id); rule.put("enabled", input.optBoolean("enabled", true)); rule.put("kind", kind);
        if ("request".equals(kind)) {
            String host = input.optString("host", "").trim().toLowerCase(Locale.US);
            String path = input.optString("path", "");
            String method = input.optString("method", "*").trim().toUpperCase(Locale.US);
            if (host.length() == 0 || host.length() > 253 || !host.matches("[a-z0-9.-]+") || host.startsWith(".") || host.endsWith(".") || host.contains("..")) throw new IllegalArgumentException("Host exato inválido");
            if (!host.equals(Uri.parse("https://" + host + "/").getHost())) throw new IllegalArgumentException("Host inválido");
            if (path.length() == 0 || path.length() > 2048 || !path.startsWith("/") || path.indexOf('?') >= 0 || path.indexOf('#') >= 0) throw new IllegalArgumentException("Caminho exato inválido");
            for (int i = 0; i < path.length(); i++) if (path.charAt(i) <= 32 || path.charAt(i) == 127) throw new IllegalArgumentException("Caminho exato inválido");
            if (!"*".equals(method) && !method.matches("[A-Z-]{1,24}")) throw new IllegalArgumentException("Método inválido");
            rule.put("host", host); rule.put("path", path); rule.put("method", method); rule.put("signature", new JSONArray());
        } else {
            JSONArray values = input.optJSONArray("signature");
            if (values == null) { values = new JSONArray(); String value = input.optString("signature", ""); if (value.length() > 0) values.put(value); }
            JSONArray signatures = new JSONArray();
            for (int i = 0; i < values.length() && signatures.length() < 32; i++) {
                String value = values.optString(i, "");
                if (!value.matches("[A-Za-z0-9_.:-]{1,128}")) throw new IllegalArgumentException("Assinatura inválida");
                signatures.put(value);
            }
            if (signatures.length() == 0) throw new IllegalArgumentException("Assinatura obrigatória");
            rule.put("signature", signatures); rule.put("host", ""); rule.put("path", ""); rule.put("method", "*");
        }
        return rule;
    }
    private static JSONObject configurationLocked() throws Exception {
        JSONObject value = new JSONObject();
        value.put("capture", capture); value.put("rules", new JSONArray(rules.toString()));
        return value;
    }
    public static String snapshot(Context context) {
        ensure(context);
        synchronized (LOCK) {
            try {
                JSONObject value = configurationLocked();
                JSONArray events = new JSONArray();
                for (JSONObject event : EVENTS) { JSONObject exported = new JSONObject(event.toString()); exported.remove("_identity"); events.put(exported); }
                value.put("events", events); value.put("page", page);
                return value.toString();
            } catch (Exception invalid) { return "{\"capture\":false,\"events\":[],\"rules\":[],\"page\":\"\"}"; }
        }
    }
    public static String exportJson(Context context) { return snapshot(context); }
    public static void configure(Context context, boolean enabled) {
        ensure(context);
        synchronized (LOCK) {
            capture = enabled;
            if (app != null) app.getSharedPreferences("mint_custom_config", Context.MODE_PRIVATE).edit().putBoolean("debugger_capture", enabled).apply();
        }
        reload();
    }
    public static void clear(Context context) { ensure(context); synchronized (LOCK) { EVENTS.clear(); } }
    public static String setRule(Context context, JSONObject input) {
        ensure(context);
        final JSONObject validated;
        try { validated = validate(input); } catch (Exception invalid) { throw new IllegalArgumentException(invalid.getMessage()); }
        String id = validated.optString("id");
        synchronized (LOCK) {
            JSONArray updated = new JSONArray(); boolean found = false;
            for (int i = 0; i < rules.length(); i++) {
                JSONObject existing = rules.optJSONObject(i);
                if (existing != null && id.equals(existing.optString("id"))) { updated.put(validated); found = true; }
                else if (existing != null) updated.put(existing);
            }
            if (!found) { if (updated.length() >= 256) throw new IllegalArgumentException("Limite de 256 regras"); updated.put(validated); }
            rules = updated; saveRulesLocked();
        }
        reload(); return id;
    }
    public static void removeRule(Context context, String id) {
        ensure(context);
        synchronized (LOCK) {
            JSONArray updated = new JSONArray();
            for (int i = 0; i < rules.length(); i++) { JSONObject existing = rules.optJSONObject(i); if (existing != null && !existing.optString("id").equals(id)) updated.put(existing); }
            rules = updated; saveRulesLocked();
        }
        reload();
    }
    private static void saveRulesLocked() {
        if (app != null) app.getSharedPreferences("mint_custom_config", Context.MODE_PRIVATE).edit().putString("debugger_rules", rules.toString()).apply();
    }
    public static void attach(WebView view) {
        if (view == null) return;
        ensure(view.getContext());
        synchronized (LOCK) { if (Boolean.TRUE.equals(ATTACHED.get(view))) return; ATTACHED.put(view, Boolean.TRUE); if (!VIEWS.containsKey(view)) VIEWS.put(view, ""); }
        view.addJavascriptInterface(new Bridge(view), "MintRequestDebugger");
    }
    public static void pageStarted(WebView view, String value) {
        if (view == null) return;
        ensure(view.getContext());
        synchronized (LOCK) { VIEWS.put(view, bounded(value, 8192)); if (origin888(value)) page = displayUrl(value); }
    }
    private static boolean allowed(WebView view, WebResourceRequest request) {
        String known;
        synchronized (LOCK) { known = VIEWS.get(view); }
        if (known != null && known.length() > 0) return origin888(known);
        Map<String,String> headers = request.getRequestHeaders();
        if (headers != null) for (Map.Entry<String,String> header : headers.entrySet()) if ("referer".equalsIgnoreCase(header.getKey())) return origin888(header.getValue());
        return false;
    }
    private static boolean matches(Uri uri, String method) {
        if (uri == null) return false;
        String scheme = uri.getScheme(), host = uri.getHost(), path = uri.getEncodedPath();
        if ((!"https".equalsIgnoreCase(scheme) && !"http".equalsIgnoreCase(scheme)) || host == null || path == null) return false;
        synchronized (LOCK) {
            for (int i = 0; i < rules.length(); i++) {
                JSONObject rule = rules.optJSONObject(i);
                if (rule == null || !rule.optBoolean("enabled", true) || !"request".equals(rule.optString("kind"))) continue;
                String verb = rule.optString("method", "*");
                if (host.equalsIgnoreCase(rule.optString("host")) && path.equals(rule.optString("path")) && ("*".equals(verb) || verb.equalsIgnoreCase(method))) return true;
            }
        }
        return false;
    }
    public static WebResourceResponse intercept(WebView view, WebResourceRequest request) {
        try {
            if (view == null || request == null || request.isForMainFrame()) return null;
            ensure(view.getContext());
            final boolean shouldCapture;
            synchronized (LOCK) { if (!capture && rules.length() == 0) return null; shouldCapture = capture; }
            if (!allowed(view, request)) return null;
            Uri uri = request.getUrl(); String method = bounded(request.getMethod(), 24).toUpperCase(Locale.US);
            boolean blocked = matches(uri, method);
            if (shouldCapture) {
                JSONObject event = new JSONObject();
                String current; synchronized (LOCK) { current = VIEWS.get(view); }
                event.put("kind", "request"); event.put("api", "native"); event.put("url", uri == null ? "" : uri.toString()); event.put("method", method); event.put("page", current == null ? "" : current); event.put("blocked", blocked);
                recordEvent(event);
            }
            return blocked ? emptyResponse() : null;
        } catch (Exception unavailable) { return null; }
    }
    /** Worker requests have no WebView: require an explicit 888 Referer. */
    public static WebResourceResponse interceptWorker(WebResourceRequest request) {
        try {
            if (request == null || request.isForMainFrame()) return null;
            final boolean shouldCapture;
            synchronized (LOCK) { if (!capture && rules.length() == 0) return null; shouldCapture = capture; }
            String ref = ""; Map<String,String> headers = request.getRequestHeaders();
            if (headers != null) for (Map.Entry<String,String> header : headers.entrySet()) if ("referer".equalsIgnoreCase(header.getKey())) { ref = header.getValue(); break; }
            if (!origin888(ref)) return null;
            Uri uri = request.getUrl(); String method = bounded(request.getMethod(), 24).toUpperCase(Locale.US);
            boolean blocked = matches(uri, method);
            if (shouldCapture) {
                JSONObject event = new JSONObject(); event.put("kind", "request"); event.put("api", "service-worker"); event.put("url", uri == null ? "" : uri.toString()); event.put("method", method); event.put("page", ref); event.put("blocked", blocked); recordEvent(event);
            }
            return blocked ? emptyResponse() : null;
        } catch (Exception unavailable) { return null; }
    }
    private static WebResourceResponse emptyResponse() {
        Map<String,String> headers = new HashMap<String,String>(); headers.put("Cache-Control", "no-store"); headers.put("Content-Length", "0");
        return new WebResourceResponse("application/octet-stream", "UTF-8", 204, "No Content", headers, new ByteArrayInputStream(new byte[0]));
    }
    private static JSONArray maskedLinks(JSONArray input) throws Exception {
        JSONArray output = new JSONArray();
        if (input == null) return output;
        for (int i = 0; i < input.length() && output.length() < 12; i++) {
            JSONObject item = input.optJSONObject(i);
            if (item == null) output.put(displayUrl(input.optString(i, "")));
            else { JSONObject link = new JSONObject(); link.put("id", bounded(item.optString("id", ""), 80)); link.put("url", displayUrl(item.optString("url", ""))); output.put(link); }
        }
        return output;
    }
    private static void recordEvent(JSONObject input) {
        synchronized (LOCK) {
            if (!capture) return;
            try {
                String kind = input.optString("kind", "request");
                if (!"request".equals(kind) && !"timer".equals(kind) && !"popup".equals(kind)) return;
                JSONObject event = new JSONObject();
                event.put("kind", kind); event.put("api", bounded(input.optString("api", ""), 48));
                String rawUrl = input.optString("url", "");
                event.put("url", displayUrl(rawUrl)); event.put("method", bounded(input.optString("method", ""), 24));
                String host = "", path = "";
                try { Uri parsed = Uri.parse(rawUrl); String scheme = parsed.getScheme(); if (("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) && parsed.getHost() != null) { host = bounded(parsed.getHost().toLowerCase(Locale.US), 253); path = bounded(parsed.getEncodedPath(), 2048); } } catch (Exception invalidUrl) { }
                event.put("host", host); event.put("path", path);
                if ("popup".equals(kind)) {
                    event.put("selector", displayText(input.optString("selector", ""), 800));
                    JSONArray assetInput = input.optJSONArray("assets"); if (assetInput == null) assetInput = input.optJSONArray("images");
                    JSONArray recentInput = input.optJSONArray("recentRequests"); if (recentInput == null) recentInput = input.optJSONArray("nearbyRequests");
                    JSONArray assets = maskedLinks(assetInput), recent = maskedLinks(recentInput);
                    event.put("assets", assets); event.put("images", assets); event.put("recentRequests", recent); event.put("nearbyRequests", recent); event.put("correlationOnly", input.optBoolean("correlationOnly", true));
                }
                event.put("page", displayUrl(input.optString("page", ""))); event.put("stack", displayText(input.optString("stack", ""), 4096));
                event.put("signature", bounded(input.optString("signature", ""), 128));
                event.put("delay", Math.max(0, Math.min(86400000L, input.optLong("delay", 0))));
                event.put("blocked", input.optBoolean("blocked", false)); event.put("time", System.currentTimeMillis());
                String identity = kind + "\n" + event.optString("api") + "\n" + event.optString("url") + "\n" + event.optString("method") + "\n" + event.optString("page") + "\n" + event.optString("signature") + "\n" + event.optLong("delay") + "\n" + event.optBoolean("blocked") + ("popup".equals(kind) ? "\n" + event.optString("selector") : "");
                for (int i = EVENTS.size() - 1; i >= 0; i--) {
                    JSONObject existing = EVENTS.get(i);
                    if (identity.equals(existing.optString("_identity"))) { existing.put("repeat", Math.min(1000000000L, existing.optLong("repeat", 1) + 1)); existing.put("time", event.getLong("time")); return; }
                }
                event.put("id", String.valueOf(++sequence)); event.put("repeat", 1); event.put("_identity", identity);
                if (EVENTS.size() >= 500) EVENTS.remove(0); EVENTS.add(event);
            } catch (Exception invalid) { }
        }
    }
    public static void reload() {
        final String script;
        final ArrayList<WebView> views;
        synchronized (LOCK) {
            try { script = "window.dispatchEvent(new CustomEvent(\"mint-debugger-config\",{detail:" + configurationLocked().toString() + "}));"; }
            catch (Exception invalid) { return; }
            views = new ArrayList<WebView>(VIEWS.keySet());
        }
        for (final WebView view : views) if (view != null) view.post(new Runnable() { public void run() { try { view.evaluateJavascript(script, null); } catch (Exception unavailable) { } } });
    }
    /** Explicit user action: reload only registered views currently on 888. */
    public static void reloadPages() {
        final ArrayList<WebView> views = new ArrayList<WebView>();
        synchronized (LOCK) { for (Map.Entry<WebView,String> entry : VIEWS.entrySet()) if (entry.getKey() != null && origin888(entry.getValue())) views.add(entry.getKey()); }
        for (final WebView view : views) view.post(new Runnable() { public void run() {
            synchronized (LOCK) { if (!origin888(VIEWS.get(view))) return; }
            try { view.reload(); } catch (Exception unavailable) { }
        } });
    }
    public static final class Bridge {
        private final WeakReference<WebView> view;
        Bridge(WebView owner) { view = new WeakReference<WebView>(owner); }
        @JavascriptInterface public String config() {
            synchronized (LOCK) {
                WebView owner = view.get(); String current = owner == null ? null : VIEWS.get(owner);
                if (!origin888(current)) return "{\"capture\":false,\"rules\":[]}";
                try { return configurationLocked().toString(); } catch (Exception invalid) { return "{\"capture\":false,\"rules\":[]}"; }
            }
        }
        @JavascriptInterface public void record(String json) {
            if (json == null || json.length() > 16384) return;
            WebView owner = view.get(); String current;
            synchronized (LOCK) { current = owner == null ? null : VIEWS.get(owner); if (!capture || !origin888(current)) return; }
            try { JSONObject event = new JSONObject(json); event.put("page", current); recordEvent(event); } catch (Exception invalid) { }
        }
    }
}

package com.mint.rebuilt;

import android.webkit.WebView;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

/** Independent document-start instrument; does not rewrite the browser automation. */
public final class DebuggerScripts {
    private static volatile String prefix;
    private DebuggerScripts() {}
    public static void attach(WebView view) {
        if (view == null) return;
        RequestDebugger.attach(view);
        if (prefix != null) return;
        synchronized (DebuggerScripts.class) {
            if (prefix != null) return;
            try {
                InputStream in = view.getContext().getAssets().open("mint-debugger.js");
                try {
                    ByteArrayOutputStream out = new ByteArrayOutputStream();
                    byte[] buf = new byte[4096]; int n;
                    while ((n = in.read(buf)) != -1) {
                        if (out.size() + n > 262144) throw new IllegalArgumentException("Debugger asset too large");
                        out.write(buf, 0, n);
                    }
                    prefix = "(function(){try{\n" + out.toString("UTF-8") + "\n}catch(_mintDebuggerInitError){}})();\n";
                } finally { in.close(); }
            } catch (Exception unavailable) { prefix = ""; }
        }
    }
    public static String prepend(String base) {
        return (prefix == null ? "" : prefix) + (base == null ? "" : base);
    }
}

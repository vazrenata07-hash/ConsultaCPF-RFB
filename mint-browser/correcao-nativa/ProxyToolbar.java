package com.mint.rebuilt;

import android.app.Activity;
import android.content.Context;
import android.content.ContextWrapper;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorFilter;
import android.graphics.Paint;
import android.graphics.PixelFormat;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.ImageView;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.WeakHashMap;

/** Reuses only the address-bar bookmark slot, preserving all native view types. */
public final class ProxyToolbar {
    private static final int ADDRESS_BOOKMARK = 0x7f0901f0;
    private static final WeakHashMap<View, Binding> bindings = new WeakHashMap<View, Binding>();
    private ProxyToolbar() {}

    /** Called exclusively by LocationBarToolView, never by the bottom toolbar. */
    public static void install(View tools) {
        if (tools == null) return;
        View candidate = tools.findViewById(ADDRESS_BOOKMARK);
        if (!(candidate instanceof ImageView)) return;
        ImageView star = (ImageView) candidate;
        Binding binding = bindings.get(star);
        if (binding == null) {
            binding = new Binding(star);
            bindings.put(star, binding);
            star.getOverlay().add(binding.pill);
            star.addOnLayoutChangeListener(binding);
            star.addOnAttachStateChangeListener(binding);
        }
        // Bookmark updates may reset the image/tint, but never the view overlay.
        // Image alpha hides the old glyph without hiding its overlay or touch area.
        star.setImageAlpha(0);
        star.setOnClickListener(binding);
        star.setOnLongClickListener(binding);
        star.setClickable(true);
        star.setFocusable(true);
        binding.update(BrowserProxy.isEnabled(star.getContext()));
    }

    /** Controller calls this only when the proxy's applied state changes. */
    public static void refresh(final boolean enabled) {
        if (Looper.myLooper() != Looper.getMainLooper()) {
            new Handler(Looper.getMainLooper()).post(new Runnable() {
                public void run() { refresh(enabled); }
            });
            return;
        }
        for (Binding binding : new ArrayList<Binding>(bindings.values())) {
            if (binding != null) binding.update(enabled);
        }
    }

    private static Activity activity(Context context) {
        for (int i = 0; context != null && i < 16; i++) {
            if (context instanceof Activity) return (Activity) context;
            if (!(context instanceof ContextWrapper)) break;
            Context next = ((ContextWrapper) context).getBaseContext();
            if (next == context) break;
            context = next;
        }
        return null;
    }

    private static final class Binding implements View.OnClickListener,
            View.OnLongClickListener, View.OnLayoutChangeListener, View.OnAttachStateChangeListener {
        final WeakReference<ImageView> image;
        final Pill pill;
        Binding(ImageView view) {
            image = new WeakReference<ImageView>(view);
            pill = new Pill(view.getContext());
        }
        void update(boolean enabled) {
            ImageView view = image.get();
            if (view == null) return;
            pill.enabled = enabled;
            pill.setBounds(0, 0, view.getWidth(), view.getHeight());
            pill.invalidateSelf();
            view.setSelected(enabled);
            view.setContentDescription(enabled
                ? "Proxy ativado. Toque para desativar; mantenha pressionado para configurar."
                : "Proxy desativado. Toque para ativar; mantenha pressionado para configurar.");
        }
        public void onClick(View view) {
            BrowserProxy.toggle(view.getContext());
            // Keep the indicator on the controller's applied state while pending.
            update(BrowserProxy.isEnabled(view.getContext()));
        }
        public boolean onLongClick(View view) {
            Activity owner = activity(view.getContext());
            if (owner == null || owner.isFinishing()) return false;
            ProxySettings.show(owner);
            return true;
        }
        public void onLayoutChange(View view, int left, int top, int right, int bottom,
                int oldLeft, int oldTop, int oldRight, int oldBottom) {
            pill.setBounds(0, 0, right - left, bottom - top);
            pill.invalidateSelf();
        }
        public void onViewAttachedToWindow(View view) {
            update(BrowserProxy.isEnabled(view.getContext()));
        }
        public void onViewDetachedFromWindow(View view) { }
    }

    /** Text is painted above the ImageView, so later native image tints are harmless. */
    private static final class Pill extends Drawable {
        final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        final RectF area = new RectF();
        final float density;
        final float textSize;
        boolean enabled;
        int alpha = 255;
        Pill(Context context) {
            density = context.getResources().getDisplayMetrics().density;
            textSize = 12f * context.getResources().getDisplayMetrics().scaledDensity;
            paint.setTypeface(Typeface.create("sans-serif-medium", Typeface.NORMAL));
            paint.setTextAlign(Paint.Align.CENTER);
        }
        public void draw(Canvas canvas) {
            Rect bounds = getBounds();
            if (bounds.width() <= 0 || bounds.height() <= 0) return;
            float height = Math.min(30f * density, Math.max(1f, bounds.height() - 4f * density));
            float inset = Math.min(2f * density, bounds.width() / 10f);
            area.set(bounds.left + inset, bounds.exactCenterY() - height / 2f,
                bounds.right - inset, bounds.exactCenterY() + height / 2f);
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(enabled ? Color.rgb(0, 137, 123) : Color.rgb(236, 239, 241));
            paint.setAlpha(alpha);
            canvas.drawRoundRect(area, height / 2f, height / 2f, paint);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(Math.max(1f, density));
            paint.setColor(enabled ? Color.rgb(0, 105, 92) : Color.rgb(144, 164, 174));
            paint.setAlpha(alpha);
            canvas.drawRoundRect(area, height / 2f, height / 2f, paint);
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(enabled ? Color.WHITE : Color.rgb(69, 90, 100));
            paint.setAlpha(alpha);
            paint.setTextSize(textSize);
            float width = paint.measureText("Proxy");
            float available = Math.max(1f, area.width() - 8f * density);
            if (width > available) paint.setTextSize(textSize * available / width);
            Paint.FontMetrics metrics = paint.getFontMetrics();
            canvas.drawText("Proxy", area.centerX(), area.centerY() - (metrics.ascent + metrics.descent) / 2f, paint);
        }
        public void setAlpha(int value) { alpha = value; invalidateSelf(); }
        public void setColorFilter(ColorFilter filter) { }
        public int getOpacity() { return PixelFormat.TRANSLUCENT; }
    }
}

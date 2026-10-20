package com.mint.rebuilt;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Fragment;
import android.content.Context;
import android.content.DialogInterface;
import android.text.InputFilter;
import android.text.InputType;
import android.util.AttributeSet;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import org.json.JSONObject;

/** Extends the original, obfuscated AndroidX preference trees without replacing them. */
public final class NativePreferenceMods {
    private static final String BASE = "androidx.preference.";
    private NativePreferenceMods() {}
    private static Class<?> type(String name) throws Exception { return Class.forName(name); }
    private static Object call(Object target, String name, Class<?>[] args, Object... values) throws Exception {
        return target.getClass().getMethod(name, args).invoke(target, values);
    }
    private static Object call(Object target, String name) throws Exception { return call(target, name, new Class<?>[0]); }
    private static void text(Object target, String name, String value) throws Exception { call(target, name, new Class<?>[]{CharSequence.class}, value); }
    private static void bool(Object target, String name, boolean value) throws Exception { call(target, name, new Class<?>[]{boolean.class}, value); }
    private static void order(Object target, int value) throws Exception { call(target, "u0", new Class<?>[]{int.class}, value); }
    private static void key(Object pref, String key) throws Exception {
        Field field = type(BASE + "Preference").getDeclaredField("q");
        field.setAccessible(true); field.set(pref, key);
    }
    private static Object screen(Object fragment) throws Exception { return call(fragment, "k"); }
    private static Object find(Object screen, String key) throws Exception { return call(screen, "I0", new Class<?>[]{CharSequence.class}, key); }
    private static void add(Object group, Object pref) throws Exception { call(group, "H0", new Class<?>[]{type(BASE + "Preference")}, pref); }
    private static void remove(Object group, Object pref) throws Exception { call(group, "P0", new Class<?>[]{type(BASE + "Preference")}, pref); }
    private static Activity activity(Object fragment) { return ((Fragment) fragment).getActivity(); }
    private static JSONObject read(Activity a) throws Exception {
        String json = (String) type("com.mint.rebuilt.ConfigNative").getMethod("json", Context.class).invoke(null, a);
        return new JSONObject(json);
    }
    private static boolean save(Activity a, String key, Object value) {
        try {
            JSONObject config = read(a); config.put(key, value);
            Object result = type("com.mint.rebuilt.ConfigNative").getMethod("save", Activity.class, String.class).invoke(null, a, config.toString());
            if (Boolean.TRUE.equals(result)) return true;
        } catch (Exception ignored) {}
        Toast.makeText(a, "Não foi possível salvar. Confira o valor e tente novamente.", Toast.LENGTH_SHORT).show();
        return false;
    }
    private static void failure(Activity a) {
        if (a != null) Toast.makeText(a, "Não foi possível carregar as personalizações.", Toast.LENGTH_SHORT).show();
    }

    /** Reparent the two original objects; their original click listeners remain attached. */
    public static void root(Object fragment) {
        Activity a = activity(fragment);
        try {
            Object root = screen(fragment);
            Object privacy = find(root, "pref_header_key_privacy");
            Object advanced = find(root, "pref_header_key_advanced");
            if (privacy == null || advanced == null) return;
            Object privacyParent = call(privacy, "s");
            Object advancedParent = call(advanced, "s");
            if (privacyParent != null) remove(privacyParent, privacy);
            if (advancedParent != null) remove(advancedParent, advanced);
            // Keep every original group/setting attached and findable: onResume
            // still accesses them. Only the two retained entry objects move up.
            int count = ((Integer) call(root, "M0")).intValue();
            for (int index = 0; index < count; index++) {
                Object child = call(root, "L0", new Class<?>[]{int.class}, index);
                bool(child, "A0", false);
            }
            order(privacy, 0); order(advanced, 1);
            bool(privacy, "A0", true); bool(advanced, "A0", true);
            add(root, privacy); add(root, advanced);
        } catch (Exception ignored) { failure(a); }
    }

    public static void privacy(Object fragment) {
        Activity a = activity(fragment);
        try {
            Object group = category(fragment, "mint_custom_privacy", "Personalizações da 888");
            if (group == null) return;
            JSONObject initial = read(a);
            toggle(a, group, initial, "passwordEnabled", "Preencher senha de acesso");
            edit(a, group, "password", "Senha de acesso", "Definida · tocar para alterar", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
            toggle(a, group, initial, "pinEnabled", "Preencher senha de saque");
            edit(a, group, "pin", "Senha de saque", "6 dígitos · tocar para alterar", InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_VARIATION_PASSWORD);
        } catch (Exception ignored) { failure(a); }
    }
    public static void advanced(Object fragment) {
        Activity a = activity(fragment);
        try {
            Object group = category(fragment, "mint_custom_advanced", "Personalizações do Mint");
            if (group == null) return;
            JSONObject initial = read(a);
            toggle(a, group, initial, "usernameEnabled", "Gerar usuário da 888");
            edit(a, group, "usernameLength", "Quantidade de caracteres do usuário", String.valueOf(initial.optInt("usernameLength", 15)), InputType.TYPE_CLASS_NUMBER);
            toggle(a, group, initial, "usernameAlphanumeric", "Usuário alfanumérico");
            toggle(a, group, initial, "historyEnabled", "Histórico de bombas do Mines");
            toggle(a, group, initial, "wagerEnabled", "Contador do total apostado");
        } catch (Exception ignored) { failure(a); }
    }
    private static Object category(Object fragment, String id, String title) throws Exception {
        Object root = screen(fragment);
        if (find(root, id) != null) return null;
        Object category = type(BASE + "PreferenceCategory").getConstructor(Context.class).newInstance(activity(fragment));
        key(category, id); text(category, "z0", title); order(category, -10000);
        add(root, category);
        return category;
    }
    private static Object preference(Activity a, String id, String title) throws Exception {
        Object pref = type(BASE + "Preference").getConstructor(Context.class).newInstance(a);
        key(pref, "mint_custom_" + id); text(pref, "z0", title); bool(pref, "v0", false);
        return pref;
    }
    private static void toggle(final Activity a, Object group, JSONObject initial, final String setting, String title) throws Exception {
        Object pref = type("miui.support.preference.CheckBoxPreference").getConstructor(Context.class, AttributeSet.class).newInstance(a, null);
        key(pref, "mint_custom_" + setting); text(pref, "z0", title); bool(pref, "v0", false);
        bool(pref, "H0", initial.optBoolean(setting, true));
        if (setting.equals("usernameAlphanumeric")) text(pref, "x0", "Ativado: letras e números. Desativado: somente letras.");
        if (setting.equals("historyEnabled")) text(pref, "x0", "Contagem por quadrado nas últimas 10 rodadas concluídas.");
        Class<?> listener = type(BASE + "Preference$d");
        Object proxy = Proxy.newProxyInstance(listener.getClassLoader(), new Class<?>[]{listener}, new InvocationHandler() {
            public Object invoke(Object proxy, Method method, Object[] args) {
                if (method.getName().equals("b") && args != null && args.length == 2) return Boolean.valueOf(save(a, setting, args[1]));
                return objectMethod(proxy, method, args);
            }
        });
        call(pref, "s0", new Class<?>[]{listener}, proxy);
        add(group, pref);
    }
    private static void edit(final Activity a, Object group, final String setting, final String title, String summary, final int inputType) throws Exception {
        final Object pref = preference(a, setting, title);
        text(pref, "x0", summary);
        Class<?> listener = type(BASE + "Preference$e");
        Object proxy = Proxy.newProxyInstance(listener.getClassLoader(), new Class<?>[]{listener}, new InvocationHandler() {
            public Object invoke(Object proxy, Method method, Object[] args) {
                if (method.getName().equals("c")) { showEdit(a, pref, setting, title, inputType); return Boolean.TRUE; }
                return objectMethod(proxy, method, args);
            }
        });
        call(pref, "t0", new Class<?>[]{listener}, proxy);
        add(group, pref);
    }
    private static Object objectMethod(Object proxy, Method method, Object[] args) {
        if (method.getName().equals("hashCode")) return Integer.valueOf(System.identityHashCode(proxy));
        if (method.getName().equals("equals")) return Boolean.valueOf(args != null && args.length == 1 && proxy == args[0]);
        if (method.getName().equals("toString")) return "MintPreferenceListener";
        return null;
    }
    private static void showEdit(final Activity a, final Object pref, final String setting, String title, int inputType) {
        try {
            JSONObject config = read(a);
            final EditText input = new EditText(a);
            input.setSingleLine(true); input.setInputType(inputType); input.setSelectAllOnFocus(true);
            input.setText(setting.equals("usernameLength") ? String.valueOf(config.optInt(setting, 15)) : config.optString(setting, ""));
            int side = (int)(20 * a.getResources().getDisplayMetrics().density + .5f);
            input.setPadding(side, side / 2, side, side / 2);
            if (setting.equals("pin")) input.setFilters(new InputFilter[]{new InputFilter.LengthFilter(6)});
            if (setting.equals("usernameLength")) input.setFilters(new InputFilter[]{new InputFilter.LengthFilter(2)});
            final AlertDialog dialog = new AlertDialog.Builder(a).setTitle(title).setView(input).setNegativeButton("Cancelar", null).setPositiveButton("Salvar", null).create();
            dialog.show();
            dialog.getButton(DialogInterface.BUTTON_POSITIVE).setOnClickListener(new View.OnClickListener() {
                public void onClick(View view) {
                    String raw = input.getText().toString();
                    Object value = raw;
                    if (setting.equals("usernameLength")) {
                        int count; try { count = Integer.parseInt(raw.trim()); } catch (Exception bad) { count = 0; }
                        if (count < 1 || count > 64) { input.setError("Use um número de 1 a 64."); return; }
                        value = Integer.valueOf(count);
                    } else if (setting.equals("pin")) {
                        if (!raw.matches("[0-9]{6}")) { input.setError("Use exatamente 6 dígitos."); return; }
                    } else if (raw.length() == 0) { input.setError("Defina a senha de acesso."); return; }
                    if (!save(a, setting, value)) return;
                    if (setting.equals("usernameLength")) try { text(pref, "x0", String.valueOf(value)); } catch (Exception ignored) {}
                    dialog.dismiss();
                }
            });
        } catch (Exception ignored) { failure(a); }
    }
}

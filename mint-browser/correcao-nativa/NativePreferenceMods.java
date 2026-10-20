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

    /** Keep native objects findable, and show the custom controls on the gear root. */
    public static void root(final Object fragment) {
        final Activity a = activity(fragment);
        Object root = null, privacy = null, advanced = null;
        try {
            root = screen(fragment);
            privacy = find(root, "pref_header_key_privacy");
            advanced = find(root, "pref_header_key_advanced");
            if (privacy == null || advanced == null) return;
            // Rebuild only our own rows after native lifecycle refreshes.
            String[] own = {"usernameEnabled", "usernameLength", "usernameAlphanumeric", "passwordEnabled", "password", "pinEnabled", "pin", "historyEnabled", "historyRounds", "wagerEnabled", "proxy", "restore_defaults"};
            for (String setting : own) {
                Object previous = find(root, "mint_custom_" + setting);
                if (previous != null) {
                    Object parent = call(previous, "s");
                    if (parent != null) remove(parent, previous);
                }
            }
            Object privacyParent = call(privacy, "s");
            Object advancedParent = call(advanced, "s");
            if (privacyParent != null) remove(privacyParent, privacy);
            if (advancedParent != null) remove(advancedParent, advanced);
            // Original general settings stay attached: native onResume still finds them.
            int count = ((Integer) call(root, "M0")).intValue();
            for (int index = 0; index < count; index++) {
                Object child = call(root, "L0", new Class<?>[]{int.class}, index);
                bool(child, "A0", false);
            }
            JSONObject initial = read(a);
            toggle(a, root, initial, "usernameEnabled", "Gerar usuário da 888", 0);
            edit(a, root, "usernameLength", "Quantidade de caracteres do usuário", String.valueOf(initial.optInt("usernameLength", 15)), InputType.TYPE_CLASS_NUMBER, 1);
            toggle(a, root, initial, "usernameAlphanumeric", "Usuário alfanumérico", 2);
            toggle(a, root, initial, "passwordEnabled", "Preencher senha de acesso", 3);
            edit(a, root, "password", "Senha de acesso", secretSummary(initial.optString("password", "")), InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD, 4);
            toggle(a, root, initial, "pinEnabled", "Preencher senha de saque", 5);
            edit(a, root, "pin", "Senha de saque", secretSummary(initial.optString("pin", "")), InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_VARIATION_PASSWORD, 6);
            toggle(a, root, initial, "historyEnabled", "Histórico de bombas do Mines", 7);
            edit(a, root, "historyRounds", "Rodadas no histórico do Mines", String.valueOf(initial.optInt("historyRounds", 10)), InputType.TYPE_CLASS_NUMBER, 8);
            toggle(a, root, initial, "wagerEnabled", "Contador do total apostado", 9);
            proxy(a, root);
            restore(a, root, fragment);
        } catch (Exception ignored) { failure(a); }
        finally {
            // Always retain access to the original trees, even if a custom row fails.
            if (root != null && privacy != null && advanced != null) try {
                order(privacy, 100); order(advanced, 101);
                bool(privacy, "A0", true); bool(advanced, "A0", true);
                add(root, privacy); add(root, advanced);
            } catch (Exception ignored) {}
        }
    }
    private static String secretSummary(String value) {
        return value.length() == 0 ? "Não definida · tocar para adicionar" : "Definida · tocar para alterar";
    }
    private static void restore(final Activity a, Object group, final Object fragment) throws Exception {
        Object pref = preference(a, "restore_defaults", "Restaurar padrão");
        order(pref, 90);
        text(pref, "x0", "Restaurar apenas as personalizações do Mint.");
        Class<?> listener = type(BASE + "Preference$e");
        Object proxy = Proxy.newProxyInstance(listener.getClassLoader(), new Class<?>[]{listener}, new InvocationHandler() {
            public Object invoke(Object proxy, Method method, Object[] args) {
                if (method.getName().equals("c")) {
                    new AlertDialog.Builder(a).setTitle("Restaurar padrão?")
                        .setMessage("Ativar as personalizações, usar usuário de 15 caracteres, histórico de 10 rodadas, limpar as senhas e remover a configuração de proxy?")
                        .setNegativeButton("Cancelar", null)
                        .setPositiveButton("Restaurar", new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int which) {
                                try {
                                    Object result = type("com.mint.rebuilt.ConfigNative").getMethod("restoreDefaults", Activity.class).invoke(null, a);
                                    if (Boolean.TRUE.equals(result)) { root(fragment); return; }
                                } catch (Exception ignored) {}
                                Toast.makeText(a, "Não foi possível restaurar as personalizações.", Toast.LENGTH_SHORT).show();
                            }
                        }).show();
                    return Boolean.TRUE;
                }
                return objectMethod(proxy, method, args);
            }
        });
        call(pref, "t0", new Class<?>[]{listener}, proxy);
        add(group, pref);
    }
    private static void proxy(final Activity a, Object group) throws Exception {
        Object pref=preference(a,"proxy","Proxy");order(pref,10);
        text(pref,"x0","Configurar HTTP, HTTPS ou SOCKS5.");
        Class<?> listener=type(BASE+"Preference$e");
        Object callback=Proxy.newProxyInstance(listener.getClassLoader(),new Class<?>[]{listener},new InvocationHandler(){
            public Object invoke(Object proxy,Method method,Object[] args){
                if(method.getName().equals("c")){ProxySettings.show(a);return Boolean.TRUE;}
                return objectMethod(proxy,method,args);
            }
        });
        call(pref,"t0",new Class<?>[]{listener},callback);add(group,pref);
    }
    private static Object preference(Activity a, String id, String title) throws Exception {
        Object pref = type(BASE + "Preference").getConstructor(Context.class).newInstance(a);
        key(pref, "mint_custom_" + id); text(pref, "z0", title); bool(pref, "v0", false);
        return pref;
    }
    private static void toggle(final Activity a, Object group, JSONObject initial, final String setting, String title, int position) throws Exception {
        Object pref = type("miui.support.preference.CheckBoxPreference").getConstructor(Context.class, AttributeSet.class).newInstance(a, null);
        key(pref, "mint_custom_" + setting); text(pref, "z0", title); bool(pref, "v0", false);
        bool(pref, "H0", initial.optBoolean(setting, true));
        order(pref, position);
        if (setting.equals("usernameAlphanumeric")) text(pref, "x0", "Ativado: letras e números. Desativado: somente letras.");
        if (setting.equals("historyEnabled")) text(pref, "x0", "Contagem por quadrado nas rodadas concluídas do histórico configurado.");
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
    private static void edit(final Activity a, Object group, final String setting, final String title, String summary, final int inputType, int position) throws Exception {
        final Object pref = preference(a, setting, title);
        order(pref, position);
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
            boolean numericSetting = setting.equals("usernameLength") || setting.equals("historyRounds");
            input.setText(numericSetting ? String.valueOf(config.optInt(setting, setting.equals("historyRounds") ? 10 : 15)) : config.optString(setting, ""));
            int side = (int)(20 * a.getResources().getDisplayMetrics().density + .5f);
            input.setPadding(side, side / 2, side, side / 2);
            if (setting.equals("pin")) input.setFilters(new InputFilter[]{new InputFilter.LengthFilter(6)});
            if (setting.equals("usernameLength")) input.setFilters(new InputFilter[]{new InputFilter.LengthFilter(2)});
            if (setting.equals("historyRounds")) {
                input.setFilters(new InputFilter[]{new InputFilter.LengthFilter(3)});
                input.setHint("De 1 a 100 rodadas");
            }
            final AlertDialog dialog = new AlertDialog.Builder(a).setTitle(title).setView(input).setNegativeButton("Cancelar", null).setPositiveButton("Aplicar", null).create();
            dialog.show();
            dialog.getButton(DialogInterface.BUTTON_POSITIVE).setOnClickListener(new View.OnClickListener() {
                public void onClick(View view) {
                    String raw = input.getText().toString();
                    Object value = raw;
                    if (setting.equals("usernameLength") || setting.equals("historyRounds")) {
                        int count; try { count = Integer.parseInt(raw.trim()); } catch (Exception bad) { count = 0; }
                        int maximum = setting.equals("historyRounds") ? 100 : 64;
                        if (count < 1 || count > maximum) { input.setError("Use um número de 1 a " + maximum + "."); return; }
                        value = Integer.valueOf(count);
                    } else if (setting.equals("pin")) {
                        if (raw.length() > 0 && !raw.matches("[0-9]{6}")) { input.setError("Deixe vazio ou use exatamente 6 dígitos."); return; }
                    }
                    if (!save(a, setting, value)) return;
                    try { text(pref, "x0", (setting.equals("usernameLength") || setting.equals("historyRounds")) ? String.valueOf(value) : secretSummary(raw)); } catch (Exception ignored) {}
                    dialog.dismiss();
                }
            });
        } catch (Exception ignored) { failure(a); }
    }
}

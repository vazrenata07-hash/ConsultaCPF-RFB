from pathlib import Path
import re, sys
root = Path(sys.argv[1])
page = root/'smali_classes3/com/mint/rebuilt/PageScripts.smali'
s = page.read_text()
start = '.method public static init(Landroid/webkit/WebView;)V\n    .locals 4\n'
assert s.count(start) == 1 and 'DebuggerScripts;' not in s
s = s.replace(start, start+'\n    invoke-static {p0}, Lcom/mint/rebuilt/DebuggerScripts;->attach(Landroid/webkit/WebView;)V\n', 1)
store = '    sput-object p0, Lcom/mint/rebuilt/PageScripts;->source:Ljava/lang/String;'
assert s.count(store) == 1
s = s.replace(store, '    invoke-static {p0}, Lcom/mint/rebuilt/DebuggerScripts;->prepend(Ljava/lang/String;)Ljava/lang/String;\n    move-result-object p0\n\n'+store, 1)
page.write_text(s)
settings = root/'smali_classes3/com/mint/rebuilt/NativePreferenceMods.smali'
s = settings.read_text()
m = re.search(r'\.method public static root\(Ljava/lang/Object;\)V\n[\s\S]*?\.end method', s)
assert m and 'DebuggerSettings;' not in m.group()
method = m.group()
assert '    return-void' in method
method = method.replace('    return-void', '    invoke-static/range {p0 .. p0}, Lcom/mint/rebuilt/DebuggerSettings;->add(Ljava/lang/Object;)V\n\n    return-void')
settings.write_text(s[:m.start()]+method+s[m.end():])
print('Debugger attached and prepended; settings entry added without replacing original classes.')

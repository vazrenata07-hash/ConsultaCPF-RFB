"""Add only root customization hooks to the original MainPreferenceFragment.
The original Privacy and Advanced fragment files are not opened or changed.
Usage: python hook-native-preferences.py /path/to/decoded-base-release-1.0.2
"""
from pathlib import Path
import re,sys
root=Path(sys.argv[1])
p=root/'smali_classes2/com/miui/org/chromium/chrome/browser/setting/preferences/MainPreferenceFragment.smali'
s=p.read_text()
for signature in (r'onCreate\(Landroid/os/Bundle;\)', r'onResume\(\)'):
 match=re.search(r'\.method public '+signature+r'V\n[\s\S]*?\.end method',s)
 assert match,signature
 method=match.group()
 assert 'NativePreferenceMods;' not in method,signature
 assert '    return-void' in method,signature
 patched=method.replace('    return-void','    invoke-static {p0}, Lcom/mint/rebuilt/NativePreferenceMods;->root(Ljava/lang/Object;)V\n\n    return-void')
 s=s[:match.start()]+patched+s[match.end():]
p.write_text(s)
print('MainPreferenceFragment onCreate/onResume → root; other fragments unchanged')

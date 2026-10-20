"""Preserve original native fragment trees; add helper calls after original onCreate.
Usage: python hook-native-preferences.py /path/to/decoded-base-release-1.0.2
"""
from pathlib import Path
import re,sys
root=Path(sys.argv[1])
base=root/'smali_classes2/com/miui/org/chromium/chrome/browser/setting/preferences'
for filename,entry in [('MainPreferenceFragment.smali','root'),('PrivacySecurityPreferencesFragment.smali','privacy'),('AdvancedPreferencesFragment.smali','advanced')]:
 p=base/filename
 s=p.read_text()
 match=re.search(r'\.method public onCreate\(Landroid/os/Bundle;\)V\n[\s\S]*?\.end method',s)
 assert match,filename
 method=match.group()
 assert 'NativePreferenceMods;' not in method,filename
 # Every original return path retains original instructions before extending the screen.
 replacement='    invoke-static {p0}, Lcom/mint/rebuilt/NativePreferenceMods;->'+entry+'(Ljava/lang/Object;)V\n\n    return-void'
 assert '    return-void' in method,filename
 patched=method.replace('    return-void',replacement)
 p.write_text(s[:match.start()]+patched+s[match.end():])
 print(filename,'→',entry)

# Main onResume refreshes the original general settings; hide them again only
# afterward, keeping them attached and fully findable by native lifecycle code.
p=base/'MainPreferenceFragment.smali'
s=p.read_text()
match=re.search(r'\.method public onResume\(\)V\n[\s\S]*?\.end method',s)
assert match
method=match.group()
assert 'NativePreferenceMods;' not in method
patched=method.replace('    return-void','    invoke-static {p0}, Lcom/mint/rebuilt/NativePreferenceMods;->root(Ljava/lang/Object;)V\n\n    return-void')
p.write_text(s[:match.start()]+patched+s[match.end():])
print('MainPreferenceFragment.onResume → root after native refresh')

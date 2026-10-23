"""Inject exact resource filtering into both native-adblock and normal client paths.
No legacy String interception: that callback cannot reliably identify main frames.
"""
from pathlib import Path
import re,sys
root=Path(sys.argv[1])
e=root/'smali/com/miui/org/chromium/chrome/browser/adblock/AdblockWebView$e.smali'
f=root/'smali_classes2/com/miui/org/chromium/chrome/browser/webview/f.smali'
s=e.read_text()
match=re.search(r'\.method public shouldInterceptRequest\(Landroid/webkit/WebView;Landroid/webkit/WebResourceRequest;\)Landroid/webkit/WebResourceResponse;\n[\s\S]*?\.end method',s)
assert match
method=match.group();assert 'CapturedResourceBlocker;' not in method
anchor='    .line 1\n'
assert anchor in method
hook='''    invoke-static {p1, p2}, Lcom/mint/rebuilt/CapturedResourceBlocker;->intercept(Landroid/webkit/WebView;Landroid/webkit/WebResourceRequest;)Landroid/webkit/WebResourceResponse;
    move-result-object v0
    if-eqz v0, :mint_resource_allowed
    return-object v0
    :mint_resource_allowed

'''
method=method.replace(anchor,hook+anchor,1)
s=s[:match.start()]+method+s[match.end():]
e.write_text(s)
s=f.read_text()
signature='.method public shouldInterceptRequest(Landroid/webkit/WebView;Landroid/webkit/WebResourceRequest;)Landroid/webkit/WebResourceResponse;'
assert signature not in s
s+='''
# Always-active request filtering when the native adblock switch is off.
.method public shouldInterceptRequest(Landroid/webkit/WebView;Landroid/webkit/WebResourceRequest;)Landroid/webkit/WebResourceResponse;
    .locals 1
    invoke-static {p1, p2}, Lcom/mint/rebuilt/CapturedResourceBlocker;->intercept(Landroid/webkit/WebView;Landroid/webkit/WebResourceRequest;)Landroid/webkit/WebResourceResponse;
    move-result-object v0
    if-eqz v0, :mint_resource_allowed
    return-object v0
    :mint_resource_allowed
    invoke-interface {p2}, Landroid/webkit/WebResourceRequest;->getUrl()Landroid/net/Uri;
    move-result-object v0
    invoke-virtual {v0}, Landroid/net/Uri;->toString()Ljava/lang/String;
    move-result-object v0
    invoke-virtual {p0, p1, v0}, Lcom/miui/org/chromium/chrome/browser/webview/f;->shouldInterceptRequest(Landroid/webkit/WebView;Ljava/lang/String;)Landroid/webkit/WebResourceResponse;
    move-result-object v0
    return-object v0
.end method
'''
f.write_text(s)
for path in [e,f]:
 s=path.read_text()
 match=re.search(r'\.method public onPageStarted\(Landroid/webkit/WebView;Ljava/lang/String;Landroid/graphics/Bitmap;\)V\n[\s\S]*?\.end method',s)
 assert match,path
 method=match.group();assert 'CapturedResourceBlocker;' not in method
 anchor='    .line 1\n';assert anchor in method
 method=method.replace(anchor,'    invoke-static {p1, p2}, Lcom/mint/rebuilt/CapturedResourceBlocker;->pageStarted(Landroid/webkit/WebView;Ljava/lang/String;)V\n\n'+anchor,1)
 path.write_text(s[:match.start()]+method+s[match.end():])
print('Patched only request and page-start methods in native e and normal f clients.')

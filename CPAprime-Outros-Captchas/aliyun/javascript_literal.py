"""JavaScript literal recuperado das constantes do executável CPAprime.exe.
Nenhum script é executado ao importar este módulo.
"""
_JS_ALIYUN_ESTADO = "\nfunction _cxAli(id) {\n    var e = document.getElementById(id);\n    if (!e) { return null; }\n    var r = e.getBoundingClientRect();\n    if (r.width < 1 && r.height < 1) { return null; }\n    return { x: r.left, y: r.top, w: r.width, h: r.height,\n             nw: e.naturalWidth || 0, nh: e.naturalHeight || 0, src: e.src || '' };\n}\nreturn {\n    fundo: _cxAli('aliyunCaptcha-img'),\n    peca: _cxAli('aliyunCaptcha-puzzle'),\n    alca: _cxAli('aliyunCaptcha-sliding-slider')\n};\n"

_JS_ALIYUN_POS = "\nvar out = {};\nvar f = document.getElementById('aliyunCaptcha-img');\nvar p = document.getElementById('aliyunCaptcha-puzzle');\nif (f) { out.fundo = f.getBoundingClientRect().left; }\nif (p) { out.peca = p.getBoundingClientRect().left; }\nreturn out;\n"

_JS_ALIYUN_PRESENTE = "\nvar f = document.getElementById('aliyunCaptcha-img');\nif (!f) { return false; }\nvar r = f.getBoundingClientRect();\nreturn r.width > 40 && r.height > 40;\n"

_JS_GEETEST_ALGUM = "\nvar p = document.querySelectorAll(\n    '[class*=geetest_slice_bg],[class*=geetest_item_img],[class*=geetest_window],' +\n    '[class*=geetest_popup_ghost],[class*=geetest_box],[class*=geetest_panel]');\nfor (var k = 0; k < p.length; k++) {\n    var el = p[k];\n    var r = el.getBoundingClientRect();\n    if (r.width < 3 || r.height < 3) { continue; }\n    var cs = window.getComputedStyle(el);\n    if (cs.display === 'none' || cs.visibility === 'hidden') { continue; }\n    if (parseFloat(cs.opacity) === 0) { continue; }\n    return true;\n}\nreturn false;\n"

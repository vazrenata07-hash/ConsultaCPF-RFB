"""Strings JavaScript literais recuperadas do módulo Nuitka classe_mp."""

# classe_mp[147]
BUSTER_PRONTO = "if (d.querySelector('#recaptcha-help-button')) { return false; }var h = d.querySelector('.help-button-holder');if (!h) { return false; }var r = h.getBoundingClientRect();return r.width > 0 && r.height > 0;"

# classe_mp[156]
RESPOSTA_AUDIO = "var i = d.querySelector('#audio-response');var e = d.querySelector('.rc-audiochallenge-error-message');var texto = '';if (i) { texto = i.value || ''; }var erro = '';if (e) { erro = (e.textContent || '').trim(); }var dos = d.querySelector('.rc-doscaptcha-body, .rc-doscaptcha-header-text');var bloq = '';if (dos) { bloq = (dos.textContent || '').trim().slice(0, 120); }return JSON.stringify([texto, erro, bloq]);"

# classe_mp[171]
LER_PREFIXO = "var alvo = null;var fr = document.querySelectorAll('iframe');for (var i = 0; i < fr.length; i++) {  var s = fr[i].src || '';  if (s.indexOf('recaptcha') >= 0 && s.indexOf("

# classe_mp[172]
LER_MEIO = ") >= 0) {    alvo = fr[i]; break;  }}if (!alvo) { return '__SEM_IFRAME__'; }var d = alvo.contentDocument;if (!d) { return '__CROSS__'; }return (function(d){"

# classe_mp[173]
LER_SUFIXO = '})(d);'

# classe_mp[177]
FRAME_PREFIXO = '(function(d){'

# classe_mp[178]
FRAME_SUFIXO = '})(document)'

# classe_mp[179]
CANTO_PREFIXO = "var fr = document.querySelectorAll('iframe');for (var i = 0; i < fr.length; i++) {  var s = fr[i].src || '';  if (s.indexOf('recaptcha') >= 0 && s.indexOf("

# classe_mp[180]
CANTO_SUFIXO = ') >= 0) {    var r = fr[i].getBoundingClientRect();    if (!r.width || !r.height) { return null; }    return [r.x, r.y];  }}return null;'

# classe_mp[181]
CENTRO_PREFIXO = 'var e = d.querySelector('

# classe_mp[182]
CENTRO_SUFIXO = ');if (!e) { return null; }var r = e.getBoundingClientRect();if (!r.width || !r.height) { return null; }return [r.x + r.width / 2, r.y + r.height / 2];'

# classe_mp[196]
TOKEN_PREFIXO = 'var t = document.querySelectorAll('

# classe_mp[198]
TOKEN_SUFIXO = ");for (var i = 0; i < t.length; i++) {  if ((t[i].value || '').length > 0) { return true; }}return false;"

# classe_mp[194]: corpo da tupla (parte, script)
MARCAR_CHECKBOX = "var e = d.querySelector('#recaptcha-anchor');if (!e) { return null; }return e.getAttribute('aria-checked');"

# classe_mp[199]: corpo da tupla (parte, script)
BLOQUEIO_AUDIO = "var e = d.querySelector('.rc-doscaptcha-body, .rc-doscaptcha-header-text');if (!e) { return ''; }return (e.textContent || '').trim().slice(0, 120);"

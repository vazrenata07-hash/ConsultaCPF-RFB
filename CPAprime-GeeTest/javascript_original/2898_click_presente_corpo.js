
// clique-em-ordem: tem foto de fundo com imagem E varios icones de pergunta,
// e NAO tem a grade do 3x3. Nao depende de nome de classe da sessao.
var itens = document.querySelectorAll('[class*=geetest_item_img]');
for (var k = 0; k < itens.length; k++) {
    var ri = itens[k].getBoundingClientRect();
    if (ri.width > 3 && ri.height > 3) { return false; }   // e' 3x3
}
var qs = _iconesVisiveis();
if (qs.length < 2) { return false; }
var bgs = document.querySelectorAll('[class*=geetest_bg]');
for (var j = bgs.length - 1; j >= 0; j--) {
    var r = bgs[j].getBoundingClientRect();
    if (r.width < 40 || r.height < 40) { continue; }
    var bi = String(window.getComputedStyle(bgs[j]).backgroundImage || '');
    if (bi.indexOf('url(') >= 0) { return true; }
}
return false;

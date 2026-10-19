
var imgs = _nineVisiveis();
if (!imgs) { return null; }
// so conta se a grade ainda esta VISIVEL: quando a casa aceita, o painel some
// mas os elementos ficam no DOM, e sem esta guarda o laco seguia "corrigindo"
// e tocando em coordenadas que ja apontam para o lobby.

function itemDe(img) {
    var el = img.parentElement, d = 0;
    while (el && d < 4) {
        var c = String(el.className || '');
        if (c.indexOf('geetest_item') >= 0 &&
            c.indexOf('geetest_item_wrap') < 0 &&
            c.indexOf('geetest_item_img') < 0) { return el; }
        el = el.parentElement; d++;
    }
    return img.parentElement || img;
}
// A assinatura NAO pode usar a classe do item: ela carrega o indice
// (geetest_0, geetest_1, ...), entao toda celula seria unica e a comparacao
// por maioria marcaria as nove. Vale so o ESTILO COMPUTADO do overlay -- e' o
// que muda ao selecionar, inclusive quando a mudanca vem de uma classe nova
// (a classe altera o estilo, e o estilo e' o que a gente le).
function assinatura(item) {
    var s = '';
    var fantasmas = item.querySelectorAll('[class*=geetest_item_ghost],[class*=geetest_item_icon]');
    for (var j = 0; j < fantasmas.length; j++) {
        var cs = window.getComputedStyle(fantasmas[j]);
        s = s + '|' + cs.opacity + ',' + cs.display + ',' + cs.visibility +
            ',' + cs.transform + ',' + cs.backgroundColor;
    }
    return s;
}
var assin = [], k;
for (k = 0; k < imgs.length; k++) { assin.push(assinatura(itemDe(imgs[k]))); }
var conta = {};
for (k = 0; k < assin.length; k++) { conta[assin[k]] = (conta[assin[k]] || 0) + 1; }
var base = assin[0], melhor = 0;
for (var c2 in conta) {
    if (conta[c2] > melhor) { melhor = conta[c2]; base = c2; }
}
var out = [];
for (k = 0; k < assin.length; k++) { out.push(assin[k] !== base); }
return out;


return (function () {
    function urlDoFundo(el) {
        var bi = String(window.getComputedStyle(el).backgroundImage || '');
        var m = bi.match(/url\(['"]?(.*?)['"]?\)/);
        return m ? m[1] : '';
    }
    var qs = _iconesVisiveis();
    if (qs.length < 2) { return { ok: false, erro: 'sem-pergunta' }; }
    var alvo = null, cx = null;
    var bgs = document.querySelectorAll('[class*=geetest_bg]');
    for (var j = bgs.length - 1; j >= 0; j--) {
        var r = bgs[j].getBoundingClientRect();
        if (r.width < 40 || r.height < 40) { continue; }
        if (urlDoFundo(bgs[j])) { alvo = bgs[j]; cx = r; break; }
    }
    if (!alvo) { return { ok: false, erro: 'sem-foto' }; }
    var icones = [];
    for (var k = 0; k < qs.length; k++) { icones.push(qs[k].src); }
    return {
        ok: true,
        foto: urlDoFundo(alvo),
        icones: icones,
        // retangulo da foto NA TELA: e' o que converte coordenada de imagem
        // em coordenada de toque
        caixa: { x: cx.left, y: cx.top, w: cx.width, h: cx.height }
    };
})();

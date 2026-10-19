
return (function () {
    function urlDoFundo(el) {
        var bi = String(window.getComputedStyle(el).backgroundImage || '');
        var m = bi.match(/url\(['"]?(.*?)['"]?\)/);
        if (!m) { return ''; }
        return m[1];
    }
    var qi = document.querySelectorAll('[class*=geetest_ques_tips] img, [class*=geetest_ques_back] img');
    if (!qi.length) { return { ok: false, erro: 'sem-pergunta' }; }
    var itens = _nineVisiveis();
    if (!itens) { return { ok: false, erro: 'sem-grade' }; }
    var sprite = urlDoFundo(itens[0]);
    if (!sprite) { return { ok: false, erro: 'sem-sprite' }; }
    var cels = [];
    for (var k = 0; k < 9; k++) {
        var bp = String(window.getComputedStyle(itens[k]).backgroundPosition || '0% 0%').split(/\s+/);
        var col = Math.round(-parseFloat(bp[0]) / 100);
        var lin = Math.round(-parseFloat(bp[1] || '0') / 100);
        if (isNaN(col) || col < 0 || col > 2) { col = k % 3; }
        if (isNaN(lin) || lin < 0 || lin > 2) { lin = Math.floor(k / 3); }
        // o toque vai no .geetest_item (a celula), nao no .geetest_item_wrap
        var el = itens[k].parentElement || itens[k], d = 0;
        while (el && d < 4) {
            var cc = String(el.className || '');
            if (cc.indexOf('geetest_item') >= 0 &&
                cc.indexOf('geetest_item_wrap') < 0 &&
                cc.indexOf('geetest_item_img') < 0) { break; }
            el = el.parentElement; d++;
        }
        if (!el) { el = itens[k].parentElement || itens[k]; }
        var r = el.getBoundingClientRect();
        cels.push({ col: col, lin: lin,
                    x: Math.round(r.left + r.width / 2),
                    y: Math.round(r.top + r.height / 2),
                    classe: String(el.className || '') });
    }
    return { ok: true, icone: qi[qi.length - 1].src, sprite: sprite, cels: cels };
})();

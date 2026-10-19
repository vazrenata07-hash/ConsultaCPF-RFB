
return (async () => {
    // Sempre o ULTIMO no do DOM: um refresh do captcha deixa os anteriores
    // para tras como lixo, e o de cima e' o que vale.
    function ultimo(sel) {
        var todos = document.querySelectorAll(sel);
        if (!todos.length) { return null; }
        return todos[todos.length - 1];
    }
    function dormir(ms) {
        return new Promise(function (r) { setTimeout(r, ms); });
    }
    // As imagens vem no background-image do CSS, nao em <img>.
    function urlDoFundo(el) {
        var bi = String(window.getComputedStyle(el).backgroundImage || '');
        var m = bi.match(/url\(['"]?(.*?)['"]?\)/);
        if (!m) { return ''; }
        return m[1];
    }
    function carregar(url) {
        return new Promise(function (ok, falhou) {
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () { ok(img); };
            img.onerror = function () { falhou('carga'); };
            img.src = url;
        });
    }
    // Desvio de quando o CDN do GeeTest nao manda o header de CORS: o canvas
    // fica tainted e o getImageData explode. Baixando por fetch a imagem vira
    // data: URL e nasce mesma-origem, entao o canvas fica limpo.
    async function carregarViaFetch(url) {
        var resp = await fetch(url);
        var blob = await resp.blob();
        var dataUrl = await new Promise(function (ok, falhou) {
            var fr = new FileReader();
            fr.onload = function () { ok(fr.result); };
            fr.onerror = function () { falhou('fr'); };
            fr.readAsDataURL(blob);
        });
        return await carregar(dataUrl);
    }
    function pixels(img, w, h) {
        var c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        var ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        return ctx.getImageData(0, 0, w, h).data;
    }

    var fundoDiv = ultimo('[class*=geetest_bg]');
    var pecaDiv = ultimo('[class*=geetest_slice_bg]');
    var pecaWrap = ultimo('[class*=geetest_slice]:not([class*=geetest_slice_bg]):not([class*=geetest_slice_animate])');
    if (!fundoDiv || !pecaDiv) { return 'sem-captcha'; }

    var w = fundoDiv.clientWidth;
    var h = fundoDiv.clientHeight;
    if (w < 10 || h < 10) { return 'sem-captcha'; }

    var pw = 80;
    var ph = 80;
    var topoPeca = 0;
    if (pecaWrap) {
        pw = pecaWrap.clientWidth;
        ph = pecaWrap.clientHeight;
        var topoCss = parseFloat(window.getComputedStyle(pecaWrap).top);
        if (isNaN(topoCss)) { topoCss = pecaWrap.offsetTop; }
        topoPeca = topoCss;
    }

    var urlFundo = urlDoFundo(fundoDiv);
    var urlPeca = urlDoFundo(pecaDiv);
    if (!urlFundo || !urlPeca) { return 'sem-imagem'; }

    var dadosPeca = null;
    var dadosFundo = null;
    try {
        dadosPeca = pixels(await carregar(urlPeca), pw, ph);
        dadosFundo = pixels(await carregar(urlFundo), w, h);
    } catch (e) {
        try {
            dadosPeca = pixels(await carregarViaFetch(urlPeca), pw, ph);
            dadosFundo = pixels(await carregarViaFetch(urlFundo), w, h);
        } catch (e2) {
            return 'cors';
        }
    }

    // A silhueta da peca e' todo pixel opaco dela.
    var pontos = [];
    for (var y = 0; y < ph; y++) {
        for (var x = 0; x < pw; x++) {
            if (dadosPeca[(y * pw + x) * 4 + 3] > 80) { pontos.push([x, y]); }
        }
    }
    if (!pontos.length) { return 'sem-silhueta'; }

    // O encaixe e' a regiao ESCURA do fundo: para cada X, soma o brilho nos
    // pontos da silhueta e fica com o X de menor soma. De 3 em 3 pontos --
    // basta para acertar e mantem a varredura rapida.
    var melhorX = 0;
    var menorErro = Infinity;
    for (var bx = 5; bx < w - pw; bx++) {
        var erro = 0;
        for (var p = 0; p < pontos.length; p = p + 3) {
            var px = Math.round(bx + pontos[p][0]);
            var py = Math.round(topoPeca + pontos[p][1]);
            if (px < 0 || py < 0 || px >= w || py >= h) { continue; }
            var i = (py * w + px) * 4;
            erro = erro + dadosFundo[i] + dadosFundo[i + 1] + dadosFundo[i + 2];
        }
        if (erro < menorErro) {
            menorErro = erro;
            melhorX = bx;
        }
    }

    var botao = ultimo('[class*=geetest_btn]');
    var trilha = ultimo('[class*=geetest_track]');
    if (!botao) { return 'sem-botao'; }

    var rb = botao.getBoundingClientRect();
    var rt = rb;
    if (trilha) { rt = trilha.getBoundingClientRect(); }
    var xBase = rb.left + rb.width / 2;
    var yBase = rb.top + rb.height / 2;

    // O botao nao nasce no zero da trilha: sem descontar o offset dele o
    // arrasto passa do buraco.
    var offset = rb.left - rt.left + rb.width / 2;
    var distancia = (melhorX + pw / 2) - offset;

    function disparar(tipo, x, y) {
        botao.dispatchEvent(new PointerEvent(tipo, {
            bubbles: true, clientX: x, clientY: y,
            pointerType: 'mouse', isPrimary: true
        }));
    }

    // 45 passos com easing (acelera e desacelera) e tremida de 1px em Y --
    // arrasto reto e de velocidade constante e' o que a GeeTest reprova.
    await dormir(600);
    disparar('pointerdown', xBase, yBase);
    var passos = 45;
    for (var s = 0; s <= passos; s++) {
        var t = s / passos;
        var suave = 0;
        if (t < 0.5) {
            suave = 2 * t * t;
        } else {
            suave = 1 - Math.pow(-2 * t + 2, 2) / 2;
        }
        disparar('pointermove', xBase + distancia * suave, yBase + (Math.random() * 2 - 1));
        await dormir(10 + Math.random() * 10);
    }
    disparar('pointerup', xBase + distancia, yBase);
    return 'ok:' + Math.round(distancia);
})();

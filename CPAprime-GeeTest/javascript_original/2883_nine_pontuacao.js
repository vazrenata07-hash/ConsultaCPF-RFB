
var dataIcone = arguments[0], dataSprite = arguments[1], cels = arguments[2];
return (async () => {
    var N = 140;

    function carregar(url) {
        return new Promise(function (ok, falhou) {
            var img = new Image();
            img.onload = function () { ok(img); };
            img.onerror = function () { falhou('carga'); };
            img.src = url;
        });
    }
    // recorta (sx,sy,sw,sh) da imagem num quadro N x N e devolve cinza
    // (mesmos pesos do BGR2GRAY do OpenCV). Pinta de BRANCO antes de
    // desenhar, o que resolve o alpha do icone de graca.
    function cinza(img, sx, sy, sw, sh) {
        var c = document.createElement('canvas');
        c.width = N; c.height = N;
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, N, N);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, N, N);
        var d = ctx.getImageData(0, 0, N, N).data;
        var g = new Float32Array(N * N);
        for (var i = 0; i < N * N; i++) {
            g[i] = 0.299 * d[i*4] + 0.587 * d[i*4+1] + 0.114 * d[i*4+2];
        }
        return g;
    }
    // limiar automatico de Otsu (maximiza a variancia entre classes)
    function otsu(g) {
        var hist = new Float64Array(256), i, t;
        for (i = 0; i < g.length; i++) {
            var v = g[i] | 0;
            if (v < 0) { v = 0; } if (v > 255) { v = 255; }
            hist[v]++;
        }
        var total = g.length, soma = 0;
        for (t = 0; t < 256; t++) { soma += t * hist[t]; }
        var somaB = 0, wB = 0, melhor = -1, limiar = 0;
        for (t = 0; t < 256; t++) {
            wB += hist[t];
            if (wB === 0) { continue; }
            var wF = total - wB;
            if (wF === 0) { break; }
            somaB += t * hist[t];
            var mB = somaB / wB, mF = (soma - somaB) / wF;
            var val = wB * wF * (mB - mF) * (mB - mF);
            if (val > melhor) { melhor = val; limiar = t; }
        }
        return limiar;
    }
    function binarioInvertido(g) {
        var lim = otsu(g), out = new Float32Array(g.length);
        for (var i = 0; i < g.length; i++) { out[i] = (g[i] > lim) ? 0 : 255; }
        return out;
    }
    // GaussianBlur 3x3 sigma=0 do OpenBLAS: kernel [0.2261, 0.5477, 0.2261]
    function borrar(g) {
        var k0 = 0.2261, k1 = 0.5477, t = new Float32Array(N * N), o = new Float32Array(N * N), x, y;
        for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
            var a = g[y*N + (x > 0 ? x-1 : 0)];
            var b = g[y*N + x];
            var c = g[y*N + (x < N-1 ? x+1 : N-1)];
            t[y*N + x] = k0*a + k1*b + k0*c;
        }
        for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
            var a2 = t[(y > 0 ? y-1 : 0)*N + x];
            var b2 = t[y*N + x];
            var c2 = t[(y < N-1 ? y+1 : N-1)*N + x];
            o[y*N + x] = k0*a2 + k1*b2 + k0*c2;
        }
        return o;
    }
    // Sobel 3x3 + magnitude no estilo addWeighted(convertScaleAbs(gx),0.5,...)
    // -- o convertScaleAbs SATURA em 255 antes da soma, entao a ordem importa.
    function gradiente(g) {
        var b = borrar(g), o = new Float32Array(N * N), x, y;
        for (y = 1; y < N-1; y++) for (x = 1; x < N-1; x++) {
            var i = y*N + x;
            var gx = (b[i-N+1] + 2*b[i+1] + b[i+N+1]) - (b[i-N-1] + 2*b[i-1] + b[i+N-1]);
            var gy = (b[i+N-1] + 2*b[i+N] + b[i+N+1]) - (b[i-N-1] + 2*b[i-N] + b[i-N+1]);
            var ax = Math.abs(gx); if (ax > 255) { ax = 255; }
            var ay = Math.abs(gy); if (ay > 255) { ay = 255; }
            o[i] = 0.5*ax + 0.5*ay;
        }
        return o;
    }
    // TM_CCOEFF_NORMED com template do MESMO tamanho = correlacao de Pearson
    function correlacao(a, b) {
        var i, ma = 0, mb = 0, n = a.length;
        for (i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
        ma /= n; mb /= n;
        var num = 0, da = 0, db = 0;
        for (i = 0; i < n; i++) {
            var xa = a[i] - ma, xb = b[i] - mb;
            num += xa*xb; da += xa*xa; db += xb*xb;
        }
        var den = Math.sqrt(da * db);
        if (den <= 0) { return 0; }
        return num / den;
    }

    // as imagens ja' vieram do Python em data: URL -- mesma origem, canvas limpo
    var imgIcone, imgSprite;
    try {
        imgIcone = await carregar(dataIcone);
        imgSprite = await carregar(dataSprite);
    } catch (e) { return { ok: false, erro: 'carga' }; }

    var gi = gradiente(binarioInvertido(cinza(imgIcone, 0, 0, imgIcone.naturalWidth, imgIcone.naturalHeight)));
    var sw = imgSprite.naturalWidth / 3, sh = imgSprite.naturalHeight / 3;

    var notas = [];
    for (var k = 0; k < 9; k++) {
        var gc = gradiente(cinza(imgSprite, cels[k].col*sw, cels[k].lin*sh, sw, sh));
        notas.push({ i: k, v: correlacao(gc, gi) });
    }
    notas.sort(function (a, b) { return b.v - a.v; });
    return {
        ok: true,
        alvos: [notas[0].i, notas[1].i, notas[2].i],
        margem: notas[2].v - notas[3].v,
        notas: notas.map(function (x) { return Math.round(x.v * 1000) / 1000; })
    };
})();

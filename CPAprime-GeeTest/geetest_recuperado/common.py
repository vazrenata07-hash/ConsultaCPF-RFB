"""Reconstrução legível de helpers GeeTest de CPAprime.exe (Nuitka).

Este arquivo NÃO é o fonte original recuperado. Assinaturas vêm dos metadados
Nuitka; JavaScript vem literalmente do bloco de constantes; o fluxo Python foi
reconstruído por análise estática. Consulte EVIDENCIAS.md para os limites.
Nada é executado no navegador ao importar este módulo.
"""
from __future__ import annotations
import base64
import time

_JS_2874 = "var todos = document.querySelectorAll('[class*=geetest_slice_bg]');for (var i = todos.length - 1; i >= 0; i--) {  var r = todos[i].getBoundingClientRect();  if (r.width > 2 && r.height > 2) { return true; }}return false;"

_JS_2875 = "var todos = document.querySelectorAll('[class*=geetest_refresh]');if (!todos.length) { return false; }todos[todos.length - 1].click();return true;"

_JS_2879 = "\nfunction _nineVisiveis() {\n    var todos = document.querySelectorAll('[class*=geetest_item_img]');\n    var vivos = [];\n    for (var i = 0; i < todos.length; i++) {\n        var r = todos[i].getBoundingClientRect();\n        if (r.width < 3 || r.height < 3) { continue; }\n        var cs = window.getComputedStyle(todos[i]);\n        if (cs.display === 'none' || cs.visibility === 'hidden') { continue; }\n        if (parseFloat(cs.opacity) === 0) { continue; }\n        vivos.push(todos[i]);\n    }\n    if (vivos.length < 9) { return null; }\n    return vivos.slice(vivos.length - 9);\n}\n"

_JS_2881 = 'return _nineVisiveis() !== null;'

_JS_2884 = '\nvar imgs = _nineVisiveis();\nif (!imgs) { return null; }\n// so conta se a grade ainda esta VISIVEL: quando a casa aceita, o painel some\n// mas os elementos ficam no DOM, e sem esta guarda o laco seguia "corrigindo"\n// e tocando em coordenadas que ja apontam para o lobby.\n\nfunction itemDe(img) {\n    var el = img.parentElement, d = 0;\n    while (el && d < 4) {\n        var c = String(el.className || \'\');\n        if (c.indexOf(\'geetest_item\') >= 0 &&\n            c.indexOf(\'geetest_item_wrap\') < 0 &&\n            c.indexOf(\'geetest_item_img\') < 0) { return el; }\n        el = el.parentElement; d++;\n    }\n    return img.parentElement || img;\n}\n// A assinatura NAO pode usar a classe do item: ela carrega o indice\n// (geetest_0, geetest_1, ...), entao toda celula seria unica e a comparacao\n// por maioria marcaria as nove. Vale so o ESTILO COMPUTADO do overlay -- e\' o\n// que muda ao selecionar, inclusive quando a mudanca vem de uma classe nova\n// (a classe altera o estilo, e o estilo e\' o que a gente le).\nfunction assinatura(item) {\n    var s = \'\';\n    var fantasmas = item.querySelectorAll(\'[class*=geetest_item_ghost],[class*=geetest_item_icon]\');\n    for (var j = 0; j < fantasmas.length; j++) {\n        var cs = window.getComputedStyle(fantasmas[j]);\n        s = s + \'|\' + cs.opacity + \',\' + cs.display + \',\' + cs.visibility +\n            \',\' + cs.transform + \',\' + cs.backgroundColor;\n    }\n    return s;\n}\nvar assin = [], k;\nfor (k = 0; k < imgs.length; k++) { assin.push(assinatura(itemDe(imgs[k]))); }\nvar conta = {};\nfor (k = 0; k < assin.length; k++) { conta[assin[k]] = (conta[assin[k]] || 0) + 1; }\nvar base = assin[0], melhor = 0;\nfor (var c2 in conta) {\n    if (conta[c2] > melhor) { melhor = conta[c2]; base = c2; }\n}\nvar out = [];\nfor (k = 0; k < assin.length; k++) { out.push(assin[k] !== base); }\nreturn out;\n'

_JS_2887 = "\nvar p = document.querySelectorAll(\n    '[class*=geetest_slice_bg],[class*=geetest_item_img],[class*=geetest_window],' +\n    '[class*=geetest_popup_ghost],[class*=geetest_box],[class*=geetest_panel]');\nfor (var k = 0; k < p.length; k++) {\n    var el = p[k];\n    var r = el.getBoundingClientRect();\n    if (r.width < 3 || r.height < 3) { continue; }\n    var cs = window.getComputedStyle(el);\n    if (cs.display === 'none' || cs.visibility === 'hidden') { continue; }\n    if (parseFloat(cs.opacity) === 0) { continue; }\n    return true;\n}\nreturn false;\n"

_JS_2896 = "\nfunction _iconesVisiveis() {\n    var todos = document.querySelectorAll(\n        '[class*=geetest_ques_tips] img, [class*=geetest_ques_back] img');\n    var vivos = [];\n    for (var i = 0; i < todos.length; i++) {\n        var r = todos[i].getBoundingClientRect();\n        if (r.width < 3 || r.height < 3) { continue; }\n        var cs = window.getComputedStyle(todos[i]);\n        if (cs.display === 'none' || cs.visibility === 'hidden') { continue; }\n        if (parseFloat(cs.opacity) === 0) { continue; }\n        vivos.push(todos[i]);\n    }\n    return vivos;\n}\n"

_JS_2898 = "\n// clique-em-ordem: tem foto de fundo com imagem E varios icones de pergunta,\n// e NAO tem a grade do 3x3. Nao depende de nome de classe da sessao.\nvar itens = document.querySelectorAll('[class*=geetest_item_img]');\nfor (var k = 0; k < itens.length; k++) {\n    var ri = itens[k].getBoundingClientRect();\n    if (ri.width > 3 && ri.height > 3) { return false; }   // e' 3x3\n}\nvar qs = _iconesVisiveis();\nif (qs.length < 2) { return false; }\nvar bgs = document.querySelectorAll('[class*=geetest_bg]');\nfor (var j = bgs.length - 1; j >= 0; j--) {\n    var r = bgs[j].getBoundingClientRect();\n    if (r.width < 40 || r.height < 40) { continue; }\n    var bi = String(window.getComputedStyle(bgs[j]).backgroundImage || '');\n    if (bi.indexOf('url(') >= 0) { return true; }\n}\nreturn false;\n"

_JS_2900 = "\n// So as marcas DENTRO da foto atual. O DOM guarda paineis antigos, cujas\n// marcas ficam em 0,0 (mesma armadilha do 3x3) -- contar todas dava 3 antes\n// mesmo do primeiro toque.\nvar bgs = document.querySelectorAll('[class*=geetest_bg]');\nvar foto = null;\nfor (var j = bgs.length - 1; j >= 0; j--) {\n    var r = bgs[j].getBoundingClientRect();\n    if (r.width >= 40 && r.height >= 40) { foto = r; break; }\n}\nif (!foto) { return -1; }\nvar m = document.querySelectorAll('[class*=geetest_square_mark]');\nvar n = 0;\nfor (var i = 0; i < m.length; i++) {\n    var rr = m[i].getBoundingClientRect();\n    var mx = rr.left + rr.width / 2;\n    var my = rr.top + rr.height / 2;\n    if (mx >= foto.left && mx <= foto.left + foto.width &&\n        my >= foto.top && my <= foto.top + foto.height) { n = n + 1; }\n}\nreturn n;\n"

class GeeTestCommonMixin:
    """Requer self.driver; atributos opcionais estão descritos em EVIDENCIAS.md."""

    _JS_GEETEST_PRESENTE = _JS_2874
    _JS_GEETEST_REFRESH = _JS_2875
    _JS_NINE_VISIVEIS = _JS_2879
    _JS_GEETEST_NINE_PRESENTE = _JS_2879 + _JS_2881
    _JS_GEETEST_NINE_MARCADAS = _JS_2879 + _JS_2884
    _JS_GEETEST_ALGUM = _JS_2887
    _JS_CLICK_VISIVEIS = _JS_2896
    _JS_GEETEST_CLICK_PRESENTE = _JS_2896 + _JS_2898
    _JS_GEETEST_CLICK_MARCAS = _JS_2900

    def _geetest_na_tela(self):
        """True se há um slider GeeTest visível agora."""
        try:
            return bool(self.driver and self.driver.execute_script(self._JS_GEETEST_PRESENTE))
        except Exception:
            return False

    def _geetest_refresh(self):
        """Solicita outro desafio pelo botão recuperado do DOM."""
        try:
            return bool(self.driver and self.driver.execute_script(self._JS_GEETEST_REFRESH))
        except Exception:
            return False

    def _geetest_nine_na_tela(self):
        try:
            return bool(self.driver and self.driver.execute_script(self._JS_GEETEST_NINE_PRESENTE))
        except Exception:
            return False

    def _geetest_aberto(self):
        try:
            return bool(self.driver and self.driver.execute_script(self._JS_GEETEST_ALGUM))
        except Exception:
            return False

    def _geetest_click_na_tela(self):
        try:
            return bool(self.driver and self.driver.execute_script(self._JS_GEETEST_CLICK_PRESENTE))
        except Exception:
            return False

    def _geetest_click_marcas(self):
        try:
            if not self.driver:
                return -1
            return int(self.driver.execute_script(self._JS_GEETEST_CLICK_MARCAS))
        except Exception:
            return -1

    def _baixar_data_url(self, url):
        """Retorna uma imagem como data: URL, com cache por URL, ou ''.

        O fluxo recuperado tenta três vezes; a última usa _proxies_api().
        requests.get é mantido: não se desativa a configuração de proxy herdada
        pelo requests. Nenhum download ocorre ao importar este módulo.
        """
        if not url:
            return ''
        if url.startswith('data:'):
            return url
        cache = getattr(self, '_cache_img_captcha', None)
        if cache is None:
            cache = self._cache_img_captcha = {}
        if url in cache:
            return cache[url]
        try:
            proxies = self._proxies_api()
        except Exception:
            proxies = None
        cabecalho = {'User-Agent': getattr(self, 'MobileUA', '') or 'Mozilla/5.0'}
        import requests
        for tentativa in range(1, 4):
            usar = proxies if tentativa == 3 else None
            try:
                resp = requests.get(url, timeout=8, proxies=usar, headers=cabecalho)
                if resp.status_code != 200 or not resp.content:
                    continue
                tipo = resp.headers.get('Content-Type', 'image/png').split(';')[0].strip()
                if not tipo.startswith('image/'):
                    tipo = 'image/png'
                dado = 'data:%s;base64,%s' % (tipo, base64.b64encode(resp.content).decode('ascii'))
                if len(cache) > 40:
                    cache.clear()
                cache[url] = dado
                return dado
            except Exception:
                continue
        return ''

    def _baixar_bytes(self, url):
        """Conteúdo bruto da imagem, ou b''; compartilha o cache de data: URLs."""
        try:
            dado = self._baixar_data_url(url)
            if not dado or ',' not in dado:
                return b''
            return base64.b64decode(dado.split(',', 1)[1])
        except Exception:
            return b''

    def _tocar_ponto(self, x, y):
        """Toque CDP real em emulação mobile; não sintetiza clique JavaScript."""
        try:
            if not self.driver:
                return False
            ponto = {'x': float(x), 'y': float(y), 'radiusX': 12, 'radiusY': 12, 'force': 1}
            self.driver.execute_cdp_cmd('Input.dispatchTouchEvent', {
                'type': 'touchStart', 'touchPoints': [ponto],
            })
            time.sleep(0.05)
            self.driver.execute_cdp_cmd('Input.dispatchTouchEvent', {
                'type': 'touchEnd', 'touchPoints': [],
            })
            return True
        except Exception:
            return False

    def _tag(self):
        try:
            return '[b%s]' % self.id_browser
        except Exception:
            return '[b?]'

    def _pausar_clique_centro(self):
        try:
            anterior = getattr(self, 'clique_centro_ativo', False)
            self.clique_centro_ativo = False
            return anterior
        except Exception:
            return False

    def _voltar_clique_centro(self, anterior):
        try:
            self.clique_centro_ativo = anterior
        except Exception:
            pass

    def _geetest_nine_marcar(self, alvos, cels, passadas=4):
        """Converge a seleção 3x3, tocando somente faltantes e excedentes.

        alvos: índices 0..8; cels: lista de dicts com centros 'x' e 'y'.
        A interpretação de grade fechada após uma passada vem do fluxo nativo;
        True neste helper não é confirmação de aceitação do servidor.
        """
        if not self.driver:
            return False
        desejado = set(alvos)
        atual = set()
        for passada in range(1, passadas + 1):
            try:
                marcadas = self.driver.execute_script(self._JS_GEETEST_NINE_MARCADAS)
            except Exception:
                marcadas = None
            if not isinstance(marcadas, list) or len(marcadas) < 9:
                if passada > 1:
                    print('%s [geetest 3x3] a grade fechou durante a marcacao' % self._tag())
                    return True
                print('%s [geetest 3x3] nao consegui ler o que esta marcado' % self._tag())
                return False
            atual = {i for i in range(9) if marcadas[i]}
            if atual == desejado:
                if passada > 1:
                    print('%s [geetest 3x3] precisei de %d passadas para fixar a selecao' % (self._tag(), passada))
                return True
            faltam = desejado - atual
            sobram = atual - desejado
            ordem = [i for i in alvos if i in faltam] + sorted(sobram)
            for i in ordem:
                if not self._geetest_nine_na_tela():
                    print('%s [geetest 3x3] a grade fechou — parando de tocar' % self._tag())
                    return True
                self._tocar_ponto(cels[i]['x'], cels[i]['y'])
                time.sleep(0.28)
            time.sleep(0.35)
        print('%s [geetest 3x3] nao consegui fixar a selecao (queria %s, ficou %s)' % (
            self._tag(), sorted(desejado), sorted(atual)))
        return False

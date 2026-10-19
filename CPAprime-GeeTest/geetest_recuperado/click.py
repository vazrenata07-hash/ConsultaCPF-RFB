"""GeeTest clique-em-ordem: reconstrução Python por análise estática do CPAprime.

As strings JavaScript são literais extraídas. O Python é uma reimplementação
legível do algoritmo e do fluxo nativos, não o arquivo-fonte original.
Integração: misture GeeTestClickMixin com os helpers comuns de Navegacao.
"""
import itertools
import time

import cv2
import numpy as np


# Os quatro valores a seguir são escritos a partir das constantes do executável.
_JS_CLICK_VISIVEIS = "\nfunction _iconesVisiveis() {\n    var todos = document.querySelectorAll(\n        '[class*=geetest_ques_tips] img, [class*=geetest_ques_back] img');\n    var vivos = [];\n    for (var i = 0; i < todos.length; i++) {\n        var r = todos[i].getBoundingClientRect();\n        if (r.width < 3 || r.height < 3) { continue; }\n        var cs = window.getComputedStyle(todos[i]);\n        if (cs.display === 'none' || cs.visibility === 'hidden') { continue; }\n        if (parseFloat(cs.opacity) === 0) { continue; }\n        vivos.push(todos[i]);\n    }\n    return vivos;\n}\n"

_JS_GEETEST_CLICK_PRESENTE_CORPO = "\n// clique-em-ordem: tem foto de fundo com imagem E varios icones de pergunta,\n// e NAO tem a grade do 3x3. Nao depende de nome de classe da sessao.\nvar itens = document.querySelectorAll('[class*=geetest_item_img]');\nfor (var k = 0; k < itens.length; k++) {\n    var ri = itens[k].getBoundingClientRect();\n    if (ri.width > 3 && ri.height > 3) { return false; }   // e' 3x3\n}\nvar qs = _iconesVisiveis();\nif (qs.length < 2) { return false; }\nvar bgs = document.querySelectorAll('[class*=geetest_bg]');\nfor (var j = bgs.length - 1; j >= 0; j--) {\n    var r = bgs[j].getBoundingClientRect();\n    if (r.width < 40 || r.height < 40) { continue; }\n    var bi = String(window.getComputedStyle(bgs[j]).backgroundImage || '');\n    if (bi.indexOf('url(') >= 0) { return true; }\n}\nreturn false;\n"

_JS_GEETEST_CLICK_URLS_CORPO = '\nreturn (function () {\n    function urlDoFundo(el) {\n        var bi = String(window.getComputedStyle(el).backgroundImage || \'\');\n        var m = bi.match(/url\\([\'"]?(.*?)[\'"]?\\)/);\n        return m ? m[1] : \'\';\n    }\n    var qs = _iconesVisiveis();\n    if (qs.length < 2) { return { ok: false, erro: \'sem-pergunta\' }; }\n    var alvo = null, cx = null;\n    var bgs = document.querySelectorAll(\'[class*=geetest_bg]\');\n    for (var j = bgs.length - 1; j >= 0; j--) {\n        var r = bgs[j].getBoundingClientRect();\n        if (r.width < 40 || r.height < 40) { continue; }\n        if (urlDoFundo(bgs[j])) { alvo = bgs[j]; cx = r; break; }\n    }\n    if (!alvo) { return { ok: false, erro: \'sem-foto\' }; }\n    var icones = [];\n    for (var k = 0; k < qs.length; k++) { icones.push(qs[k].src); }\n    return {\n        ok: true,\n        foto: urlDoFundo(alvo),\n        icones: icones,\n        // retangulo da foto NA TELA: e\' o que converte coordenada de imagem\n        // em coordenada de toque\n        caixa: { x: cx.left, y: cx.top, w: cx.width, h: cx.height }\n    };\n})();\n'

_JS_GEETEST_CLICK_MARCAS = "\n// So as marcas DENTRO da foto atual. O DOM guarda paineis antigos, cujas\n// marcas ficam em 0,0 (mesma armadilha do 3x3) -- contar todas dava 3 antes\n// mesmo do primeiro toque.\nvar bgs = document.querySelectorAll('[class*=geetest_bg]');\nvar foto = null;\nfor (var j = bgs.length - 1; j >= 0; j--) {\n    var r = bgs[j].getBoundingClientRect();\n    if (r.width >= 40 && r.height >= 40) { foto = r; break; }\n}\nif (!foto) { return -1; }\nvar m = document.querySelectorAll('[class*=geetest_square_mark]');\nvar n = 0;\nfor (var i = 0; i < m.length; i++) {\n    var rr = m[i].getBoundingClientRect();\n    var mx = rr.left + rr.width / 2;\n    var my = rr.top + rr.height / 2;\n    if (mx >= foto.left && mx <= foto.left + foto.width &&\n        my >= foto.top && my <= foto.top + foto.height) { n = n + 1; }\n}\nreturn n;\n"

_JS_GEETEST_CLICK_PRESENTE = _JS_CLICK_VISIVEIS + _JS_GEETEST_CLICK_PRESENTE_CORPO
_JS_GEETEST_CLICK_URLS = _JS_CLICK_VISIVEIS + _JS_GEETEST_CLICK_URLS_CORPO


def _grad(imagem):
    """Algoritmo nativo em 0x1408bf780: gradiente Sobel em duas direções."""
    imagem = cv2.GaussianBlur(imagem, (3, 3), 0)
    gx = cv2.Sobel(imagem, cv2.CV_64F, 1, 0, ksize=3)
    gy = cv2.Sobel(imagem, cv2.CV_64F, 0, 1, ksize=3)
    return cv2.addWeighted(
        cv2.convertScaleAbs(gx), 0.5,
        cv2.convertScaleAbs(gy), 0.5, 0,
    )


def _mascara(conteudo):
    """Algoritmo nativo em 0x1408c0110: silhueta recortada do ícone."""
    imagem = cv2.imdecode(np.frombuffer(conteudo, np.uint8), cv2.IMREAD_UNCHANGED)
    if imagem is None:
        return None
    if len(imagem.shape) == 2:
        bgr = cv2.cvtColor(imagem, cv2.COLOR_GRAY2BGR)
    else:
        bgr = imagem[:, :, :3].copy()
        if imagem.shape[2] == 4:
            bgr[imagem[:, :, 3] < 80] = 255
    cinza = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    _, mascara = cv2.threshold(
        cinza, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU,
    )
    ys, xs = np.where(mascara > 0)
    if len(xs) == 0:
        return None
    return mascara[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


class GeeTestClickMixin:
    _JS_CLICK_VISIVEIS = _JS_CLICK_VISIVEIS
    _JS_GEETEST_CLICK_PRESENTE = _JS_GEETEST_CLICK_PRESENTE
    _JS_GEETEST_CLICK_URLS = _JS_GEETEST_CLICK_URLS
    _JS_GEETEST_CLICK_MARCAS = _JS_GEETEST_CLICK_MARCAS

    def _geetest_click_marcas(self):
        """Quantidade de marcas na foto atual; -1 se a leitura falhar."""
        try:
            return int(self.driver.execute_script(self._JS_GEETEST_CLICK_MARCAS))
        except Exception:
            return -1

    def _geetest_click_na_tela(self):
        try:
            return bool(self.driver.execute_script(self._JS_GEETEST_CLICK_PRESENTE))
        except Exception:
            return False

    def _achar_figuras_na_foto(self, foto_bytes, icones_bytes):
        """Localiza os ícones na ordem pedida; retorna pontos e (largura, altura).

        Reconstrução do corpo nativo 0x1408ba410. A ordem das operações de
        visão, escalas, rotações, supressão e restrição entre pontos foi mantida.
        """
        foto = cv2.imdecode(
            np.frombuffer(foto_bytes, np.uint8), cv2.IMREAD_GRAYSCALE,
        )
        if foto is None:
            return None, None
        gfoto = _grad(foto)
        picos = []
        for icone_bytes in icones_bytes:
            mascara = _mascara(icone_bytes)
            if mascara is None:
                return None, None
            mapa = None
            for lado in range(22, 48, 6):
                m = cv2.resize(mascara, (lado, lado))
                for angulo in range(0, 360, 15):
                    rotacao = cv2.getRotationMatrix2D(
                        (lado / 2.0, lado / 2.0), angulo, 1.0,
                    )
                    girada = cv2.warpAffine(m, rotacao, (lado, lado))
                    gicone = _grad(girada)
                    if (gicone.shape[0] > gfoto.shape[0]
                            or gicone.shape[1] > gfoto.shape[1]):
                        continue
                    resposta = cv2.matchTemplate(
                        gfoto, gicone, cv2.TM_CCOEFF_NORMED,
                    )
                    centralizada = np.full(gfoto.shape, -9.0, np.float32)
                    altura, largura = resposta.shape
                    centro = lado // 2
                    centralizada[
                        centro:centro + altura,
                        centro:centro + largura,
                    ] = resposta
                    mapa = centralizada if mapa is None else np.maximum(mapa, centralizada)
            if mapa is None:
                return None, None
            tmp = mapa.copy()
            lista = []
            for _ in range(6):
                _, nota, _, ponto = cv2.minMaxLoc(tmp)
                lista.append((float(nota), ponto[0], ponto[1]))
                cv2.circle(tmp, ponto, 30, -9.0, -1)
            picos.append(lista)

        melhor = None
        melhor_soma = float('-inf')
        for escolha in itertools.product(range(6), repeat=len(picos)):
            pts = [(picos[i][j][1], picos[i][j][2])
                   for i, j in enumerate(escolha)]
            juntos = any(
                abs(pts[i][0] - pts[j][0]) < 25
                and abs(pts[i][1] - pts[j][1]) < 25
                for i in range(len(pts))
                for j in range(i + 1, len(pts))
            )
            if juntos:
                continue
            soma = sum(picos[i][j][0] for i, j in enumerate(escolha))
            if soma > melhor_soma:
                melhor_soma = soma
                melhor = escolha
        if melhor is None:
            return None, None
        pontos = []
        notas = []
        for i, j in enumerate(melhor):
            nota, x, y = picos[i][j]
            pontos.append((x, y))
            notas.append(nota)
        return pontos, (foto.shape[1], foto.shape[0])

    def resolver_geetest_click_se_aparecer(self, respostas=5):
        """Executa o resolvedor e restaura o clique automático do aplicativo."""
        if not self.driver or not self.CAPTCHA_SOLVER:
            return False
        if not self._geetest_click_na_tela():
            return False
        anterior = self._pausar_clique_centro()
        try:
            return self._resolver_geetest_click(respostas)
        finally:
            self._voltar_clique_centro(anterior)

    def _resolver_geetest_click(self, respostas_max):
        """Controlador reconstruído do corpo nativo 0x1408c2b80.

        As mensagens de diagnóstico foram extraídas; veja NOTAS_CLICK.md para
        as diferenças pontuais de tratamento de erros desta implementação.
        """
        respostas = 0
        esperas = 0
        limpezas = 0
        while respostas < respostas_max:
            try:
                info = self.driver.execute_script(self._JS_GEETEST_CLICK_URLS)
            except Exception as erro:
                print('%s [geetest ordem] o script nao rodou: %s' % (self._tag(), erro))
                return False
            if not isinstance(info, dict) or not info.get('ok'):
                motivo = info.get('erro', '') if isinstance(info, dict) else ''
                if motivo in ('sem-pergunta', 'sem-foto'):
                    esperas += 1
                    if esperas <= 6:
                        time.sleep(1.0)
                        continue
                print('%s [geetest ordem] nao consegui ler o desafio: %s' % (self._tag(), motivo))
                return False
            esperas = 0

            # A página mantém marcas da rodada anterior durante a transição.
            marcas = self._geetest_click_marcas()
            if marcas > 0:
                fim = time.time() + 6.0
                while time.time() < fim and self._geetest_click_marcas() > 0:
                    time.sleep(0.5)
            sobrou = self._geetest_click_marcas()
            if sobrou > 0:
                limpezas += 1
                if limpezas > 3:
                    print('%s [geetest ordem] as marcas nao limpam — desisto' % self._tag())
                    return False
                print('%s [geetest ordem] sobraram %d marcas da rodada anterior — pedindo outro desafio'
                      % (self._tag(), sobrou))
                self._geetest_refresh()
                time.sleep(2.0)
                continue

            foto = self._baixar_bytes(info.get('foto', ''))
            icones = [self._baixar_bytes(u) for u in info.get('icones', [])]
            if not foto or not icones or any(not b for b in icones):
                print('%s [geetest ordem] nao consegui baixar as imagens' % self._tag())
                return False
            try:
                pontos, tam = self._achar_figuras_na_foto(foto, icones)
            except Exception as erro:
                print('%s [geetest ordem] falhei ao pontuar: %s' % (self._tag(), erro))
                return False
            if not pontos or len(pontos) != len(icones):
                print('%s [geetest ordem] nao localizei as figuras' % self._tag())
                return False
            caixa = info.get('caixa') or {}
            larg_img, alt_img = tam
            ex = float(caixa.get('w', larg_img)) / max(1.0, larg_img)
            ey = float(caixa.get('h', alt_img)) / max(1.0, alt_img)
            na_tela = [
                (caixa.get('x', 0) + px * ex,
                 caixa.get('y', 0) + py * ey)
                for px, py in pontos
            ]
            respostas += 1
            print('%s [geetest ordem] tocando %s — resposta %d de %d'
                  % (self._tag(), na_tela, respostas, respostas_max))
            for indice, (x, y) in enumerate(na_tela):
                if not self._geetest_aberto():
                    print('%s [geetest ordem] o painel fechou — parando de tocar' % self._tag())
                    break
                self._tocar_ponto(x, y)
                time.sleep(self._PAUSA_ENTRE_TOQUES)
                marcas = self._geetest_click_marcas()
                if 0 <= marcas < indice + 1:
                    self._tocar_ponto(x, y)
                    time.sleep(self._PAUSA_ENTRE_TOQUES)
            time.sleep(0.4)
            marcas = self._geetest_click_marcas()
            if marcas >= 0 and marcas != len(na_tela):
                print('%s [geetest ordem] ficaram %d marcas para %d figuras — nao vou confirmar, pedindo outro desafio'
                      % (self._tag(), marcas, len(na_tela)))
                self._geetest_refresh()
                time.sleep(2.0)
                continue
            try:
                self.driver.execute_script(self._JS_GEETEST_NINE_CONFIRMAR)
            except Exception as erro:
                # A versão reconstruída registra o erro e ainda observa o painel.
                print('%s [geetest ordem] erro ao confirmar: %s' % (self._tag(), erro))
            prazo = time.time() + 6
            fechado_desde = None
            while time.time() < prazo:
                aberto = self._geetest_click_na_tela() or self._geetest_aberto()
                if aberto:
                    fechado_desde = None
                elif fechado_desde is None:
                    fechado_desde = time.time()
                elif time.time() - fechado_desde >= 2.0:
                    print('%s [geetest ordem] resolvido' % self._tag())
                    return True
                time.sleep(0.3)
            print('%s [geetest ordem] respondi e o captcha ficou (resposta %d de %d)'
                  % (self._tag(), respostas, respostas_max))
            time.sleep(1.5)
        return False

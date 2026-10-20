"""Controle Aliyun reconstruído por análise estática de CPAprime.exe.

Não é o fonte Python original. Os nomes, argumentos, constantes e JavaScript
vêm do executável; o fluxo foi reescrito em Python legível. Nenhum navegador
ou serviço é acessado na importação. Evidências e limites em EVIDENCIAS.md.
"""
from __future__ import annotations

import base64
import time

try:
    from .javascript_literal import (
        _JS_ALIYUN_ESTADO, _JS_ALIYUN_POS, _JS_ALIYUN_PRESENTE,
        _JS_GEETEST_ALGUM,
    )
except ImportError:
    from javascript_literal import (
        _JS_ALIYUN_ESTADO, _JS_ALIYUN_POS, _JS_ALIYUN_PRESENTE,
        _JS_GEETEST_ALGUM,
    )


class AliyunMixin:
    """Requer um driver com execute_script e execute_cdp_cmd.

    Todos os helpers necessários estão neste módulo. A detecção adicional de
    GeeTest serve apenas ao método genérico _captcha_aberto; não inclui outro
    resolvedor nem depende do pacote GeeTest.
    """

    _JS_ALIYUN_ESTADO = _JS_ALIYUN_ESTADO
    _JS_ALIYUN_POS = _JS_ALIYUN_POS
    _JS_ALIYUN_PRESENTE = _JS_ALIYUN_PRESENTE
    _JS_GEETEST_ALGUM = _JS_GEETEST_ALGUM

    def _tag(self):
        try:
            return '[b%s]' % self.id_browser
        except Exception:
            return '[b?]'

    def _baixar_data_url(self, url):
        """Helper compartilhado reconstruído: cache e até três tentativas."""
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
        import requests
        cabecalho = {'User-Agent': getattr(self, 'MobileUA', '') or 'Mozilla/5.0'}
        for tentativa in range(1, 4):
            try:
                resposta = requests.get(
                    url, timeout=8, headers=cabecalho,
                    proxies=proxies if tentativa == 3 else None,
                )
                if resposta.status_code != 200 or not resposta.content:
                    continue
                tipo = resposta.headers.get('Content-Type', 'image/png').split(';')[0].strip()
                if not tipo.startswith('image/'):
                    tipo = 'image/png'
                dado = 'data:%s;base64,%s' % (
                    tipo, base64.b64encode(resposta.content).decode('ascii'),
                )
                if len(cache) > 40:
                    cache.clear()
                cache[url] = dado
                return dado
            except Exception:
                continue
        return ''

    def _baixar_bytes(self, url):
        try:
            dado = self._baixar_data_url(url)
            return base64.b64decode(dado.split(',', 1)[1]) if dado and ',' in dado else b''
        except Exception:
            return b''

    def _aliyun_na_tela(self):
        try:
            return bool(self.driver and self.driver.execute_script(self._JS_ALIYUN_PRESENTE))
        except Exception:
            return False

    def _geetest_aberto(self):
        """Somente detector literal para a guarda genérica do aplicativo."""
        try:
            return bool(self.driver and self.driver.execute_script(self._JS_GEETEST_ALGUM))
        except Exception:
            return False

    def _captcha_aberto(self):
        return self._geetest_aberto() or self._aliyun_na_tela()

    def _toque_cru(self, tipo, x=None, y=None):
        try:
            if not self.driver:
                return False
            pontos = []
            if x is not None:
                pontos = [{
                    'x': float(x), 'y': float(y),
                    'radiusX': 12, 'radiusY': 12, 'force': 1,
                }]
            self.driver.execute_cdp_cmd('Input.dispatchTouchEvent', {
                'type': tipo, 'touchPoints': pontos,
            })
            return True
        except Exception:
            return False

    def _imagem_aliyun(self, src):
        if not src:
            return b''
        try:
            if src.startswith('data:'):
                return base64.b64decode(src.split(',', 1)[1])
            return self._baixar_bytes(src)
        except Exception:
            return b''

    def _achar_buraco_aliyun(self, fundo_bytes, peca_bytes):
        """Deslocamento no tamanho natural da imagem, por máscara HSV."""
        import numpy as _np
        import cv2 as _cv2

        peca = _cv2.imdecode(_np.frombuffer(peca_bytes, _np.uint8), _cv2.IMREAD_UNCHANGED)
        fundo = _cv2.imdecode(_np.frombuffer(fundo_bytes, _np.uint8), _cv2.IMREAD_UNCHANGED)
        if peca is None or fundo is None or len(peca.shape) < 3 or peca.shape[2] != 4:
            return None
        ys, xs = _np.where(peca[:, :, 3] > 40)
        if len(xs) < 50:
            return None
        larg_p = int(xs.max() - xs.min() + 1)
        alt_p = int(ys.max() - ys.min() + 1)
        cx_p = float(xs.mean())
        cy_p = float(ys.mean())
        hsv = _cv2.cvtColor(fundo[:, :, :3], _cv2.COLOR_BGR2HSV)
        sat = hsv[:, :, 1].astype(int)
        val = hsv[:, :, 2].astype(int)
        melhor = None
        for s_max, v_min in ((30, 190), (28, 185), (34, 195), (25, 180), (40, 200)):
            m = ((sat < s_max) & (val > v_min)).astype(_np.uint8)
            m = _cv2.morphologyEx(m, _cv2.MORPH_CLOSE, _np.ones((3, 3), _np.uint8))
            n, lab, st, _c = _cv2.connectedComponentsWithStats(m, 8)
            for i in range(1, n):
                x, y, w, h, _a = st[i]
                if w < 0.6 * larg_p or w > 1.4 * larg_p:
                    continue
                if h < 0.6 * alt_p or h > 1.4 * alt_p:
                    continue
                yy, xx = _np.where(lab == i)
                dy = abs(float(yy.mean()) - cy_p)
                if dy > 6:
                    continue
                nota = dy + abs(w - larg_p) / float(larg_p) * 10
                if melhor is None or nota < melhor[0]:
                    melhor = (nota, float(xx.mean()) - cx_p)
        return melhor[1] if melhor is not None else None

    def resolver_aliyun_se_aparecer(self, tentativas=3):
        if not self.driver or not self._aliyun_na_tela():
            return False
        try:
            return self._resolver_aliyun(tentativas)
        except Exception as erro:
            print('%s [aliyun] falhei: %s' % (self._tag(), erro))
            return False

    def _resolver_aliyun(self, tentativas):
        for tentativa in range(1, tentativas + 1):
            est = self.driver.execute_script(self._JS_ALIYUN_ESTADO)
            fundo = est.get('fundo') or {}
            peca = est.get('peca') or {}
            if not fundo or not peca:
                return False
            if not fundo.get('nw'):
                time.sleep(1.0)
                continue
            b_fundo = self._imagem_aliyun(fundo.get('src', ''))
            b_peca = self._imagem_aliyun(peca.get('src', ''))
            if not b_fundo or not b_peca:
                print('%s [aliyun] nao consegui baixar as imagens' % self._tag())
                return False
            dx_nat = self._achar_buraco_aliyun(b_fundo, b_peca)
            if dx_nat is None:
                print('%s [aliyun] nao localizei o buraco' % self._tag())
                return False
            escala = fundo['w'] / max(fundo['nw'], 1.0)
            alvo = peca['x'] + dx_nat * escala
            limite = fundo['x'] + fundo['w'] - peca['w']
            if alvo > limite:
                alvo = limite
            if not est.get('alca'):
                print('%s [aliyun] sem alca na tela' % self._tag())
                return False
            print('%s [aliyun] buraco a %.0fpx — arrastando (tentativa %d de %d)' % (
                self._tag(), dx_nat, tentativa, tentativas,
            ))
            self._arrastar_aliyun(est['alca'], alvo)
            prazo = time.time() + 6
            fechado = None
            while time.time() < prazo:
                if not self._aliyun_na_tela():
                    if fechado is None:
                        fechado = time.time()
                    elif time.time() - fechado >= 1.5:
                        print('%s [aliyun] resolvido' % self._tag())
                        return True
                else:
                    fechado = None
                time.sleep(0.3)
            print('%s [aliyun] arrastei e o captcha ficou (tentativa %d de %d)' % (
                self._tag(), tentativa, tentativas,
            ))
            time.sleep(1.5)
        return False

    def _arrastar_aliyun(self, alca, alvo_peca):
        ax = alca['x'] + alca['w'] / 2.0
        ay = alca['y'] + alca['h'] / 2.0
        self._toque_cru('touchStart', ax, ay)
        time.sleep(0.35)
        dedo = 0.0
        razao = 0.35
        try:
            for _ in range(12):
                pos = self.driver.execute_script(self._JS_ALIYUN_POS)
                if pos.get('peca') is None:
                    break
                erro = alvo_peca - pos['peca']
                if abs(erro) <= 1.0:
                    break
                avanco = erro / max(0.15, razao)
                if avanco > 120:
                    avanco = 120
                elif avanco < -120:
                    avanco = -120
                antes_peca = pos['peca']
                antes_dedo = dedo
                destino = dedo + avanco
                while abs(dedo - destino) > 0.5:
                    if abs(destino - dedo) < 6:
                        dedo = destino
                    elif destino > dedo:
                        dedo += 6
                    else:
                        dedo -= 6
                    self._toque_cru('touchMove', ax + dedo, ay)
                    time.sleep(0.012)
                time.sleep(0.3)
                pos2 = self.driver.execute_script(self._JS_ALIYUN_POS)
                if pos2.get('peca') is not None:
                    andou_peca = pos2['peca'] - antes_peca
                    andou_dedo = dedo - antes_dedo
                    if abs(andou_dedo) > 3 and abs(andou_peca) > 0.5:
                        razao = abs(andou_peca) / abs(andou_dedo)
            time.sleep(0.25)
        finally:
            self._toque_cru('touchEnd')


class AliyunResolver(AliyunMixin):
    """Adaptador independente: recebe um driver já aberto pelo aplicativo."""

    def __init__(self, driver, id_browser='local', mobile_ua='', proxies=None):
        self.driver = driver
        self.id_browser = id_browser
        self.MobileUA = mobile_ua
        self._proxies = proxies
        self._cache_img_captcha = {}

    def _proxies_api(self):
        return self._proxies

"""Controle reCAPTCHA/Buster reconstruído do módulo compilado classe_mp.

O Python é uma reconstrução de comportamento e os scripts em scripts.py são
literais extraídos. Esta API independente recebe uma sessão Selenium Chromium
já aberta e com a extensão Buster carregada. Não depende de CPAprime.
"""

import json
import time

from . import scripts as js
from .buster_config import BusterConfigMixin


class RecaptchaSolver(BusterConfigMixin):
    def __init__(self, driver):
        self.driver = driver
        self._recaptcha_bloqueado = False

    @property
    def recaptcha_bloqueado(self):
        """Indica que a página recusou o desafio de áudio por reputação de IP."""
        return self._recaptcha_bloqueado

    def resolver_recaptcha(self, timeout=90):
        """Fluxo reconstruído de Contas_pix.resolver_recaptcha(timeout=90).

        Para reCAPTCHA invisível, chamar após a página abrir o desafio. O retorno
        só é True quando há token preenchido na página ou checkbox marcado.
        O método não altera automaticamente as preferências da extensão Buster.
        """
        import urllib.request as _urlreq
        import websocket as _ws

        try:
            caps = self.driver.capabilities
            opts = caps.get("goog:chromeOptions") or caps.get("chrome") or {}
            addr = opts.get("debuggerAddress", "")
        except Exception:
            addr = ""
        conexoes = {}
        contador = [0]

        def _conn_iframe(parte):
            """Reconstrução da closure em 0x14085fd40."""
            if parte in conexoes:
                return conexoes[parte]
            achado = None
            if not addr:
                return None
            try:
                with _urlreq.urlopen("http://" + addr + "/json", timeout=2) as resp:
                    alvos = json.loads(resp.read().decode("utf-8"))
                for t in alvos:
                    url = t.get("url", "") or ""
                    if "recaptcha" in url and parte in url:
                        achado = t
                        break
            except Exception:
                return None
            if not achado:
                return None
            conn = _ws.create_connection(
                achado["webSocketDebuggerUrl"], suppress_origin=True, timeout=10
            )
            conexoes[parte] = conn
            return conn

        def _eval_iframe(parte, expr):
            """Reconstrução da closure em 0x140861600."""
            try:
                conn = _conn_iframe(parte)
                if not conn:
                    return None
                contador[0] += 1
                ident = contador[0]
                conn.send(
                    json.dumps(
                        {
                            "id": ident,
                            "method": "Runtime.evaluate",
                            "params": {
                                "expression": expr,
                                "awaitPromise": True,
                                "returnByValue": True,
                            },
                        }
                    )
                )
                while True:
                    msg = json.loads(conn.recv())
                    if msg.get("id") == ident:
                        return msg.get("result", {}).get("result", {}).get("value")
            except Exception:
                # Invalida o target em cache para permitir nova descoberta.
                # Adaptação: fecha também a conexão descartada, evitando vazamento.
                descartada = conexoes.pop(parte, None)
                if descartada is not None:
                    try:
                        descartada.close()
                    except Exception:
                        pass
                return None

        def ler(parte, corpo):
            """Lê primeiro pelo documento pai; usa CDP para iframe cross-origin."""
            script = (
                js.LER_PREFIXO + json.dumps(parte) + js.LER_MEIO
                + corpo + js.LER_SUFIXO
            )
            try:
                valor = self.driver.execute_script(script)
            except Exception:
                valor = None
            if valor == "__SEM_IFRAME__":
                return None
            if valor != "__CROSS__":
                return valor
            return _eval_iframe(parte, js.FRAME_PREFIXO + corpo + js.FRAME_SUFIXO)

        def canto_iframe(parte):
            script = js.CANTO_PREFIXO + json.dumps(parte) + js.CANTO_SUFIXO
            try:
                return self.driver.execute_script(script)
            except Exception:
                return None

        def centro(parte, seletor):
            corpo = js.CENTRO_PREFIXO + json.dumps(seletor) + js.CENTRO_SUFIXO
            base = canto_iframe(parte)
            if base is None:
                return None
            dentro = ler(parte, corpo)
            if dentro is None:
                return None
            return (base[0] + dentro[0], base[1] + dentro[1])

        def clicar(ponto):
            x = float(ponto[0])
            y = float(ponto[1])
            self.driver.execute_cdp_cmd(
                "Input.dispatchMouseEvent", {"type": "mouseMoved", "x": x, "y": y}
            )
            self.driver.execute_cdp_cmd(
                "Input.dispatchMouseEvent",
                {
                    "type": "mousePressed", "x": x, "y": y,
                    "button": "left", "clickCount": 1,
                },
            )
            self.driver.execute_cdp_cmd(
                "Input.dispatchMouseEvent",
                {
                    "type": "mouseReleased", "x": x, "y": y,
                    "button": "left", "clickCount": 1,
                },
            )

        def marcado():
            return ler("anchor", js.MARCAR_CHECKBOX) == "true"

        def resolvido():
            script = (
                js.TOKEN_PREFIXO
                + json.dumps('textarea[id^="g-recaptcha-response"]')
                + js.TOKEN_SUFIXO
            )
            try:
                if self.driver.execute_script(script):
                    return True
            except Exception:
                pass
            return marcado()

        def audio_pronto():
            return centro("bframe", "#recaptcha-audio-button") is not None

        def bloqueado():
            texto = ler("bframe", js.BLOQUEIO_AUDIO)
            return texto if isinstance(texto, str) else ""

        def desafio_aberto():
            return resolvido() or audio_pronto()

        def esperar(condicao, segundos):
            limite = time.time() + segundos
            while time.time() < limite:
                if condicao():
                    return True
                time.sleep(0.5)
            return False

        self._recaptcha_bloqueado = False
        try:
            fim = time.time() + timeout
            if resolvido():
                return True
            ponto = centro("anchor", "#recaptcha-anchor")
            if ponto is not None:
                clicar(ponto)
                esperar(desafio_aberto, 15)
                if resolvido():
                    return True

            if not esperar(audio_pronto, 20):
                print("[recaptcha] o desafio não abriu (sem botão de áudio)")
                return False
            ponto = centro("bframe", "#recaptcha-audio-button")
            if ponto is None:
                print("[recaptcha] botão de áudio sumiu antes do clique")
                return False
            clicar(ponto)
            corpo_pronto = js.BUSTER_PRONTO

            def pronto_ou_bloqueado():
                return bool(bloqueado() or ler("bframe", corpo_pronto))

            esperar(pronto_ou_bloqueado, 20)
            aviso = bloqueado()
            if aviso:
                self._recaptcha_bloqueado = True
                print("[recaptcha] o Google recusou o desafio de áudio: " + str(aviso))
                print("[recaptcha] bloqueio por IP — trocar de proxy antes de tentar de novo")
                return False
            if not ler("bframe", corpo_pronto):
                print("[recaptcha] o botão do Buster não apareceu no desafio")
                return False
            ponto = centro("bframe", ".help-button-holder")
            if ponto is None:
                print("[recaptcha] não achei a posição do botão do Buster")
                return False
            clicar(ponto)

            corpo_resp = js.RESPOSTA_AUDIO
            transcrito = False
            while time.time() < fim:
                bruto = ler("bframe", corpo_resp)
                if isinstance(bruto, str) and bruto.startswith("["):
                    dados = json.loads(bruto)
                    if dados[0]:
                        transcrito = True
                        break
                    if dados[1]:
                        print("[recaptcha] Buster falhou: " + str(dados[1]))
                        return False
                    if dados[2]:
                        self._recaptcha_bloqueado = True
                        print(
                            "[recaptcha] o Google recusou o desafio de áudio: "
                            + str(dados[2])
                        )
                        print("[recaptcha] bloqueio por IP — trocar de proxy antes de tentar de novo")
                        return False
                time.sleep(1)
            if not transcrito:
                print("[recaptcha] o Buster não devolveu a transcrição a tempo")
                return False
            ponto = centro("bframe", "#recaptcha-verify-button")
            if ponto is not None:
                clicar(ponto)
            return esperar(resolvido, 20)
        except Exception as e:
            print("[recaptcha] erro ao resolver: " + str(e))
            return False
        finally:
            for parte, conn in conexoes.items():
                try:
                    conn.close()
                except Exception:
                    pass

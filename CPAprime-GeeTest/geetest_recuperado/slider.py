"""Reconstrução Python do controle do GeeTest slider do CPAprime.

Os três scripts JavaScript de slider_js.py são extrações literais. Os corpos
Python abaixo foram reconstruídos a partir do código nativo Nuitka; não são
uma recuperação byte a byte do fonte Python. Ver evidencias.md.

Adaptação de integração: a consulta original a Navegacao.CAPTCHA_SOLVER usa
self.CAPTCHA_SOLVER nesta mixin, para que a classe final controle a configuração.
As rotinas de pausa/retorno de clique central pertencem ao restante da classe.
"""

import time

from .slider_js import (
    _JS_GEETEST_PRESENTE,
    _JS_GEETEST_REFRESH,
    _JS_GEETEST_SLIDER,
)


class GeeTestSliderMixin:
    _JS_GEETEST_PRESENTE = _JS_GEETEST_PRESENTE
    _JS_GEETEST_REFRESH = _JS_GEETEST_REFRESH
    _JS_GEETEST_SLIDER = _JS_GEETEST_SLIDER

    def _geetest_na_tela(self):
        """True se há um slider do GeeTest visível agora."""
        if not self.driver:
            return False
        try:
            return bool(self.driver.execute_script(self._JS_GEETEST_PRESENTE))
        except Exception:
            return False

    def _geetest_refresh(self):
        """Pede outro quebra-cabeça. True se achou o botão de refresh."""
        if not self.driver:
            return False
        try:
            return bool(self.driver.execute_script(self._JS_GEETEST_REFRESH))
        except Exception:
            return False

    def resolver_geetest_se_aparecer(self, tentativas=3):
        """Resolve o slider somente se estiver na tela e o painel desaparecer.

        Reconstrução do método nativo 0x1408d01c0. O valor padrão 3 está
        confirmado na construção da classe (classes[2212]).
        """
        if not self.driver:
            return False
        try:
            # Original: if not Navegacao.CAPTCHA_SOLVER: return False.
            if not self.CAPTCHA_SOLVER:
                return False
        except Exception:
            pass
        if not self._geetest_na_tela():
            return False
        clique_antes = self._pausar_clique_centro()
        try:
            return self._resolver_geetest_slider(tentativas)
        finally:
            self._voltar_clique_centro(clique_antes)

    def _resolver_geetest_slider(self, tentativas):
        """Laço reconstruído do método nativo 0x1408d0a50."""
        tentativa = 0
        while tentativa < tentativas:
            tentativa += 1
            try:
                estado = str(
                    self.driver.execute_script(self._JS_GEETEST_SLIDER) or ""
                )
            except Exception as erro:
                print("[geetest] o script nao rodou: %s" % erro)
                return False

            if estado.startswith("ok:"):
                prazo = time.time() + 4
                while time.time() < prazo:
                    if not self._geetest_na_tela():
                        print("[geetest] slider resolvido (%s px)" % estado[3:])
                        return True
                    time.sleep(0.3)
                print(
                    "[geetest] arrastei e o captcha ficou (%d de %d)"
                    % (tentativa, tentativas)
                )
            else:
                print(
                    "[geetest] nao arrastei: %s (%d de %d)"
                    % (estado, tentativa, tentativas)
                )
                if estado in ("sem-captcha", "sem-botao"):
                    return False

            if tentativa < tentativas:
                self._geetest_refresh()
                time.sleep(1.5)
        return False

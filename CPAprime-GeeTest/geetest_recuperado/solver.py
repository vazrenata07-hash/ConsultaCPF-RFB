"""Integração nova dos métodos reconstruídos, independente da GUI CPAprime."""

from .common import GeeTestCommonMixin
from .click import GeeTestClickMixin
from .nine import GeeTestNineMixin
from .slider import GeeTestSliderMixin


class GeeTestSolver(
    GeeTestCommonMixin, GeeTestClickMixin, GeeTestNineMixin, GeeTestSliderMixin
):
    # Valores confirmados na construção da classe original Navegacao.
    CAPTCHA_SOLVER = True
    _PAUSA_ENTRE_TOQUES = 0.8

    def __init__(self, driver, *, proxies=None, user_agent=None, id_browser=1):
        self.driver = driver
        self.proxies = proxies
        self.MobileUA = user_agent or "Mozilla/5.0"
        self.id_browser = id_browser
        self.clique_centro_ativo = False
        self._cache_img_captcha = {}
        self._sprite_visto = ""

    def _proxies_api(self):
        """Contrato mínimo do aplicativo: configuração requests fornecida no init."""
        return self.proxies

    def resolver(self, *, respostas=5, tentativas_slider=3):
        """Detecta um dos três desafios e chama o resolvedor correspondente.

        Retorna True somente quando o método selecionado observa sucesso;
        ausência de desafio e falha retornam False, como os métodos originais.
        """
        if not self.driver or not self.CAPTCHA_SOLVER:
            return False
        if self._geetest_nine_na_tela():
            return self.resolver_geetest_nine_se_aparecer(respostas=respostas)
        if self._geetest_click_na_tela():
            return self.resolver_geetest_click_se_aparecer(respostas=respostas)
        return self.resolver_geetest_se_aparecer(tentativas=tentativas_slider)

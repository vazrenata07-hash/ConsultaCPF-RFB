"""Reconstrucao Python por analise estatica, nao o fonte original.

Dados/JavaScript sao literais extraidos. Estrutura Python reexpressa as
operacoes do nativo; limites pontuais de equivalencia constam em EVIDENCIAS.md.
Este modulo nao inicia navegador nem faz chamadas de rede ao ser importado.
"""
import base64
import hashlib
import time
from .nine_js import (
    _JS_GEETEST_NINE_URLS,
    _JS_GEETEST_NINE_NOTAS,
    _JS_GEETEST_NINE_CONFIRMAR,
)


class GeeTestNineMixin:
    """Requer os auxiliares de navegador definidos na camada comum recuperada."""
    _TABELA_EMOCAO_LIDA = False
    _TABELA_EMOCAO = None
    _JS_GEETEST_NINE_URLS = _JS_GEETEST_NINE_URLS
    _JS_GEETEST_NINE_NOTAS = _JS_GEETEST_NINE_NOTAS
    _JS_GEETEST_NINE_CONFIRMAR = _JS_GEETEST_NINE_CONFIRMAR

    @classmethod
    def _tabela_emocao(cls):
        """Retorna {'prompts': dict, 'celulas': dict} ou None; le uma unica vez."""
        if cls._TABELA_EMOCAO_LIDA:
            return cls._TABELA_EMOCAO
        cls._TABELA_EMOCAO_LIDA = True
        try:
            from . import geetest_emocao
            cls._TABELA_EMOCAO = {
                'prompts': geetest_emocao.PROMPTS,
                'celulas': geetest_emocao.CELULAS,
            }
        except Exception as erro:
            print('[geetest 3x3 emocao] tabela indisponivel (%s) — esta variante nao sera resolvida' % erro)
            cls._TABELA_EMOCAO = None
        return cls._TABELA_EMOCAO

    def _dhash_celula(self, img):
        """Assinatura dHash 8x8, hexadecimal minusculo de exatamente 16 digitos."""
        import numpy as _np
        import cv2 as _cv2
        g = _cv2.cvtColor(img, _cv2.COLOR_BGR2GRAY)
        g = _cv2.resize(g, (9, 8), interpolation=_cv2.INTER_AREA)
        dif = g[:, 1:] > g[:, :-1]
        v = 0
        for b in dif.flatten():
            v = (v << 1) | int(b)
        return '%016x' % v

    def _emocao_do_prompt(self, data_icone):
        """Nome da emocao pelo MD5 dos bytes do prompt, ou None."""
        tab = self._tabela_emocao()
        if not tab:
            return None
        try:
            bruto = base64.b64decode(data_icone.split(',', 1)[1])
        except Exception:
            return None
        return tab['prompts'].get(hashlib.md5(bruto).hexdigest())

    def _nine_emocao_alvos(self, data_icone, data_sprite):
        """Tres indices de 0 a 8, na ordem do sprite, ou None se nao reconhecidos."""
        tab = self._tabela_emocao()
        if not tab:
            return None
        import numpy as _np
        import cv2 as _cv2
        emo = self._emocao_do_prompt(data_icone)
        if not emo:
            return None
        try:
            bruto_sprite = base64.b64decode(data_sprite.split(',', 1)[1])
        except Exception:
            return None
        conhecidas = tab['celulas'].get(emo)
        if not conhecidas:
            return None
        sprite = _cv2.imdecode(_np.frombuffer(bruto_sprite, _np.uint8), _cv2.IMREAD_COLOR)
        if sprite is None:
            return None
        alt, larg = sprite.shape[:2]
        ch, cw = alt // 3, larg // 3
        alvos = []
        for k in range(9):
            lin, col = k // 3, k % 3
            cel = sprite[lin * ch:(lin + 1) * ch, col * cw:(col + 1) * cw]
            if self._dhash_celula(cel) in conhecidas:
                alvos.append(k)
        return alvos if len(alvos) == 3 else None

    def resolver_geetest_nine_se_aparecer(self, respostas=5):
        """Pausa o auto-click durante a resolucao e restaura-o no finally."""
        if not self.driver:
            return False
        try:
            ligado = self.CAPTCHA_SOLVER
        except Exception:
            return False
        if not ligado or not self._geetest_nine_na_tela():
            return False
        clique_antes = self._pausar_clique_centro()
        try:
            return self._resolver_geetest_nine(respostas)
        finally:
            self._voltar_clique_centro(clique_antes)

    def _resolver_geetest_nine(self, respostas_max):
        """Controlador reconstruido: objeto por notas JS e emocao pela tabela.

        Responde independentemente da margem de pontuacao. O desaparecimento
        estavel do painel, e nao o simples envio, e o sinal de sucesso.
        """
        respostas = 0
        descartes = 0
        esperas = 0
        while respostas < respostas_max:
            try:
                info = self.driver.execute_script(self._JS_GEETEST_NINE_URLS) or {}
            except Exception as erro:
                print('%s [geetest 3x3] o script nao rodou: %s' % (self._tag(), erro))
                return False
            if not info.get('ok'):
                motivo = info.get('erro', '')
                if motivo in ('sem-pergunta', 'sem-grade', 'sem-sprite'):
                    esperas += 1
                    if esperas <= 6:
                        time.sleep(1.0)
                        continue
                print('%s [geetest 3x3] nao consegui ler a grade: %s' % (self._tag(), motivo))
                return False
            esperas = 0
            data_icone = self._baixar_data_url(info.get('icone', ''))
            data_sprite = self._baixar_data_url(info.get('sprite', ''))
            if not data_icone or not data_sprite:
                qual = 'icone' if not data_icone else 'sprite'
                print('%s [geetest 3x3] nao consegui baixar o %s do desafio' % (self._tag(), qual))
                return False
            cels = info.get('cels') or []
            if len(cels) != 9:
                return False
            if self._emocao_do_prompt(data_icone):
                alvos = self._nine_emocao_alvos(data_icone, data_sprite)
                if alvos is None:
                    if descartes < 3:
                        descartes += 1
                        print('%s [geetest 3x3 emocao] nao reconheci este desafio — pedindo outro (%d de 3)' % (self._tag(), descartes))
                        self._geetest_refresh()
                        time.sleep(2.5)
                        continue
                    print('%s [geetest 3x3 emocao] desisti: nao reconheci 3 desafios' % self._tag())
                    return False
                margem = 9.999
            else:
                try:
                    r = self.driver.execute_script(self._JS_GEETEST_NINE_NOTAS, data_icone, data_sprite, cels) or {}
                except Exception as erro:
                    print('%s [geetest 3x3] falhei ao pontuar: %s' % (self._tag(), erro))
                    return False
                if not r.get('ok'):
                    print('%s [geetest 3x3] falhei ao pontuar: %s' % (self._tag(), r.get('erro', '')))
                    return False
                margem = float(r.get('margem', 0.0))
                alvos = r.get('alvos') or []
            if len(alvos) != 3:
                return False
            sprite_atual = info.get('sprite', '')
            visto = getattr(self, '_sprite_visto', '')
            if sprite_atual and sprite_atual == visto and descartes < 3:
                descartes += 1
                print('%s [geetest 3x3] a casa repetiu o mesmo desafio — pedindo outro (%d de 3)' % (self._tag(), descartes))
                self._geetest_refresh()
                time.sleep(2.5)
                continue
            self._sprite_visto = sprite_atual
            respostas += 1
            print('%s [geetest 3x3] tocando %s (margem %.3f) — resposta %d de %d' % (self._tag(), alvos, margem, respostas, respostas_max))
            if not self._geetest_nine_marcar(alvos, cels):
                time.sleep(1.2)
                continue
            try:
                self.driver.execute_script(self._JS_GEETEST_NINE_CONFIRMAR)
            except Exception as erro:
                print('%s [geetest 3x3] falhei ao confirmar: %s' % (self._tag(), erro))
                return False
            prazo = time.time() + 6
            fechado_desde = None
            while time.time() < prazo:
                if self._geetest_nine_na_tela() or self._geetest_aberto():
                    fechado_desde = None
                elif fechado_desde is None:
                    fechado_desde = time.time()
                elif time.time() - fechado_desde >= 2.0:
                    print('%s [geetest 3x3] resolvido' % self._tag())
                    self._sprite_visto = ''
                    return True
                time.sleep(0.3)
            print('%s [geetest 3x3] respondi e o captcha ficou (resposta %d de %d)' % (self._tag(), respostas, respostas_max))
            time.sleep(1.5)
        return False

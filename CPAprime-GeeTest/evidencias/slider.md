# Slider: extração e reconstrução

Fonte analisada: `CPAprime.exe`, módulo Nuitka `classes`, array de constantes
em `0x142de3080`. Não há fonte Python original neste executável.

## Conteúdo literal recuperado

- `classes[2874]`: JavaScript `_JS_GEETEST_PRESENTE`, também em `geetest_presente.js`.
- `classes[2875]`: JavaScript `_JS_GEETEST_REFRESH`, também em `geetest_refresh.js`.
- `classes[2876]`: JavaScript `_JS_GEETEST_SLIDER`, também em `geetest_slider.js`.

Os scripts em `slider_js.py` mantêm o texto literal das constantes; não foi
substituído pelo JavaScript reescrito na resposta anterior da conversa.

## Métodos nativos identificados

| Método original | Entrada nativa |
| --- | --- |
| `Navegacao._geetest_na_tela` | `0x1408ae770` |
| `Navegacao._geetest_refresh` | `0x1408aecd0` |
| `Navegacao.resolver_geetest_se_aparecer` | `0x1408d01c0` |
| `Navegacao._resolver_geetest_slider` | `0x1408d0a50` |

Os arquivos `asm.txt`, `helpers.txt` e `default.txt` preservam disassembly
anotado com os índices das constantes referenciadas.

## Evidências do fluxo recuperado

- A construção em `0x140a4174d` carrega `classes[2212] = (3,)` antes de chamar
  a factory do método público em `0x14086b380`: padrão `tentativas=3`.
- `classes[3252]` contém os nomes `self`, `tentativas`, `clique_antes` do wrapper.
- `classes[3157]` contém `self`, `tentativas`, `tentativa`, `estado`, `erro`,
  `prazo` do laço interno.
- `0x1408d0383`: consulta a `Navegacao.CAPTCHA_SOLVER`. Exceção nesta consulta
  é ignorada; valor falso encerra imediatamente.
- `0x1408d05b5` e `0x1408d0784`: pausa de clique central e restauração em
  `finally`, inclusive se o método interno levantar exceção.
- `0x1408d0c28` a `0x1408d0c8a`: chamada a
  `self.driver.execute_script(self._JS_GEETEST_SLIDER)`.
- `0x1408d0ed5`: prazo soma 4 segundos ao `time.time()`; `0x1408d1121` usa
  `classes[1551] = (0.3,)` como intervalo de verificação de desaparecimento.
- `0x1408d1404`: refresh entre tentativas; `0x1408d144d` usa
  `classes[1890] = (1.5,)` como espera.
- `0x1408d13ae`: retornos `sem-captcha` e `sem-botao` encerram com `False`.
- Erro no `execute_script`/conversão de retorno é capturado e registrado por
  `classes[1952]`, retornando `False`.

## Limites e adaptação explícita

O Python é uma reconstrução de comportamento, com os nomes locais indicados
pelos metadados. A formatação, sintaxe exata e comentários do fonte Python não
foram preservados por Nuitka. O uso de `while tentativa < tentativas` corresponde
ao laço nativo, em vez de substituir por um `range` com outras coerções.

Para integrar como mixin, a referência global original `Navegacao.CAPTCHA_SOLVER`
foi escrita `self.CAPTCHA_SOLVER`; o comentário marca essa mudança. A classe final
deve fornecer `driver`, `_pausar_clique_centro` e `_voltar_clique_centro`.

Esta frente não executou CAPTCHA nem acessou sites externos. As constantes
JavaScript incluem suas próprias afirmações/comentários originais: essas
afirmações não constituem validação independente da eficácia do algoritmo.

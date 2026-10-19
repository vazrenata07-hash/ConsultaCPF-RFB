# Helpers comuns: reconstrução documentada

`reconstrucao_common.py` / `GeeTestCommonMixin` é uma reconstrução Python legível,
não o texto original do `.py`. A revisão foi estática; não foram acessados sites,
executados CAPTCHAs nem iniciadas sessões de navegador para validar este código.

**Material literal recuperado:** os arquivos `JS_*.js` contêm exatamente as strings
Unicode correspondentes de `constants-agent/classes.json`, sem reformatá-las. As
combinações helper + corpo em `execute_script` reproduzem as dependências JavaScript
visíveis nessas próprias strings. O código Python usa os mesmos literais.

**Assinaturas:** metadados de code objects Nuitka em `mapa_funcoes.json` confirmam os
nomes posicionais. O default `passadas=4` é confirmado pela fábrica e pela constante
2894 `(4,)`, aplicada na inicialização da classe. Não foi inferido de uma preferência
desta reconstrução.

| Helper | Implementação nativa | Evidência principal |
|---|---|---|
| `_geetest_na_tela` | `0x1408ae770` | `self.driver`, `execute_script`, atributo JS 1716 |
| `_geetest_refresh` | `0x1408aecd0` | atributo JS 1718; JS literal 2875 |
| `_geetest_nine_na_tela` | `0x1408b3630` | atributo JS 1720; helper 2879 e corpo 2881 |
| `_geetest_aberto` | `0x1408b3b90` | atributo JS 1722; JS literal 2887 |
| `_baixar_data_url` | `0x1408b40f0` | cache, requests, cabeçalhos e retornos nas constantes 1724–1739 |
| `_tocar_ponto` | `0x1408b56a0` | CDP, coordenadas float, raio 12, força 1, pausa 0.05 |
| `_tag` | `0x1408b5f50` | `self.id_browser`, formatos `[b%s]` e `[b?]` |
| `_pausar_clique_centro` | `0x1408b63a0` | `getattr(..., False)`, atribuição False e retorno do estado anterior |
| `_voltar_clique_centro` | `0x1408b67f0` | restaura `clique_centro_ativo`, exceção ignorada |
| `_geetest_nine_marcar` | `0x1408b6c10` | conjunto desejado/atual, diferenças, ordem, tempos e logs |
| `_baixar_bytes` | `0x1408c2570` | `_baixar_data_url`, separação na primeira vírgula, `base64.b64decode` |

Os guards de clique `_geetest_click_na_tela` e `_geetest_click_marcas` também estão
incluídos para os demais mixins. Usam as strings literais 2896/2898 e 2900 e retornos
padrão False/-1 documentados nas constantes 1771/1773.

## Valores e comportamento confirmados

- `_cache_img_captcha` **é um atributo**, um dicionário inicializado quando ausente
  ou None. Não existe método de mesmo nome no material mapeado. Retorna imediatamente
  `data:` URLs e resultados já presentes no cache.
- `_baixar_data_url`: três tentativas, timeout `8`, sucesso somente HTTP 200 com
  conteúdo; `User-Agent = self.MobileUA or 'Mozilla/5.0'`; `_proxies_api()` serve como
  fallback na terceira tentativa. O código usa `requests.get`, com proxies=None
  nas duas primeiras tentativas. Isso preserva a interpretação normal do ambiente
  pelo requests; o docstring original dizer “direto” não prova que proxies do
  sistema eram desativadas. Esta reconstrução não acrescenta desativação de proxy.
- Tipo de imagem: `Content-Type`, default `image/png`, remove parâmetros após `;`,
  faz strip e exige prefixo `image/`. Conteúdo é codificado em base64 ASCII.
- `cache.clear()` quando **len(cache) > 40**, antes de inserir o novo resultado.
  O limite 40 é imediato nativo em `0x1408b4eed`, e não um valor escolhido agora.
- `_tocar_ponto`: `float(x)`, `float(y)`, `radiusX=12`, `radiusY=12`, `force=1`;
  `Input.dispatchTouchEvent` touchStart, `time.sleep(0.05)`, touchEnd com lista vazia.
  12 e 0.05 são constantes recuperadas; força 1 é o singleton inteiro compartilhado.
- `_geetest_nine_marcar`: lê nove estados de seleção pelo script recuperado; aceita
  uma lista com pelo menos nove itens e usa somente os primeiros nove. Constrói
  `faltam = desejado - atual`, `sobram = atual - desejado`, toca faltantes na ordem
  original de `alvos` e depois excedentes em ordem crescente. Confirma visibilidade
  antes de cada toque. Pausas **0.28** entre toques e **0.35** entre passadas são as
  constantes 1766/1767, usadas nos pontos nativos `0x1408b7a85`/`0x1408b7c2d`.
- O retorno True por desaparecimento da grade reproduz uma heurística do nativo:
  leitura inválida depois da primeira passada ou grade invisível entre toques é
  tratada como encerramento. **Isso não confirma aceitação do desafio pelo servidor.**
- A última sequência de toques não ganha uma leitura extra fora do limite de
  passadas; o último log pode mostrar o estado lido antes desses toques.

## Limites de fidelidade

A sintaxe e estrutura Python (por exemplo, `for range`, compreensão e disposição
dos try/except) são uma tradução legível das chamadas/branches nativos, não fonte
textual recuperado. Os limites finos de exceções e caminhos raros não têm prova
completa de equivalência. Houve conferência estática dos caminhos usuais e das
constantes acima. Os imports de requests são locais para permitir importar o mixin
sem iniciar rede e sem exigir requests quando só forem usados helpers DOM.

Dependências do objeto hospedeiro: `self.driver` com `execute_script` e
`execute_cdp_cmd`; `self.id_browser` para o prefixo de log; `self.MobileUA` opcional;
`self._proxies_api()` opcional para fallback; `self.clique_centro_ativo` para suspender
o autoclique. `_cache_img_captcha` passa a existir após o primeiro download HTTP.
Os mixins específicos de slider/3x3/clique são responsáveis por seus próprios
orquestradores e por pausar/restaurar o autoclique ao redor da resolução.

Verificação feita nesta etapa: compilação sintática Python. Nenhum teste vivo.

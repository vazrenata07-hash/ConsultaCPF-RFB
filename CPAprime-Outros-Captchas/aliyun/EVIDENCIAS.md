# Origem e limites

O arquivo original contém código Python compilado em código nativo por Nuitka.
Não havia `classes.py` em texto. `aliyun.py` é uma reconstrução legível;
`AliyunResolver`, seu construtor e o exemplo são adaptações novas para permitir
integração independente. Não se afirma que o texto Python original foi recuperado.

Os JavaScripts foram extraídos literalmente das constantes do módulo `classes`:

| Constante | Arquivo | Papel |
|---|---|---|
| 2918 | `javascript/aliyun_estado.js` | Geometria e fontes das imagens e da alça. |
| 2919 | `javascript/aliyun_posicao.js` | Posições atuais para realimentação. |
| 2920 | `javascript/aliyun_presente.js` | Detecção do painel visível. |
| 2887 | `javascript/geetest_aberto_detector.js` | Detector complementar da guarda genérica. |

`javascript_literal.py` contém os mesmos textos como constantes Python.
O original não fornecia um método chamado `_resolver_aliyun_slider`; o controle
identificado se chama `_resolver_aliyun`. Não foi identificado um refresh
Aliyun separado; não se acrescentou um seletor ou botão de refresh inventado.

Os oito corpos nativos identificados e os argumentos dos seus codeobjects:

| Método | Argumentos | Início nativo |
|---|---|---|
| `_aliyun_na_tela` | `self` | `0x1408d1d30` |
| `_toque_cru` | `self, tipo, x=None, y=None` | `0x1408d2290` |
| `_imagem_aliyun` | `self, src` | `0x1408d2ab0` |
| `_achar_buraco_aliyun` | `self, fundo_bytes, peca_bytes` | `0x1408d3180` |
| `resolver_aliyun_se_aparecer` | `self, tentativas=3` | `0x1408d68a0` |
| `_resolver_aliyun` | `self, tentativas` | `0x1408d6f80` |
| `_arrastar_aliyun` | `self, alca, alvo_peca` | `0x1408d94f0` |
| `_captcha_aberto` | `self` | `0x1408db570` |

Os defaults vêm das chamadas das factories no inicializador da classe:
`classes[1357] == (None, None)` em `0x140a41869`, chamada `0x140a4187c`;
`classes[2212] == (3,)` em `0x140a41912`, chamada `0x140a41925`.

A reconstrução usa os seguintes elementos confirmados na análise estática:

- Imagens de `data:` ou HTTP, com os helpers compartilhados de download e cache.
- Máscara alfa da peça, corte em 40 e mínimo de 50 pixels.
- Largura/altura e centroides da peça; conversão da imagem de fundo para HSV.
- Cinco pares de limiares HSV presentes em `classes[1970]`.
- Fechamento morfológico com matriz 3×3; componentes conectados; limites de
  largura/altura entre 0,6 e 1,4 da peça; comparação da posição vertical.
- Escolha por pontuação e deslocamento horizontal pelo centroide.
- Conversão do deslocamento natural para coordenadas da tela.
- Até 12 passagens de arrasto com leitura da posição real; estimativa inicial
  0,35, piso 0,15 e avanço limitado a ±120; passos de 6 pixels e atualização
  da estimativa pelo deslocamento observado.
- Eventos CDP de toque, liberação em `finally`, intervalos recuperados e
  confirmação de painel ausente por 1,5 segundo dentro de uma janela de 6 segundos.

`_tag`, `_baixar_data_url` e `_baixar_bytes` foram incluídos a partir da
reconstrução dos helpers compartilhados de `classes`. O método adicional
`_geetest_aberto` inclui somente o detector necessário para preservar a guarda
genérica; não há importação de outro pacote ou resolvedor GeeTest.

Os detalhes de exceções e tratamento de dados inválidos foram traduzidos para
Python legível, sem reproduzir o gerenciamento de referências de Nuitka.
Os logs, seletores e constantes foram preservados quando identificados. Essa
reescrita não estabelece equivalência completa em todos os caminhos de erro.

`evidencias/mapa_nativo.json` registra hash do executável, endereços, factories,
metadados e argumentos. `evidencias/*.asm.txt` preserva o assembly anotado;
`evidencias/decompiled/*.c` preserva o pseudocódigo gerado por Ghidra.
O pseudocódigo C é uma representação da compilação, não o fonte original.

Nenhum arquivo do aplicativo original foi alterado. Nenhum CAPTCHA, navegador,
site ou rotina de teste foi executado para preparar esta pasta. Portanto,
compatibilidade prática e taxa de acerto não foram verificadas.

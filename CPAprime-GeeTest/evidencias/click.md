# GeeTest: clique em ordem

Este pacote contém as strings JavaScript literais e uma reimplementação Python
legível feita a partir do código nativo e das constantes. Não é uma recuperação
literal do arquivo Python original nem uma garantia de equivalência em todos os
caminhos de exceção.

## Correspondência com o executável

| Função | Endereço virtual |
|---|---|
| `_geetest_click_marcas` | `0x1408b8dd0` |
| `_geetest_click_na_tela` | `0x1408b9320` |
| `_achar_figuras_na_foto` | `0x1408ba410` |
| `_grad`, originalmente função local | `0x1408bf780` |
| `_mascara`, originalmente função local | `0x1408c0110` |
| `resolver_geetest_click_se_aparecer` | `0x1408c1ce0` |
| `_baixar_bytes` (helper comum) | `0x1408c2570` |
| `_resolver_geetest_click` | `0x1408c2b80` |

As quatro strings JS vieram das constantes `classes[2896]`, `[2898]`, `[2899]`
e `[2900]`. A composição do preâmbulo de visibilidade com presença/URLs segue
a inicialização da classe. O confirmador é o mesmo `_JS_GEETEST_NINE_CONFIRMAR`
usado pela grade 3×3, conforme `classes[1886]`.

## Algoritmo identificado

- A foto é decodificada em cinza. Os ícones preservam alpha, recebem fundo
  branco onde alpha é menor que 80, limiar Otsu invertido e recorte pela área
  não zero.
- O gradiente usa `GaussianBlur((3,3),0)`, dois Sobel `CV_64F` com `ksize=3`,
  `convertScaleAbs` e média de pesos `0.5`/`0.5`.
- Cada ícone é redimensionado para lados `range(22,48,6)` e girado em passos de
  15 graus. A busca usa `TM_CCOEFF_NORMED`; mapas de resposta são realinhados
  para representar o centro da figura e combinados por máximo.
- São preservados seis picos por ícone. Depois de cada pico, um disco de raio
  30 recebe `-9.0` para impedir uma segunda seleção do mesmo pico.
- A escolha conjunta percorre `itertools.product(range(6), repeat=n)`, rejeita
  pares cujas diferenças em x **e** em y são menores que 25, e maximiza a soma
  das correlações. Retorna `(pontos, (largura_da_foto, altura_da_foto))`.
- O controlador aguarda transições e marcas antigas, baixa imagens, converte
  coordenadas da imagem para o retângulo visível, confere os toques, confirma
  e só considera sucesso após o painel permanecer fechado por dois segundos.
- `_PAUSA_ENTRE_TOQUES=0.8` está confirmado na constante `classes[2906]` e na
  inicialização `0x140a4156f..0x140a41580`.

## Limites precisos da reimplementação

- As assinaturas e os nomes de argumentos vieram dos objetos de código.
  O default do wrapper é `respostas=5`, confirmado pela tupla
  `classes[1351]=(5,)` carregada em `0x140a414f9` e passada à factory
  `0x14086afc0` pela chamada `0x140a4150c`. O controlador recebe
  `respostas_max` sem default.
- `_grad` e `_mascara` foram expostas como funções de módulo para facilitar o
  reaproveitamento. No binário são funções locais de `_achar_figuras_na_foto`.
- A rotina de visão foi reescrita com operações Python/NumPy equivalentes, sem
  reproduzir a infraestrutura de objetos, referências e tracebacks do Nuitka.
- O controlador mantém o fluxo e os temporizadores identificados. Os caminhos
  de exceção não foram reproduzidos instrução por instrução; a reimplementação
  registra uma falha na confirmação e ainda observa o fechamento do painel.
  O binário suprime essa exceção antes de observar o painel.
- O wrapper usa `self.CAPTCHA_SOLVER`; o executável consulta a classe
  `Navegacao.CAPTCHA_SOLVER`. O adaptador de integração pode fornecer o atributo
  na classe, preservando o uso normal.
- As chamadas de clique, download e pausa do aplicativo são providas pelo
  mixin comum; o refresh é provido pelo módulo slider. Não foram embutidos
  endereços de sites, credenciais, perfis ou dados de conta.

Nenhum desafio, site ou resolução de CAPTCHA foi executado nesta recuperação.

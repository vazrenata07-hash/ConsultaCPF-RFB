# GeeTest 3x3: recuperacao estatica

Os arquivos desta pasta NAO sao o fonte Python original. `nine_reconstruido.py` e uma reexpressao de operacoes nativas e contratos recuperados. `nine_js.py`, os arquivos `JS_*.js` e as tabelas de `geetest_emocao.py` preservam os valores literais encontrados nas constantes compiladas. Nao foi iniciado desafio, consultado servidor, executado navegador ou alterado o executavel nesta frente.

## Contratos recuperados

| Metodo | Parametros posicionais no codeobject | Linha registrada | Entrada nativa |
|---|---|---:|---|
| resolver_geetest_nine_se_aparecer | self, respostas | 8779 | 0x1408c81b0 |
| _tabela_emocao | cls (classmethod) | 8835 | 0x1408c8a40 |
| _dhash_celula | self, img | 8856 | 0x1408c9200 |
| _emocao_do_prompt | self, data_icone | 8873 | 0x1408c9d90 |
| _nine_emocao_alvos | self, data_icone, data_sprite | 8891 | 0x1408ca600 |
| _resolver_geetest_nine | self, respostas_max | 8933 | 0x1408cc210 |

O mapa detalhado de criacao das funcoes/codeobjects esta em `mapa_nine.json`. Os arquivos `*.asm.txt` sao evidencia de disassembly com constantes anotadas. Os limites superiores desses dumps seguem o proximo simbolo identificado e podem conter alinhamento ou simbolos intermediarios; nao sao declaracoes de tamanho exato do corpo Python.

## Dados literais completos

`geetest_emocao.json[6]` contem tres mapeamentos MD5 -> emocao, copiados integralmente:

- `57e9c748a52197ff144e54ff76af3569`: `chorando`.
- `2b720d7572ead822ab3746a7825bfcb0`: `raiva`.
- `8ec594f4b0bff1c73065559cdadb41ed`: `sorrindo`.

`geetest_emocao.json[8]` contem os frozensets completos: 348 hashes de chorando, 354 de raiva e 410 de sorrindo, total de 1112 entradas. A docstring historica menciona um dataset maior (482 desafios/2217 celulas); esses numeros foram preservados na docstring, mas nao substituem a contagem real da tabela compilada. Nenhum hash foi sintetizado. A ordem textual dos frozensets foi ordenada para tornar o arquivo estavel; a semantica de conjunto e a cardinalidade foram preservadas.

## Procedimentos comprovados

- A tabela e carregada uma vez por classe, com flags `_TABELA_EMOCAO_LIDA` e `_TABELA_EMOCAO`; erro de importacao/carregamento registra o texto literal de classes[1901] e deixa a tabela como None.
- O prompt e decodificado de data URL com `split(',', 1)[1]` e base64; o MD5 dos bytes, e nao a URL, escolhe a emocao. Ausencia de MD5 na tabela devolve None.
- O dHash usa `cv2.cvtColor(..., COLOR_BGR2GRAY)`, resize `(9, 8)` com `INTER_AREA`, comparacao `g[:, 1:] > g[:, :-1]` e iteracao `flatten()`. O inteiro comeca em zero e acumula `(v << 1) | int(b)`; formato final `%016x`. A comparacao maior foi confirmada no helper 0x142ce1980, que passa opcode Python Py_GT=4; deslocamento e OR estao nos helpers 0x142cbf700 e 0x142cbee60.
- O sprite de emocao e decodificado com IMREAD_COLOR; `shape[:2]` fornece altura/largura e divisao inteira por 3 fornece cada celula. Ha nove recortes row-major: k//3, k%3. Cada dHash e comparado por pertinencia exata ao frozenset da emocao. Apenas exatamente tres reconhecimentos produzem lista; os demais casos produzem None. Nao ha busca por menor distancia de Hamming nessa funcao.
- O algoritmo de OBJETO esta integralmente no JavaScript classes[2883]: canvas 140x140, fundo branco para alpha, cinza 0.299/0.587/0.114, Otsu invertido no prompt, blur separavel [0.2261,0.5477,0.2261], Sobel com saturacao anterior a soma, correlacao de Pearson, ordenacao decrescente e escolha das tres maiores notas. Margem = terceira menos quarta. O JS foi copiado, nao reimplementado.
- O controlador tem respostas/descartes/esperas. Aguarda ate seis leituras incompletas com sleep1.0s. O helper 0x142cd1ef0 confirma `esperas <= 6`, inclusive igualdade.
- Descartes sao compartilhados entre emocao nao reconhecida e repeticao do sprite; o helper 0x142cd2260 confirma `< 3`. O teste vem ANTES do incremento. Assim sao possiveis tres refreshes; um reconhecimento de emocao novamente ausente depois disso aborta. O texto literal do log continua dizendo "3 desafios".
- Emocao reconhecida usa margem de diagnostico9.999. Objeto usa a margem devolvida pelo JS, sem corte minimo de confianca.
- O sprite atual e comparado a `_sprite_visto`; repeticao pode pedir refresh e sleep2.5s, respeitando o limite compartilhado. Nao se descarta por margem baixa.
- `respostas` e incrementado antes da marcacao; marcacao malsucedida custa uma resposta e sleep1.2s. A marcacao convergente em si e fornecida pela camada comum.
- Depois de confirmar, observa por seis segundos. Exige ausencia da grade e de qualquer painel GeeTest por pelo menos2.0s; o helper0x142ce05d0 usa `setae`/Py_GE=5 e confirma a igualdade inclusiva. Polling0.3s; resposta que permaneceu em tela espera1.5s antes da proxima.
- O wrapper pausa o auto-click e o restaura em `finally`.

## Adaptacoes e limites declarados

1. O nome da classe combinadora foi alterado para `GeeTestNineMixin`. A guarda do wrapper usa `self.CAPTCHA_SOLVER`, conforme o adaptador pedido; o nativo consulta o atributo da classe original `Navegacao`.
2. O import da tabela e relativo ao pacote reconstruido, em vez de `import geetest_emocao` absoluto; isso evita depender de um modulo externo homonimo.
3. O default `respostas=5` tambem foi confirmado no chamador de criacao: VA0x140a415b9 carrega classes[1351], a tupla `(5,)`, antes da chamada VA0x140a415cc para MAKE_FUNCTION0x14086b0e0. A evidencia integral esta em `../assembly/default_wrapper_nine.asm.txt` e no mapa de funcoes. Nao foi inferido apenas da docstring.
4. Os contornos de alguns `try/except` e o tratamento de retornos vazios foram reexpressos de forma legivel. Os valores e caminhos principais listados acima tem evidencia; equivalencia completa para excecoes atipicas, tipos de dados malformados e subclasses personalizadas nao foi demonstrada. Nao se afirma que formatacao, nomes de import alias, sintaxe ou estrutura textual reproduzam o fonte original.
5. As dependencias do navegador, download, toque e auto-click sao as implementacoes recuperadas na camada comum. Esta pasta nao implementa nem falsifica esses servicos.
6. A verificacao realizada foi sintatica e de igualdade das tabelas literais, sem CAPTCHA real ou teste de rede.

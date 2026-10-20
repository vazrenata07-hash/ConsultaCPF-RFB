# Origem e limites da reconstrução

Módulo Nuitka: `classe_mp`; array de constantes: `0x142de1c80`.
Método principal: `Contas_pix.resolver_recaptcha`, entrada `0x14085b860`.
O padrão `timeout=90` é literal `classe_mp[408] = (90,)` na factory da classe
em `0x1408684c0` a `0x14086851d`.

`classe_mp[515]` preserva a lista dos nomes locais do método. Os metadados
469–517 preservam nomes de argumentos, capturas e variáveis das closures.
`helpers_map.json` associa as factories às entradas nativas. Os arquivos
`.asm.txt` preservam as instruções nativas anotadas com índices de constantes.

| Closure original | Entrada |
| --- | --- |
| `_conn_iframe` | `0x14085fd40` |
| `_eval_iframe` | `0x140861600` |
| `ler` | `0x1408623e0` |
| `canto_iframe` | `0x140862ba0` |
| `centro` | `0x140863150` |
| `clicar` | `0x140863850` |
| `marcado` | `0x140863fe0` |
| `resolvido` | `0x140864240` |
| `audio_pronto` | `0x140864800` |
| `bloqueado` | `0x14085ed30` |
| `desafio_aberto` | `0x14085eff0` |
| `esperar` | `0x14085f2e0` |
| `pronto_ou_bloqueado` | `0x14085f990` |

Os literais JavaScript recuperados e os fragmentos usados para montar scripts
estão em `scripts.py` e `javascript_extraido.json`, com índices originais.
O fluxo não resolve imagens reCAPTCHA por algoritmo próprio: seleciona áudio,
aciona a extensão e observa o campo de resposta que ela preenche.

Adaptações explícitas desta API:

- Os métodos foram separados da classe de contas `Contas_pix` para
  `RecaptchaSolver(driver)`; nenhum cadastro, conta ou configuração do CPAprime
  é carregado.
- A propriedade `recaptcha_bloqueado` expõe o atributo original
  `_recaptcha_bloqueado`.
- Ao descartar um WebSocket inválido, o adaptador também fecha a conexão.
- `_configurar_buster` preserva preferências por padrão; o método original
  sempre desabilitava o modelo local. `buster_config.md` documenta a mudança.
- Mensagens originais de bloqueio foram preservadas; não foi implementada
  qualquer rotação automática de proxy.

A sintaxe exata, formatação e comentários do fonte Python não foram recuperados.
O código fornecido reconstrói o fluxo observado no executável e usa o JavaScript
literal extraído. Não é uma afirmação de equivalência formal nem uma validação
de que serviços e versões atuais aceitam esse fluxo.

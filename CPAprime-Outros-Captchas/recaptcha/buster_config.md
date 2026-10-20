# Evidência da configuração Buster

`buster_config.py` é uma reconstrução de comportamento, não o fonte original.
O método original é `Contas_pix._configurar_buster`, entrada nativa
`0x140857f50`, término `0x14085ad58`. A closure `_eval` começa em
`0x14085ad60`. O disassembly anotado permanece em `buster.asm.txt` e
`_eval.asm.txt`.

Confirmado no binário:

- `classe_mp[468]` preserva os nomes locais `self`, `_urlreq`, `_ws`, `caps`,
  `opts`, `addr`, `alvo`, `limite`, `alvos`, `resp`, `t`, `conn`, `contador`,
  `_eval`, `estavel`, `atual`, `e`.
- Lê `debuggerAddress` em `goog:chromeOptions`, com fallback `chrome`.
- Descobre o worker pela rota HTTP `/json`, tipo `service_worker`, URL contendo
  `src/background/script.js`; limite 15 segundos, HTTP com timeout 2 segundos,
  intervalo de 0,3 segundo. Exceções de descoberta são ignoradas e repetidas.
- Abre `webSocketDebuggerUrl` com `suppress_origin=True`, timeout 10 segundos.
- `_eval` usa contador mutável `[0]`, incrementa o ID e espera a resposta
  correspondente a `Runtime.evaluate`, com `awaitPromise=True` e
  `returnByValue=True`. Retorna `result.result.value` por chamadas `get`.
- O original lê `enableManagedLocalServices` e sempre força `false` quando
  o valor difere. Repete até quatro leituras consecutivas iguais a `false`,
  com limite de 12 segundos e espera de 0,4 segundo.
- Fecha a conexão no `finally`, ignorando erro de fechamento; imprime falhas
  de configuração e devolve booleano.

Adaptações explícitas no arquivo de integração:

- `_configurar_buster()` preserva a preferência existente. A mudança é
  solicitada pelo chamador em `configurar_buster_local(True/False)`.
- O literal original de leitura e o literal original de escrita `false`
  foram preservados nas constantes. A escrita `true` é uma adaptação nova,
  identificada no código.
- Inicializa `conn=None` explicitamente; o original protegia o fechamento
  também contra a variável ainda não atribuída.
- Usa `get("url", "")` na descoberta para tratar targets sem URL diretamente.
- A mensagem de expiração foi generalizada para ambos os modos; o texto
  original era `[buster] não consegui fixar o modelo local desligado`.

Não foram lidos ou recuperados segredos de provedores; este arquivo não
provisiona chaves. Nenhum CAPTCHA foi executado e não houve testes em sites.

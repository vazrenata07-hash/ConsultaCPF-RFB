# Buster / reCAPTCHA: extensão original e dependências

Esta pasta contém a árvore original da extensão Buster 3.4.0 que veio em
`CPAprime.Bot.zip`, preservada byte a byte, com uma exclusão documentada abaixo.
Não é uma reconstrução Python nem um resolvedor independente do navegador.

Foram extraídos **54 arquivos, 27.086.874 bytes**. O ZIP original continha 55
arquivos nesta árvore. O relatório `buster_audit.json` registra tamanhos e SHA256.
A versão anterior, em `captcha-extraido/buster`, continha somente scripts; esta
árvore também inclui HTML, CSS, WASM, fontes, imagens e `_locales/en/messages.json`.

## Componentes

- `manifest.json`: extensão Chrome Manifest V3, mínimo declarado Chrome 123.
- `src/base/script.js`: content script dos iframes reCAPTCHA api2/enterprise em
  google.com e recaptcha.net; inclui a interface do botão de resolução.
- `src/background/script.js`: coordenação do áudio, opções e serviços de transcrição.
- `src/offscreen/`: documento e script para processamento/transcrição de áudio.
- `src/wasm/`: runtime ONNX JavaScript e binário WASM incluídos no original.
- `src/options/`, `src/setup/`, `src/commons-ui/`, `src/contribute/`: interface,
  configuração, bibliotecas da interface e páginas auxiliares originais.
- `src/scripts/init-setup.js` e `reset.js`: auxiliares da configuração.
- `src/assets/`, `_locales/`, CSS e HTML: recursos necessários à extensão.
- `LICENSE`, `NOTICE` e `*.LICENSE.txt`: avisos originais preservados.

## Única exclusão: secrets.txt

`secrets.txt` tinha 2.048 bytes e contém ciphertext Base64 no formato OpenSSL
Salted__. Não contém a implementação dos algoritmos. O próprio background lê o
arquivo sob demanda, deriva uma chave dos scripts background/base e acessa o
resultado como `witApiKeys`: é provisionamento de credenciais do serviço remoto
"managed" do distribuidor. Não foi decriptado e não foi incluído neste pacote.

Isso não representa configuração pessoal identificada do usuário, mas também
não é código necessário para carregar a extensão. O carregamento tem try/catch
que usa `{}` em caso de falha, e os únicos consumidores encontrados são caminhos
de transcrição gerenciada. Sem essa credencial, o caminho remoto correspondente
exibe `error_missingApiKey` quando solicitado; a inicialização não depende de sua
presença. Portanto nenhum patch dos scripts originais foi necessário.

As opções abaixo permitem configurar serviços próprios, sem esse arquivo.
Os nomes são os campos reais encontrados nos scripts; não são chaves adicionadas
por esta extração. As credenciais devem ser fornecidas pelo titular do serviço.

| `speechService` | Campos da configuração |
|---|---|
| `googleSpeechApi` | `googleSpeechApiKey` |
| `witSpeechApi` | `witSpeechApiKeys`, objeto com chaves por idioma |
| `ibmSpeechApi` | `ibmSpeechApiUrl`, `ibmSpeechApiKey` |
| `microsoftSpeechApi` | `microsoftSpeechApiLoc`, `microsoftSpeechApiKey` |

A página original de opções está em `src/options/index.html`; os dados são
armazenados pelo mecanismo de storage da extensão. Nenhum backup pessoal de
storage, perfil Chromium, cookies ou credenciais próprias veio nesta árvore.

## Transcrição local e pesos de modelo

O caminho local usa `speechService="managed"`, `enableManagedLocalServices=true`
e pode ser separado do remoto com `enableManagedRemoteServices=false`.

O código tenta a API `LanguageModel` do Chrome com áudio, quando disponível. A
alternativa explícita no próprio código é o pipeline de Transformers.js
`automatic-speech-recognition`, modelo **`Xenova/whisper-tiny`**, com
`device="wasm"` e `dtype="q8"`. O runtime WASM é local em `src/wasm/`; os pesos e
arquivos do modelo não constavam no ZIP original. O código usa o host
`https://huggingface.co/` e cache de navegador (`transformers-cache`) para esses
recursos. Assim, runtime incluído não significa modelo já baixado ou operação
completamente offline desde a primeira execução. Nada disso foi baixado ou
executado nesta revisão.

Recursos opcionais de `nativeMessaging`, por exemplo simulação de entrada pelo
aplicativo cliente Buster, dependem de componente externo próprio; ele não está
embutido nesta árvore da extensão. Compatibilidade de Chrome e disponibilidade
dos serviços/modelos precisam ser verificadas no ambiente de implementação.

## Validação feita

- Todos os 54 arquivos extraídos coincidem byte a byte com o ZIP fornecido.
- 49 referências locais de manifest, HTML e CSS foram verificadas; nenhuma está
  ausente. Seis referências externas foram apenas reconhecidas, sem acessá-las.
- Não foram encontrados padrões comuns de chaves privadas ou credenciais em
  texto claro nos scripts extraídos; o provisionamento cifrado foi excluído.
- A análise foi estática: nenhum script da extensão foi executado, nenhum desafio
  foi resolvido e nenhum site ou serviço foi acessado.

O presente documento e `buster_audit.json` são documentação gerada nesta revisão;
não pertencem à extensão original. O JavaScript do fornecedor permanece literal.

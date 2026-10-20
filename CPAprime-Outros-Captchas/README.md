# CPAprime — outros CAPTCHAs

Código dos outros resolvedores identificados no programa, organizado por família.
O GeeTest foi entregue separadamente.

| Pasta | Implementação |
| --- | --- |
| `aliyun/` | Quebra-cabeça Aliyun: detecção, imagens, localização do buraco, controle do arrasto e verificação do resultado |
| `recaptcha/` | reCAPTCHA v2 com checkbox e invisível: iframes, CDP, áudio, acionamento do Buster, confirmação e sinal de bloqueio |
| `recaptcha/buster/` | Extensão Buster 3.4.0: JavaScript, HTML, CSS, imagens, fontes, localização e runtime WASM |

Cada pasta tem sua implementação, exemplo de integração, dependências e notas de
recuperação. Os controladores são independentes da interface e das classes de
contas do aplicativo original. Nenhum método depende da instalação do CPAprime.

## Instalação

Python 3.10 ou mais recente:

```console
python -m pip install -r requirements.txt
```

Use os exemplos e instruções da pasta do CAPTCHA escolhido. O Aliyun requer um
Chromium com emulação de toque; o reCAPTCHA requer a extensão Buster carregada no
navegador. Para carregar a extensão por linha de comando, use uma distribuição
Chromium ou Chrome for Testing que aceite `--load-extension`; a aceitação dessa
opção varia entre distribuições e versões do Chrome.

## Código, recursos e serviços externos

Os scripts JavaScript embutidos e os arquivos da extensão são extrações literais.
As funções Python foram reconstruídas do executável Nuitka, com seus auxiliares e
contratos identificados. A sintaxe Python original não estava disponível. As
adaptações necessárias para uso independente estão indicadas na documentação de
cada implementação.

O Buster precisa de um mecanismo de transcrição. O pacote inclui o código e o
runtime WASM; os pesos do modelo local são obtidos pelo próprio Buster no primeiro
uso e não vieram no programa original. Como alternativa, configure um serviço de
fala com credenciais próprias. O arquivo do distribuidor `secrets.txt`, que contém
provisionamento cifrado de credenciais, foi excluído; nenhum código de resolução
foi removido com ele. Veja `recaptcha/BUSTER_DEPENDENCIAS.md` para os campos de
configuração e os efeitos dessa exclusão.

Assim, o pacote reúne o código e os recursos disponíveis, mas não inclui contas,
chaves de serviços nem um modelo de reconhecimento de fala previamente baixado.

## Origem e verificação

Executável analisado: `CPAprime.exe`, SHA-256
`e1ec1bc4f627f601e98227d974a98b8fb474a0e39cfd28a35869830c082f06b2`.

As evidências registram constantes, funções e limites da reconstrução. O
`MANIFESTO.json` relaciona os arquivos do ZIP com seus hashes. A revisão foi
estática e sintática; nenhum CAPTCHA ou site foi usado para testar os solvers.
Os seletores e algoritmos correspondem à versão analisada, e o resultado não
constitui uma implementação universal de todas as versões desses CAPTCHAs.

Não foi identificada implementação de hCaptcha, Turnstile ou FunCaptcha no
material analisado.

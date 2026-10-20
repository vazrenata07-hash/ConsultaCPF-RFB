# reCAPTCHA v2 e Buster

API independente reconstruída do método `Contas_pix.resolver_recaptcha` do
CPAprime. Inclui checkbox, modo invisível, desafio de áudio, clique coordenado
no botão do Buster, transcrição e confirmação. A extensão Buster está na pasta
`buster/`; o reconhecimento de áudio é realizado por ela.

O código Python foi reconstruído do executável Nuitka; não é o fonte original.
Os textos JavaScript em `scripts.py` são literais extraídos do módulo `classe_mp`.

## Uso com Selenium existente

Instale `python -m pip install -r recaptcha/requirements.txt` a partir da pasta
pai do pacote. Use um driver Chromium com a extensão Buster já carregada:

```python
from recaptcha import RecaptchaSolver

solver = RecaptchaSolver(driver)
# Opcional: modo local, usando modelo baixado pela própria extensão.
solver.configurar_buster_local(True)

sucesso = solver.resolver_recaptcha(timeout=90)
print(sucesso, solver.recaptcha_bloqueado)
```

Para reCAPTCHA invisível, chame o método depois que o formulário abrir o desafio.
`True` significa que a página apresentou um token ou o checkbox ficou marcado.
`False` pode indicar ausência de desafio, timeout, transcrição indisponível ou
recusa do desafio de áudio. `recaptcha_bloqueado` identifica a última condição.

## Exemplo independente

Execute na pasta pai de `recaptcha/`:

```text
python -m recaptcha.exemplo --url "URL_DA_PAGINA" --browser-binary "CAMINHO_DO_CHROMIUM"
```

`--extensao` permite indicar outra pasta que contenha `manifest.json`.
`--timeout` altera o prazo padrão de 90 segundos. O exemplo usa janela visível
e permite abrir o formulário antes de iniciar o fluxo.

Use Chromium ou Chrome for Testing com suporte a extensões descompactadas via
`--load-extension`; versões oficiais atuais do Chrome podem ignorar esse argumento.
O ChromeDriver precisa ser compatível com a versão do navegador; Selenium Manager
pode baixá-lo quando necessário.

## Configuração e dependências externas

- O solver exige `driver.execute_script`, `execute_cdp_cmd` e endereço de depuração
  em `driver.capabilities`. Para iframes isolados, usa `/json` e WebSocket CDP do
  navegador local; não basta uma conexão remota que não exponha esse endereço.
- O modelo de fala e seus downloads pertencem à extensão. O primeiro uso local
  pode exigir baixar o modelo e prazo maior; não há modelo de fala neste pacote.
- As credenciais de provisionamento da distribuição original foram excluídas.
  Para usar transcrição remota, configure seu próprio serviço nas opções da
  extensão e depois chame `configurar_buster_local(False)`.
- `_configurar_buster()` mantém o nome original de integração, mas preserva
  preferências. `configurar_buster_local(True/False)` altera a preferência de
  maneira explícita; não há seleção remota automática.

O parâmetro `timeout` é o prazo do laço de transcrição desde o começo da operação.
As esperas de abertura, extensão e confirmação têm prazos próprios de 15/20
segundos, além de timeouts CDP; portanto, a chamada pode durar mais que `timeout`.

Nenhum CAPTCHA ou site foi executado para validar a eficácia desta reconstrução.
O código e a extensão precisam ser exercitados no ambiente de destino.

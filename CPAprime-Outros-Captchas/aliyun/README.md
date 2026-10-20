# Aliyun

Reconstrução Python legível por análise estática de `CPAprime.exe`, com os
JavaScripts literais extraídos das constantes do executável. Não é o arquivo
Python original recuperado nem há garantia de equivalência completa.

Esta pasta contém o controle, detecção, leitura das imagens, análise por HSV,
arrasto com realimentação, liberação do toque, dependências e exemplo de
integração. Não depende dos módulos GeeTest. O detector adicional de GeeTest
é isolado e serve somente à guarda genérica `_captcha_aberto()`.

Instale as dependências com `pip install -r requirements.txt` no ambiente do
seu aplicativo. A API recebe um driver já aberto que implemente
`execute_script(texto, *args)` e `execute_cdp_cmd(comando, parametros)`.

```python
from aliyun import AliyunResolver

resolvedor = AliyunResolver(driver)
resultado = resolvedor.resolver_aliyun_se_aparecer(tentativas=3)
```

`AliyunMixin` também pode integrar uma classe existente que forneça
`self.driver`. O arquivo `exemplo.py` define `integrar(driver)`; não abre sites
nem executa o controle automaticamente.

`javascript_literal.py` e `javascript/*.js` preservam os textos extraídos.
`evidencias/` contém endereços, metadados, assembly anotado e pseudocódigo C da
decompilação. Consulte `EVIDENCIAS.md` para a origem e os limites.

Nenhum CAPTCHA, site ou teste de execução foi acessado nesta recuperação.

# Código GeeTest recuperado do CPAprime

Este pacote reúne os três resolvedores identificados em `CPAprime.exe`:

- **Slider:** presença, arrasto, confirmação por desaparecimento, atualização e tentativas.
- **Clique em ordem:** download dos ícones e da foto, máscaras, gradientes Sobel, busca por escala e rotação, combinação de posições, toques e confirmação.
- **Grade 3×3:** coleta da grade, pontuação dos objetos em JavaScript, reconhecimento de emoções por tabela, correção das células selecionadas e confirmação.

Inclui os auxiliares de download/cache, conversão de imagens, toque pelo Chrome DevTools Protocol, controle do clique automático e os dados de emoções: três prompts e 1.112 hashes armazenados nas três categorias.

## Origem e fidelidade

O programa recebido é um executável Nuitka. Os corpos Python foram compilados em código nativo; não há um `classes.py` original para simplesmente copiar.

| Conteúdo | Origem |
| --- | --- |
| JavaScript dos desafios | Texto literal das constantes embutidas no executável |
| `PROMPTS` e `CELULAS` de emoções | Dados literais do módulo compilado `geetest_emocao` |
| Métodos Python de resolução e auxiliares | Reconstrução a partir das instruções nativas, constantes, nomes locais e assinaturas recuperadas |
| Classe de integração `GeeTestSolver` e exemplo de uso | Código novo para reunir os métodos fora do aplicativo |

Os arquivos em `evidencias/` registram endereços, assinaturas, constantes e limites da reconstrução. Não se afirma que a sintaxe Python reconstruída é idêntica ao fonte original. Não foram executados desafios nem testes contra sites; a validação de funcionamento fica com você, conforme solicitado.

Executável analisado: `CPAprime.exe`, SHA-256 `e1ec1bc4f627f601e98227d974a98b8fb474a0e39cfd28a35869830c082f06b2`.

## Uso independente

Python 3.10 ou mais recente, Google Chrome e as dependências:

```console
python -m pip install -r requirements.txt
python resolver_geetest.py https://sua-pagina
```

O exemplo abre o Chrome com emulação de toque. Navegue até deixar o desafio visível e pressione Enter no terminal. O próprio Selenium cuida da seleção do ChromeDriver quando o ambiente permite.

Para usar com um navegador Selenium já aberto:

```python
from geetest_recuperado import GeeTestSolver

solver = GeeTestSolver(driver)
resolvido = solver.resolver()
```

Também estão disponíveis os métodos separados:

```python
solver.resolver_geetest_se_aparecer(tentativas=3)       # slider
solver.resolver_geetest_click_se_aparecer(respostas=5)  # clique em ordem
solver.resolver_geetest_nine_se_aparecer(respostas=5)   # grade 3×3
```

O download das imagens usa `requests`; `proxies` pode ser passado à classe no formato aceito por `requests`. O clique em ordem e o reconhecimento de emoções usam NumPy/OpenCV. Os toques reais exigem um driver Chromium com `execute_cdp_cmd` e uma página preparada para eventos de toque.

Os scripts mantêm os seletores e os algoritmos da versão analisada. A compatibilidade depende do desafio e da página atuais; este pacote não contém um resolvedor universal de todas as versões do GeeTest.

## Arquivos

- `geetest_recuperado/`: todos os módulos Python de resolução e suas constantes JavaScript.
- `javascript_original/`: os scripts JavaScript literais, também disponíveis para leitura separada.
- `resolver_geetest.py`: exemplo de integração.
- `evidencias/`: mapa dos 27 métodos/auxiliares e notas de recuperação.
- `MANIFESTO.json`: lista dos arquivos do pacote e seus hashes.

O mapa nativo inclui 26 métodos e auxiliares GeeTest reconstruídos e, como contexto, `iniciar_clique_centro`, o loop de autoclique do aplicativo. O adaptador independente não inicia esse loop. Os dumps de assembly e o pseudocódigo C disponível são evidência de análise, não módulos Python executáveis.

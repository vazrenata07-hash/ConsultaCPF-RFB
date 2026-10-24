# Revisão do log e do filtro original

Foram examinados os **500 eventos retidos**, com **477 registros de requisição**, **191 combinações distintas de host e caminho**, **44 endpoints de API**, **10 janelas** e **13 temporizadores**. Entradas nativas, de JavaScript e de Performance podem registrar a mesma chamada; esses números não equivalem a downloads nem permitem calcular bytes economizados.

## Alterações aplicadas ao bloqueio de rede

A V26.12 mantém os nove caminhos anteriores e acrescenta somente:

| Recurso | Evidência |
| --- | --- |
| `cdntoos.cf888pg.com/siteadmin/upload/img/1925138707392065538.gif` | Eventos 972/979; mesmo host e identificador da arte `.avif` já associada ao carrossel fechado na captura original. |
| `cdntoos.cf888pg.com/siteadmin/skin/lobby_asset/common/common/login/icon_zccgtc_yh.avif` | Captura original, eventos 10–13, dentro da promoção de cadastro fechada pelo usuário. |
| `cdntoos.cf888pg.com/siteadmin/skin/lobby_asset/common/common/login/icon_zccgtc_cz.avif` | Mesma promoção de cadastro; não é um bloqueio genérico de imagens de depósito. |

São **12 caminhos exatos de arquivos**, interceptados antes da transferência de rede nos caminhos nativos cobertos. Os dois ícones de cadastro não aparecem no recorte novo; sua inclusão vem da evidência direta da captura original. Não há bloqueio do CDN inteiro, de todos os GIFs, nem por pasta.

Bloquear os arquivos evita essas transferências; isso, sozinho, não desativa todo o JavaScript que cria ou reabre as janelas.

## APIs candidatas, ainda desativadas

Todos os caminhos abaixo usam o host `cdnapiif.ppa888pg.vip` e o prefixo `/hall/api/`.

| Consulta | Eventos | Situação |
| --- | --- | --- |
| `* active/cutADeal/cut_a_deal_announcement` | 668 | Candidato; não ativado |
| `POST active/tasks/newcomer_benefit_pop` | 866, 867, 875 | Candidato; não ativado |
| `POST active/coupon/popList` | 953, 954, 959 | Candidato; não ativado |
| `POST active/popRegressActive` | 1102, 1103, 1106 | Candidato; não ativado |

As 43 pilhas retidas de chamadas à API mostram o mesmo transporte Axios/Fy compartilhado e terminam antes do componente chamador. O endpoint de anúncio cut-a-deal aparece somente em Performance, sem método real conhecido. Não há corpo de resposta nem comprovação de que cada uma dessas APIs alimente somente as nove famílias fechadas. A decisão permanece discriminada no JSON, sem ativação automática.

`cutADeal/list` e `coupon/list` foram preservados: também aparecem no fluxo de depósito. O prefixo `agent/promote/` corresponde à página de indicação/agente, e não pode ser classificado inteiro como anúncio intrusivo apenas pelo nome.

## Módulos e temporizadores

O candidato mais específico é `FindUsIndex._2t0_lNs.js` com `FindUsIndex.BAaj7vtL.css`, seguido da janela `_find-us_ly0vd` no evento 975. O log não contém o código do módulo nem seu tratamento de rejeição de import. Bloquear o import pode interromper a fila compartilhada em vez de apenas remover essa janela; a regra não foi ativada.

O mesmo registro de diálogos carrega `WithdrawalPasswordIndex.BqLR4UWx.js` antes da janela de senha de saque 895. Por isso `optimized-chunk-dialog-registry`, `chunk-closure-startup`, bibliotecas compartilhadas, PIN, formulários, conta, pagamentos e ícones comuns foram preservados.

Nenhum dos 13 temporizadores foi demonstrado como exclusivo de publicidade. Há temporizadores de transição, fechamento, formulário e listas. Não foi criada regra por atraso, nome genérico ou proximidade temporal.

## Janelas observadas

Duas correspondem exatamente ao filtro original: convite/tarefas 675 e FindUs 975. As outras oito incluem senha de saque 895, dados de conta 900, depósito 940, avisos, seletores e uma seleção de prêmio que já estava fora das ações de fechamento no registro original. Não foram adicionadas ao filtro por serem genericamente `ui-popup`.

## Limites do registro

O arquivo guarda eventos **662 a 1161**; os anteriores foram descartados pelo limite de 500. Em nove janelas o vetor de recursos está vazio. O ícone de confirmação capturado no FindUs é compartilhado e foi preservado. Requisições próximas são candidatas de correlação, não prova de origem. `blocked:false` indica a avaliação das regras do depurador e não informa o resultado do bloqueador AdResources nem o status da transferência.

Não foram executados testes de uso ou acessos ao site. O APK foi compilado e assinado. O script principal, PIN, GeeTest, configurações, proxy e o salvamento do log foram preservados. Os arquivos brutos fornecidos pelo usuário não foram publicados.

A classificação de todos os 191 recursos está em `analise-recursos.json`; APIs, módulos, temporizadores e janelas têm relatórios próprios nesta pasta.

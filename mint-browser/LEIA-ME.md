# Mint Browser V26.13 — final sem depurador

Arquivo atual: `Mint-Browser-v26.13-Final-Sem-Depurador.apk`. O nome antigo `Mint-Browser-v26-Matrix-Configuracoes.apk` aponta para o mesmo APK.

**Todo o depurador incorporado foi removido:** classes, ponte, captura de eventos, asset e atalho nas configurações. A versão final parte da V26.10 limpa, com o PIN da base MODmint e a mesma chave de assinatura da V26.10. Configurações, senhas aplicadas, proxy, Mines e GeeTest foram preservados. Não são apagados arquivos de log já salvos pelo usuário.

O bloqueio nativo mantém 12 caminhos exatos de arquivos promocionais. Também são bloqueadas antes do envio as chamadas automáticas aos quatro endpoints de popup documentados em [politica-rede-final.json](politica-rede-final.json): `newcomer_benefit_pop`, `coupon/popList`, `popRegressActive` e `cut_a_deal_announcement`, somente no host `cdnapiif.ppa888pg.vip`.

Ações de promoção reconhecidas por gesto confiável podem autorizar uma chamada por endpoint/método em uma janela curta. Essa identificação é uma heurística limitada aos controles conhecidos, não uma classificação universal de todo pedido manual. As demais APIs seguem seus caminhos normais. Não há leitura de arquivo por requisição, varredura de eventos do depurador, nem cancelamento indiscriminado de temporizadores ou de módulos compartilhados.

A análise original está em [analise-log-2026-10-24](analise-log-2026-10-24/ANALISE.md). Nela, as quatro APIs eram candidatas sem ativação. A instrução posterior do usuário ampliou o escopo para impedir automações promocionais, com as exceções manuais documentadas. Isso não transforma as relações temporais do log em prova de causa nem garante remoção de toda publicidade ou ausência de impacto em qualquer fluxo futuro do site.

**Compilado e assinado, sem testes de uso.** Mesma assinatura da V26.10: `68c9841645621ead0edda3825aba76f9d292cecb1426cf6b255a73423d57aa7a`. Apenas o DEX3 foi substituído e o pequeno asset de controle de requisições foi adicionado à base limpa. Script principal, DEX1/2/4, manifesto, recursos, bibliotecas e demais assets foram preservados.

Fontes atuais: `correcao-nativa/AdResources.java`, `AutomaticRequestPolicy.java`, `AutomaticScripts.java` e `mint-automatic-requests.js`. Nenhuma captura bruta do usuário foi publicada.

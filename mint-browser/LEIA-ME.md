# Mint Browser V26.14.4 — Liberação manual por clique

Arquivo atual: `Mint-Browser-v26.14.4-Requisicoes-Manuais.apk`. O alias antigo aponta para o mesmo APK.

Qualquer clique real na página 888 inicia uma permissão de 5 segundos, sem exigir botão, texto ou classe específica. Toque para rolar e cliques gerados por scripts não ativam a permissão. Durante esse intervalo, nossos filtros permitem os quatro endpoints promocionais e as imagens capturadas/aprendidas. As janelas abertas durante a permissão seguem seu fechamento normal; fora dela o bloqueio permanece ativo.

A atribuição é por proximidade no tempo: uma requisição ou janela automática coincidente também pode passar. ServiceWorker e o callback legado de imagens usam uma janela breve compartilhada entre páginas 888, pois não informam o WebView. Não há garantia de atribuição universal em frames, nova navegação ou DOM reutilizado sem estado de fechamento observável. As regras de elegibilidade dos baús no servidor não são alteradas.

PIN e seus tempos, Mines, proxy, configurações e GeeTest limitado ao registro permanecem inalterados. Sem depurador. Mesma assinatura da V26.10. Compilação e assinatura concluídas; sem testes de uso, conforme solicitado.

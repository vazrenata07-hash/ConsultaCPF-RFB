# Mint Browser V26.14.3 — Abertura manual dos baús

Arquivo atual: `Mint-Browser-v26.14.3-Baus-Manual.apk`. O alias antigo aponta para o mesmo APK.

O clique real na seção `div._inner_14o7p_95` passa a autorizar a abertura manual dos dois componentes controlados e as requisições dos quatro endpoints promocionais já filtrados. Essa seção usa divs/imagens sem rótulo “Abrir” ou papel de botão, que a regra anterior não reconhecia. Pointerdown e click da mesma interação não renovam a permissão em duplicidade.

As permissões continuam temporárias. A exceção anterior da caixa `div._container_n102k_117._style2_n102k_144` permanece. As condições de desbloqueio e recompensas do próprio site não são alteradas. A associação dos baús aos endpoints e componentes precisa de validação no aparelho pelo usuário; não houve captura nova ou acesso ao site.

PIN, Mines, proxy, configurações e o script principal inteiro da V26.14.2 permanecem inalterados. GeeTest continua limitado ao registro. Todos os DEX foram mantidos. Sem depurador, com a mesma assinatura da V26.10.

JavaScript analisado sem execução; APK reempacotado e assinado. Sem testes de uso, conforme solicitado.

# Mint Browser V26.14.1 — exceção para o bônus manual

Arquivo atual: `Mint-Browser-v26.14.1-Bonus-Manual.apk`. O alias antigo aponta para o mesmo APK.

Foi adicionada uma exceção para `div._container_n102k_117._style2_n102k_144`. A caixa não entra no fechamento/hide dos filtros quando está presente. Um gesto confiável em Abrir nessa caixa autoriza a abertura seguinte de um dos dois componentes controlados e libera as chamadas promocionais correspondentes pela política de intenção manual. O diálogo autorizado mantém seu ciclo normal de fechamento; uma reabertura automática posterior volta a ser bloqueada.

O seletor informado não estava nas capturas anteriores, portanto a associação causal não foi validada pelo log. Esta é uma exceção dirigida ao elemento e ao acionamento manual informado, sem liberar globalmente os popups. Permanecem as limitações de reconhecimento do Vue e de gestos/controles da versão anterior.

Somente três assets JavaScript foram alterados. DEX, PIN, Mines, GeeTest, proxy, manifesto e recursos foram mantidos. O depurador continua removido; a assinatura é a mesma da V26.10. Sem testes de uso; JavaScript analisado sem execução e APK assinado.

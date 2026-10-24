# Mint Browser V26.11.1 — exportação corrigida

Arquivo atual: `Mint-Browser-v26.11.1-Exportacao-Corrigida.apk`. O nome antigo `Mint-Browser-v26-Matrix-Configuracoes.apk` aponta para o mesmo APK.

Abra **Configurações → Depurador de requisições**. Toque em **Recarregar e capturar**, volte ao site e deixe os elementos intrusivos aparecerem. Retorne ao depurador, toque em **Atualizar** e filtre por **Requisições**, **Temporizadores** ou **Janelas**. Abra um evento para ver detalhes e escolher **Bloquear**; gerencie ou remova suas escolhas em **Bloqueios**. O botão **Exportar** oferece o JSON pelo seletor do Android, sem envio automático.

As regras de requisição cancelam chamadas futuras por host, caminho e método antes do envio no navegador. Uma regra de temporizador impede a execução do callback identificado. Desligar a captura não desativa os bloqueios escolhidos. As regras sobrevivem ao Limpar dados interno; o registro é um buffer temporário de até 500 eventos. A tela exibe até 80 eventos depois de aplicar o filtro de tipo.

Este depurador ajuda a descobrir as origens e não transforma proximidade temporal em prova: um popup pode usar código inline ou um bundle compartilhado, sem requisição exclusiva. Não há acesso ao servidor remoto, às respostas ou aos corpos POST. Temporizadores textuais não são bloqueados; temporizadores criados antes de iniciar a captura exigem recarregar. As regras por caminho abrangem seus parâmetros e podem afetar funções que compartilhem o mesmo endpoint.

O script principal da V26.10, incluindo PIN, Mines e GeeTest, foi mantido integralmente. Só `classes3.dex` foi substituído e o asset independente `mint-debugger.js` foi acrescentado. Manifesto, recursos, bibliotecas, DEX 1, 2 e 4 e demais assets foram copiados da V26.10. A assinatura é a mesma da V26.10 e permite atualizar essa versão. A assinatura continua diferente da base MODmint original.

**Sem testes de uso ou de dispositivo, conforme solicitado.** Compilação, montagem e assinatura concluídas. [Guia do depurador](DEPURADOR.md). Fontes e integração em `correcao-nativa/depurador-v2611`; dados de montagem em `verification.json`. Arquivos e relatórios de versões anteriores permanecem históricos.

## Correção da exportação

A V26.11 criava o arquivo JSON, mas tentava compartilhá-lo usando uma autoridade FileProvider inexistente. A V26.11.1 usa a autoridade exata do manifesto: `com.miui.browser.mini.fileprovider`. A aplicação possui o pacote `com.mi.globalbrowser.mini`; esses dois identificadores não precisam coincidir.

A nova versão tem a mesma assinatura da V26.11 e pode atualizá-la. Se o buffer atual estiver vazio, Exportar usa o último JSON já salvo na pasta do depurador. Uma eventual nova falha informa a etapa e o tipo da exceção. Captura, regras, PIN, GeeTest e demais mods foram preservados. Compilado e assinado, sem testes de uso.

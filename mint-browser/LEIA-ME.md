# Mint Browser V26.12 — revisão do bloqueio com base no log

Arquivo atual: `Mint-Browser-v26.12-Adblock-Log.apk`. O nome antigo `Mint-Browser-v26-Matrix-Configuracoes.apk` aponta para o mesmo APK.

Foram analisados 500 eventos e 191 recursos distintos, cruzados com as janelas explicitamente fechadas na captura original. Esta versão acrescenta três caminhos exatos ao bloqueio nativo de download: a variante GIF de uma arte do carrossel e dois ícones específicos da promoção de cadastro. Os nove caminhos anteriores foram mantidos, totalizando 12. As regras independem da chave original de adblock.

[Análise completa e classificação dos recursos](analise-log-2026-10-24/ANALISE.md). Quatro APIs de popup e o módulo FindUs foram documentados como candidatos; não foram ativados sem comprovação de exclusividade e tratamento de falha. Bibliotecas compartilhadas, PIN, saques, conta, depósitos e seletores foram preservados. O bloqueio desses arquivos não equivale a desativar toda a lógica das janelas.

O script principal, GeeTest, proxy, configurações, captura e **Salvar log** permanecem da V26.11.2. Mesma assinatura, permitindo atualização sem desinstalar. [Como guardar o log em uma pasta](DEPURADOR.md).

**Sem testes de uso.** Compilação e assinatura concluídas. Capturas brutas não publicadas. Fontes em `correcao-nativa`; dados em `verification.json`.

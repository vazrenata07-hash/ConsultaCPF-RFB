# Mint Browser V26.11.2 — Salvar log

Arquivo atual: `Mint-Browser-v26.11.2-Salvar-Log.apk`. O nome antigo `Mint-Browser-v26-Matrix-Configuracoes.apk` aponta para o mesmo APK.

O depurador agora tem **Salvar log**. Esse botão abre o **Salvar como** do Android para escolher uma pasta e gravar `mint-log.json`. Aguarde a confirmação de gravação e anexe esse arquivo na conversa. O fluxo anterior de compartilhamento/Quick Share foi removido desse botão.

[Como capturar, salvar e enviar](DEPURADOR.md). Os controles de bloqueio continuam disponíveis, mas não são necessários para gerar o log.

A cópia é feita fora da thread da interface. Cancelar a escolha de pasta mantém o original. O receptor do resultado é um Fragment nativo sem interface, com estado restaurável; não foram alterados manifesto ou recursos. Apenas `classes3.dex` foi substituído. Os scripts do PIN, Mines, GeeTest e da captura permanecem intactos. DEX 1, 2 e 4 e demais arquivos foram copiados da V26.11.1.

A assinatura é a mesma das V26.11 e V26.11.1, permitindo atualização sem desinstalar. Os logs já gravados permanecem na pasta do aplicativo. Se o registro em memória estiver vazio, Salvar log utiliza o último JSON salvo pelo depurador.

**Compilado e assinado, sem testes de uso**, conforme solicitado. Fontes em `correcao-nativa/depurador-v2611`; metadados em `verification.json`.

# Guardar e enviar o log — Mint V26.11.2

1. Abra **Configurações → Depurador de requisições** e toque em **Recarregar e capturar**.
2. Volte ao site e deixe as janelas que deseja investigar aparecerem ou tentarem abrir.
3. Reabra o depurador e toque em **Salvar log**.
4. Na janela **Salvar como** do Android, escolha **Downloads** (ou outra pasta) e confirme **Salvar**. O nome sugerido é `mint-log.json`. Aguarde a mensagem de gravação concluída.
5. Nesta conversa, toque no botão de anexar e escolha o JSON na pasta em que o salvou.

Você pode apenas gravar e mandar o log; não precisa configurar bloqueios. O botão Salvar log abre a escolha de pasta, sem Quick Share. Cancelar a janela mantém a cópia original no Mint.

O registro mantém até 500 eventos em memória. Se o registro atual estiver vazio, usa o último arquivo de log salvo pelo depurador. Os arquivos anteriores são preservados ao atualizar da V26.11 ou V26.11.1, com a mesma assinatura. Nenhum teste de uso foi executado nesta correção; a entrega foi compilada e assinada.

Os registros incluem requisições, temporizadores e assinaturas de janelas, com possíveis relações temporais. Não incluem corpos de respostas, payloads, cookies ou conteúdo dos campos de senha. Proximidade temporal não comprova a origem de uma janela; a captura não cobre todos os processos do Android.

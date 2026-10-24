# Mint Browser V26.11 — Depurador de requisições

APK: `Mint-Browser-v26.11-Depurador-Requisicoes.apk`.

1. Abra a engrenagem de configurações e toque em **Depurador de requisições**. A captura vem desligada. Use **Recarregar e capturar** para acompanhar o início da página e os temporizadores criados a partir daí.
2. Feche o painel, volte ao site e reproduza a janela ou o comportamento que deseja investigar.
3. Reabra o depurador e toque em **Atualizar**. Filtre por **Todos**, **Requisições**, **Temporizadores** ou **Janelas**. Toque em um evento para ver os detalhes e a pilha de chamadas, quando disponível.
4. Adicione um bloqueio nos detalhes do evento. Requisições são identificadas pelo **host, caminho e método**; a regra impede novas tentativas correspondentes. Em temporizadores compatíveis, a regra identifica o callback pela assinatura e impede sua execução. Em **Bloqueios**, você pode remover regras ou adicionar manualmente uma regra de requisição. Recarregue o site para observar o resultado desde o início.
5. Use **Exportar** para gerar um JSON e escolher como compartilhar pelo Android. Você pode anexá-lo nesta conversa. Nada é enviado automaticamente. Depois da coleta, desligue **Capturar eventos** para encerrar o registro.

## Registro e persistência

O registro mantém até **500 eventos em memória**; os mais antigos são descartados e o painel mostra até 80 por filtro. **Limpar registro** apaga os eventos, sem remover bloqueios. As regras ficam nas preferências persistentes dos mods e sobrevivem ao **Limpar dados interno do navegador**.

Não são coletados corpos de resposta, payloads de POST, cookies ou campos de senha. O arquivo exportado é uma cópia dos eventos e das regras disponíveis naquele momento.

## Limites

A captura cobre as requisições interceptadas pelo WebView e pelos Service Workers no escopo identificado do site, além de `fetch`, XHR, beacon, WebSocket, EventSource e `window.open` instrumentados na página. Não cobre todo o tráfego de todos os processos do Android. Uma requisição já concluída não pode ser desfeita pelo bloqueio adicionado depois.

Para registrar os temporizadores de inicialização, use **Recarregar e capturar**. Callbacks fornecidos como texto são registrados como não compatíveis e não podem ser bloqueados por essa ferramenta. A assinatura de um callback pode mudar quando o site atualizar seu código.

Uma janela e uma requisição próximas no tempo indicam uma possível relação, sem provar qual código abriu a janela. Bloquear um script ou callback compartilhado pode também interromper funções úteis. O bloqueio atua no cliente; não altera o servidor nem garante bloqueio automático completo de anúncios.

O script principal do PIN e o DEX do GeeTest foram preservados em relação à V26.10. A entrega passa por compilação e assinatura; os testes de funcionamento no aparelho ficam com você, conforme solicitado.

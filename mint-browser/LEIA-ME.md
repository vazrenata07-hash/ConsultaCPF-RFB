# Mint Browser V26.14.2 — GeeTest somente no registro

Arquivo atual: `Mint-Browser-v26.14.2-Gee-So-Registro.apk`. O alias antigo aponta para o mesmo APK.

O resolvedor automático fica autorizado somente em `https://888pg.cc/home/register` (incluindo query e barra final). Em `/home/login` e nas demais rotas, não inicia resoluções ou gestos. A navegação revoga a autorização e cancela tarefas pendentes. Frames de desafio recebem a autorização do contexto superior e sua revogação, mantendo o funcionamento do registro em iframe.

A verificação oferecida pelo próprio site permanece disponível para interação manual no login. Nenhum algoritmo de resolução ou atraso do registro foi alterado; apenas o escopo de ativação. O script do PIN, Mines, filtros, exceção do bônus manual e todos os DEX foram mantidos.

Sem depurador, com a mesma assinatura da V26.10. JavaScript analisado sem execução; APK montado e assinado. Sem testes de uso, conforme solicitado.

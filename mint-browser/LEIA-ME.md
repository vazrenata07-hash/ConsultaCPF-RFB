# Mint Browser V26 — Matrix e configurações

APK: Mint-Browser-v26-Matrix-Configuracoes.apk

- Caixa inicial com o layout Matrix enviado, campo opcional e confirmação sem precisar digitar 0.
- A engrenagem mantém somente Privacidade e segurança e Avançados.
- Controles para ativar/desativar gerador de usuário, escolher de 1 a 64 caracteres e modo alfanumérico ou só letras.
- Senha de acesso e PIN de saque configuráveis, cada um com chave de preenchimento automático. O PIN tem seis dígitos. As opções são salvas localmente ao tocar em Salvar.
- Histórico passivo de bombas por quadrado nas últimas dez rodadas e contador de total apostado, com chaves separadas.
- Adblock customizado sempre ativo, sem opção para desligá-lo.

O código JavaScript e o DEX nativo do GeeTest são idênticos aos da V25. Os tempos existentes do script foram preservados. As páginas de configuração são locais, sem carregamentos externos ou animações. Os valores já preenchidos de senha/PIN não são apagados ao desativar os controles. Jogos abertos em iframes aninhados podem precisar ser recarregados para receber novas configurações.

Montagem, alinhamento, assinaturas v1/v2/v3, comparação dos arquivos e testes lógicos concluídos. Ainda não foi testado em um aparelho Android. O histórico usa mapas revelados depois das rodadas; não prevê bombas.

A assinatura é a mesma da V25-Janela-Compacta desta conversa e diferente da V25-PIN-Fluido original. Instalar sobre a original pode exigir reinstalação. Desinstalar apaga os dados locais.

SHA-256:
40781f7d3a7bc22ac307e7577a87fd88b76d4813c0fc474496692c9d6d5707fe

Esta branch adiciona somente a pasta mint-browser. Os arquivos existentes da ConsultaCPF-RFB foram preservados.

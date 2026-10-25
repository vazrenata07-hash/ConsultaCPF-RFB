# 888 Lite v7 — funções da Mint 26.14.3

Base: `53b354_lite_perfil_rota_v6.apk`. APK atual: `888-Lite-v7-Mint-26.14.3.apk`.

- Janela Matrix antes da tela principal: código opcional; vazio abre normalmente. O código mantém o domínio escolhido pelo app e direciona a `/home/register?id=...`.
- Um botão **Configurações** ao lado de **Limpar dados**, inserido somente no Perfil `/home/mine`. O mecanismo de rota da v6 é reaproveitado, sem busca por intervalo.
- Usuário configurável, senha de acesso, PIN de saque, Mines com 1 a 100 rodadas, total apostado, proxy e restaurar padrão. Funções iniciam ativas; senhas vazias e proxy desligado até configurar. Aplicação explícita das opções.
- Limpeza, reabertura e identidade local preservadas. As opções ficam em armazenamento privado fora dos diretórios apagados pela limpeza interna; desinstalar ou limpar os dados pelo Android continua apagando tudo.
- Bloqueios de rede e prevenção dos dois componentes antes da renderização da 26.14.3, com as exceções manuais das duas caixas/baús. Não inclui a permissão geral por qualquer clique da 26.14.4. Não houve nova captura de rede; os caminhos conhecidos foram adaptados aos hosts equivalentes já listados pelo app.
- **Resolvedor automático de CAPTCHA e ponte nativa não incluídos.** A verificação do site permanece manual.
- HTTP, HTTPS e SOCKS5 com host, porta, usuário e senha. Uma única notificação com botão ON/OFF. Requer permitir notificações no Android. O proxy cobre as WebViews e a busca HTML de compatibilidade da base; outros clientes nativos/SDKs e outros aplicativos não são roteados. O Android controla a permanência da notificação e do serviço.

**Assinatura nova e exclusiva**, conforme solicitado. Não instala por cima da v6 assinada com outra chave. Chave privada e senha não foram publicadas.

A montagem, análise sintática sem execução e assinatura foram concluídas. **Sem testes de uso ou aparelho**, conforme solicitado. A abertura dos baús depende das condições do site; a prevenção antes da renderização depende da estrutura Vue já identificada. Detalhes em `verification.json`.

Os fontes Java novos estão em `src/`; os scripts em `assets/`; os pontos de integração com a base estão em `integration.patch`. A rotina original de limpeza/identidade não foi reescrita.

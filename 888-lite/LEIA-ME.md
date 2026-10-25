# 888 Lite v7.1 — ativação dos filtros e Configurações

Base: `53b354_lite_perfil_rota_v6.apk`. APK atual: `888-Lite-v7.1-Filtros-Configuracoes.apk`.

- Janela Matrix antes da tela principal: código opcional; vazio abre normalmente. O código mantém o domínio escolhido pelo app e direciona a `/home/register?id=...`.
- Um botão **Configurações** ao lado de **Limpar dados**, inserido somente no Perfil `/home/mine`. O mecanismo de rota da v6 é reaproveitado, sem busca por intervalo.
- Usuário configurável, senha de acesso, PIN de saque, Mines com 1 a 100 rodadas, total apostado, proxy e restaurar padrão. Funções iniciam ativas; senhas vazias e proxy desligado até configurar. Aplicação explícita das opções.
- Limpeza, reabertura e identidade local preservadas. As opções ficam em armazenamento privado fora dos diretórios apagados pela limpeza interna; desinstalar ou limpar os dados pelo Android continua apagando tudo.
- Bloqueios de rede e prevenção dos dois componentes antes da renderização da 26.14.3, com as exceções manuais das duas caixas/baús. Não inclui a permissão geral por qualquer clique da 26.14.4. Não houve nova captura de rede; os 12 caminhos de imagens e os 4 endpoints conhecidos agora são comparados sem depender do host, dentro das páginas reconhecidas pela base.
- **Resolvedor automático de CAPTCHA e ponte nativa não incluídos.** A verificação do site permanece manual.
- HTTP, HTTPS e SOCKS5 com host, porta, usuário e senha. Uma única notificação com botão ON/OFF. Requer permitir notificações no Android. O proxy cobre as WebViews e a busca HTML de compatibilidade da base; outros clientes nativos/SDKs e outros aplicativos não são roteados. O Android controla a permanência da notificação e do serviço.

**Mesma assinatura exclusiva da v7.** Pode atualizar por cima da v7; não instala por cima da v6 assinada com outra chave. Chave privada e senha não foram publicadas.

A montagem, análise sintática sem execução e assinatura foram concluídas. **Sem testes de uso ou aparelho**, conforme solicitado. A abertura dos baús depende das condições do site; a prevenção antes da renderização depende da estrutura Vue já identificada. Detalhes em `verification.json`.

Os fontes Java novos estão em `src/`; os scripts em `assets/`; os pontos de integração com a base estão em `integration.patch`. A rotina original de limpeza/identidade não foi reescrita.

## Correção da v7.1

A v7 mantinha uma lista inicial separada de domínios. A base registra domínios adicionais durante seleção/navegação e redirecionamento; por isso o menu original podia funcionar enquanto o código portado recusava a mesma página. Agora os mods consultam diretamente a autoridade de páginas da base. O cache da página é atualizado após a preparação original e no início de navegação; novos endereços recebem registro de script no início do documento, uma vez por origem e WebView.

As rotas `/home/register`, `/home/mine`, `/home/security`, `/home/withdraw` e `/h5/games/9/9014/` mantêm seus endereços originais. Os filtros de rede usam caminhos exatos, sem impor o domínio da Mint. O botão Configurações recebe confirmação da ponte e possui alternativa por navegação nativa. Nenhum intervalo de busca foi adicionado. A configuração inalterada não é reaplicada a cada injeção repetida.

Os métodos em `build-stubs/` são apenas assinaturas para compilação; o APK usa os acessores implementados em smali na base. Não incluir o stub como classe executável na compilação.

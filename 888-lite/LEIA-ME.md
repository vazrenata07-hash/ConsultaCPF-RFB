# 888 Lite v7.4 — ações manuais

Base: `53b354_lite_perfil_rota_v6.apk`. APK atual: `888-Lite-v7.4-Acoes-Manuais.apk`.

- Janela Matrix antes da tela principal: código opcional; vazio abre normalmente. O código mantém o domínio escolhido pelo app e direciona a `/home/register?id=...`.
- Um botão **Configurações** ao lado de **Limpar dados**, inserido somente no Perfil `/home/mine`. O mecanismo de rota da v6 é reaproveitado, sem busca por intervalo.
- Usuário configurável, senha de acesso, PIN de saque, Mines com 1 a 100 rodadas, total apostado, proxy e restaurar padrão. Funções iniciam ativas; senhas vazias e proxy desligado até configurar. Aplicação explícita das opções.
- Limpeza, reabertura e identidade local preservadas. As opções ficam em armazenamento privado fora dos diretórios apagados pela limpeza interna; desinstalar ou limpar os dados pelo Android continua apagando tudo.
- Bloqueios de rede e prevenção dos dois componentes antes da renderização da 26.14.3, com as exceções manuais das duas caixas/baús. A partir da v7.4, as ações manuais são liberadas após qualquer clique real, conforme a nova orientação do usuário. Não houve nova captura de rede; os 12 caminhos de imagens e os 4 endpoints conhecidos agora são comparados sem depender do host, dentro das páginas reconhecidas pela base.
- **Resolvedor automático de CAPTCHA e ponte nativa não incluídos.** A verificação do site permanece manual.
- HTTP, HTTPS e SOCKS5 com host, porta, usuário e senha. Uma única notificação com botão ON/OFF. Requer permitir notificações no Android. O proxy cobre as WebViews e a busca HTML de compatibilidade da base; outros clientes nativos/SDKs e outros aplicativos não são roteados. O Android controla a permanência da notificação e do serviço.

**Mesma assinatura exclusiva da v7.** Pode atualizar por cima da v7; não instala por cima da v6 assinada com outra chave. Chave privada e senha não foram publicadas.

A montagem, análise sintática sem execução e assinatura foram concluídas. **Sem testes de uso ou aparelho**, conforme solicitado. A abertura dos baús depende das condições do site; a prevenção antes da renderização depende da estrutura Vue já identificada. Detalhes em `verification.json`.

Os fontes Java novos estão em `src/`; os scripts em `assets/`; os pontos de integração com a base estão em `integration.patch`. A rotina original de limpeza/identidade não foi reescrita.

## Correção da v7.1

A v7 mantinha uma lista inicial separada de domínios. A base registra domínios adicionais durante seleção/navegação e redirecionamento; por isso o menu original podia funcionar enquanto o código portado recusava a mesma página. Agora os mods consultam diretamente a autoridade de páginas da base. O cache da página é atualizado após a preparação original e no início de navegação; novos endereços recebem registro de script no início do documento, uma vez por origem e WebView.

As rotas `/home/register`, `/home/mine`, `/home/security`, `/home/withdraw` e `/h5/games/9/9014/` mantêm seus endereços originais. Os filtros de rede usam caminhos exatos, sem impor o domínio da Mint. O botão Configurações recebe confirmação da ponte e possui alternativa por navegação nativa. Nenhum intervalo de busca foi adicionado. A configuração inalterada não é reaplicada a cada injeção repetida.

Os métodos em `build-stubs/` são apenas assinaturas para compilação; o APK usa os acessores implementados em smali na base. Não incluir o stub como classe executável na compilação.

## Atualização da v7.2

A notificação agora tem dois botões: o controle do proxy e **Atualizar**. Atualizar recarrega a página aberta na WebView, na thread da interface. Se houver troca de estado do proxy em andamento, a recarga aguarda o callback existente; nenhum intervalo ou espera fixa foi adicionado. Sem página viva, aparece a orientação para abrir o app.

O botão usa a conexão atual; não troca o IP por conta própria. A mudança de IP depende do provedor da rede/proxy e das conexões mantidas. A recarga não limpa dados, senhas, opções ou IDs locais. Os scripts e filtros são os mesmos da v7.1. Mesma assinatura; pode instalar por cima da v7 ou v7.1.

O novo receiver não exportado está em `notification-manifest.patch`. Sem testes de uso/aparelho, conforme solicitado.

## Correção da v7.3

Antes, o parâmetro `id` era inserido apenas no primeiro `loadUrl` nativo. A navegação interna por Registrar podia ignorar esse trecho e abrir o formulário sem o código. A nova versão mantém `<protocolo/domínio/porta originais>/home/register?id=CODIGO`, com o `id` primeiro e os demais parâmetros preservados. A regra cobre carregamentos nativos, links de cadastro e navegação SPA. O guard do Vue Router corrige o objeto de query antes da navegação, para que a correção não seja apenas na URL exibida. Sem router acessível, há navegação real ao entrar no cadastro sem código inicializado. O código do formulário, os dados de cadastro e as respostas do servidor não são reescritos.

Chamadas `javascript:` internas deixam de consumir a primeira navegação e de substituir o cache da página usado pelos filtros. Os endereços originais permanecem; o guard reutiliza a descoberta Vue existente, sem intervalo de busca ou novo observador permanente.

A janela inicial aparece até confirmar a primeira escolha, inclusive se o campo estiver vazio. Essa escolha e o código ficam em `no_backup/mint_launch_choice_v1.json`, sobrevivendo às aberturas normais. A rotina original Limpar apaga esse arquivo e restaura a janela para informar outro código, enquanto as opções dos mods continuam no armazenamento persistente separado. Na primeira abertura após esta atualização é necessário confirmar uma escolha, pois versões anteriores não a guardavam.

Mesma assinatura das v7 anteriores. Compilação e assinatura concluídas, sem testes de cadastro/aparelho. A perda do parâmetro no cliente foi tratada; a atribuição efetiva do convite pelo servidor permanece para validação do usuário.

## Correção da v7.4

O clique em Receber da missão de depósito não era reconhecido pela lista anterior de exceções. A nova política usa qualquer clique real do usuário, sem exigir rótulo, classe ou seletor específico. Somente tocar para rolar e cliques produzidos por scripts não concedem permissão.

Por 5 segundos após a ação, os quatro endpoints promocionais filtrados e as imagens barradas pelos nossos filtros podem passar. As famílias de janelas filtradas podem abrir por ação manual e seguir seu fechamento normal. Elementos que já estavam marcados como bloqueados não são revelados por um clique posterior. Fora da permissão, permanecem os bloqueios de rede e de abertura automática. A autorização de um diálogo manual deixa de desativar globalmente os filtros por toda a vida desse diálogo.

A distinção é por proximidade no tempo: trabalho automático simultâneo também pode passar. Não existe classificação causal universal na WebView. O vídeo foi analisado, mas não mostra os requests nem as respostas do servidor; não há confirmação de recebimento do bônus. Os dados enviados pela aplicação e as respostas do servidor não foram reescritos e nenhum botão de recebimento é acionado automaticamente pelo mod.

A limpeza e identidade permanecem como na base; os 13 auxiliares originais de identidade/reset, além de LiteHooks que contém apenas os pontos de integração já documentados, não receberam mudanças nesta correção. Código de convite, janela inicial, proxy e atualização da página mantêm a implementação da v7.3. Mesma assinatura; pode atualizar por cima. Compilação e assinatura concluídas, sem testes de uso.

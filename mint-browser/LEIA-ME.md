# Mint Browser V26.9 — filtros da captura

Arquivo atual: `Mint-Browser-v26.9-Filtros-Capturados.apk`. O nome de download antigo `Mint-Browser-v26-Matrix-Configuracoes.apk` também foi atualizado.

## Bloqueios atualizados

Os filtros cosméticos anteriores foram substituídos pelos fechamentos explícitos registrados na captura: 15 gestos, agrupados em 9 famílias de componentes. Reaberturas e o par pointerdown/click foram deduplicados. Inclui também a janela de verificação fechada pelo usuário, usando seu botão X específico; o script não responde nem envia a verificação.

O bloqueio nativo intercepta, antes do download, 9 URLs de imagens promocionais identificadas na captura. Ele permanece ativo independentemente da chave original de bloqueio de anúncios. As regras usam host e caminho exatos, nas páginas 888pg.cc, sem bloquear o CDN inteiro ou imagens compartilhadas da navegação.

A captura contém resumos do DOM, sem HAR, e omite URLs originais de imagens inline/data e de alguns fundos CSS. Todos os componentes fechados entram nas regras de fechamento; o bloqueio de download cobre os recursos identificados no JSON. Não é possível afirmar que todos os recursos embutidos desses componentes foram identificados.

O preenchimento de PIN da V26.8, o proxy, as configurações, o Mines e o GeeTest foram preservados. O arquivo bruto da captura não foi publicado; os catálogos sanitizados e os fontes estão em `correcao-nativa`.

## Senha de saque

A V26.8 remove a exigência de ler o modelo interno do Vue que bloqueou o preenchimento na V26.7. Restaura o método compatível anterior e ativa cada campo da definição antes de preenchê-lo, incluindo a confirmação quando o teclado do primeiro campo ainda está aberto. As tentativas são limitadas e priorizam os campos ainda não tentados.

A verificação para sacar mantém os eventos das teclas reais, sem pausas fixas de digitação. O script não aciona Sacar/Confirmar nem envia solicitações de saque. Todo o código nativo, o proxy e as demais funções da V26.7 foram mantidos.

## Proxy

A antiga opção DNS Cloudflare/1.1.1.1 foi removida. No mesmo lugar da página inicial da engrenagem há a opção **Proxy**, antes de Restaurar padrão.

1. Abra **Configurações → Proxy**.
2. Escolha **HTTP**, **HTTPS** ou **SOCKS5** e preencha host/IP e porta. Usuário e senha são opcionais; em SOCKS5, informe ambos ou deixe ambos vazios.
3. Toque em **Aplicar** para salvar. Salvar uma configuração desativada não a ativa.
4. Toque no botão arredondado **Proxy**, no lugar da estrela ao lado da barra de endereço, para ativar ou desativar. Manter pressionado também abre o editor.
5. Recarregue as páginas após alterar a conexão.

O indicador fica cinza quando desativado e verde depois que o WebView aplica a configuração. Ele indica o estado da rota configurada; a conexão com o servidor e as credenciais serão testadas pelo usuário. O espaço original da estrela foi mantido: a barra de endereço não foi encurtada. O acesso aos favoritos pelo menu continua disponível.

HTTP e HTTPS aceitam autenticação Basic do proxy; SOCKS5 aceita autenticação por usuário/senha. O protocolo HTTPS valida o certificado do próprio servidor proxy. O HTTPS das páginas permanece entre o site e o WebView, sem descriptografia pelo intermediário local. O destino é informado ao proxy para resolução remota; somente o host do próprio proxy pode exigir a resolução normal do aparelho. Não há retorno silencioso à conexão direta se o proxy configurado falhar. O mod aplica-se às páginas WebView deste aplicativo, sem alterar o proxy global do Android.

As credenciais do proxy ficam na configuração nativa do aplicativo. A configuração injetada nos scripts das páginas usa uma lista explícita de campos e não recebe host, porta, protocolo, usuário ou senha do proxy.

## Opções preservadas

Os controles de usuário, senhas, histórico do Mines de 1 a 100 rodadas e total apostado continuam na página inicial da engrenagem. Privacidade e segurança e Avançado permanecem por último, com suas subdivisões originais. O adblock customizado permanece ativo. O layout Matrix, o contador e o GeeTest foram mantidos.

As configurações e senhas aplicadas são preservadas ao atualizar e ao usar o Limpar dados interno do navegador. Restaurar padrão redefine somente os mods, deixando o proxy desativado e seus campos vazios. A assinatura permanece igual às versões anteriores; instale como atualização, sem desinstalar.

## Montagem

JavaScript analisado sem execução; nova classe de interceptação compilada e conectada aos dois caminhos de WebView existentes; APK montado, alinhado e assinado com v1/v2/v3. O DEX nativo do GeeTest, manifesto, recursos, bibliotecas e demais assets foram mantidos da V26.8. **Nenhum teste de uso, fixture, conexão de proxy, navegador, formulário real ou saque foi executado**, conforme instrução do usuário. Relatórios em `correcao-nativa/tests` pertencem às versões anteriores e não validam a V26.9. Dados de montagem em `verification.json`.

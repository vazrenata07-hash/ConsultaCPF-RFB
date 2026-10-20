# Mint Browser V26.7 — Proxy e preenchimento do PIN

Arquivo atual: `Mint-Browser-v26.7-Proxy-PIN.apk`. O nome de download antigo `Mint-Browser-v26-Matrix-Configuracoes.apk` também foi atualizado.

## Senha de saque

A definição da senha ativa cada campo programaticamente, incluindo a confirmação, sem exigir um toque do usuário no segundo campo. O script identifica o componente do campo correto e aguarda a atualização do seu valor/modelo; apenas os pontos desenhados não contam como confirmação. Ele percorre os dois campos com tentativas automáticas limitadas, inclusive quando a confirmação termina de montar depois do primeiro campo.

A verificação do PIN para sacar usa as teclas reais da página e confirma o modelo a cada dígito. Foram removidas as pausas fixas de digitação: a continuação depende da atualização do componente. Campos HTML comuns também finalizam seus eventos sem temporizador fixo. O script não clica em Sacar/Confirmar nem envia uma solicitação de saque. A resposta real do site será conferida pelo usuário no aparelho.

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

Java e DEX compilados, JavaScript analisado pelo compilador sem execução, APK montado e assinado com v1/v2/v3 e alinhamento. **Nenhum teste de uso, fixture, conexão de proxy, navegador, formulário real ou saque foi executado**, conforme instrução expressa do usuário. Relatórios antigos em `correcao-nativa/tests` pertencem exclusivamente às versões anteriores e não validam a V26.7. Fontes atuais e patches estão em `correcao-nativa`; os dados de montagem estão em `verification.json`.

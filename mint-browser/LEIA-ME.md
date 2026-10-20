# Mint Browser V26.4 — confirmação da senha de saque

Arquivo atual: `Mint-Browser-v26.4-PIN-Validacao.apk`. O arquivo de nome antigo `Mint-Browser-v26-Matrix-Configuracoes.apk` também aponta para esta versão.

A página inicial da engrenagem contém os controles de usuário, senha de acesso, senha de saque, histórico do Mines, quantidade de rodadas e contador de total apostado. Em seguida vêm **DNS Cloudflare · 1.1.1.1**, **Restaurar padrão** e, por último, **Privacidade e segurança** e **Avançado**, com suas subdivisões originais preservadas.

## Senha de saque

O preenchimento dos seis pontos não é usado como confirmação de um preenchimento completo via setter do componente. A V26.4 retira esse atalho e também o evento Vue `input` isolado: usa as teclas reais do teclado da página, com eventos de toque completos ou o handler de clique correspondente. Aguarda 80 ms ao abrir o teclado, 60 ms entre os dígitos e 100 ms ao terminar, permitindo atualizar o modelo e os validadores do formulário. Nos campos HTML comuns, há uma confirmação com `change` e `blur/focusout` após 100 ms, sem mudar o preenchimento de usuário ou senha de acesso.

O script não aciona Sacar/Confirmar e não executa transações. Mantém a interrupção ao mudar de página/configuração e não completa um PIN parcial digitado pelo usuário. Nove casos passaram em uma simulação isolada do modelo do formulário em Node VM, incluindo reprodução do defeito anterior, atualização por teclas de toque/clique, confirmação por blur, PIN parcial e cancelamento por troca de página/opção. Isso não executa um WebView real. A aceitação pelo formulário do site deve ser conferida no aparelho; o Chromium local não iniciou por restrição de processo deste ambiente.

## Imagens e desempenho

O navegador original podia desativar o carregamento de imagens ao aplicar a economia de dados em redes móveis. Esta versão mantém `loadsImagesAutomatically=true` e `blockNetworkImage=false` quando reaplica as configurações da página. Também evita varrer campos e consultar o layout quando nenhum preenchimento configurado pode atuar naquela página. O adblock customizado continua sempre ativo; suas regras e os tempos das outras funções foram preservados. Essas mudanças corrigem o bloqueio identificado; recursos indisponíveis no próprio site ou na rede ainda dependem de suas respectivas origens.

## Rodadas do Mines

O campo **Rodadas no histórico do Mines** aceita de **1 a 100**, com **10** como padrão. Digite, por exemplo, 3 ou 5 e toque em **Aplicar**. A contagem usa somente as últimas N rodadas concluídas disponíveis. O histórico guarda até 100 registros para permitir reduzir e aumentar N sem descartar os registros já coletados. Rodadas antigas que não haviam sido guardadas não são reconstruídas.

## DNS Cloudflare somente neste navegador

A chave fica imediatamente antes de Restaurar padrão e vem desligada. Ao ativar, o WebView usa um proxy local de conexão, dentro do próprio aplicativo, que resolve os destinos por **DNS sobre HTTPS da Cloudflare**. As páginas HTTPS mantêm seu TLS e seus certificados originais; não há interceptação ou descriptografia do conteúdo. O DNS dos outros aplicativos e a configuração de DNS do Android não são alterados.

O início de novas navegações aguarda o callback do WebView que confirma a aplicação da configuração, sem temporizador fixo. Recarregue páginas já abertas depois de alterar a chave. Requer um Android System WebView com suporte a `PROXY_OVERRIDE`; quando indisponível, a alteração é recusada e a chave mantém seu estado anterior. Enquanto ativo, não há retorno silencioso ao DNS do aparelho se a Cloudflare falhar. O transporte do proxy usa TCP: HTTPS pode usar HTTP/2; HTTP/3 não é encaminhado por esse transporte. Requisições HTTP sem TLS usam conexões fechadas após cada resposta.

## Persistência e padrões

As opções anteriores continuam ligadas por padrão, com usuário alfanumérico de 15 caracteres e senhas vazias em instalação nova. Esta atualização preserva as senhas e escolhas já aplicadas na V26.2. **Limpar dados pelo navegador** preserva as configurações dos mods, inclusive o número de rodadas e a chave de DNS. **Restaurar padrão** redefine somente essas personalizações: senhas vazias, histórico de 10 rodadas, opções anteriores ligadas e DNS desligado. As duas seções nativas não são redefinidas por esse botão.

O layout Matrix inicial e o GeeTest foram mantidos. A comparação do APK final com a V26.3 confirma que apenas o JavaScript do PIN mudou; todos os DEX, recursos, manifesto, DNS e layout Matrix permaneceram idênticos. O JavaScript do GeeTest e seu DEX nativo também permanecem idênticos à base indicada.

Base: release 1.0.2 indicada pelo usuário. Assinatura igual à base e às versões anteriores; instale como atualização, sem desinstalar. Sintaxe JavaScript, integridade ZIP, preservação dos demais componentes, alinhamento e assinaturas v1/v2/v3 conferidos. Os testes de uso no aparelho ficam com o usuário, conforme solicitado. Fontes e patch dos pontos nativos alterados estão em `correcao-nativa`; a conferência está em `verification.json`.

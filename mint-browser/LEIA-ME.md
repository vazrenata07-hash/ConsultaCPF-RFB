# Mint Browser V26.6 — saque com pausas de 10 ms

Arquivo desta versão: `Mint-Browser-v26.6-Saque-10ms.apk`.

A página inicial da engrenagem contém os controles de usuário, senha de acesso, senha de saque, histórico do Mines, quantidade de rodadas e contador de total apostado. Em seguida vêm **DNS Cloudflare · 1.1.1.1**, **Restaurar padrão** e, por último, **Privacidade e segurança** e **Avançado**, com suas subdivisões originais preservadas.

## Senha de saque

**Definir e confirmar a senha:** volta o preenchimento instantâneo da V26.3, sem pausas artificiais entre os dígitos. A tela `/home/security` exibida no vídeo, com “Defina sua senha de saque” e “Confirmar Nova Senha”, usa esse caminho.

**Verificar a senha para realizar um saque:** mantém as teclas reais da página e os eventos que atualizam o formulário. Todas as pausas desse fluxo foram reduzidas para **10 ms**: abertura do teclado, intervalo entre os dígitos, conclusão e confirmação dos campos HTML comuns. Essas pausas se aplicam somente à verificação da senha de saque. A definição e confirmação inicial do PIN continuam instantâneas; senha de acesso e outras verificações não recebem essas pausas.

Se houver um toque real durante a sequência automática, ela é interrompida antes das próximas teclas. O toque não é bloqueado, e a sequência não deve continuar em outro campo após uma troca de foco. O script não aciona Sacar/Confirmar nem executa transações.

**Esta V26.6 não foi testada, por solicitação expressa do usuário.** Não foram executados testes de regressão, testes funcionais, navegador ou site nesta versão. Os relatórios de testes existentes são históricos de versões anteriores e não validam a V26.6; a conferência de uso no aparelho fica com o usuário.

## Imagens e desempenho

O navegador original podia desativar o carregamento de imagens ao aplicar a economia de dados em redes móveis. Esta versão mantém `loadsImagesAutomatically=true` e `blockNetworkImage=false` quando reaplica as configurações da página. Também evita varrer campos e consultar o layout quando nenhum preenchimento configurado pode atuar naquela página. O adblock customizado continua sempre ativo; suas regras e os tempos das outras funções foram preservados. Essas mudanças corrigem o bloqueio identificado; recursos indisponíveis no próprio site ou na rede ainda dependem de suas respectivas origens.

## Rodadas do Mines

O campo **Rodadas no histórico do Mines** aceita de **1 a 100**, com **10** como padrão. Digite, por exemplo, 3 ou 5 e toque em **Aplicar**. A contagem usa somente as últimas N rodadas concluídas disponíveis. O histórico guarda até 100 registros para permitir reduzir e aumentar N sem descartar os registros já coletados. Rodadas antigas que não haviam sido guardadas não são reconstruídas.

## DNS Cloudflare somente neste navegador

A chave fica imediatamente antes de Restaurar padrão e vem desligada. Ao ativar, o WebView usa um proxy local de conexão, dentro do próprio aplicativo, que resolve os destinos por **DNS sobre HTTPS da Cloudflare**. As páginas HTTPS mantêm seu TLS e seus certificados originais; não há interceptação ou descriptografia do conteúdo. O DNS dos outros aplicativos e a configuração de DNS do Android não são alterados.

O início de novas navegações aguarda o callback do WebView que confirma a aplicação da configuração, sem temporizador fixo. Recarregue páginas já abertas depois de alterar a chave. Requer um Android System WebView com suporte a `PROXY_OVERRIDE`; quando indisponível, a alteração é recusada e a chave mantém seu estado anterior. Enquanto ativo, não há retorno silencioso ao DNS do aparelho se a Cloudflare falhar. O transporte do proxy usa TCP: HTTPS pode usar HTTP/2; HTTP/3 não é encaminhado por esse transporte. Requisições HTTP sem TLS usam conexões fechadas após cada resposta.

## Persistência e padrões

As opções anteriores continuam ligadas por padrão, com usuário alfanumérico de 15 caracteres e senhas vazias em instalação nova. Esta atualização preserva as senhas e escolhas já aplicadas na V26.2. **Limpar dados pelo navegador** preserva as configurações dos mods, inclusive o número de rodadas e a chave de DNS. **Restaurar padrão** redefine somente essas personalizações: senhas vazias, histórico de 10 rodadas, opções anteriores ligadas e DNS desligado. As duas seções nativas não são redefinidas por esse botão.

A alteração desta versão se limita às pausas do PIN para saque, herdando as demais funções da V26.5. O layout Matrix inicial, o GeeTest, o DNS, o histórico e as configurações permanecem na implementação anterior. Relatórios de comparação anteriores permanecem apenas como histórico; não foi feita nova comparação funcional nesta versão.

Base original: release 1.0.2 indicada pelo usuário, com as personalizações herdadas até a V26.5. Instale como atualização, sem desinstalar. As fontes e os patches anteriores continuam em `correcao-nativa`; eventuais arquivos de conferência e resultados anteriores são históricos. Esta entrega atende à instrução de alterar os tempos e empacotar o APK sem executar novos testes.

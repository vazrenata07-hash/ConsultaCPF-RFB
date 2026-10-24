# Mint Browser V26.14 — impedir a montagem das janelas identificadas

Arquivo atual: `Mint-Browser-v26.14-Bloqueio-Antes-Montagem.apk`. O nome antigo `Mint-Browser-v26-Matrix-Configuracoes.apk` aponta para o mesmo APK.

A correção atua antes da renderização das instâncias Vue cujas classes identificam as janelas de convite/tarefas (`_dialogBox_1r6g9_89`) e sorteio/prêmios (`_dialogBox_930qf_89`). O render dessas instâncias é vetado antes da criação dos filhos da janela e de sua camada de fundo. A tentativa de abertura recebe cancelamento lógico pelos handlers registrados do componente, com verificação de instância e vnode; não há clique no X nem remoção de DOM nesse bloqueio. O fechamento tardio antigo foi desativado para esses dois alvos.

Também foi corrigido um erro no CSS preventivo: `:has()` aninhado gerava uma regra inválida para a camada de fundo. Agora o seletor usa somente um `:has()`, com alvos específicos. Os vídeos mostraram o efeito do fundo e o texto do sorteio; a captura original confirma a relação entre os diálogos e o overlay. A hipótese inicial de overlay irmão não foi usada como evidência.

Os bloqueios de rede da V26.13 permanecem: 12 arquivos promocionais e quatro endpoints automáticos com exceções manuais reconhecidas. Uma janela criada por código já carregado não exige novo download para cada abertura, portanto o veto de componente complementa o bloqueio de rede.

**Limite:** o veto depende do app/contexto Vue acessível e dos tokens de classe identificados. A associação do app ocorre depois da montagem da raiz; não há garantia de interceptar um componente que já tenha sido renderizado antes dessa associação. Nenhum teste de uso foi feito, conforme solicitado; o resultado no aparelho fica para verificação do usuário.

O script principal foi alterado somente no bloco de filtros anterior a `function register()`. O restante do PIN, Mines e GeeTest foi copiado por bytes da V26.13. DEX1/2/4, manifesto, recursos e bibliotecas foram preservados. O depurador continua ausente. A assinatura é a mesma da V26.10 e versões finais seguintes.

Fontes: `correcao-nativa/mint-component-policy.js`, `mint-rebuilt.js` e `AutomaticScripts.java`. Compilado e assinado, sem testes de uso.

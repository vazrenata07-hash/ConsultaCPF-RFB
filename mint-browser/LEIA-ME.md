# Mint Browser V26.10 — base MODmint e bloqueio de recursos

Arquivo atual: `Mint-Browser-v26.10-Base-MODmint-Bloqueio.apk`. O nome antigo `Mint-Browser-v26-Matrix-Configuracoes.apk` aponta para o mesmo APK.

## Base e PIN

Esta versão usa diretamente o **MODmint.apk** da release [modifinal/1.0.1](https://github.com/vazrenata07-hash/modifinal/releases/tag/1.0.1), SHA256 `5b97834977f14b779635b02baa131c6ac23c42d2e50005b79020173b07b2fa87`. Essa base contém `setupTogether()`, que preenche os dois componentes de PIN pelos setters específicos, e a digitação de verificação de saque de 5 ms. Todo o JavaScript desde `function register()` foi preservado por bytes: PIN, cadastro, Mines e GeeTest não foram reescritos. O DEX 4 foi copiado integralmente da base, assim como manifesto, recursos, bibliotecas e demais assets.

A V26.9 anterior partia da V26.8 e não incluía essas melhorias da base MODmint. Use a V26.10 como versão atual.

## Bloqueio atualizado

O catálogo antigo foi substituído pelas nove famílias de componentes explicitamente fechados na captura de 23 de outubro: 15 gestos, sem duplicar pointerdown/click ou reaberturas. Inclui a janela de verificação fechada pelo usuário, usando somente seu X; não responde nem envia verificações. A regra genérica que escondia todos os módulos flutuantes foi removida.

O sistema original **MintAdResources** foi mantido e recebeu nove caminhos exatos de imagens promocionais como regras iniciais. Esses arquivos são interceptados antes do download, inclusive na primeira visita, com resposta vazia. O bloqueio agora entra antes dos delegados dos dois caminhos de WebView, independentemente da chave original de adblock. Em Android 7/API24 ou superior, os nove caminhos também são interceptados em pedidos de service workers. Parâmetros de cache não contornam os caminhos exatos; o Referer do CDN não desativa uma regra quando a página 888 já é conhecida. Não há bloqueio de CDN inteiro, APIs genéricas ou recursos do GeeTest.

CSS com as assinaturas exatas é instalado no início do documento para evitar a aparição breve dos componentes. Isso complementa a interceptação de rede. A aprendizagem de imagens promocionais da base foi preservada; as regras aprendidas antigas eram somente em memória, sem catálogo persistido em disco.

**Limite da captura:** o JSON contém resumos do DOM, sem HAR e sem os endereços originais de todos os recursos inline/fundos CSS ou das APIs e módulos que criam cada promoção. O bloqueio antecipado de rede cobre os nove caminhos registrados. Imagens desconhecidas podem ser aprendidas após a primeira carga. Portanto esta versão não promete eliminar todos os bytes relacionados a propagandas nem o processamento do JavaScript compartilhado do site.

## Assinatura

A assinatura original foi verificada em v1/v2/v3: certificado `Mint Browser PIN Delay5ms`, SHA256 `3f9e5471fbc31de4b8302b554064d9110d7138a7fc7ddcc2934f47ac65870e13`.

O usuário autorizou **uma nova chave**. Certificado atual: `Mint Custom Browser 2026`, SHA256 `68c9841645621ead0edda3825aba76f9d292cecb1426cf6b255a73423d57aa7a`. Por serem assinaturas diferentes, o Android não permite instalar esta versão por cima do MODmint original. A chave privada fica fora do repositório público.

## Montagem e fontes

APK compilado, alinhado e assinado em v1/v2/v3. **Nenhum teste funcional, de navegador, formulário, proxy ou saque foi executado.** A conferência da assinatura, compilação e inspeção dos fontes/ZIP foram realizadas. Relatórios antigos em `correcao-nativa/tests` pertencem a outras versões.

Fontes atuais do script e do bloqueador: `correcao-nativa/mint-rebuilt.js` e `correcao-nativa/AdResources.java`. Integração: `hook-ad-resources.py`; diferença cosmética contra a base: `modmint-filtros-v2610.patch`; montagem que preserva o restante do APK: `repack-v2610.py`. Catálogos sanitizados: `capture-filter-spec.json`, `captured-resource-rules.json` e `resource-rule-spec.json`. Não foi publicada a captura bruta. Os demais patches nessa pasta são históricos de versões anteriores.

# CPAprime: abertura direta

O CPAprime.exe do asset CPAprime.Bot.zip da release 1.0.0 abre uma tela Google antes da interface. Este aplicador cria CPAprime-SemLogin.exe, que abre a interface local diretamente. O executavel original e seus dados sao preservados.

## Como aplicar no Windows

1. Baixe `CPAprime-Correcao-Abertura.zip` desta pasta e extraia.
2. Execute `Aplicar-Correcao.cmd`.
3. Selecione o `CPAprime.exe` na pasta extraida do programa original.
4. Abra `CPAprime-SemLogin.exe`, criado na mesma pasta. Mantenha-o junto das DLLs e demais arquivos.

Nao requer Python nem permissao de administrador quando a pasta permite gravacao. O script PowerShell tambem aceita `-Arquivo caminho/CPAprime.exe -SemJanela` para execucao sem dialogos. A politica de execucao Bypass vale somente para o processo do aplicador.

Para desfazer, apague apenas o novo executavel e abra o original. Uma atualizacao oficial nao recebe esta alteracao automaticamente.

## Alteracao

O ZIP fornecido contem um executavel Nuitka x64, nao o fonte Python. A mudanca usa os metodos compilados existentes e preserva os caminhos normais de retorno e tratamento de erro:

- Offset `0x44edd8`, 195 bytes: depois das tarefas locais de inicializacao, chamar `InterfaceNova._abrir_interface()` em vez de mostrar a entrada e iniciar a autenticacao.
- Offset `0x44f656`, 7 bytes: saltar somente o inicio do heartbeat da conta e do sync autenticado da dashboard nessa abertura. A janela principal continua sendo mostrada pelo metodo original.

Sao 189 bytes diferentes, todos dentro desses dois intervalos. Recursos QML, bibliotecas e dados nao sao alterados. O manifesto com bytes antes/depois esta embutido no PowerShell.

Este ajuste cobre a abertura da interface. A checagem de licenca usada antes de cadastrar e as autorizacoes dos servicos externos continuam presentes; essas operacoes podem continuar exigindo uma licenca valida. Nao se criam tokens nem se modifica o servidor.

## Integridade e verificacao

Tamanho do executavel: 71.693.824 bytes.

SHA256 original: `e1ec1bc4f627f601e98227d974a98b8fb474a0e39cfd28a35869830c082f06b2`

SHA256 corrigido: `ae6dfefa5fe3f35b41704e570d75eed29c5cb4067f3b9d9ccd832392549e6076`

O aplicador verifica o hash e os bytes esperados antes de escrever, valida o resultado antes e depois de grava-lo e nunca sobrescreve outro arquivo de saida diferente.

Testes do aplicador em PowerShell 7.5.4: geracao com hash exato; original preservado; reaplicacao segura; selecao de arquivo ja corrigido; rejeicao de versao diferente; preservacao de saida preexistente e limpeza de temporarios.

Teste de interface em Wine 10 x64, com dados vazios e sem contas salvas: o original mostrou Entrar com Google; o corrigido abriu diretamente a interface principal e permaneceu aberta sem voltar ao login. A automatizacao de cliques no Xvfb/Wine teve limitacoes de renderizacao; nao foi usada para afirmar validacao das operacoes do aplicativo. Bibliotecas do sistema Windows foram preparadas apenas no prefixo de teste Wine, sem serem incluidas na correcao. Operacoes externas nao foram executadas.

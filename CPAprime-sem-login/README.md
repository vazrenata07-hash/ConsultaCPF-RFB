# CPAprime: correcao v2

O aplicador cria `CPAprime-SemLogin-v2.exe` na pasta do programa. Preserva o executavel original, a primeira correcao e os dados salvos. Aceita o original da release 1.0.0 e o resultado exato da v1.

## Como aplicar no Windows

1. Extraia `CPAprime-Correcao-v2.zip`.
2. Execute `Aplicar-Correcao.cmd`.
3. Selecione `CPAprime.exe` ou `CPAprime-SemLogin.exe` na pasta do programa original.
4. Feche a versao anterior e abra `CPAprime-SemLogin-v2.exe`, mantendo-o junto das DLLs e demais arquivos.

Nao requer Python nem permissao de administrador quando a pasta permite gravacao. O PowerShell aceita `-Arquivo caminho/CPAprime.exe -SemJanela`. A politica de execucao Bypass vale somente para o processo do aplicador.

Para desfazer, apague apenas o novo executavel e abra o anterior. Uma atualizacao oficial nao recebe esta alteracao automaticamente.

## Alteracao

O ZIP fornecido contem um executavel Nuitka x64. A v2 inclui os dois ajustes de abertura da v1 e remove a recusa local de `ModeloLicenca.licencaOk`:

- Offset `0x44edd8`, 195 bytes: chamar `InterfaceNova._abrir_interface()` depois das tarefas locais de inicializacao.
- Offset `0x44f656`, 7 bytes: omitir o inicio do heartbeat da conta e do sync autenticado da dashboard nessa abertura.
- Offset `0x587212`, 2 bytes: omitir o salto condicional da recusa local por licenca invalida.

Sao 191 bytes diferentes em tres intervalos. Recursos QML, bibliotecas e dados nao sao alterados. Os servicos externos continuam sujeitos as proprias autorizacoes e disponibilidade; nao se criam tokens nem se modificam servidores.

## Integridade e verificacao

Tamanho: 71693824 bytes.

SHA256 original: `e1ec1bc4f627f601e98227d974a98b8fb474a0e39cfd28a35869830c082f06b2`

SHA256 v1 aceito: `ae6dfefa5fe3f35b41704e570d75eed29c5cb4067f3b9d9ccd832392549e6076`

SHA256 v2: `38ce6404ac7828ee451f80340c72c4067090375d77339d8a15da58c67e5229f2`

O aplicador confere tamanho, SHA256 e bytes esperados. Quando a entrada e a v1, reconstitui o original somente em memoria, verifica novamente seu SHA256 e aplica os tres intervalos da v2. Verifica o resultado antes e depois de grava-lo e recusa sobrescrever uma saida diferente. Selecionar uma v2 ja correta nao a modifica.

Os testes automatizados do aplicador cobrem entrada original e v1, preservacao das entradas, reaplicacao, entrada ja corrigida, conflito de saida, entrada invalida e limpeza de temporarios. Isso verifica a transformacao dos arquivos, sem afirmar validacao funcional completa do aplicativo ou dos servicos externos.

O teste anterior da abertura foi realizado em Wine 10 x64 com dados vazios: a v1 abriu diretamente a interface principal. A automatizacao de cliques no Xvfb/Wine apresentou limitacoes de renderizacao. Esse teste da v1 nao valida as operacoes adicionais da v2. Bibliotecas preparadas no prefixo Wine de teste nao sao incluidas no pacote.

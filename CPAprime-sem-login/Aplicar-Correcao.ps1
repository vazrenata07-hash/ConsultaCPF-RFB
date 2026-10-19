[CmdletBinding()]
param([string]$Arquivo = '', [switch]$SemJanela)
$ErrorActionPreference = 'Stop'
$temporario = $null
function Get-Sha256([byte[]]$Dados) {
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return [BitConverter]::ToString($sha.ComputeHash($Dados)).Replace('-', '').ToLowerInvariant() }
    finally { $sha.Dispose() }
}
function Convert-Hex([string]$Hex) {
    $resultado = New-Object byte[] ($Hex.Length / 2)
    for ($i = 0; $i -lt $resultado.Length; $i++) {
        $resultado[$i] = [Convert]::ToByte($Hex.Substring($i * 2, 2), 16)
    }
    return ,$resultado
}
$manifesto = @'
{"original_name":"CPAprime.exe","patched_name":"CPAprime-SemLogin-v2.exe","size":71693824,"original_sha256":"e1ec1bc4f627f601e98227d974a98b8fb474a0e39cfd28a35869830c082f06b2","patched_sha256":"38ce6404ac7828ee451f80340c72c4067090375d77339d8a15da58c67e5229f2","patches":[{"offset":4517336,"va":"0x14044f9d8","description":"Call InterfaceNova._abrir_interface after local startup tasks; omit login window and account verification.","before":"4c8b0501179702498bd6488bcbe836818802488be8bf0f0100004885c00f84a0000000897e28488bd04c8b0538179702488bcbe8900c88024c8bf8443965007c1148836d0001750a488b5508488bcdff52304d85ff746c4539277c1049832f01750a498b4708498bcfff50304c8b05ed139702498bd6488bcbe8ca808802488be8bf100100004885c07438897e28488bd04c8b05d8169702488bcbe8280c88024c8bf8443965007c1148836d0001750a488b5508488bcdff52304d85ff0f8527010000","after":"4c8b0511179702498bd6488bcbbf0f010000897e28e8ae0c88024c8bf84d85ff0f85c4010000e9980000009090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090"},{"offset":4519510,"va":"0x140450256","description":"Omit account heartbeat and authenticated dashboard sync while opening the local interface.","before":"4c8b05eb0b9702","after":"e96e0100009090"},{"offset":5796370,"va":"0x140587e12","description":"Use the existing successful return of the local license guard; do not call _acabar or reopen account entry when no cached license is present.","before":"741d","after":"9090"}],"version":2,"previous_name":"CPAprime-SemLogin.exe","previous_sha256":"ae6dfefa5fe3f35b41704e570d75eed29c5cb4067f3b9d9ccd832392549e6076","previous_patches":[{"offset":4517336,"va":"0x14044f9d8","description":"Call InterfaceNova._abrir_interface after local startup tasks; omit login window and account verification.","before":"4c8b0501179702498bd6488bcbe836818802488be8bf0f0100004885c00f84a0000000897e28488bd04c8b0538179702488bcbe8900c88024c8bf8443965007c1148836d0001750a488b5508488bcdff52304d85ff746c4539277c1049832f01750a498b4708498bcfff50304c8b05ed139702498bd6488bcbe8ca808802488be8bf100100004885c07438897e28488bd04c8b05d8169702488bcbe8280c88024c8bf8443965007c1148836d0001750a488b5508488bcdff52304d85ff0f8527010000","after":"4c8b0511179702498bd6488bcbbf0f010000897e28e8ae0c88024c8bf84d85ff0f85c4010000e9980000009090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090"},{"offset":4519510,"va":"0x140450256","description":"Omit account heartbeat and authenticated dashboard sync while opening the local interface.","before":"4c8b05eb0b9702","after":"e96e0100009090"}],"upgrade_from":{"sha256":"ae6dfefa5fe3f35b41704e570d75eed29c5cb4067f3b9d9ccd832392549e6076","patches":[{"offset":4517336,"va":"0x14044f9d8","description":"Call InterfaceNova._abrir_interface after local startup tasks; omit login window and account verification.","before":"4c8b0501179702498bd6488bcbe836818802488be8bf0f0100004885c00f84a0000000897e28488bd04c8b0538179702488bcbe8900c88024c8bf8443965007c1148836d0001750a488b5508488bcdff52304d85ff746c4539277c1049832f01750a498b4708498bcfff50304c8b05ed139702498bd6488bcbe8ca808802488be8bf100100004885c07438897e28488bd04c8b05d8169702488bcbe8280c88024c8bf8443965007c1148836d0001750a488b5508488bcdff52304d85ff0f8527010000","after":"4c8b0511179702498bd6488bcbbf0f010000897e28e8ae0c88024c8bf84d85ff0f85c4010000e9980000009090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090909090"},{"offset":4519510,"va":"0x140450256","description":"Omit account heartbeat and authenticated dashboard sync while opening the local interface.","before":"4c8b05eb0b9702","after":"e96e0100009090"}]}}
'@ | ConvertFrom-Json
try {
    if (-not $Arquivo) {
        if ($SemJanela) { throw 'Informe -Arquivo com o caminho de CPAprime.exe.' }
        Add-Type -AssemblyName System.Windows.Forms
        $seletor = New-Object System.Windows.Forms.OpenFileDialog
        try {
            $seletor.Title = 'Selecione CPAprime.exe ou CPAprime-SemLogin.exe na pasta do programa'
            $seletor.Filter = 'Executaveis CPAprime (*.exe)|*.exe'
            $seletor.InitialDirectory = $PSScriptRoot
            if ($seletor.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) { exit 0 }
            $Arquivo = $seletor.FileName
        } finally { $seletor.Dispose() }
    }
    $origem = (Get-Item -LiteralPath $Arquivo).FullName
    [byte[]]$dados = [IO.File]::ReadAllBytes($origem)
    $hash = Get-Sha256 $dados
    if ($hash -eq $manifesto.patched_sha256) {
        $destino = $origem
    } else {
        if ($dados.LongLength -ne $manifesto.size -or ($hash -ne $manifesto.original_sha256 -and $hash -ne $manifesto.upgrade_from.sha256)) {
            throw 'Esse executavel nao corresponde ao CPAprime.exe do ZIP analisado. Nenhum arquivo foi alterado.'
        }
        if ($hash -eq $manifesto.upgrade_from.sha256) {
            foreach ($p in $manifesto.upgrade_from.patches) {
                [byte[]]$antes = Convert-Hex $p.before
                [byte[]]$depois = Convert-Hex $p.after
                if ($antes.Length -ne $depois.Length -or $p.offset -lt 0 -or $p.offset + $depois.Length -gt $dados.LongLength) { throw 'Intervalo de atualizacao invalido.' }
                for ($i = 0; $i -lt $depois.Length; $i++) {
                    if ($dados[$p.offset + $i] -ne $depois[$i]) { throw 'A verificacao dos bytes da primeira correcao falhou.' }
                }
            }
            foreach ($p in $manifesto.upgrade_from.patches) {
                [byte[]]$antes = Convert-Hex $p.before
                [Array]::Copy($antes, 0, $dados, [int]$p.offset, $antes.Length)
            }
            if ((Get-Sha256 $dados) -ne $manifesto.original_sha256) { throw 'A verificacao da versao anterior falhou.' }
        }
        $destino = Join-Path ([IO.Path]::GetDirectoryName($origem)) $manifesto.patched_name
        if (Test-Path -LiteralPath $destino) {
            if ((Get-Sha256 ([IO.File]::ReadAllBytes($destino))) -ne $manifesto.patched_sha256) {
                throw 'Ja existe outro CPAprime-SemLogin-v2.exe nessa pasta. Renomeie-o antes de continuar; ele foi preservado.'
            }
        } else {
            foreach ($p in $manifesto.patches) {
                [byte[]]$antes = Convert-Hex $p.before
                [byte[]]$depois = Convert-Hex $p.after
                if ($antes.Length -ne $depois.Length -or $p.offset -lt 0 -or $p.offset + $antes.Length -gt $dados.LongLength) { throw 'Intervalo de alteracao invalido.' }
                for ($i = 0; $i -lt $antes.Length; $i++) {
                    if ($dados[$p.offset + $i] -ne $antes[$i]) { throw 'A verificacao dos bytes originais falhou.' }
                }
            }
            foreach ($p in $manifesto.patches) {
                [byte[]]$depois = Convert-Hex $p.after
                [Array]::Copy($depois, 0, $dados, [int]$p.offset, $depois.Length)
            }
            if ((Get-Sha256 $dados) -ne $manifesto.patched_sha256) { throw 'A verificacao do resultado falhou.' }
            $temporario = Join-Path ([IO.Path]::GetDirectoryName($origem)) ('.cpaprime-' + [Guid]::NewGuid().ToString('N') + '.tmp')
            [IO.File]::WriteAllBytes($temporario, $dados)
            if ((Get-Sha256 ([IO.File]::ReadAllBytes($temporario))) -ne $manifesto.patched_sha256) { throw 'A verificacao do arquivo gravado falhou.' }
            [IO.File]::Move($temporario, $destino)
            $temporario = $null
        }
    }
    $mensagem = "Correcao v2 pronta!`r`n`r`nAbra:`r`n$destino`r`n`r`nMantenha o novo executavel nessa pasta, junto das DLLs e demais arquivos do programa."
    if ($SemJanela) { Write-Output $mensagem }
    else {
        Add-Type -AssemblyName System.Windows.Forms
        [void][System.Windows.Forms.MessageBox]::Show($mensagem, 'CPAprime - abertura direta', 'OK', 'Information')
    }
    exit 0
} catch {
    $mensagem = $_.Exception.Message
    if ($SemJanela) { Write-Output ('ERRO: ' + $mensagem) }
    else {
        Add-Type -AssemblyName System.Windows.Forms
        [void][System.Windows.Forms.MessageBox]::Show($mensagem, 'CPAprime - correcao nao aplicada', 'OK', 'Error')
    }
    exit 1
} finally {
    if ($temporario -and (Test-Path -LiteralPath $temporario)) { Remove-Item -LiteralPath $temporario }
}

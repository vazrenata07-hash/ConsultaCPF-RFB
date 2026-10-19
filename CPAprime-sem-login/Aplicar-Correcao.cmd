@echo off
setlocal
powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File "%~dp0Aplicar-Correcao.ps1"
if errorlevel 1 pause
endlocal

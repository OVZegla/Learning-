@echo off
setlocal
cd /d "%~dp0"

echo [+] Nettoyage des builds...
if exist backend\dist rmdir /s /q backend\dist
if exist frontend\.next rmdir /s /q frontend\.next

echo [+] Relancez start.bat pour reconstruire.
pause

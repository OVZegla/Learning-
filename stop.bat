@echo off
echo Arret de Learning+...
taskkill /FI "WINDOWTITLE eq Learning+*" /T /F >nul 2>&1
taskkill /IM node.exe /F >nul 2>&1
echo Fait.
timeout /t 2 >nul

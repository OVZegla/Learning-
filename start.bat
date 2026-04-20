@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

echo.
echo ============================================
echo        Learning+  -  Demarrage Windows
echo ============================================
echo.

set NODE_VERSION=v20.11.1
set NODE_PKG=node-%NODE_VERSION%-win-x64
set NODE_DIR=%~dp0.bin\%NODE_PKG%
set NODE_ZIP=%~dp0.bin\node.zip
set NODE_URL=https://nodejs.org/dist/%NODE_VERSION%/%NODE_PKG%.zip

if not exist "%NODE_DIR%\node.exe" (
  echo [+] Premier lancement : telechargement de Node.js portable...
  if not exist "%~dp0.bin" mkdir "%~dp0.bin"
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%NODE_ZIP%'"
  if errorlevel 1 (
    echo [!] Echec du telechargement. Verifiez votre connexion internet.
    pause
    exit /b 1
  )
  echo [+] Extraction...
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "Expand-Archive -Path '%NODE_ZIP%' -DestinationPath '%~dp0.bin' -Force"
  if errorlevel 1 (
    echo [!] Echec de l'extraction.
    pause
    exit /b 1
  )
  del "%NODE_ZIP%"
  echo [+] Node.js portable installe dans .bin\
)

set "PATH=%NODE_DIR%;%PATH%"

rem --- Backend : install + prisma + build ---
pushd backend
if not exist node_modules (
  echo [+] Installation des dependances backend...
  call npm install
  if errorlevel 1 goto :error
)

if not exist .env (
  copy .env.example .env >nul
  echo [+] Fichier backend\.env cree.
)

if not exist data mkdir data

echo [+] Generation du client Prisma...
call npx prisma generate
if errorlevel 1 goto :error

echo [+] Mise a jour du schema SQLite...
call npx prisma db push --skip-generate
if errorlevel 1 goto :error

echo [+] Compilation backend...
if exist dist rmdir /s /q dist
call npm run build
if errorlevel 1 goto :error

echo [+] Verification des comptes de demonstration...
call npm run seed
popd

rem --- Frontend : install + build ---
pushd frontend
if not exist node_modules (
  echo [+] Installation des dependances frontend...
  call npm install
  if errorlevel 1 goto :error
)

if not exist .env.local (
  copy .env.example .env.local >nul
)

if not exist .next (
  echo [+] Compilation frontend...
  call npm run build
  if errorlevel 1 goto :error
)
popd

echo.
echo [+] Demarrage des serveurs...
start "Learning+ API"      cmd /k "set PATH=%NODE_DIR%;%%PATH%% && cd /d %~dp0backend && npm run start"
timeout /t 3 /nobreak >nul
start "Learning+ Frontend" cmd /k "set PATH=%NODE_DIR%;%%PATH%% && cd /d %~dp0frontend && npm run start"
timeout /t 4 /nobreak >nul
start "" http://localhost:3000

echo.
echo Learning+ est lance :
echo   - Application : http://localhost:3000
echo   - API         : http://localhost:4000
echo.
echo Comptes de demo :
echo   admin@learning.local      / admin123
echo   formateur@learning.local  / formateur123
echo   apprenant@learning.local  / apprenant123
echo.
echo Pour arreter : fermez les fenetres "Learning+ API" et "Learning+ Frontend",
echo ou double-cliquez sur stop.bat.
pause
exit /b 0

:error
echo.
echo [!] Une etape a echoue. Consultez le message ci-dessus.
popd
pause
exit /b 1

@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

echo.
echo ============================================
echo        Learning+  -  Demarrage Windows
echo ============================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [!] Node.js n'est pas installe.
  echo     Telechargez-le ici: https://nodejs.org/  (version LTS)
  echo     Relancez ce fichier apres installation.
  pause
  exit /b 1
)

rem --- Backend : install + prisma + build ---
pushd backend
if not exist node_modules (
  echo [+] Installation des dependances backend...
  call npm install
  if errorlevel 1 goto :error
)

if not exist .env (
  copy .env.example .env >nul
  echo [+] Fichier backend\.env cree ^(vous pouvez le personnaliser^).
)

if not exist data mkdir data

echo [+] Generation du client Prisma...
call npx prisma generate
if errorlevel 1 goto :error

echo [+] Mise a jour du schema SQLite...
call npx prisma db push --skip-generate
if errorlevel 1 goto :error

if not exist dist (
  echo [+] Compilation backend...
  call npm run build
  if errorlevel 1 goto :error

  echo [+] Creation des comptes de demonstration...
  call npm run seed
)
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
start "Learning+ API"      cmd /k "cd /d %~dp0backend && npm run start"
timeout /t 3 /nobreak >nul
start "Learning+ Frontend" cmd /k "cd /d %~dp0frontend && npm run start"
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
echo Fermez les deux fenetres "Learning+ API" et "Learning+ Frontend" pour arreter.
echo Cette fenetre peut etre fermee.
pause
exit /b 0

:error
echo.
echo [!] Une etape a echoue. Consultez le message ci-dessus.
popd
pause
exit /b 1

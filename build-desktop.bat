@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

echo.
echo ============================================
echo    Learning+  -  Packaging desktop (Windows)
echo ============================================
echo.

set NODE_VERSION=v20.11.1
set NODE_PKG=node-%NODE_VERSION%-win-x64
set NODE_DIR=%~dp0.bin\%NODE_PKG%
set NODE_ZIP=%~dp0.bin\node.zip
set NODE_URL=https://nodejs.org/dist/%NODE_VERSION%/%NODE_PKG%.zip

if not exist "%NODE_DIR%\node.exe" (
  echo [+] Telechargement de Node.js portable...
  if not exist "%~dp0.bin" mkdir "%~dp0.bin"
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%NODE_ZIP%'"
  if errorlevel 1 goto :error
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "Expand-Archive -Path '%NODE_ZIP%' -DestinationPath '%~dp0.bin' -Force"
  if errorlevel 1 goto :error
  del "%NODE_ZIP%"
)

set "PATH=%NODE_DIR%;%PATH%"

rem --- Backend build + seed DB bundled with app ---
pushd backend
if not exist node_modules (
  echo [+] Install backend deps...
  call npm install
  if errorlevel 1 goto :error
)

if not exist .env (
  copy .env.example .env >nul
)

if not exist data mkdir data
if exist data\learning.db del /f /q data\learning.db

echo [+] Prisma generate...
call npx prisma generate
if errorlevel 1 goto :error

echo [+] Prisma db push (fresh SQLite schema)...
call npx prisma db push --skip-generate
if errorlevel 1 goto :error

echo [+] Backend compile...
if exist dist rmdir /s /q dist
call npm run build
if errorlevel 1 goto :error

echo [+] Seeding bundled database...
call npm run seed
if errorlevel 1 goto :error
popd

rem --- Frontend build (standalone) ---
pushd frontend
if not exist node_modules (
  echo [+] Install frontend deps...
  call npm install
  if errorlevel 1 goto :error
)

if not exist .env.local (
  copy .env.example .env.local >nul
)

echo [+] Frontend compile (standalone)...
if exist .next rmdir /s /q .next
set NEXT_STANDALONE=1
call npm run build
if errorlevel 1 goto :error
set NEXT_STANDALONE=
popd

rem --- Electron packaging ---
pushd desktop
if not exist node_modules (
  echo [+] Install Electron tooling...
  call npm install
  if errorlevel 1 goto :error
)

if exist dist rmdir /s /q dist

echo [+] electron-builder (win, dir)...
call npm run dist:win
if errorlevel 1 goto :error
popd

echo.
echo [OK] Build termine.
echo L'application est ici :
echo   %~dp0desktop\dist\win-unpacked\Learning+.exe
echo.
pause
exit /b 0

:error
echo.
echo [!] Une etape a echoue.
popd
pause
exit /b 1

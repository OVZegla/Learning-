#!/bin/bash
set -e
cd "$(dirname "$0")"

echo
echo "============================================"
echo "    Learning+  -  Packaging desktop (macOS)"
echo "============================================"
echo

NODE_VERSION="v20.11.1"
ARCH="$(uname -m)"
case "$ARCH" in
  arm64)  NODE_PKG="node-${NODE_VERSION}-darwin-arm64" ;;
  x86_64) NODE_PKG="node-${NODE_VERSION}-darwin-x64" ;;
  *)      echo "[!] Architecture non supportee : $ARCH"; exit 1 ;;
esac
NODE_DIR="$PWD/.bin/${NODE_PKG}"

if [ ! -x "${NODE_DIR}/bin/node" ]; then
  echo "[+] Telechargement de Node.js portable..."
  mkdir -p .bin
  curl -fL "https://nodejs.org/dist/${NODE_VERSION}/${NODE_PKG}.tar.gz" -o .bin/node.tar.gz
  tar -xzf .bin/node.tar.gz -C .bin
  rm .bin/node.tar.gz
fi

export PATH="${NODE_DIR}/bin:$PATH"

# --- Backend build + seed bundled DB ---
pushd backend >/dev/null
if [ ! -d node_modules ]; then
  echo "[+] Install backend deps..."
  npm install
fi

[ -f .env ] || cp .env.example .env
mkdir -p data
rm -f data/learning.db

echo "[+] Prisma generate..."
npx prisma generate

echo "[+] Prisma db push (fresh SQLite schema)..."
npx prisma db push --skip-generate

echo "[+] Backend compile..."
rm -rf dist
npm run build

echo "[+] Seeding bundled database..."
npm run seed
popd >/dev/null

# --- Frontend build (standalone) ---
pushd frontend >/dev/null
if [ ! -d node_modules ]; then
  echo "[+] Install frontend deps..."
  npm install
fi
[ -f .env.local ] || cp .env.example .env.local

echo "[+] Frontend compile (standalone)..."
rm -rf .next
NEXT_STANDALONE=1 npm run build
popd >/dev/null

# --- Electron packaging ---
pushd desktop >/dev/null
if [ ! -d node_modules ]; then
  echo "[+] Install Electron tooling..."
  npm install
fi

rm -rf dist

echo "[+] electron-builder (mac, dir)..."
npm run dist:mac
popd >/dev/null

echo
echo "[OK] Build termine."
echo "L'application est ici :"
echo "  $PWD/desktop/dist/mac/Learning+.app"
echo "  (ou mac-arm64/ selon votre architecture)"
echo
read -n 1 -s -r -p "Appuyez sur une touche pour fermer..."
echo

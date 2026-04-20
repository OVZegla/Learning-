#!/bin/bash
set -e
cd "$(dirname "$0")"

echo
echo "============================================"
echo "        Learning+  -  Demarrage macOS"
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
  echo "[+] Premier lancement : telechargement de Node.js portable..."
  mkdir -p .bin
  if ! curl -fL "https://nodejs.org/dist/${NODE_VERSION}/${NODE_PKG}.tar.gz" -o .bin/node.tar.gz; then
    echo "[!] Echec du telechargement. Verifiez votre connexion internet."
    read -n 1 -s -r -p "Appuyez sur une touche pour fermer..."
    exit 1
  fi
  echo "[+] Extraction..."
  tar -xzf .bin/node.tar.gz -C .bin
  rm .bin/node.tar.gz
  echo "[+] Node.js portable installe dans .bin/"
fi

export PATH="${NODE_DIR}/bin:$PATH"

# --- Backend ---
pushd backend >/dev/null
if [ ! -d node_modules ]; then
  echo "[+] Installation des dependances backend..."
  npm install
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "[+] Fichier backend/.env cree."
fi

mkdir -p data

echo "[+] Generation du client Prisma..."
npx prisma generate

echo "[+] Mise a jour du schema SQLite..."
npx prisma db push --skip-generate

echo "[+] Compilation backend..."
rm -rf dist
npm run build

echo "[+] Verification des comptes de demonstration..."
npm run seed
popd >/dev/null

# --- Frontend ---
pushd frontend >/dev/null
if [ ! -d node_modules ]; then
  echo "[+] Installation des dependances frontend..."
  npm install
fi

if [ ! -f .env.local ]; then
  cp .env.example .env.local
fi

if [ ! -d .next ]; then
  echo "[+] Compilation frontend..."
  npm run build
fi
popd >/dev/null

# --- Launch ---
cleanup() {
  echo
  echo "Arret de Learning+..."
  [ -n "$BACK_PID" ]  && kill "$BACK_PID"  2>/dev/null || true
  [ -n "$FRONT_PID" ] && kill "$FRONT_PID" 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM EXIT

echo
echo "[+] Demarrage des serveurs..."
( cd backend  && npm run start ) &
BACK_PID=$!
sleep 3
( cd frontend && npm run start ) &
FRONT_PID=$!
sleep 4

open http://localhost:3000 2>/dev/null || true

echo
echo "Learning+ est lance :"
echo "  - Application : http://localhost:3000"
echo "  - API         : http://localhost:4000"
echo
echo "Comptes de demo :"
echo "  admin@learning.local      / admin123"
echo "  formateur@learning.local  / formateur123"
echo "  apprenant@learning.local  / apprenant123"
echo
echo "Pour arreter : fermez cette fenetre ou appuyez sur Ctrl+C."
wait

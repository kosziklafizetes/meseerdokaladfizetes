#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "HIBA: A Node.js nincs telepítve."
  echo "Telepítsd a Node.js LTS verzióját a https://nodejs.org/ oldalról."
  read -p "Nyomj Entert a kilépéshez..."
  exit 1
fi
if [ ! -d node_modules ]; then
  echo "Első indítás: szükséges csomagok telepítése..."
  npm install || exit 1
fi
echo "A weboldal indul... A böngésző automatikusan megnyílik."
npm start

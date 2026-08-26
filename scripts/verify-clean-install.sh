#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."
npm ci
npm test
npm run content:audit
npm run build
printf '\nCLEAN_INSTALL_VERIFY_OK\n'

#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."
if [ -f .env ]; then
  exec node --env-file=.env server.mjs
fi
exec node server.mjs

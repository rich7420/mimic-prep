$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
if (Test-Path ".env") {
  node --env-file=.env server.mjs
} else {
  node server.mjs
}

# One-shot Liara setup + deploy. Token is NOT saved to the repo.
# Usage:
#   $env:LIARA_API_TOKEN = "paste-from-https://console.liara.ir/API"
#   .\scripts\deploy-liara.ps1 -AppName "qaim-magham"

param(
  [string]$AppName = "qaim-magham",
  [string]$ApiToken = $env:LIARA_API_TOKEN
)

$ErrorActionPreference = "Stop"

$envFile = Join-Path $PSScriptRoot "..\.env.local"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
    $name, $value = $_ -split '=', 2
    $name = $name.Trim()
    $value = $value.Trim()
    if ($name -eq 'LIARA_API_TOKEN' -and -not $ApiToken) { $ApiToken = $value }
    if ($name -eq 'ADMIN_TOKEN' -and -not $env:ADMIN_TOKEN) { $env:ADMIN_TOKEN = $value }
  }
}

if (-not $ApiToken) {
  Write-Error "Set LIARA_API_TOKEN in .env.local or env. Create at https://console.liara.ir/API"
}

function Invoke-LiaraCli {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$CliArgs)
  & liara @CliArgs --api-token $ApiToken
}

Write-Host "Creating app '$AppName' (skip if it already exists)..."
$plan = if ($env:LIARA_PLAN) { $env:LIARA_PLAN } else { "medium-g2" }
$network = if ($env:LIARA_NETWORK) { $env:LIARA_NETWORK } else { "my-network" }
Invoke-LiaraCli app create -a $AppName --platform next -n $network --plan $plan 2>&1 | Out-Null

Write-Host "Creating disks (skip if already exist)..."
Invoke-LiaraCli disk create -a $AppName -n shop-data -s 1 2>$null
Invoke-LiaraCli disk create -a $AppName -n shop-uploads -s 4 2>$null

Write-Host "Setting env..."
Invoke-LiaraCli env set CATALOG_BACKEND=sqlite -a $AppName
Invoke-LiaraCli env set SQLITE_PATH=data/catalog.sqlite -a $AppName
if (-not $env:ADMIN_TOKEN) {
  Write-Warning "ADMIN_TOKEN not set in your shell; set it before deploy or set on console."
} else {
  Invoke-LiaraCli env set "ADMIN_TOKEN=$env:ADMIN_TOKEN" -a $AppName
}

Write-Host "Deploying (port 3000)..."
Push-Location $PSScriptRoot\..
Invoke-LiaraCli deploy -a $AppName -p 3000
Pop-Location

Write-Host ""
Write-Host "After first deploy, open Liara shell and run: npm run db:seed"
Write-Host "URL: https://$AppName.liara.run"

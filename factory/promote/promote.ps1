# Pasaje a PRD via PowerShell (estandar desde BL-073).
# Copia de gw2-factory-dev (commit fijo) a gw2-wallet-ligero segun un manifiesto C/M/D,
# controla blob a blob y sube todo en UN commit. Uso:
#   powershell -ExecutionPolicy Bypass -File promote.ps1 -DevSha <sha> -PrdBase <sha> -Manifest factory/promote/BL-073.txt -Tarea BL-073
param(
  [Parameter(Mandatory = $true)][string]$DevSha,
  [Parameter(Mandatory = $true)][string]$PrdBase,
  [Parameter(Mandatory = $true)][string]$Manifest,
  [Parameter(Mandatory = $true)][string]$Tarea,
  [string]$Work = "$env:USERPROFILE\gw2-promo"
)
$ErrorActionPreference = 'Stop'
function G { & git @args; if ($LASTEXITCODE -ne 0) { throw "git $args fallo ($LASTEXITCODE)" } }

if (Test-Path $Work) { throw "Ya existe $Work : borralo o usa -Work otra carpeta" }
New-Item -ItemType Directory -Force $Work | Out-Null
Set-Location $Work

Write-Host "1/6 Clonando DEV y PRD (sin tocar saltos de linea)..." -ForegroundColor Cyan
G -c core.autocrlf=false clone -q https://github.com/PabloSnchz/gw2-factory-dev.git dev
G -c core.autocrlf=false clone -q https://github.com/PabloSnchz/gw2-wallet-ligero.git prd
G -C dev config core.autocrlf false
G -C prd config core.autocrlf false
G -C dev checkout -q $DevSha

Write-Host "2/6 Controlando que produccion este donde la dejamos..." -ForegroundColor Cyan
$head = (& git -C prd rev-parse HEAD).Trim()
if (-not $head.StartsWith($PrdBase)) { throw "Produccion esta en $head y se esperaba $PrdBase : FRENA y avisale a Shiruvana" }

$rb = "rollback/pre-$($Tarea.ToLower())"
Write-Host "3/6 Rama de vuelta atras $rb = $PrdBase ..." -ForegroundColor Cyan
G -C prd branch $rb $PrdBase
G -C prd push -q origin $rb

Write-Host "4/6 Aplicando $Manifest ..." -ForegroundColor Cyan
$ops = 0; $bad = 0
foreach ($l in Get-Content -Encoding UTF8 (Join-Path 'dev' $Manifest)) {
  if ($l -match '^\s*(#|$)') { continue }
  $p = $l.Trim() -split '\s+'
  $ops++
  if ($p[0] -eq 'D') { G -C prd rm -q -- $p[1]; continue }
  if ($p[0] -eq 'C') { $src = $p[1]; $dst = $p[1] }
  elseif ($p[0] -eq 'M') { $src = $p[1]; $dst = $p[2] }
  else { throw "Linea invalida: $l" }
  $to = Join-Path 'prd' $dst
  New-Item -ItemType Directory -Force (Split-Path $to) | Out-Null
  Copy-Item -LiteralPath (Join-Path 'dev' $src) -Destination $to -Force
  G -C prd add -- $dst
  $want = (& git -C dev rev-parse "${DevSha}:$src").Trim()
  $got = (& git -C prd hash-object -- $dst).Trim()
  if ($want -ne $got) { Write-Host "DISTINTO: $dst" -ForegroundColor Red; $bad++ }
}

Write-Host "5/6 Control final..." -ForegroundColor Cyan
$changed = @(& git -C prd status --porcelain).Count
Write-Host "Movimientos en el manifiesto: $ops | archivos cambiados en PRD: $changed | distintos: $bad"
if ($bad -gt 0) { throw "$bad archivos no quedaron iguales a DEV: no subo nada" }
if ($changed -ne $ops) { Write-Host "OJO: la cantidad de cambios no coincide con el manifiesto. Revisa la lista de abajo." -ForegroundColor Yellow }
& git -C prd status --short

$ok = Read-Host "6/6 Escribi SI para subir el commit a produccion"
if ($ok -ne 'SI') { Write-Host "No subi nada. La rama $rb ya quedo creada (no molesta)." -ForegroundColor Yellow; exit 1 }
G -C prd commit -q -m "${Tarea}: pasaje a PRD desde gw2-factory-dev $DevSha (manifiesto $Manifest)"
G -C prd push -q origin main
$new = (& git -C prd rev-parse HEAD).Trim()
Write-Host "LISTO. Produccion = $new . Pasale este SHA a Shiruvana para el control." -ForegroundColor Green

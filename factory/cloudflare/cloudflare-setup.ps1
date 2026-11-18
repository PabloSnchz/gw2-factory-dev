# cloudflare-setup.ps1 - BL-095 (Shiruvana). Windows PowerShell 5.1.
# Que hace:
#  1) Pide Account ID y lee el token DEL PORTAPAPELES (no se muestra, no se guarda en disco, y despues vacia el portapapeles).
#  2) Verifica el token contra la API de Cloudflare.
#  3) Saca UNA captura de prueba de DEV y la abre (usa segundos de los 10 min/dia gratis).
#  4) Si tenes GitHub CLI (gh) logueado, guarda los dos secretos en gw2-factory-dev. Si no, te abre la pagina.
# No toca produccion. No escribe el token en ningun archivo.
# v2: en PowerShell 5.1, Ctrl+V no pega dentro de Read-Host -AsSecureString (entra un solo caracter); por eso se lee del portapapeles.
param(
  [string]$Repo = "PabloSnchz/gw2-factory-dev",
  [string]$Url  = "https://pablosnchz.github.io/gw2-factory-dev/"
)
$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Write-Host "1/4 Datos de Cloudflare" -ForegroundColor Cyan
$acc = (Read-Host "Pega tu Account ID").Trim()
if ($acc -notmatch '^[0-9a-fA-F]{32}$') { throw "El Account ID debe tener 32 caracteres hexadecimales. Revisalo." }

Write-Host "Ahora COPIA el token de Cloudflare (Ctrl+C en la pagina del token) y volve aca." -ForegroundColor Yellow
[void](Read-Host "Cuando lo tengas copiado, apreta Enter (no pegues nada)")
$tok = ""
try { $tok = ((Get-Clipboard -Raw) -as [string]) } catch { $tok = "" }
if ($tok) { $tok = $tok.Trim() }
if (-not $tok -or $tok.Length -lt 20 -or $tok -match '\s') {
  Write-Host "En el portapapeles no hay un token valido." -ForegroundColor Yellow
  Write-Host "Plan B: pegalo con CLIC DERECHO (no Ctrl+V) y Enter." -ForegroundColor Yellow
  $sec = Read-Host "Token" -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
  try { $tok = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr).Trim() } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}
if ($tok.Length -lt 20) { throw "El token parece incompleto ($($tok.Length) caracteres). Copialo de nuevo y volve a correr la linea." }
try { Set-Clipboard -Value " " } catch {}
Write-Host "   Token leido ($($tok.Length) caracteres, empieza con $($tok.Substring(0,5))...). Portapapeles vaciado." -ForegroundColor Green
$h = @{ Authorization = "Bearer $tok" }

Write-Host "2/4 Verificando el token..." -ForegroundColor Cyan
try {
  $v = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/user/tokens/verify" -Headers $h
  if (-not $v.success -or $v.result.status -ne "active") { throw "no activo" }
  Write-Host "   Token valido y activo." -ForegroundColor Green
} catch {
  Write-Host "   No pude verificarlo como token de usuario; sigo con la prueba real." -ForegroundColor Yellow
}

Write-Host "3/4 Captura de prueba de DEV (celular 390x844)..." -ForegroundColor Cyan
$out = Join-Path ([Environment]::GetFolderPath("Desktop")) "shiruvana-prueba-dev.png"
$body = @{
  url = $Url
  viewport = @{ width = 390; height = 844 }
  gotoOptions = @{ waitUntil = "networkidle0"; timeout = 45000 }
} | ConvertTo-Json -Depth 5
try {
  $r = Invoke-WebRequest -UseBasicParsing -Method Post -Uri "https://api.cloudflare.com/client/v4/accounts/$acc/browser-run/screenshot" -Headers $h -ContentType "application/json" -Body $body -OutFile $out -PassThru
  $ms = $r.Headers["X-Browser-Ms-Used"]
  Write-Host "   Captura OK -> $out (tiempo de navegador usado: $ms ms)" -ForegroundColor Green
  Start-Process $out
} catch {
  $msg = $_.Exception.Message
  if ($_.Exception.Response) { try { $msg = (New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd() } catch {} }
  throw "La captura fallo: $msg  (Revisa que el token tenga el permiso Account > Browser Run (o Browser Rendering) > Edit)"
}

Write-Host "4/4 Guardando secretos en GitHub ($Repo)..." -ForegroundColor Cyan
$ok = $false
if (Get-Command gh -ErrorAction SilentlyContinue) {
  gh secret set CLOUDFLARE_ACCOUNT_ID --repo $Repo --body $acc
  $e1 = $LASTEXITCODE
  gh secret set CLOUDFLARE_API_TOKEN --repo $Repo --body $tok
  $e2 = $LASTEXITCODE
  if ($e1 -eq 0 -and $e2 -eq 0) { $ok = $true; gh secret list --repo $Repo }
}
if ($ok) {
  Write-Host "LISTO. Secretos guardados. Avisale a Shiruvana: 'secretos cargados'." -ForegroundColor Green
} else {
  Write-Host "No pude usar GitHub CLI (gh). Te abro la pagina: crea dos 'New repository secret':" -ForegroundColor Yellow
  Write-Host "   CLOUDFLARE_ACCOUNT_ID = $acc"
  Write-Host "   CLOUDFLARE_API_TOKEN  = (el token; copialo de nuevo desde Cloudflare si hace falta)"
  Start-Process "https://github.com/$Repo/settings/secrets/actions/new"
}
$tok = $null; $h = $null

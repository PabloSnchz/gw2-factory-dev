# Pasaje a PRD vía PowerShell (DEC-036)

Shiruvana prepara en DEV el manifiesto `factory/promote/BL-NNN.txt`; Pablo corre un solo comando en PowerShell; Shiruvana controla blob a blob después.

## Comando estándar (regla de Pablo, 2026-10-27)

Siempre se entrega así, en una sola línea para pegar en PowerShell. Hace todo de corrido:

1. se para en `%USERPROFILE%` y borra `%USERPROFILE%\gw2-promo` si existe (restos de un pasaje anterior);
2. baja `promote.ps1` del commit DEV fijo (la misma versión que se revisó, no la de tu disco);
3. lo corre: clona, controla la base de producción, crea `rollback/pre-bl-nnn`, copia, controla blob a blob y, con `SI`, hace el commit y el push.

```powershell
Set-Location $env:USERPROFILE; if (Test-Path "$env:USERPROFILE\gw2-promo") { Remove-Item -Recurse -Force "$env:USERPROFILE\gw2-promo" }; $ps1 = "$env:TEMP\promote.ps1"; Invoke-WebRequest -UseBasicParsing "https://raw.githubusercontent.com/PabloSnchz/gw2-factory-dev/<DEV_SHA_COMPLETO>/factory/promote/promote.ps1" -OutFile $ps1; powershell -ExecutionPolicy Bypass -File $ps1 -DevSha <DEV_SHA> -PrdBase <PRD_BASE> -Manifest factory/promote/BL-NNN.txt -Tarea BL-NNN
```

El `SI` final se mantiene a propósito: es el último freno antes de producción, después de ver `movimientos | cambiados | distintos`. Si hay distintos, el script no sube nada solo.

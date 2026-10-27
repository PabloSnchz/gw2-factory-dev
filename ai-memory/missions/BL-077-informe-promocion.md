# BL-077 — Informe del pasaje a producción

- Pedido: Pablo, 2026-10-27 21:30Z («preparemos todo para pasar a PRD vía powershell»). Modalidad: vía PowerShell (DEC-036), con el comando de una línea (regla nueva de Pablo, factory/promote/README.md).
- Qué pasó: BL-074 (cachés en IndexedDB), BL-075 (mi globo), BL-059 SHV-1 a SHV-4 (FEAT-020, FEAT-021, FEAT-022) y BL-076 SHV-5 (FEAT-023).
- DEV fijo: 9f21446 (app idéntica a 1952f2e). Manifiesto: factory/promote/BL-077.txt (28 movimientos: 7 JS nuevos, 18 JS modificados, 3 páginas, 0 bajas).
- Producción antes: 383c8f5 · rollback/pre-bl-077 = 383c8f5 (verificada) · Producción después: bc089b1 (commit de Pablo 21:45:57Z).
- Salida del script: 28 | 28 | 0 distintos; 7 A y 21 M, como el manifiesto.

## Control blob a blob (Shiruvana, bc089b1 contra DEV 1952f2e)

- js/: 79 archivos en los dos lados; 78 iguales a DEV. Única diferencia: js/analytics.js (79b2351, versión de producción, a propósito).
- Los 28 del manifiesto, iguales a DEV: gn-idb b81859e, shv-bubble b225f9f, shv-core 2592b51, shv-legendary e9d48e8, shv-memory f75c041, shv-recall e41f9b1, shv-wallet bf6cc2e, acc-vault-edit a941046, acc-vault-view d4c2261, acc-view 99ad865, ach-view ad5b8cc, act-view 59733f6, act-week 740e6f3, api-gw2 e5e7e2f, app d673de5, converter-modal cae123e, home-view c1e9ff7, inv-view 0d8e202, meta-theme 0167557, modules.json 25e36d2, raids-sheet 10ada5c, raids-view 7be362c, shiruvana-places 18fdfdf, shiruvana a0c009e, wv-view 280a0eb, index.html 5bbbb16 (GA de producción intacto, solo se activa en el host de producción), privacy.html 630982e, docs/user-guide-avanzado.html 966d172.
- Sin tocar, como estaba previsto: css/ (84dfc06), assets/ (6b32fb6, con meta-drops.json de producción), CHANGELOG, README, docs internos.

## Revisión

- ALTO resuelto: app.js 2.9.1 ya no imprime la API Key en la consola de producción.
- MEDIO: la mudanza de cachés a IndexedDB corre la primera vez que cada jugador entra (copia antes de borrar).
- MEDIO: index.html 48.435 B y converter-modal 48.596 B en zona de advertencia.
- BAJO: los mensajes que Pablo ya vio en DEV no vuelven en el globo de producción (mismo origen).

## Aprendizajes

- El comando de una línea (limpia gw2-promo, baja promote.ps1 del commit fijo y lo corre) sacó el único paso manual que podía fallar; el «SI» queda como último freno.

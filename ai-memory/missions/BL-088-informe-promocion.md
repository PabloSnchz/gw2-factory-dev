# BL-088 — Informe del pasaje a producción (vía PowerShell)

- Fecha: 2026-11-16 00:39Z (Pablo corrió la línea) · control 00:40Z (RUN-289)
- Qué pasó: BL-084 (FEAT-026, la ficha de build completa) y BL-087 (js/shiruvana.js 1.2.0, una cara por tipo de mensaje)
- Manifiesto: factory/promote/BL-088.txt · DEV fijo: c8ddd2987bdcc3d71f7f922687dcba6eaddf5c4f
- Producción antes: 73d1b09 (commit «builds-watch» del bot, 2026-11-09) · después: **13efe64af09af5867c95cf8e55d84a377c9268a8**
- Vuelta atrás: rama `rollback/pre-bl-088` = 73d1b09 (verificada)

## Control

| Qué | Resultado |
|---|---|
| Script de Pablo | 25 movimientos · 25 cambiados · 0 distintos; un solo commit con padre 73d1b09 |
| Blob a blob, manifiesto contra DEV c8ddd29 | 25/25 iguales |
| Cambios contra la base fuera del manifiesto | 0 |
| Publicables distintos DEV/PRD | solo js/analytics.js, assets/meta-drops.json y assets/data/builds/watch.json (versión de PRD, intactos) |
| Pages de PRD | «pages build and deployment» de 13efe64: success (00:39:32Z) |
| Sitio publicado | js/modules.json sirve bld-sheet 1.6.0; index.html sirve shiruvana.js ?v=1.2.0 |
| Vigía de PRD | no se disparó (el pasaje no toca catalog.json); próxima corrida programada lunes 2026-11-16 12:00 UTC, ya con la curación del equipo (gear.json) |

## Qué validar en producción (Chrome)

1. Builds → Biblioteca: filas por profesión y élite; abrir una ficha.
2. Ficha: Equipo (descripciones con cursor o Tab), Rasgos y habilidades como en el juego, notas en desplegables y «Cómo se juega».
3. «Copiar AE2 (Alter Ego)» y pegarlo en Alter Ego.
4. Importar (pegar el código de una build de la Biblioteca) y Editor: la misma ficha.
5. Mi cara en la burbuja según el mensaje (saludo, explicación, advertencia).

Recarga forzada (Ctrl+F5) la primera vez si el navegador tiene la versión anterior.

## Revisión

- BAJO: la primera curación semanal con equipo en PRD (lunes 12:00 UTC) puede sumar un commit «builds-watch» con gear.json; lo verifico después.
- BAJO: los mismos de FEAT-026 (equipo de las propias según su base, AE2 sin copia a mano, valores de PvE en PvP).

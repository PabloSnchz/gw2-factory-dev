# STATUS

Estado: EN CURSO
Tarea actual: BL-058 — WEL-4a: guarda de contraste de la Bienvenida. La revisión en los 19 themes encontró textos por debajo de 4.5:1 (en macOS y Notion el verde de «listo» queda en 1.1:1 sobre blanco).
Motivo: Pablo (05:54Z) validó WEL-3 y pidió WEL-4: 19 themes, responsive, teclado y accesibilidad, revisión final y cierre de BL-058.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 06:20Z
Próxima acción: publicar `welcome-panel.js` 2.2.0 (archivo grande dedicado, 49 KB) y después su test; seguir con WEL-4b (anuncio para lector de pantalla) y WEL-4c (cierre).

Micro-ciclo (en curso):
WEL-4a — `welcome-panel.js` 2.2.0: con cada cambio de theme leo sus tokens y, solo dentro de #welcomePanel, acerco al texto principal del mismo theme los colores que no llegan a 4.5:1. Los themes no se tocan; Gato Negro no necesita ninguna corrección. Además: grupos con role, nombre de la barra de progreso y foco visible en «Ver cuáles». Test nuevo que lee los 19 themes reales.
Archivos:
- js/welcome-panel.js
- tests/welcome-contrast.test.cjs

Último hecho: revisión WEL-4 en local. 19 themes: 45 pares bajo AA en 15 themes, 0 después de la guarda. Celular (980/720 px, controles de 44 px): correcto. Teclado: todo es control nativo; faltaban nombres ARIA y el anuncio de «Siguiente». 50/50 tests, 14/15 mutaciones (la que vive es equivalente), humo de integración 16/16.

Plan BL-058 (Pantalla de Bienvenida), aprobado:

- WEL-1, WEL-2 y WEL-3 hechos y validados.
- WEL-4a guarda de contraste. En curso.
- WEL-4b anuncio de «Siguiente» y «Preguntame» para lector de pantalla (`shiruvana-places.js` 1.2.0).
- WEL-4c cierre: FEAT-008, backlog, CHANGELOG-FACTORY.

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `611f7c9`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado validado por Pablo en DEV (FEAT-007).
- BL-058: WEL-1, WEL-2 y WEL-3 validados; WEL-4 en curso. La Bienvenida es la puerta de entrada de la Bóveda y no asume funciones de ningún módulo (DEC-032).
- Frente registrado: evolución de Shiruvana en 5 niveles (DEC-033, BL-059), sin implementar.

## Esperando a Pablo

- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-057] Metas y Eventos queda solo en DEV: pasarlo a producción lo decidís vos.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

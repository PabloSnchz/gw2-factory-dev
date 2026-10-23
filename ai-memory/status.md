# STATUS

Estado: EN CURSO
Tarea actual: BL-058 — WEL-4b: cuando tocás «Siguiente» o un botón de «Preguntame», el mensaje nuevo se anuncia a quien usa lector de pantalla.
Motivo: Pablo (05:54Z) validó WEL-3 y pidió WEL-4: 19 themes, responsive, teclado y accesibilidad, revisión final y cierre de BL-058.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 06:08Z
Próxima acción: publicar `shiruvana-places.js` 1.2.0 junto con su test; después WEL-4c (FEAT-008, backlog, CHANGELOG-FACTORY).

Micro-ciclo (en curso):
WEL-4b — `shiruvana-places.js` 1.2.0: región «polite» fija (#shvGuideLive, role=status) en #welcomePanel, fuera de .panel__body. Al cambiar de mensaje dice «2 de 3.» o «Preguntame.» y el texto nuevo; el foco no se mueve. Al cargar no anuncia nada: el mensaje ya está en pantalla.
Archivos:
- js/shiruvana-places.js
- tests/shiruvana-places.test.cjs

Último hecho: WEL-4a publicado. `welcome-panel.js` 2.2.0 (`2c7184e`, blob cd8587a) y `tests/welcome-contrast.test.cjs` (`767e0fd`, blob cebaa51), iguales a los locales. 45 pares bajo AA en 15 themes → 0; Gato Negro, Bóveda, Dracula, Glassmorphism, Material Dark y PS5 no necesitan corrección.

Plan BL-058 (Pantalla de Bienvenida), aprobado:

- WEL-1, WEL-2 y WEL-3 hechos y validados.
- WEL-4a guarda de contraste. Hecho.
- WEL-4b anuncio para lector de pantalla. En curso.
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

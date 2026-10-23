# STATUS

Estado: EN CURSO
Tarea actual: BL-058 — WEL-2: Bienvenida 2.1.0 con «Seguí donde quedaste», «Tu Bóveda», permisos de cada Key, estado de la copia y el flujo de orientación.
Motivo: Pablo (05:22Z) validó WEL-1 («la nueva propuesta corrige correctamente el problema») y pidió WEL-2 con el mismo criterio: guía sobre la Bóveda, sin agendas, timers ni recomendaciones de juego.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 05:40Z
Próxima acción: publicar en serie (1) el test de vista sin atarlo a la versión, (2) `welcome-panel.js` 2.1.0 con su test nuevo; verificar blobs y pedir validación.

Micro-ciclo (en curso, checkpoint de este commit):
WEL-2 — «Seguí donde quedaste» (último módulo y los 3 más usados), «Tu Bóveda» (Keys y permisos con el detalle y cómo arreglarlo, cuenta activa, copia, theme; «N de 4 listo»), botón de Copia en la cabecera, «Falta permiso» en los módulos que la Key activa no alcanza y `Welcome.orientation()`. Clave nueva `gn:global:welcome` (solo ids de módulo y fechas). Sin pedidos a la API. 21 tests, 35/35 mutaciones en local. Archivo grande dedicado (43 KB, DEC-021 §1 bis).
Archivos:
- js/welcome-panel.js
- tests/welcome-view.test.cjs
- tests/welcome-vault.test.cjs

Último hecho: WEL-1 validado por Pablo (05:22Z). `5ee02d8` Bienvenida 2.0.0.

Plan BL-058 (Pantalla de Bienvenida), aprobado:

- WEL-1 hecho y validado.
- WEL-2 (este micro-ciclo): «Seguí donde quedaste» y «Tu Bóveda» juntos, como pidió Pablo.
- WEL-3 `shiruvana-places.js` 1.1.0: «Shiruvana te guía» con `Welcome.orientation()` y Preguntame; fuera el Gist (DEC-030).
- WEL-4 revisión (19 themes, celular, teclado) y cierre (FEAT-008).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `611f7c9`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado validado por Pablo en DEV (FEAT-007).
- BL-058 en implementación: WEL-1 validado. La Bienvenida es la puerta de entrada de la Bóveda y no asume funciones de ningún módulo (DEC-032).
- Frente registrado: evolución de Shiruvana en 5 niveles (DEC-033, BL-059). No se implementa todavía.

## Esperando a Pablo

- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-057] Metas y Eventos queda solo en DEV: pasarlo a producción lo decidís vos.
- [BL-059] El frente de Shiruvana queda registrado y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

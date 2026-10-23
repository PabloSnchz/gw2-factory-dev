# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-058 — WEL-3 publicado en DEV: «Shiruvana te guía» reemplaza el saludo heredado de la Bienvenida. Esperando la validación de Pablo antes de WEL-4 (revisión y cierre).
Motivo: Pablo (05:39Z) validó WEL-2 y pidió WEL-3 con prioridades: 1 lo que impide funcionar, 2 permisos faltantes, 3 copias pendientes, 4 configuración incompleta, 5 continuidad, 6 orientación general. Solo sobre la Bóveda.
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 05:50Z
Próxima acción: con la validación de Pablo, WEL-4: revisión en los 19 themes, celular y teclado; cierre de BL-058 (FEAT-008, backlog, CHANGELOG-FACTORY).

Micro-ciclo (cerrado):
WEL-3 — `shiruvana-places.js` 1.1.0: «Shiruvana te guía», un mensaje por vez con «1 de N», la acción que lo resuelve (la atiende la Bienvenida), «Siguiente» y «Preguntame» (¿Qué hay que revisar?, ¿Mis Keys están seguras?, ¿Qué es un permiso?, ¿Cómo cambio de cuenta?, Un truco). Prioridades 1 a 6 sobre `Welcome.orientation()` y la Key activa; sin API Key, el texto aprobado. El modal de Keys deja de prometer el Gist (DEC-030); el saludo de respaldo ya no nombra la barra lateral. 15 tests, 18/18 mutaciones, humo de integración con `welcome-panel.js` 2.1.0 real (16/16).
Archivos:
- js/shiruvana-places.js
- tests/shiruvana-places.test.cjs
- tests/index-identity.test.cjs

Último hecho: WEL-3 (05:48Z) en un solo commit `01b0778` (blobs f32e964, d584262, 529d853, iguales a los locales). `index.html` sigue pidiendo `shiruvana-places.js?v=1.0.0` y no se puede publicar (69 KB, LES-028): el test acepta la misma versión mayor y queda cubierto por RSK-020 (Ctrl+F5).

Plan BL-058 (Pantalla de Bienvenida), aprobado:

- WEL-1 y WEL-2 hechos y validados.
- WEL-3 hecho; espera validación.
- WEL-4 revisión (19 themes, celular, teclado) y cierre (FEAT-008, backlog, CHANGELOG-FACTORY).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `611f7c9`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado validado por Pablo en DEV (FEAT-007).
- BL-058 en implementación: WEL-1 y WEL-2 validados, WEL-3 publicado. La Bienvenida es la puerta de entrada de la Bóveda y no asume funciones de ningún módulo (DEC-032).
- Frente registrado: evolución de Shiruvana en 5 niveles (DEC-033, BL-059). WEL-3 es N2 aplicado a la Bóveda.

## Esperando a Pablo

- [BL-058] Validación: abrí la Bienvenida en DEV con Ctrl+F5 (el navegador puede tener guardado el archivo de mi voz anterior). Probá «Siguiente», «Preguntame» y el botón de cada mensaje. Si guardás una copia, el mensaje de la copia desaparece y vuelvo al primero.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-057] Metas y Eventos queda solo en DEV: pasarlo a producción lo decidís vos.
- [BL-059] El frente de Shiruvana queda registrado y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

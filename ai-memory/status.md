# STATUS

Estado: EN CURSO
Tarea actual: BL-058 — WEL-3: «Shiruvana te guía» reemplaza el saludo heredado de la Bienvenida (`shiruvana-places.js` 1.1.0).
Motivo: Pablo (05:39Z) validó WEL-2 («el enfoque actual de Bienvenida es el correcto») y pidió WEL-3 con prioridades: 1 lo que impide funcionar, 2 permisos faltantes, 3 copias pendientes, 4 configuración incompleta, 5 continuidad, 6 orientación general. Solo sobre la Bóveda.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 05:55Z
Próxima acción: publicar los 3 archivos en un commit (el test de identidad tiene que cambiar junto con la versión), verificar blobs y pedir validación.

Micro-ciclo (en curso, checkpoint de este commit):
WEL-3 — «Shiruvana te guía»: un mensaje por vez según `Welcome.orientation()` y la Key activa, con «1 de N», la acción que lo resuelve, «Siguiente» y «Preguntame» (respuestas fijas sobre la Bóveda); sin API Key, el texto aprobado. El modal de Keys deja de prometer el Gist (DEC-030). 15 tests, 18/18 mutaciones, humo de integración con `welcome-panel.js` 2.1.0 real (16 comprobaciones).
Archivos:
- js/shiruvana-places.js
- tests/shiruvana-places.test.cjs
- tests/index-identity.test.cjs

Último hecho: WEL-2 validado por Pablo (05:39Z). `08ea3a1`, `c55503e` Bienvenida 2.1.0.

Plan BL-058 (Pantalla de Bienvenida), aprobado:

- WEL-1 y WEL-2 hechos y validados.
- WEL-3 (este micro-ciclo).
- WEL-4 revisión (19 themes, celular, teclado) y cierre (FEAT-008, backlog, CHANGELOG-FACTORY).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `611f7c9`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado validado por Pablo en DEV (FEAT-007).
- BL-058 en implementación: WEL-1 y WEL-2 validados. La Bienvenida es la puerta de entrada de la Bóveda y no asume funciones de ningún módulo (DEC-032).
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

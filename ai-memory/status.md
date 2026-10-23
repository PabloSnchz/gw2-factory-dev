# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-058 — WEL-2 publicado en DEV (Bienvenida 2.1.0: «Seguí donde quedaste», «Tu Bóveda», permisos de Keys, copias y flujo de orientación). Esperando la validación de Pablo antes de WEL-3.
Motivo: Pablo (05:22Z) validó WEL-1 y pidió WEL-2 con el mismo criterio: guía sobre la Bóveda, sin agendas, timers ni recomendaciones de juego.
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 05:37Z
Próxima acción: con la validación de Pablo, WEL-3: «Shiruvana te guía» en `shiruvana-places.js` 1.1.0, alimentado por `Welcome.orientation()`, con Preguntame y sin el texto del Gist.

Micro-ciclo (cerrado):
WEL-2 — Bienvenida 2.1.0. «Seguí donde quedaste» (último módulo con «Última visita: ayer» y los 3 más usados); «Tu Bóveda» con «N de 4 listo»: Keys (completas, con permisos faltantes con el detalle de qué módulos quedan sin datos y cómo arreglarlo, sin verificar), cuenta activa, copia de seguridad (al día hasta 14 días) y theme, cada una con su botón; botón de Copia en la cabecera; «Falta permiso» en los módulos que la Key activa no alcanza; `Welcome.orientation()`. Clave nueva `gn:global:welcome` (solo ids de módulo y fechas); la copia se anota desde «Guardar copia» y desde «Backup» de la cabecera. Sin pedidos a la API. 21 tests, 35/35 mutaciones.
Archivos:
- js/welcome-panel.js
- tests/welcome-view.test.cjs
- tests/welcome-vault.test.cjs

Último hecho: WEL-2 (05:35Z) en dos commits en serie para no dejar CI en rojo: `08ea3a1` test de vista sin atarlo a la versión, `c55503e` `welcome-panel.js` 2.1.0 (43 KB, archivo grande dedicado, DEC-021 §1 bis) y `tests/welcome-vault.test.cjs`. Blobs 243ba6a, 1654e57 y 05a933c, iguales a los locales.

Plan BL-058 (Pantalla de Bienvenida), aprobado:

- WEL-1 hecho y validado.
- WEL-2 hecho; espera validación.
- WEL-3 `shiruvana-places.js` 1.1.0: «Shiruvana te guía» con `Welcome.orientation()` y Preguntame; fuera el Gist (DEC-030).
- WEL-4 revisión (19 themes, celular, teclado) y cierre (FEAT-008).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `611f7c9`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado validado por Pablo en DEV (FEAT-007).
- BL-058 en implementación: WEL-1 validado, WEL-2 publicado. La Bienvenida es la puerta de entrada de la Bóveda y no asume funciones de ningún módulo (DEC-032).
- Frente registrado: evolución de Shiruvana en 5 niveles (DEC-033, BL-059). No se implementa todavía.

## Esperando a Pablo

- [BL-058] Validación: mirá la Bienvenida en DEV (Inicio, Ctrl+F5 por RSK-020). Probá «Guardar copia», abrí un módulo y volvé a Inicio («Seguí donde quedaste»), y si tenés una Key con menos permisos, mirá «Tu Bóveda». Desde ahora la Bienvenida guarda en tu navegador la clave `gn:global:welcome`. La fecha de la copia cuenta desde la primera que hagas con esta versión.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-057] Metas y Eventos queda solo en DEV: pasarlo a producción lo decidís vos.
- [BL-059] El frente de Shiruvana queda registrado y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

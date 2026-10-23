# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-058 — WEL-1 publicado en DEV (Bienvenida 2.0.0). Esperando la validación de Pablo en pantalla antes de WEL-2.
Motivo: Pablo (05:00Z) aprobó la propuesta WEL-0b y pidió implementarla tal cual, por micro-ciclos.
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 05:20Z
Próxima acción: con la validación de Pablo, WEL-2: «Tu Bóveda» y estado de cada Key con sus permisos (ya guardados en el navegador: sin pedidos a la API).

Micro-ciclo (cerrado):
WEL-1 — Bienvenida 2.0.0: cabecera con el gato y botones de API Key y Cuentas, dos estados (tres pasos sin Key), los 9 módulos con su ruta real, Novedades desde `assets/welcome-news.json`, Guías y ayuda, pie compacto con los colores oficiales de la bio. Sin estilos en línea; test de frontera DEC-032. 11 tests, 15/15 mutaciones.
Archivos:
- js/welcome-panel.js
- tests/welcome-view.test.cjs
- assets/welcome-news.json

Último hecho: WEL-1 (05:16Z) en un solo commit `5ee02d8` (blobs 001d3c5, e612468, b1bf170, iguales a los locales). Antes, SHV-0: `5fbf835` DEC-033, `f6c413d` memory-index, `4b65933` backlog.

Plan BL-058 (Pantalla de Bienvenida), aprobado:

- WEL-1 hecho; espera validación.
- WEL-2 «Tu Bóveda» y botones de estado (Keys y sus permisos, cuentas, copia, theme).
- WEL-3 «Seguí donde quedaste» (clave nueva `gn:global:welcome`).
- WEL-4 `shiruvana-places.js` 1.1.0: «Shiruvana te guía» y Preguntame; fuera el Gist (DEC-030).
- WEL-5 revisión (19 themes, celular, teclado) y cierre (FEAT-008).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `611f7c9`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado validado por Pablo en DEV (FEAT-007).
- BL-058 en implementación: WEL-1 publicado. La Bienvenida es la puerta de entrada de la Bóveda y no asume funciones de ningún módulo (DEC-032).
- Frente nuevo registrado: evolución de Shiruvana en 5 niveles (DEC-033, BL-059). No se implementa todavía.

## Esperando a Pablo

- [BL-058] Validación: mirá la Bienvenida en DEV (Inicio, con Ctrl+F5 por RSK-020), con y sin API Key y en el celular. Mi mensaje de arriba todavía es el saludo viejo: el nuevo «Shiruvana te guía» llega en WEL-4.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-057] Metas y Eventos queda solo en DEV: pasarlo a producción lo decidís vos.
- [BL-059] El frente de Shiruvana queda registrado y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

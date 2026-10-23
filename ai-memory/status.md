# STATUS

Estado: EN CURSO
Tarea actual: BL-058 — WEL-1 (Bienvenida 2.0.0). Antes, SHV-0: registrar el frente estratégico de Shiruvana (niveles N1 a N5), sin implementar.
Motivo: Pablo (05:00Z) aprobó la propuesta WEL-0b completa (sin API Key y con API Key), pidió implementarla tal cual y abrir un frente para la evolución de Shiruvana. BL-058 sigue siendo la prioridad.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 05:10Z
Próxima acción: SHV-0 (DEC-033, memory-index, backlog BL-059) → WEL-1 (`js/welcome-panel.js` 2.0.0, `tests/welcome-view.test.cjs`, `assets/welcome-news.json`) → validación de Pablo.

Micro-ciclo (en curso, checkpoint de este commit):
SHV-0 — el frente de Shiruvana queda registrado: visión de los 5 niveles en DEC-033, su línea en el índice y BL-059 en el backlog (bloqueado por Pablo hasta que lo habilite).
Archivos:
- ai-memory/decisions/DEC-033-niveles-de-inteligencia-de-shiruvana.md
- ai-memory/memory-index.md
- ai-memory/backlog.md

Último hecho: WEL-0b aprobada por Pablo (05:00Z). `9b45215` propuesta v2, `e696be8` DEC-032.

Plan BL-058 (Pantalla de Bienvenida), aprobado:

- WEL-1 `welcome-panel.js` 2.0.0: cabecera con el gato, dos estados, 9 módulos, Novedades, Guías y ayuda, pie; test de frontera (DEC-032).
- WEL-2 «Tu Bóveda» y botones de estado (Keys y sus permisos, cuentas, copia, theme).
- WEL-3 «Seguí donde quedaste» (clave nueva `gn:global:welcome`).
- WEL-4 `shiruvana-places.js` 1.1.0: «Shiruvana te guía» y Preguntame; fuera el Gist (DEC-030).
- WEL-5 revisión (19 themes, celular, teclado) y cierre (FEAT-008).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `611f7c9`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado validado por Pablo en DEV (FEAT-007).
- BL-058 aprobada (WEL-0b): la Bienvenida es la puerta de entrada de la Bóveda y no asume funciones de ningún módulo (DEC-032). Empieza la implementación.
- Frente nuevo: evolución de Shiruvana en 5 niveles (informativa, contextual, analítica, asistente estratégico, compañera de cuenta). Solo se registra.

## Esperando a Pablo

- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-057] Metas y Eventos queda solo en DEV: pasarlo a producción lo decidís vos.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

# STATUS

Estado: EN CURSO
Tarea actual: BL-058 — WEL-4: revisión final de la Bienvenida (19 themes, celular, teclado y accesibilidad) y cierre formal (FEAT-008, backlog, CHANGELOG-FACTORY).
Motivo: Pablo (05:54Z) validó WEL-3 y pidió WEL-4 y el cierre de BL-058. BL-059 sigue aprobado conceptualmente y sin implementar.
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 05:56Z
Próxima acción: revisión en navegador headless sobre los 19 themes y 3 anchos; corregir lo que aparezca en un micro-ciclo propio; después FEAT-008, backlog y CHANGELOG-FACTORY.

Micro-ciclo (en curso):
WEL-4 — revisión final y cierre de BL-058.
Archivos:
- ai-memory/features/FEAT-008-bienvenida-puerta-de-la-boveda.md
- ai-memory/backlog.md
- ai-memory/CHANGELOG-FACTORY.md

Último hecho: WEL-3 validado por Pablo (05:54Z): priorización, un mensaje por vez, acciones concretas, «Preguntame», continuidad y separación respecto de Metas y Eventos.

Plan BL-058 (Pantalla de Bienvenida), aprobado:

- WEL-1, WEL-2 y WEL-3 hechos y validados.
- WEL-4 revisión (19 themes, celular, teclado) y cierre (FEAT-008, backlog, CHANGELOG-FACTORY). En curso.

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

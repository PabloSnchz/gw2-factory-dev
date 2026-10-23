# STATUS

Estado: EN CURSO
Tarea actual: PRD — promoción a producción de Metas y Eventos (BL-057), Bienvenida (BL-058) y Sidebar (BL-061, SBR-1 y SBR-2).
Motivo: Pablo (07:00Z) validó SBR-2 y ordenó: «Meta + Welcome + sidebar, todo a productivo autorizado».
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 07:05Z
Próxima acción: PRD-0 rama de vuelta atrás en gw2-wallet-ligero; después PRD-15 a PRD-19 en serie.

Micro-ciclo (en curso):
PRD (BL-062) — copiar a gw2-wallet-ligero los blobs de DEV. Diferencias medidas DEV↔PROD (07:02Z): solo 5 archivos de js/ (meta.js, meta-theme.js, welcome-panel.js, shiruvana-places.js, sidebar-nav.js), assets/meta-drops.json, assets/welcome-news.json (nuevo) y assets/previews/ (8 .webp, binarios). index.html difiere solo en el bloque de GA (DEC-006): no se toca. css/ e íconos iguales.
Plan:
- PRD-0 rama `rollback/pre-meta-welcome-sidebar` = PROD a82c996.
- PRD-15 js/meta.js 4.0.1 (d70026a, 63,6 KB, solo).
- PRD-16 js/meta-theme.js 2.1.0 (37a2981) + assets/meta-drops.json versión PROD (e30b617: piñata y burbujas siguen en assets/gifanim; las otras 6 apuntan a assets/previews y muestran «Sin vista previa» hasta que estén los .webp, que la Factory no puede subir: son binarios).
- PRD-17 js/welcome-panel.js 2.2.0 (cd8587a) + assets/welcome-news.json (b1bf170).
- PRD-18 js/shiruvana-places.js 1.2.0 (23a718e).
- PRD-19 js/sidebar-nav.js 2.1.0 (8934573).
Archivos:
- js/meta.js
- ai-memory/status.md

Último hecho: Pablo validó SBR-2 (07:00Z).

Plan BL-061 (Sidebar), aprobado:

- SBR-1 Sidebar desktop. Hecho y validado.
- SBR-2 Cuenta activa, «Falta permiso», «Nuevo». Hecho y validado.
- SBR-3 Celular: barra fija abajo + «Más».
- SBR-4 Rincón de Shiruvana (DEC-034).
- SBR-5 Revisión y cierre (FEAT-009).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET, WEL): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `86afe37`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado (FEAT-007).
- BL-058 cerrada: Bienvenida, la puerta de entrada de la Bóveda (FEAT-008).
- BL-061: SBR-1 y SBR-2 validados.
- Promoción a PRD de Metas, Bienvenida y Sidebar en curso.

## Esperando a Pablo

- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

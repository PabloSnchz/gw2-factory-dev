# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-062 — Metas y Eventos, Bienvenida y Sidebar (SBR-1 y SBR-2) publicados en producción.
Motivo: falta la validación de Pablo en producción; después sigue SBR-3 en DEV.
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 07:17Z
Próxima acción: con la validación de Pablo, SBR-3 en DEV (celular: barra fija abajo con Inicio, Cartera, Metas, Armería y «Más»; hoja con foco atrapado, Escape y safe-area).

Micro-ciclo (cerrado):
PRD (BL-062) — gw2-wallet-ligero, en serie: rama de vuelta atrás `rollback/pre-meta-welcome-sidebar` = `a82c996`; `0cfe1be` meta.js 4.0.1; `c97521d` meta-theme.js 2.1.0 + meta-drops.json (versión de producción `e30b617`); `88a6da6` welcome-panel.js 2.2.0 + welcome-news.json; `a435bcc` shiruvana-places.js 1.2.0; `d5136bd` sidebar-nav.js 2.1.0. Verificado: `js/` de producción = DEV salvo analytics.js; welcome-news.json = DEV. index.html no se tocó (solo difería en GA). Docs: CHANGELOG-FACTORY `ee72511`, backlog `be0e56e`.
Archivos:
- docs/CHANGELOG-FACTORY.md
- ai-memory/backlog.md
- ai-memory/status.md

Último hecho: BL-062 publicado en producción (07:13Z).

Plan BL-061 (Sidebar), aprobado:

- SBR-1 Sidebar desktop. Hecho, validado y en producción.
- SBR-2 Cuenta activa, «Falta permiso», «Nuevo». Hecho, validado y en producción.
- SBR-3 Celular: barra fija abajo + «Más».
- SBR-4 Rincón de Shiruvana (DEC-034).
- SBR-5 Revisión y cierre (FEAT-009).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET, WEL): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `86afe37`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado (FEAT-007), en producción.
- BL-058 cerrada: Bienvenida, la puerta de entrada de la Bóveda (FEAT-008), en producción.
- BL-061: SBR-1 y SBR-2 validados y en producción; siguen SBR-3 a SBR-5 en DEV.

## Esperando a Pablo

- [BL-062] Validación: abrí producción con Ctrl+F5 y revisá Inicio (Bienvenida con «Shiruvana te guía»), Metas y Eventos (cabecera nueva, «Hoy en tu cuenta») y la Sidebar a la izquierda con «Cuenta activa». Si algo no va, la vuelta atrás es la rama `rollback/pre-meta-welcome-sidebar`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-062] En producción la Bienvenida suma una clave nueva en el navegador de cada usuario: `gn:global:welcome` (último módulo, visitas y fecha de la última copia). La Sidebar en el celular sigue como antes hasta SBR-3.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

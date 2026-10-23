# STATUS

Estado: EN CURSO
Tarea actual: BL-064 — ARM-1: dieta de `legendary-tracker.js` (la cola y el marco pasan a `render-catologo.js`), cabecera con resumen, pestañas «Catálogo / Mi cola» y buscador.
Motivo: Pablo aprobó el plan y el orden, el diseño completo de la Armería y las armaduras por set (2026-10-23 15:33Z).
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 15:35Z
Próxima acción: implementar ARM-1 en local con los tests de la Armería, mutaciones y publicar en serie; después, esperar la validación de Pablo antes de ARM-2.

Micro-ciclo:
ARM-1 — marco nuevo de la Armería, sin cambiar las tarjetas (eso es ARM-2).
Archivos:
- js/legendary-tracker.js
- js/render-catologo.js
- tests/armeria-shell.test.cjs

Último hecho: ARM-0 aprobado por Pablo (15:33Z).

Plan del restyle (aprobado por Pablo, 15:33Z):

1. Armería Legendaria: ARM-1 marco, cabecera, pestañas y buscador · ARM-2 filtros, tarjetas y grilla · ARM-3 «Mi cola» y mi línea · ARM-4 armaduras por set (aprobado) · ARM-5 revisión y cierre (FEAT-010).
2. Cámara del Brujo.
3. Logros.
4. Actividades (después de decidir BL-055).
5. Raids y Strikes.
6. Inventario y Personajes.
7. Cuentas.
8. Marco común: barra de arriba, modales, avisos y pie.

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET, WEL, SBR): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `86afe37`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado (FEAT-007), en producción.
- BL-058 cerrada: Bienvenida, la puerta de entrada de la Bóveda (FEAT-008), en producción.
- BL-061 cerrada: la Sidebar (FEAT-009). Completa en producción (BL-062 y BL-063).
- BL-064 en curso: restyle completo, primero la Armería. Propuesta aprobada.

## Esperando a Pablo

- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-064] Cuatro archivos del resto de la Bóveda no entran en una publicación de la Factory (`raid-tracker.js` 100 KB, `wv-purchase-detail.js` 91 KB, `inventory-hub.js` 70 KB, `accounts-panel.js` 68 KB). Esos módulos se renuevan desde sus archivos `*-theme.js`, que ya se cargan. `legendary-tracker.js` está a 1 KB del límite: ARM-1 lo achica primero.
- [BL-061] La zona segura del iPhone queda en 0 hasta que `index.html` pida `viewport-fit=cover` (no lo toco: LES-028); la barra igual deja su margen normal y no tapa nada.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

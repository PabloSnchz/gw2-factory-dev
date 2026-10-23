# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-064 — ARM-1 publicado en DEV: cabecera con resumen, pestañas «Catálogo / Mi cola» y buscador de la Armería.
Motivo: Pablo aprobó el plan y el orden, el diseño completo de la Armería y las armaduras por set (2026-10-23 15:33Z).
Fase: F1 — Visibilidad
Etapa actual: REVIEW (validación visual de Pablo)
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 15:50Z
Próxima acción: con la validación de Pablo, ARM-2 (filtros en una fila, tarjetas nuevas, grilla responsive, secciones por expansión, «La tengo», precio con fecha).

Micro-ciclo:
ARM-1 — marco nuevo de la Armería, sin cambiar las tarjetas (eso es ARM-2). HECHO.
Archivos:
- js/render-catologo.js (1.2.0, commit 1fba76e, blob da14de0)
- tests/armeria-shell.test.cjs (commit 413ee9c, blob 0044481)

Último hecho: ARM-1 publicado y verificado (15:50Z). Blobs publicados = locales. Tests 12/12, réplica local de los tests heredados 21/21, mutaciones 18/18.
Nota: ARM-1 vive entero en `render-catologo.js`; `legendary-tracker.js` no se tocó, así que la dieta del tracker no hace falta por ahora (se evalúa en ARM-3, que cambia la cola).

Plan del restyle (aprobado por Pablo, 15:33Z):

1. Armería Legendaria: ARM-1 marco, cabecera, pestañas y buscador (HECHO, espera validación) · ARM-2 filtros, tarjetas y grilla · ARM-3 «Mi cola» y mi línea · ARM-4 armaduras por set (aprobado) · ARM-5 revisión y cierre (FEAT-010).
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
- BL-064 en curso: restyle completo, primero la Armería. ARM-1 en DEV.

## Esperando a Pablo

- [BL-064] Validación: abrí DEV con recarga completa (Ctrl+F5) → Armería. Arriba: título, resumen (Desbloqueadas X de 206 con barra, Armas, Armaduras, Abalorios y más, En tu cola N de 5) y «↻ Actualizar». Debajo: pestañas «Catálogo / Mi cola» en lugar de «Modo:» y un buscador (sin tildes, en español o inglés). Las tarjetas siguen como antes: cambian en ARM-2.
- [BL-064] Decisión: ¿registro el flujo de parches de `index.html` por GitHub Actions? (ver «Para tu información»).
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [LES-028] Por qué no republico `index.html`: la Factory publica cada archivo mandando su contenido completo en una sola operación, y cada operación mía tiene un tope de ~64 KB. `index.html` pesa 69 KB: si lo mando, sale cortado y rompe la página. No es una regla de GitHub, es un límite de cómo publico yo. Alternativa: un workflow de GitHub Actions en DEV que aplique parches chicos a `index.html` (yo publico el parche, Actions lo aplica). Destrabaría BL-005, BL-053 y RSK-020 (cache-busting `?v=`). En producción solo con tu orden.
- [BL-064] Cuatro archivos del resto de la Bóveda no entran en una publicación de la Factory (`raid-tracker.js` 100 KB, `wv-purchase-detail.js` 91 KB, `inventory-hub.js` 70 KB, `accounts-panel.js` 68 KB). Esos módulos se renuevan desde sus archivos `*-theme.js`, que ya se cargan. `legendary-tracker.js` (63,9 KB) está a 1 KB del límite: no lo toqué en ARM-1.
- [BL-061] La zona segura del iPhone queda en 0 hasta que `index.html` pida `viewport-fit=cover` (no lo toco: LES-028); la barra igual deja su margen normal y no tapa nada.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-064 — ARM-4 publicado en DEV: armaduras por set en la Armería.
Motivo: Pablo validó ARM-3 y pidió seguir con ARM-4 (2026-10-23 16:49Z). Foco: restyle de la Armería.
Fase: F1 — Visibilidad
Etapa actual: REVIEW (validación visual de Pablo)
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 17:00Z
Próxima acción: con la validación de Pablo, ARM-5 (revisión final: 19 themes, celular, teclado y lector; foco al cambiar Expansión/Gen.; FEAT-010 y cierre de la Armería).

Micro-ciclo:
ARM-4 — armaduras por set. HECHO.
Archivos:
- js/render-catologo.js (1.5.0, commit 67d2f58, blob e9fca2e, 59.720 B)
- tests/armeria-sets.test.cjs (commit d97dfc1, blob d3ccee2)

Último hecho: ARM-4 publicado y verificado (16:59Z). Blobs publicados = locales. Tests de la Armería 32/32, hb119-2-2 7/7, hb126 15/15, réplica local 22/22, mutaciones 23/24 (sobrevive el caché de setOf: solo rendimiento, mutante equivalente); siguen 24/25 (ARM-3), 24/24 (ARM-2) y 18/18 (ARM-1).
Notas de ARM-4:
- 132 piezas → 23 tarjetas: 7 sets × 3 pesos (Enviado perfeccionado, Héroe triunfal, Héroe triunfal forjado en la Niebla, Héroe glorioso, Héroe glorioso forjado en la Niebla, Glorioso ardiente, Obsidiana) + Eikasia (guantes) y Selaquimorfo (casco acuático), una tarjeta con los 3 pesos cada una.
- Cada set es un <details>: se abre con clic, Enter o Espacio; adentro, las piezas con la tarjeta de siempre (abren la ficha y encolan como antes). Abierto ocupa toda la fila. Con una búsqueda, los sets que encuentran algo se abren solos.
- El avance («tenés N de 6 piezas», barra, «✓ Completo») cuenta las 6 piezas aunque haya filtros; sin Key o si la API falló no lo digo.
- Una armadura que no reconozca (un set nuevo) aparece suelta: nunca se esconde.
- Para que entrara (LES-028) resumí comentarios heredados de render-catologo.js; el detalle sigue en git. El archivo quedó en 59,7 KB: no le entra otro paso grande. ARM-5 va con cambios chicos.

Plan del restyle (aprobado por Pablo, 15:33Z):

1. Armería Legendaria: ARM-1 (VALIDADO) · ARM-2 (VALIDADO) · ARM-3 (VALIDADO) · ARM-4 armaduras por set (HECHO, espera validación) · ARM-5 revisión y cierre (FEAT-010).
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
- BL-064 en curso: restyle completo, primero la Armería. ARM-1 a ARM-3 validados; ARM-4 en DEV.

## Esperando a Pablo

- [BL-064] Validación: abrí DEV con recarga completa (Ctrl+F5) → Armería → Catálogo. En Clásico, Heart of Thorns, Secrets of the Obscure y Visions of Eternity, las armaduras ya no son 132 tarjetas sueltas: son tarjetas de set («Enviado perfeccionado · Pesada — Armadura · Gen 1 · tenés 4 de 6 piezas», con barra). Al tocar una se abre a lo ancho con sus piezas; cada pieza abre su ficha y tiene «+ A la cola» como siempre. Probá buscar «casco del enviado»: el set se abre solo.
- [BL-064] Decisión (sin apuro): el flujo de parches de `index.html` por GitHub Actions. Pablo lo está revisando (16:02Z).
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [LES-028] Por qué no republico `index.html`: la Factory publica cada archivo mandando su contenido completo en una sola operación, y cada operación mía tiene un tope de ~64 KB. `index.html` pesa 69 KB: si lo mando, sale cortado y rompe la página. No es una regla de GitHub, es un límite de cómo publico yo. Alternativa: un workflow de GitHub Actions en DEV que aplique parches chicos a `index.html`. Destrabaría BL-005, BL-053 y RSK-020 (cache-busting `?v=`). En producción solo con tu orden.
- [BL-064] Cuatro archivos del resto de la Bóveda no entran en una publicación de la Factory (`raid-tracker.js` 100 KB, `wv-purchase-detail.js` 91 KB, `inventory-hub.js` 70 KB, `accounts-panel.js` 68 KB). Esos módulos se renuevan desde sus archivos `*-theme.js`, que ya se cargan. `render-catologo.js` quedó en 59,7 KB: cerca del límite.
- [BL-061] La zona segura del iPhone queda en 0 hasta que `index.html` pida `viewport-fit=cover` (no lo toco: LES-028); la barra igual deja su margen normal y no tapa nada.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

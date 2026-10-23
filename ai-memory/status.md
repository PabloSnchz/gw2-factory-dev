# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-064 — ARM-5 publicado en DEV: revisión final de la Armería (contraste en los 19 themes y foco). La Armería queda terminada en DEV (FEAT-010).
Motivo: Pablo validó ARM-4 y pidió avanzar (2026-10-23 17:50Z, «ARM-5 validado, podes avanzar»: lo tomé como ARM-4 validado). Foco: restyle de la Armería.
Fase: F1 — Visibilidad
Etapa actual: REVIEW (validación visual de Pablo)
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 18:31Z
Próxima acción: con la validación de Pablo, propuesta de la Cámara del Brujo (módulo 2 del plan), para aprobar antes de escribir código.

Micro-ciclo:
ARM-5 — revisión final y cierre de la Armería. HECHO.
Archivos:
- js/render-catologo.js (1.6.0, commit d767fb9, blob bedfa6a, 61.317 B)
- tests/armeria-contrast.test.cjs (commit 3b7eb67, blob b1619a5)
- ai-memory/features/FEAT-010-armeria-renovada.md (c9a8d3f), backlog (5579247), memory-index (34dce33), CHANGELOG-FACTORY (efa2e6e)

Último hecho: ARM-5 publicado y verificado (blobs publicados = locales). Tests de la Armería 38/38 (6 suites), hb119-2-2 7/7, hb126 15/15, réplica local 22/22. Mutaciones ARM-5 14/15 (sobrevive una comparación equivalente); siguen ARM-4 23/24, ARM-3 24/25, ARM-2 24/24 y ARM-1 18/18.
Notas de ARM-5:
- El test mide cada token sobre sus superficies reales en los 19 themes (fondos y tintes). Dos hallazgos corregidos: el subtítulo de la cabecera usaba `--tx-3` y no llegaba a 4,5:1 sobre el tinte en varios themes (pasa a `--tx-2`); «La tengo» daba 4,45 en One Dark (su tinte baja de .14 a .10). 0 fallas después.
- La guarda de contraste de la Bienvenida se aplica también dentro de la Armería y se recalcula al cambiar de theme.
- Foco: cuando el tracker repinta (filtros, Expansión/Gen., quitar de la cola), el foco vuelve al mismo control en vez de saltar al principio.
- render-catologo.js quedó en 61,3 KB: cerca del límite de publicación (LES-028). Lo próximo de la Armería, si hace falta, va en otro archivo.

Plan del restyle (aprobado por Pablo, 15:33Z):

1. Armería Legendaria: ARM-1 a ARM-4 (VALIDADOS) · ARM-5 revisión y cierre (HECHO, espera validación) → FEAT-010.
2. Cámara del Brujo (siguiente: propuesta primero).
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
- BL-064 en curso: restyle completo. La Armería, terminada en DEV (FEAT-010): ARM-1 a ARM-4 validados, ARM-5 espera validación.

## Esperando a Pablo

- [BL-064] Validación: abrí DEV con recarga completa (Ctrl+F5) → Armería. Probá 3 themes (macOS, Notion y Tokyo Night): el subtítulo de la cabecera y la pastilla «✓ La tengo» se leen bien. Con teclado: Tab hasta un filtro (por ejemplo «Me faltan» o Expansión) y Enter: el foco queda en ese mismo filtro, no vuelve al principio. En «Mi cola», «Quitar» deja el foco en la siguiente.
- [BL-064] Decisión (sin apuro): el flujo de parches de `index.html` por GitHub Actions. Pablo lo está revisando (16:02Z).
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [LES-028] Por qué no republico `index.html`: la Factory publica cada archivo mandando su contenido completo en una sola operación, y cada operación mía tiene un tope de ~64 KB. `index.html` pesa 69 KB: si lo mando, sale cortado y rompe la página. No es una regla de GitHub, es un límite de cómo publico yo. Alternativa: un workflow de GitHub Actions en DEV que aplique parches chicos a `index.html`. Destrabaría BL-005, BL-053 y RSK-020 (cache-busting `?v=`). En producción solo con tu orden.
- [BL-064] Cuatro archivos del resto de la Bóveda no entran en una publicación de la Factory (`raid-tracker.js` 100 KB, `wv-purchase-detail.js` 91 KB, `inventory-hub.js` 70 KB, `accounts-panel.js` 68 KB). Esos módulos se renuevan desde sus archivos `*-theme.js`, que ya se cargan. `render-catologo.js` quedó en 61,3 KB: cerca del límite.
- [BL-064] Deuda conocida de la Armería (DEBT-ARM-3): el panel viejo de la cola del tracker se sigue pintando y se oculta por CSS. Se limpia cuando se pueda tocar `legendary-tracker.js`. No se ve ni molesta.
- [BL-061] La zona segura del iPhone queda en 0 hasta que `index.html` pida `viewport-fit=cover` (no lo toco: LES-028); la barra igual deja su margen normal y no tapa nada.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

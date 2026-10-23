# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-064 — ARM-2 publicado en DEV: filtros en una fila, tarjetas nuevas, grilla adaptable y secciones por expansión.
Motivo: Pablo validó ARM-1 y pidió seguir con ARM-2 (2026-10-23 16:02Z). Foco: restyle de la Armería.
Fase: F1 — Visibilidad
Etapa actual: REVIEW (validación visual de Pablo)
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 16:15Z
Próxima acción: con la validación de Pablo, ARM-3 («Mi cola» renovada, sin los filtros del catálogo, y mi línea en la cabecera).

Micro-ciclo:
ARM-2 — filtros, tarjetas y grilla. HECHO.
Archivos:
- js/render-catologo.js (1.3.0, commit 70380ec, blob 3472f07)
- tests/armeria-catalogo.test.cjs (commit ceca631, blob e0ecb0a)

Último hecho: ARM-2 publicado y verificado (16:13Z). Blobs publicados = locales. Tests de la Armería 20/20 (etiquetas 5, marco 7, catálogo 8), réplica local de los tests heredados 21/21, mutaciones 24/24 (ARM-2) y 18/18 (ARM-1).
Notas de ARM-2:
- Los chips de tipo siguen en singular («Abalorio (10)»): es la jerga aprobada en BL-046 y contrato de `legendary-catalog-labels`.
- Las que ya tenés no muestran «+ A la cola» (como la maqueta); si estaban en la cola, muestran «✓ En tu cola» para poder quitarlas. Desde la ficha se puede encolar igual.
- Al elegir expansión o generación en la lista, el tracker repinta y el foco vuelve al inicio (BAJO; se revisa en ARM-5).
- `legendary-tracker.js` sigue sin tocarse.

Plan del restyle (aprobado por Pablo, 15:33Z):

1. Armería Legendaria: ARM-1 marco, cabecera, pestañas y buscador (VALIDADO) · ARM-2 filtros, tarjetas y grilla (HECHO, espera validación) · ARM-3 «Mi cola» y mi línea · ARM-4 armaduras por set (aprobado) · ARM-5 revisión y cierre (FEAT-010).
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
- BL-064 en curso: restyle completo, primero la Armería. ARM-1 validado; ARM-2 en DEV.

## Esperando a Pablo

- [BL-064] Validación: abrí DEV con recarga completa (Ctrl+F5) → Armería. Filtros en una fila («Todas / Las tengo / Me faltan», Tipo, y Expansión y Gen. como listas, con «✕ Limpiar» cuando hay alguno puesto). Las legendarias agrupadas por expansión con su título y «tenés X de Y». Tarjetas nuevas: nombre, qué es («Hacha · Gen 1»), «✓ La tengo», precio «≈» con su fecha o «No se vende», y «+ A la cola». En el celular: una tarjeta por renglón y los filtros se deslizan de costado.
- [BL-064] Decisión (sin apuro): el flujo de parches de `index.html` por GitHub Actions. Pablo lo está revisando (16:02Z).
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [LES-028] Por qué no republico `index.html`: la Factory publica cada archivo mandando su contenido completo en una sola operación, y cada operación mía tiene un tope de ~64 KB. `index.html` pesa 69 KB: si lo mando, sale cortado y rompe la página. No es una regla de GitHub, es un límite de cómo publico yo. Alternativa: un workflow de GitHub Actions en DEV que aplique parches chicos a `index.html`. Destrabaría BL-005, BL-053 y RSK-020 (cache-busting `?v=`). En producción solo con tu orden.
- [BL-064] Cuatro archivos del resto de la Bóveda no entran en una publicación de la Factory (`raid-tracker.js` 100 KB, `wv-purchase-detail.js` 91 KB, `inventory-hub.js` 70 KB, `accounts-panel.js` 68 KB). Esos módulos se renuevan desde sus archivos `*-theme.js`, que ya se cargan. `render-catologo.js` quedó en 48 KB: hay lugar para ARM-3 y ARM-4.
- [BL-061] La zona segura del iPhone queda en 0 hasta que `index.html` pida `viewport-fit=cover` (no lo toco: LES-028); la barra igual deja su margen normal y no tapa nada.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

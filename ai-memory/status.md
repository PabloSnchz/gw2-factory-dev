# STATUS

Estado: EN CURSO
Tarea actual: BL-065 — FP-1 hecho: script del canal de parches y sus tests en DEV. Todavía sin workflow.
Motivo: Pablo aprobó BL-065 y DEC-035 (2026-10-23 18:55Z): parches primero, manifiesto después, reducción progresiva al final; presupuesto de 40 KB por archivo.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 19:04Z
Próxima acción: FP-2 — workflow `factory-patch.yml` que corre `apply-patch.cjs` cuando llega un `factory/patches/PATCH-NNN.json`, probado primero por el camino de error (LES-016): un parche con sha base equivocado tiene que dejar RESULT «RECHAZADO» y el archivo igual.

Micro-ciclo:
FP-1 — script del canal de parches. HECHO.
Archivos:
- .github/scripts/apply-patch.cjs (commit ed86e8d, blob 71969f7, 8.185 B)
- .github/scripts/apply-patch.test.cjs (commit ed86e8d, blob 2d30562, 11.964 B)
- ai-memory/decisions/DEC-035-crecimiento-modular-y-canal-de-parches.md (0c9723f), memory-index (8d81ae7), backlog (218b95d)

Último hecho: FP-1 publicado y verificado (blobs publicados = locales). 14 tests; mutaciones 22/24 (sobreviven 2 equivalentes: el chequeo de «..» ya lo cubre la normalización de la ruta, y un parche rechazado nunca trae archivos para escribir). Dos mutantes vivos de la primera ronda eran huecos reales y se cerraron con tests (insert_after/insert_before del lado correcto; sha en bytes con tildes). `blobSha` da el mismo sha que GitHub sobre `render-catologo.js` (fe6ed4f). El script lo corre en CI el workflow `factory-scripts` que ya existía.
Qué hace el script:
- operaciones: replace, insert_before, insert_after, delete; en orden, cada una sobre el resultado anterior;
- ancla exactamente una vez (también cuenta las que se solapan); texto literal (sin `$&` ni regex);
- sha base por archivo: rechaza un parche sobre otra versión o ya aplicado;
- todo o nada; un parche que no cambia nada se rechaza; máximo 50 operaciones;
- rutas: solo app y documentación (index.html, js/, css/, assets/, docs/, tests/, tools/, ai-memory/, CHANGELOG.md, README.md); nunca .github/, .git/, el propio canal, absolutas ni con «..»;
- escribe RESULT-NNN.md junto al parche, también si el JSON está roto; código de salida 0/1/2.

Plan BL-065 (aprobado por Pablo, 18:55Z; DEC-035):

1. FP-1 script apply-patch.cjs + tests locales. HECHO.
2. FP-2 workflow factory-patch.yml, probado primero por el camino de error.
3. FP-3 prueba feliz sobre un archivo inofensivo.
4. FP-4 primer uso real: index.html carga js/boot.js + viewport-fit + BL-005.
5. FP-5 manifiesto js/modules.js con versión ?v=.
6. FP-6 test trinquete de tamaño + LES.

Plan del restyle (BL-064, EN PAUSA desde 18:46Z):

1. Armería Legendaria: CERRADA en DEV y validada por Pablo al 100% (FEAT-010).
2. Cámara del Brujo (cuando vuelva BL-064; ya con la regla de achicar al renovar).
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
- BL-064: la Armería terminada y validada en DEV (FEAT-010). Restyle en pausa por BL-065.
- BL-065: aprobada con DEC-035; FP-1 hecho.

## Esperando a Pablo

- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-065] FP-1 no cambia nada en la Bóveda: es una herramienta interna de la Factory, todavía sin workflow que la use. No hay nada para mirar en pantalla hasta FP-4.
- [LES-028] El límite de ~64 KB es de cómo publico yo (cada archivo entero en una sola operación), no de GitHub. BL-065 lo resuelve con DEC-035.
- [BL-064] Deuda conocida de la Armería (DEBT-ARM-3): el panel viejo de la cola y la barra «Modo:» del tracker se siguen pintando y se ocultan por CSS. Se limpian con el canal de parches.
- [BL-061] La zona segura del iPhone queda en 0 hasta que `index.html` pida `viewport-fit=cover` (lo resuelve FP-4).
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar; el canal de parches escribe su resultado en el repo por eso mismo.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

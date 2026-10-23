# STATUS

Estado: EN CURSO
Tarea actual: BL-065 — FP-2 hecho: el canal de parches funciona en DEV y rechaza lo que tiene que rechazar. Empieza FP-3 (prueba feliz).
Motivo: Pablo validó FP-1 y aprobó FP-2 y FP-3 (2026-10-23 19:09Z): workflow de aplicación, pruebas de rechazo, sin cambios funcionales en la Bóveda, solo DEV; mantener aplicación atómica, validación por versión, resultado persistente, rechazo ante ambigüedad y protección de workflows y canal. Pablo pasó el problema de caso de `index.html` a limitación estructural de la Factory.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 19:20Z
Próxima acción: FP-3 — un parche que se tiene que aplicar sobre un documento de `docs/` (sin republicar DEV) y otro sobre un archivo que sí se publica, inofensivo, para ver el disparo de `dev-pages`. Leer los RESULT y verificar los blobs nuevos.

Micro-ciclo:
FP-2 — workflow del canal de parches. HECHO.
Archivos:
- .github/workflows/factory-patch.yml (blob c1e2b69), .github/scripts/factory-patch.cjs (blob f3d7fb1), .github/scripts/factory-patch.test.cjs (blob 378c273) — commit 34d1bab
- .github/workflows/dev-pages.yml (blob 25df1d9) + tests/dev-pages.test.cjs (blob cdc6c5f) — commit 794ed03: hallazgo BAJO, `factory/` no se publica ni dispara DEV
- prueba real: factory/patches/PATCH-001..005 (4708ae8) → RESULT-001..005 por github-actions[bot] (78effca)

Último hecho: 5 parches de rechazo, 5 RESULT «RECHAZADO» con el motivo correcto: 001 sha base equivocado, 002 ancla que aparece 2 veces, 003 ancla que aparece 0 veces, 004 intento de tocar `.github/workflows/factory-patch.yml`, 005 intento de tocar el propio canal. El commit del bot solo agregó los 5 RESULT (+45 líneas); el documento siguió en fadd74b y los workflows sin cambios. El workflow tardó menos de 10 s y su paso de tests (45 tests del canal en Node 22 de GitHub) pasó: primera señal de CI que la Factory puede leer, aunque indirecta.
Diseño del workflow:
- se dispara con `factory/patches/PATCH-*.json` en main (y a mano); solo en este repo y solo con pushes del dueño;
- procesa todos los PATCH sin RESULT del main actual, en orden numérico: si la cola de GitHub cancela una corrida, la siguiente los encuentra (idempotente);
- por parche: plan (ancla única, sha base, todo o nada) → escribe → `node --check` y la suite de app-checks antes y después → si algo falla, restaura byte a byte y rechaza; si la suite ya estaba en rojo, no culpa al parche y lo anota;
- antes del commit verifica que lo preparado sea exactamente RESULT + archivos parcheados; nunca `.github/` ni `factory/` salvo RESULT;
- republica DEV con `workflow_dispatch` solo si el parche cambió algo que se publica;
- 31 tests del ejecutor y del workflow; mutaciones 21/21.

Plan BL-065 (aprobado por Pablo; DEC-035):

1. FP-1 script apply-patch.cjs + tests. HECHO (validado por Pablo).
2. FP-2 workflow factory-patch.yml + rechazos reales. HECHO.
3. FP-3 prueba feliz sobre archivos inofensivos. EN CURSO.
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
- BL-065: aprobada con DEC-035; FP-1 validado, FP-2 hecho, FP-3 en curso.

## Esperando a Pablo

- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-065] FP-1 a FP-3 no cambian nada en la Bóveda: son herramientas internas de la Factory. No hay nada para mirar en pantalla hasta FP-4.
- [LES-028] El límite de ~64 KB es de cómo publico yo (cada archivo entero en una sola operación), no de GitHub. BL-065 lo resuelve con DEC-035.
- [BL-064] Deuda conocida de la Armería (DEBT-ARM-3): el panel viejo de la cola y la barra «Modo:» del tracker se siguen pintando y se ocultan por CSS. Se limpian con el canal de parches.
- [BL-061] La zona segura del iPhone queda en 0 hasta que `index.html` pida `viewport-fit=cover` (lo resuelve FP-4).
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. El canal de parches escribe su resultado en el repo, y con la suite que corre antes y después empieza a dar una lectura indirecta.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

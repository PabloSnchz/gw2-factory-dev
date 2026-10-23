# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-065 — FP-2 y FP-3 hechos: el canal de parches está operativo en DEV, probado en real por el camino de error (5 rechazos) y por el feliz (4 parches aplicados, uno de dos archivos sobre la memoria oficial).
Motivo: Pablo aprobó FP-2 y pidió seguir con FP-3 (2026-10-23 19:09Z). Antes de FP-4 (`index.html`, primer cambio visible) espero su validación.
Fase: F1 — Visibilidad
Etapa actual: REVIEW (validación de Pablo)
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 19:35Z
Próxima acción: con la validación de Pablo, BL-066 (diagnosticar la falla de la suite, micro-ciclo chico) y después FP-4 (`index.html` por el canal: cargador `js/boot.js`, `viewport-fit=cover`, script duplicado de BL-005), con la suite en verde como red completa.

Micro-ciclo:
FP-3 — prueba feliz del canal. HECHO.
Archivos:
- PATCH-006/007 (6d74de5) → RESULT-006/007 (4ef3aaf): .md sin republicar DEV y .html publicado (blob 7ccd865, igual al calculado en local antes de enviar).
- .github/scripts/factory-patch.cjs (blob adb7e24) + factory-patch.test.cjs (blob 29b5264) — commit f0e88fe: la suite se lee en TAP y nombra sus fallas; un parche que rompe algo nuevo se rechaza aunque la suite ya esté en rojo. 34 tests, mutaciones 30/30.
- PATCH-008 (6773f1f) → RESULT-008 (dd573ca): primera lectura nombrada de la suite.
- factory/README.md (guía del canal), ai-memory/lessons/LES-031, PATCH-009 (b85365e) → RESULT-009 (8e16bfd): backlog (BL-065 al día, BL-066) e índice (LES-031) aplicados por el canal, dos archivos en un parche: +2 −1 y +1 líneas, nada más.

Último hecho: el canal funciona de punta a punta: 9 parches, 5 rechazados con el motivo correcto y 4 aplicados con blobs verificados; los workflows y el canal nunca se tocaron. Descubrimiento: la suite de DEV (`app-checks`) está en rojo por un solo archivo, `tests/idea61-claves-congeladas.test.js` (heredado de QwenPaw). Era invisible por RSK-016; quedó como BL-066 (MEDIO). Hallazgos corregidos en el camino: `dev-pages` publicaba y se disparaba con `factory/` (BAJO, 794ed03); la suite se leía con el formato de mi Node local y daba «? fallas» (MEDIO, f0e88fe, LES-031).
Sin verificar desde la Factory: que `dev-pages` se haya republicado por `workflow_dispatch` tras PATCH-007 (el sitio no se puede leer desde el sandbox: 403). Se ve en Actions → dev-pages, una corrida «workflow_dispatch» cerca de las 19:20Z.

Plan BL-065 (aprobado por Pablo; DEC-035):

1. FP-1 script apply-patch.cjs + tests. HECHO (validado por Pablo).
2. FP-2 workflow factory-patch.yml + rechazos reales. HECHO.
3. FP-3 prueba feliz + lectura de la suite. HECHO.
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
- BL-065: DEC-035; FP-1 validado, FP-2 y FP-3 hechos; canal de parches operativo en DEV.
- BL-066: la suite de DEV estaba en rojo sin que nadie lo viera; ahora tiene nombre.

## Esperando a Pablo

- [BL-065] Validación: FP-2 y FP-3 (no hay nada para mirar en pantalla). Si querés verlo: `factory/patches/` tiene los 9 parches con sus RESULT, y en Actions → factory-patch las corridas. De paso, en Actions → dev-pages debería haber una corrida «workflow_dispatch» cerca de las 19:20Z (la que disparó PATCH-007): es lo único que no pude comprobar desde acá.
- [BL-066] Decisión (recomendada: sí): diagnosticar la falla de la suite antes de FP-4, para que el primer cambio a `index.html` tenga la red completa.
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-065] El canal de parches solo corre en DEV, solo con pushes tuyos (de tu cuenta, que es la que uso), y nunca puede tocar workflows ni a sí mismo: lo probé en real. Guía: `factory/README.md`.
- [LES-028] El límite de ~64 KB es de cómo publico yo, no de GitHub. Con el canal deja de frenar: un cambio pesa lo que el cambio, no lo que el archivo.
- [BL-064] Deuda conocida de la Armería (DEBT-ARM-3): el panel viejo de la cola y la barra «Modo:» del tracker se siguen pintando y se ocultan por CSS. Se limpian con el canal de parches.
- [BL-061] La zona segura del iPhone queda en 0 hasta que `index.html` pida `viewport-fit=cover` (lo resuelve FP-4).
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer CI, pero el canal escribe en el repo el estado de la suite con nombres: primera ventana a CI (LES-031).

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016). Con el canal, los `.js` que se parchean ya pasan `node --check` antes del commit.

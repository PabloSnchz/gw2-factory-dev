# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-065 — propuesta de arquitectura para archivos grandes (canal de parches + manifiesto de módulos + archivos chicos). Sin código.
Motivo: Pablo validó la Armería al 100% (2026-10-23 18:46Z) y pausó BL-064 para resolver el límite de publicación de archivos grandes, que frena el crecimiento de la webapp.
Fase: F1 — Visibilidad
Etapa actual: ARCHITECTURE (propuesta para aprobación)
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 18:49Z
Próxima acción: con la aprobación de Pablo, registrar DEC-035 y empezar FP-1 (script de parches con tests locales, sin workflow todavía).

Micro-ciclo:
BL-065 — propuesta. HECHO.
Archivos:
- docs/propuestas/propuesta-archivos-grandes-bl065.md (c066e56)

Último hecho: propuesta publicada. Medición de DEV: 8 archivos de código, 3 de datos generados y 2 documentos ya pasan los ~64 KB que entran en una publicación; 6 más están entre 56 y 64 KB.
Recomendación: combinar las tres opciones en orden 1 → 3 → 2. Canal de parches por Actions (la llave; resultado escrito en el repo porque no leo CI), manifiesto de módulos para no volver a tocar index.html, y archivos chicos como regla de crecimiento (presupuesto ≤ 40 KB, trinquete en CI para los que pasan 48 KB, achicar al renovar cada módulo). No es una migración masiva.

Plan BL-065 (propuesto, espera aprobación):

1. FP-1 script apply-patch.cjs + tests locales.
2. FP-2 workflow factory-patch.yml, probado primero por el camino de error.
3. FP-3 prueba feliz sobre un archivo inofensivo.
4. FP-4 primer uso real: index.html carga js/boot.js + viewport-fit + BL-005.
5. FP-5 manifiesto js/modules.js con versión ?v=.
6. FP-6 test trinquete de tamaño + DEC-035 + LES.

Plan del restyle (BL-064, EN PAUSA desde 18:46Z):

1. Armería Legendaria: CERRADA en DEV y validada por Pablo al 100% (FEAT-010).
2. Cámara del Brujo (cuando vuelva BL-064; ya con la regla de achicar al pasar).
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
- BL-065: propuesta de arquitectura para archivos grandes, espera aprobación.

## Esperando a Pablo

- [BL-065] Decisión: aprobar la propuesta `docs/propuestas/propuesta-archivos-grandes-bl065.md`. Recomiendo combinar las tres opciones en orden 1 → 3 → 2 y registrarlo como DEC-035. Riesgo: medio, mitigado (ancla única, sha base, todo o nada, resultado escrito en el repo, solo DEV).
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [LES-028] El límite de ~64 KB es de cómo publico yo (cada archivo entero en una sola operación), no de GitHub. BL-065 propone cómo dejar de depender de él.
- [BL-064] Deuda conocida de la Armería (DEBT-ARM-3): el panel viejo de la cola y la barra «Modo:» del tracker se siguen pintando y se ocultan por CSS. Se limpian cuando se pueda tocar `legendary-tracker.js` (con el canal de BL-065).
- [BL-061] La zona segura del iPhone queda en 0 hasta que `index.html` pida `viewport-fit=cover` (lo resuelve FP-4 de BL-065).
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

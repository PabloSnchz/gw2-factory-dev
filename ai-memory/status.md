# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-065 CERRADA (FP-6 hecho: zonas de tamaño con trinquete en CI). BL-064 retomada: lo siguiente es la propuesta visual de la Cámara del Brujo.
Motivo: Pablo validó FP-5 y autorizó FP-6 (2026-10-23 22:55Z), con la orden de cerrar BL-065 al terminar y retomar BL-064 según el plan aprobado.
Fase: F1 — Visibilidad
Etapa actual: DOCUMENTATION
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 23:08Z
Próxima acción: BL-064 paso 2, la Cámara del Brujo. Primero CAM-0: propuesta visual pantalla por pantalla para que Pablo la apruebe, sin código. La implementación va en archivos nuevos de hasta 40 KB cargados por `js/modules.json`; `wv-purchase-detail.js` (89 KB, congelado) solo se achica.

Micro-ciclo:
FP-6 — presupuesto de tamaño de DEC-035 con test en CI. HECHO.
Archivos:
- tools/size-budget.cjs + tools/size-budget.json + tests/size-budget.test.cjs + tests/size-budget.smoke.cjs (e18170e; RUN-004 → OUT-004)
- ai-memory: DEC-035 con las zonas (c471531), LES-034 (efaa684), backlog e índice por el canal (PATCH-017)

Último hecho: el presupuesto de DEC-035 ya es exigible. `tests/size-budget.test.cjs` corre en cada push y en cada parche del canal. Las 4 zonas son: saludable (hasta 40 KB), advertencia (hasta 48 KB, registrada con motivo), congelado (más de 48 KB: no crece y su techo solo baja) y excepción (solo los 3 archivos de datos generados de la Armería). Línea base en CI (OUT-004): 71 archivos; 46 saludables, 3 en advertencia, 19 congelados, 3 excepciones; 0 errores. 14 de 14 mutaciones detectadas. Las listas son exactas: entrar o salir de una zona se registra en el mismo cambio. PATCH-016 lo rechazó el canal: al bloqueado BL-053 (dueño, la Factory) le escribí una mención a Pablo, y DEC-019 lo prohíbe; salió corregido en PATCH-017.

Plan BL-065 (aprobado por Pablo; DEC-035): CERRADA.

1. FP-1 script apply-patch.cjs + tests. VALIDADO.
2. FP-2 workflow factory-patch.yml + rechazos reales. VALIDADO.
3. FP-3 prueba feliz + lectura de la suite. VALIDADO.
4. FP-4 primer uso real: index.html carga js/boot.js + viewport-fit + BL-005. VALIDADO.
5. FP-5 primer módulo por js/modules.json + `?v` al día (RSK-020). VALIDADO.
6. FP-6 zonas de tamaño con trinquete en CI + LES-034. HECHO.

Plan del restyle (BL-064, RETOMADO 2026-10-23):

1. Armería Legendaria: CERRADA en DEV y validada por Pablo al 100% (FEAT-010).
2. Cámara del Brujo. SIGUIENTE (propuesta visual primero).
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
- BL-064: la Armería terminada y validada en DEV (FEAT-010). Retomada con la Cámara del Brujo.
- BL-065 cerrada: canal de parches, manifiesto de módulos y presupuesto de tamaño (DEC-035; LES-031 a LES-034).
- BL-066 cerrada: suite de DEV en verde; las 3 fallas eran mías (LES-032).
- BL-005 cerrada con el primer parche sobre `index.html` (FP-4).

## Esperando a Pablo

- [BL-065] Info: FP-6 no cambia nada visible en la Bóveda: es un control de CI. Si alguna vez un archivo crece de más, el push o el parche fallan con el motivo y qué hacer.
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-065] Zonas de hoy: 19 archivos congelados (el más grande, `api-gw2.js`, 129 KB; `welcome-panel.js` quedó congelado por 1 byte y sale con el próximo recorte); en advertencia `converter-modal.js`, `activities-theme.js` y `css/theme-polish.css`; excepciones, solo los datos generados de la Armería.
- [BL-065] Regla de LES-033: cuando subo la versión de un módulo, en el mismo cambio sube su `?v`, o el módulo vive en `js/modules.json`. El test `index-versions` lo exige en CI.
- [BL-065] El canal de parches solo corre en DEV, solo con pushes tuyos, y nunca puede tocar workflows ni a sí mismo. Guía: `factory/README.md`. El diagnóstico (`factory/diagnose/`) solo lee: corre tests y escribe la salida.
- [BL-066] Producción tiene la misma Cartera (`wallet-theme.js` 2.1.0, BL-056). El respaldo nunca se usa en la app real (Storage siempre está cargado), así que no hay efecto visible; la corrección queda en DEV hasta que decidas promoverla.
- [BL-064] Deuda conocida de la Armería (DEBT-ARM-3): el panel viejo de la cola y la barra «Modo:» del tracker se siguen pintando y se ocultan por CSS. Se limpian con el canal de parches.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016). Con el canal, los `.js` que se parchean ya pasan `node --check` antes del commit.

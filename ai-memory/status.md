# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-065 FP-5 HECHO — los `?v` de `index.html` al día (RSK-020 MITIGADO) y el primer módulo cargado desde `js/modules.json` (`wv-tabs-skin.js`, Cámara del Brujo). Espera la validación de Pablo en DEV.
Motivo: Pablo validó FP-4 y aprobó FP-5 (2026-10-23 22:01Z): primer módulo desde modules.json, inicio del desacople de `index.html`, corrección gradual de RSK-020 y compatibilidad con los módulos actuales.
Fase: F1 — Visibilidad
Etapa actual: DOCUMENTATION
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 22:22Z
Próxima acción: con la validación de Pablo, FP-6: test trinquete de tamaño (presupuesto de 40 KB; los de más de 48 KB no crecen) + LES. Después vuelve BL-064 con la Cámara del Brujo.

Micro-ciclo:
FP-5 — inventario de versiones, `?v` al día y primer módulo por el manifiesto. HECHO.
Archivos:
- tools/index-versions.cjs + tests/index-versions-tool.test.cjs + tests/index-versions.smoke.cjs (dae9ef9; RUN-002 → OUT-002)
- index.html + js/settings-manager.js + js/modules.json + tests/boot.test.cjs (PATCH-014 → RESULT-014); tests/index-versions.test.cjs (80bf7d2; RUN-003 → OUT-003)

Último hecho: el inventario en CI (OUT-002) encontró 14 `?v` desfasados en `index.html`. PATCH-013 lo rechazó el canal sin tocar nada: bajé el `?v` de `settings-manager.js` a 1.0.2 cuando el archivo ya era 1.0.4 y lo viejo era su cabecera (LES-033). PATCH-014 corrigió los 13 restantes y esa cabecera, y movió `wv-tabs-skin.js` de `index.html` a `js/modules.json`: lo carga `boot.js`. Suite verde antes y después. OUT-003: 45 de 48 al día y 0 desfasados; las 3 excepciones son conocidas (`item-icons.js` y `legendary-tree.js` sin versión en la cabecera, `analytics.js` sin `?v` por DEC-006). `tests/index-versions.test.cjs` no deja que se vuelvan a separar (9 de 9 mutaciones; la herramienta, 12 de 12). Documentación por el canal (PATCH-015): RSK-020 MITIGADO, BL-005 en DONE, BL-053 destrabado, LES-033.

Plan BL-065 (aprobado por Pablo; DEC-035):

1. FP-1 script apply-patch.cjs + tests. VALIDADO.
2. FP-2 workflow factory-patch.yml + rechazos reales. VALIDADO.
3. FP-3 prueba feliz + lectura de la suite. VALIDADO.
4. FP-4 primer uso real: index.html carga js/boot.js + viewport-fit + BL-005. VALIDADO.
5. FP-5 primer módulo por js/modules.json + `?v` al día (RSK-020). HECHO, espera validación.
6. FP-6 test trinquete de tamaño (40 KB) + LES. SIGUIENTE.

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
- BL-065: DEC-035; FP-1 a FP-4 validados; FP-5 hecho: `?v` al día y primer módulo por el manifiesto.
- BL-066 cerrada: suite de DEV en verde; las 3 fallas eran mías (LES-032).
- BL-005 cerrada con el primer parche sobre `index.html` (FP-4).

## Esperando a Pablo

- [BL-065] Validación: abrí DEV con Ctrl+F5 una última vez. Todo debería verse y andar igual que antes. De ahora en más, cuando cambie un archivo el navegador baja la versión nueva solo, sin Ctrl+F5 (como mucho, unos minutos después).
- [BL-065] Validación: en la Cámara del Brujo, los botones Diarias, Semanales, Especiales y Tienda tienen que verse igual que «Refrescar». Ese estilo ahora lo carga el manifiesto (`wv-tabs-skin.js`), no `index.html`. En la consola no aparece ningún error `[GNBoot]`.
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-065] Regla nueva (LES-033): cuando subo la versión de un módulo, en el mismo cambio sube su `?v`, o el módulo vive en `js/modules.json`. El test `index-versions` lo exige en CI. Por eso los módulos nuevos y los que renueve en BL-064 van al manifiesto: cambiarlos ya no toca `index.html`.
- [BL-065] Solo `wv-tabs-skin.js` pasó al manifiesto: es chico, no lo usa ningún otro módulo y arranca bien aunque cargue tarde. Los demás quedan en `index.html` hasta que los renueve.
- [BL-065] El canal de parches solo corre en DEV, solo con pushes tuyos, y nunca puede tocar workflows ni a sí mismo. Guía: `factory/README.md`. El diagnóstico (`factory/diagnose/`) solo lee: corre tests y escribe la salida.
- [BL-066] Producción tiene la misma Cartera (`wallet-theme.js` 2.1.0, BL-056). El respaldo nunca se usa en la app real (Storage siempre está cargado), así que no hay efecto visible; la corrección queda en DEV hasta que decidas promoverla.
- [BL-064] Deuda conocida de la Armería (DEBT-ARM-3): el panel viejo de la cola y la barra «Modo:» del tracker se siguen pintando y se ocultan por CSS. Se limpian con el canal de parches.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016). Con el canal, los `.js` que se parchean ya pasan `node --check` antes del commit.

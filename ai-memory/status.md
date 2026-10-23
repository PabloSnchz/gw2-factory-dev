# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-066 CERRADA — la suite de DEV está en verde (RESULT-011: «verde antes y después»). Lo siguiente es FP-4 (primer parche sobre `index.html`), según DEC-035.
Motivo: Pablo priorizó BL-066 antes de FP-4 (2026-10-23 19:58Z). El diagnóstico contradijo lo que le había dicho (que los módulos renovados no eran la causa): se lo informo antes de tocar `index.html`.
Fase: F1 — Visibilidad
Etapa actual: DOCUMENTATION
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 20:15Z
Próxima acción: FP-4 por el canal. Un parche sobre `index.html` (blob 3a9b2f1) que: 1) agrega `viewport-fit=cover`; 2) saca la segunda carga de `characters-theme.js` (BL-005); 3) carga `js/boot.js` (cargador de módulos nuevos, archivo nuevo y chico, publicado antes). La suite completa corre antes y después; luego validación visual de Pablo en DEV.

Micro-ciclo:
BL-066 — suite de DEV en verde. HECHO.
Archivos:
- js/wallet-theme.js 2.1.1 + tests/wallet-view.test.cjs (PATCH-010 → RESULT-010)
- ai-memory/lessons/LES-032 (006cbf8); backlog e índice por el canal (PATCH-011 → RESULT-011, ead2747)
- .github/workflows/factory-diagnose.yml + scripts (bfa5ac8)

Último hecho: suite de DEV en verde, confirmado en CI por el canal (RESULT-011). Las 3 fallas eran mías: un respaldo de `wallet-theme.js` (Cartera) que leía la lista de cuentas saltándose Storage (lo detectó idea61, 37 de 38) y dos reglas de formato que rompí en mi `status.md` de las 19:35Z. Ninguna era del legado (LES-032). El diagnóstico nuevo (`factory/diagnose/RUN-NNN.json` → `OUT-NNN.md`) da la salida completa de cualquier test en CI: RSK-016 queda mitigado.

Plan BL-065 (aprobado por Pablo; DEC-035):

1. FP-1 script apply-patch.cjs + tests. VALIDADO.
2. FP-2 workflow factory-patch.yml + rechazos reales. VALIDADO.
3. FP-3 prueba feliz + lectura de la suite. VALIDADO.
4. FP-4 primer uso real: index.html carga js/boot.js + viewport-fit + BL-005. SIGUIENTE.
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
- BL-065: DEC-035; FP-1, FP-2 y FP-3 validados; canal de parches operativo en DEV.
- BL-066 cerrada: suite de DEV en verde; las 3 fallas eran mías (LES-032).

## Esperando a Pablo

- [BL-066] Info: la causa no era el legado. Un respaldo de la Cartera nueva (`wallet-theme.js`, escrito por mí) leía la lista de cuentas saltándose Storage; corregido (2.1.1). En pantalla no cambia nada.
- [BL-065] Validación: FP-4 empieza con la suite en verde; lo próximo que vas a ver en DEV es el primer cambio a `index.html`.
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-066] Producción tiene la misma Cartera (`wallet-theme.js` 2.1.0, BL-056). El respaldo nunca se usa en la app real (Storage siempre está cargado), así que no hay efecto visible; la corrección queda en DEV hasta que decidas promoverla.
- [BL-065] El canal de parches solo corre en DEV, solo con pushes tuyos, y nunca puede tocar workflows ni a sí mismo. Guía: `factory/README.md`. El diagnóstico (`factory/diagnose/`) solo lee: corre tests y escribe la salida.
- [RSK-020] `index.html` pide versiones viejas de casi todos los scripts (por ejemplo `wallet-theme.js?v=1.3.1` cuando el archivo va por la 2.1.1): por eso a veces hace falta Ctrl+F5. Con el canal se puede corregir; lo dejo para FP-5, junto con el manifiesto.
- [BL-064] Deuda conocida de la Armería (DEBT-ARM-3): el panel viejo de la cola y la barra «Modo:» del tracker se siguen pintando y se ocultan por CSS. Se limpian con el canal de parches.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016). Con el canal, los `.js` que se parchean ya pasan `node --check` antes del commit.

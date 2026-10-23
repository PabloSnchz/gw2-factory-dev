# STATUS

Estado: EN CURSO
Tarea actual: BL-066 — recuperar la suite de DEV en verde antes de FP-4. Causa encontrada y corregida; falta la confirmación de la suite completa.
Motivo: Pablo validó FP-2 y FP-3 y priorizó BL-066 (2026-10-23 19:58Z): diagnosticar el fallo heredado, recuperar la suite verde, confirmar si los módulos renovados son la causa y dejar la línea base estable para el primer parche sobre `index.html`.
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 20:10Z
Próxima acción: confirmar con un parche chico que la suite completa queda en verde antes y después (RESULT «verde antes y después»); con eso, BL-066 cerrada y FP-4 según DEC-035.

Micro-ciclo:
BL-066 — suite de DEV en verde. EN CURSO.
Archivos:
- js/wallet-theme.js 2.1.1 + tests/wallet-view.test.cjs por el canal (PATCH-010 → RESULT-010, 31232e8)
- .github/workflows/factory-diagnose.yml + scripts (bfa5ac8): diagnóstico de tests en CI, solo lectura
- ai-memory/status.md (este archivo, vuelto al formato de DEC-019 y DEC-021)

Último hecho: diagnóstico completo. La suite de DEV tenía 3 fallas y las 3 eran mías, no heredadas:
1. `tests/idea61-claves-congeladas.test.js` (37 de 38): `js/wallet-theme.js` 2.0.0+ (Cartera, CAR-1, 2026-10-22) tenía un respaldo que leía `gn:account:keys` directo del navegador, saltándose el espejo de Storage. El test heredado lo prohíbe con razón. Corregido en 2.1.1: solo Storage; sin Storage, la pestaña no muestra número (PATCH-010, aplicado con node --check y sin romper ningún test nuevo).
2. y 3. `tests/ai-memory.test.cjs`: mi status de las 19:35Z rompió dos reglas de formato: una línea «Decisión (recomendada: sí):» sin la forma «Decisión:», y un manifiesto con 4 archivos (máximo 3). Corregido en este archivo.
Cómo lo vi: la Factory no lee CI (RSK-016). Sumé `factory-diagnose`: pido correr tests de `tests/` con `factory/diagnose/RUN-NNN.json` y la salida completa queda en `OUT-NNN.md`. RUN-001 mostró la aserción exacta.

Plan BL-065 (aprobado por Pablo; DEC-035):

1. FP-1 script apply-patch.cjs + tests. VALIDADO.
2. FP-2 workflow factory-patch.yml + rechazos reales. VALIDADO.
3. FP-3 prueba feliz + lectura de la suite. VALIDADO.
4. FP-4 primer uso real: index.html carga js/boot.js + viewport-fit + BL-005. Después de BL-066.
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
- BL-066: la suite en rojo era por 3 errores míos (Cartera y formato de status), no por el legado; corregidos.

## Esperando a Pablo

- [BL-066] Info: la causa no era el legado. Un respaldo de la Cartera nueva (`wallet-theme.js`, escrito por mí) leía la lista de cuentas saltándose Storage; ya está corregido (2.1.1). En pantalla no cambia nada.
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-066] Producción tiene la misma Cartera (`wallet-theme.js` 2.1.0, BL-056). El respaldo nunca se usa en la app real (Storage siempre está cargado), así que no hay efecto visible; la corrección queda en DEV hasta que decidas promoverla.
- [BL-065] El canal de parches solo corre en DEV, solo con pushes tuyos (de tu cuenta, que es la que uso), y nunca puede tocar workflows ni a sí mismo. Guía: `factory/README.md`. El diagnóstico (`factory/diagnose/`) solo lee: corre tests y escribe la salida.
- [LES-028] El límite de ~64 KB es de cómo publico yo, no de GitHub. Con el canal deja de frenar: un cambio pesa lo que el cambio, no lo que el archivo.
- [BL-064] Deuda conocida de la Armería (DEBT-ARM-3): el panel viejo de la cola y la barra «Modo:» del tracker se siguen pintando y se ocultan por CSS. Se limpian con el canal de parches.
- [BL-061] La zona segura del iPhone queda en 0 hasta que `index.html` pida `viewport-fit=cover` (lo resuelve FP-4).
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer CI, pero el canal escribe en el repo el estado de la suite con nombres y el diagnóstico deja la salida completa de cualquier test.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016). Con el canal, los `.js` que se parchean ya pasan `node --check` antes del commit.

# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-065 FP-4 HECHO — primer parche sobre `index.html` aplicado por el canal (PATCH-012 → RESULT-012, suite «verde antes y después»). Espera la validación visual de Pablo en DEV.
Motivo: Pablo autorizó FP-4 (2026-10-23, después de validar BL-066 y LES-032): viewport-fit=cover, sacar la carga duplicada de `characters-theme.js` (BL-005) e incorporar `boot.js` según DEC-035.
Fase: F1 — Visibilidad
Etapa actual: DOCUMENTATION
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 20:25Z
Próxima acción: con la validación de Pablo, FP-5: primer módulo real declarado en `js/modules.json` (sin tocar `index.html`) y, por el canal, corregir los `?v=` atrasados de `index.html` (RSK-020).

Micro-ciclo:
FP-4 — primer uso real del canal sobre `index.html`. HECHO.
Archivos:
- js/boot.js 1.0.0 + js/modules.json (vacío) + tests/boot.test.cjs (4842616)
- index.html + tests/index-identity.test.cjs (PATCH-012 → RESULT-012, commit del canal 2d8d554)

Último hecho: `index.html` (69 KB) cambió sin republicarse entero: un parche de 2,6 KB con 3 operaciones. Los blobs que dejó el canal (`d17e6e3`, `40a5426`) son idénticos a los que calculé antes de publicar. Cambios: 1) `viewport-fit=cover` en el viewport; 2) `characters-theme.js` se carga una sola vez (queda la carga con defer, junto a Personajes; BL-005); 3) `js/boot.js?v=1.0.0` como último defer. Test nuevo en index-identity: rojo contra el HTML viejo, verde contra el nuevo, 7 de 7 mutaciones detectadas. `boot.js`: 7 tests, 16 de 16 mutaciones.

Plan BL-065 (aprobado por Pablo; DEC-035):

1. FP-1 script apply-patch.cjs + tests. VALIDADO.
2. FP-2 workflow factory-patch.yml + rechazos reales. VALIDADO.
3. FP-3 prueba feliz + lectura de la suite. VALIDADO.
4. FP-4 primer uso real: index.html carga js/boot.js + viewport-fit + BL-005. HECHO, espera validación.
5. FP-5 primer módulo por js/modules.json + `?v=` al día (RSK-020).
6. FP-6 test trinquete de tamaño (40 KB) + LES.

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
- BL-065: DEC-035; FP-1, FP-2 y FP-3 validados; FP-4 hecho: primer parche real sobre `index.html`.
- BL-066 cerrada: suite de DEV en verde; las 3 fallas eran mías (LES-032).

## Esperando a Pablo

- [BL-065] Validación: abrí DEV con Ctrl+F5. La app carga igual que antes; Personajes conserva los bordes por profesión; en el iPhone la barra de abajo respeta la zona del gesto; en la consola no aparece ningún error `[GNBoot]`.
- [BL-065] Validación: en el iPhone, girá a horizontal en un par de pantallas. Con `viewport-fit=cover` la página puede llegar hasta el borde del notch; si algún contenido queda tapado, lo corrijo con márgenes de zona segura.
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-065] Desde ahora, sumar un archivo JS nuevo no requiere tocar `index.html`: alcanza con declararlo en `js/modules.json` y `boot.js` lo carga con su `?v=`. Hoy la lista está vacía: `boot.js` no carga nada todavía.
- [BL-065] El canal de parches solo corre en DEV, solo con pushes tuyos, y nunca puede tocar workflows ni a sí mismo. Guía: `factory/README.md`. El diagnóstico (`factory/diagnose/`) solo lee: corre tests y escribe la salida.
- [BL-066] Producción tiene la misma Cartera (`wallet-theme.js` 2.1.0, BL-056). El respaldo nunca se usa en la app real (Storage siempre está cargado), así que no hay efecto visible; la corrección queda en DEV hasta que decidas promoverla.
- [RSK-020] `index.html` pide versiones viejas de casi todos los scripts (por ejemplo `wallet-theme.js?v=1.3.1` cuando el archivo va por la 2.1.1): por eso a veces hace falta Ctrl+F5. Ahora que el canal funciona sobre `index.html`, lo corrijo en FP-5.
- [BL-064] Deuda conocida de la Armería (DEBT-ARM-3): el panel viejo de la cola y la barra «Modo:» del tracker se siguen pintando y se ocultan por CSS. Se limpian con el canal de parches.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016). Con el canal, los `.js` que se parchean ya pasan `node --check` antes del commit.

# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-069 — Promoción del ciclo de restyle a producción. HECHA (2026-10-24 15:21Z).
Motivo: Pablo validó BL-057, BL-058, BL-064 y BL-067 (2026-10-24 13:10Z) y aprobó la promoción a producción, plan A (15:04Z).
Fase: F1 — Visibilidad
Etapa actual: DOCUMENTATION
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-24 15:27Z
Próxima acción: esperar a Pablo. Él valida BL-069 en producción. Después sigue SHIRUVANA-ART-001, cuando él la abra; no empiezo BL-059 ni otro frente.

Micro-ciclo:
BL-069 — promoción del ciclo de restyle a producción (PRD-0 a PRD-9). HECHO.
Archivos:
- gw2-wallet-ligero: gn-surface, ach-view, ach-cards, ach-categories, ach-armory, wv-view 1.2.0, achievements 3.6.0, index.html, gn-frame y modules.json; achievements-theme.js borrado
- PATCH-035 (FEAT-007, 008, 011, 012 y 013, backlog, CHANGELOG-FACTORY), PATCH-036 (status) y ai-memory/missions/BL-069-informe-promocion.md

Último hecho: promoví a producción, por orden de Pablo, lo que faltaba del ciclo de restyle (BL-069): Logros, superficies y marco común, y `wv-view.js` 1.2.0 de la Cámara. 13 commits en serie con vuelta atrás en la rama `rollback/pre-restyle-ciclo`; cada blob igual al de DEV y `index.html` con el GA de producción intacto. `js/` de producción quedó igual a DEV salvo 4 archivos a propósito (`analytics.js`, `router.js`, `wallet-theme.js` y la cabecera de `settings-manager.js`). Antes, en DEV: con `js/gn-surface.js` la Cámara del Brujo, Logros y los siete paneles heredados tienen bandeja oscura, tarjeta elevada, pista, bordes y placa, calculadas desde el theme. En Gato Negro la bandeja es `#0f1117`, como en la maqueta. `js/gn-frame.js` da a Actividades, Raids y Strikes, Inventario y Personajes y Cuentas una cabecera común con el ícono oficial, la guarda AA en los 19 themes, foco visible, movimiento reducido y 44 px en el celular. No toqué ninguno de sus archivos congelados. RUN-017 y RUN-019 en verde; la suite local con el árbol de DEV, 106/106.

Plan del restyle:

BL-064 (cerrada y validada por Pablo, 2026-10-24 02:25Z):
1. Armería Legendaria: validada al 100% (FEAT-010). En producción (BL-068).
2. Cámara del Brujo: CAM-0 a CAM-6 validados (FEAT-011). En producción y validada (BL-068).

BL-067 (validada por Pablo el 2026-10-24 13:10Z; en producción con BL-069):
3. Logros (FEAT-012): LOG-0 a LOG-4 validados; LOG-5 hecho. CAM-POLISH-001 sumó la placa, el anillo dorado «A UN PASO» y la bandeja (FEAT-013).
4. Actividades: marco común (FEAT-013). Home Nodes sigue en BL-055.
5. Raids y Strikes: marco común (FEAT-013).
6. Inventario y Personajes: marco común (FEAT-013).
7. Cuentas: marco común (FEAT-013).
8. Marco común: `js/gn-surface.js` y `js/gn-frame.js` (FEAT-013).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET, WEL, SBR, CAM, LOG): en el backlog y en git (`ai-memory/status.md` hasta `27a4dd6`).

## Resumen de la sesión

- BL-069: el ciclo de restyle en producción (Logros, superficies y marco común; la Cámara al día). Informe: `ai-memory/missions/BL-069-informe-promocion.md`.
- BL-067 validada por Pablo: Logros (FEAT-012) y superficies y marco común (FEAT-013).
- BL-064 cerrada y validada: la Armería (FEAT-010) y la Cámara del Brujo (FEAT-011), en producción y validadas por Pablo (BL-068).
- BL-057, BL-058 y BL-061 cerradas: Metas, Bienvenida y Sidebar, en producción.
- BL-065 y BL-066 cerradas: canal de parches, manifiesto, presupuesto de tamaño y suite verde.
- SHIRUVANA-ART-001: obra «EVOLVING» entregada.

## Esperando a Pablo

- [BL-069] Validación: abrí producción con recarga completa (Ctrl+F5) y recorré Logros (cabecera, tres pestañas, tarjetas con el ícono oficial grande y anillo dorado en los que están a un paso; la barra lateral ya sin el panel viejo de Logros), la Cámara del Brujo y Actividades, Raids, Strikes, Inventario, Personajes y Cuentas con la cabecera común. Probá también un theme claro (Notion o macOS). Si algo no va, la vuelta atrás es la rama `rollback/pre-restyle-ciclo`; para quitar solo el marco común, sacar `js/gn-frame.js` de `js/modules.json`.
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-067] Regla de Pablo: el ícono oficial de cada logro y de cada módulo se queda destacado; nunca se oculta ni se achica. Lo vigilan `tests/ach-cards.test.cjs`, `tests/gn-surface.test.cjs` y `tests/gn-frame.test.cjs`.
- [BL-067] Deudas anotadas (BAJO): algunos colores fijos en línea de los archivos heredados (el contador de LI de Raids y Strikes, `typeColor` en `raid-tracker.js`) no pasan por la guarda; la voz de Shiruvana no llega a los módulos heredados porque no publican sus datos (LES-006). Detalle en FEAT-013.
- [BL-067] En One Dark y Everforest la pista de las barras queda más suave (1.15 y 1.33) para que el texto siga en AA. Es a propósito.
- [BL-064] Deuda registrada (DEBT-CAM-1): la Tienda, Objetivos semanales y Compras fijadas siguen leyendo la lista de cuentas desde la clave vieja `gw2_keys` (lectura tolerada que vigila idea61).
- [BL-065] Regla de LES-033: cuando subo la versión de un módulo, en el mismo cambio sube su `?v`, o el módulo vive en `js/modules.json`. El test `index-versions` lo exige en CI.
- [BL-065] El canal de parches solo corre en DEV, solo con pushes tuyos, y nunca puede tocar workflows ni a sí mismo. Guía: `factory/README.md`.
- [BL-068] En producción `router.js` sigue en 2.17.0; su limpieza (2.18.0) queda en DEV. La rama `promo/camara-armeria` se puede borrar.
- [BL-069] Producción conserva a propósito `router.js` 2.17.0, `wallet-theme.js` 2.1.0, la cabecera vieja de `settings-manager.js` y su GA (DEC-006). La rama `rollback/pre-restyle-ciclo` se puede borrar cuando valides.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016). Con el canal, los `.js` que se parchean ya pasan `node --check` antes del commit.

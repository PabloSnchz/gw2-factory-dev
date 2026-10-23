# STATUS

Estado: EN CURSO
Tarea actual: BL-061 — SBR-4: mi rincón al pie de la Sidebar (desktop) y de la hoja «Más» (celular), según DEC-034.
Motivo: Pablo (13:21Z) pidió seguir con SBR-4.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 13:24Z
Próxima acción: SBR-4a (`sidebar-nav.js` 2.2.1, arranque) y después SBR-4b (`shiruvana-places.js` 1.3.0, el rincón).

Micro-ciclo (en curso):
SBR-4 en dos pasos.
- SBR-4a — hallazgo de la revisión: con `defer`, `sidebar-nav.js` arranca antes de que exista la Bienvenida (se carga después en `index.html`). La tarjeta y los avisos se arreglan con el `gn:tokenchange` que emite app.js, pero «Nuevo» no aparece nunca y la guarda de contraste no se aplica hasta cambiar de theme. Afecta también a producción. Arreglo: arrancar en DOMContentLoaded, cuando ya cargaron todos.
- SBR-4b — el rincón (DEC-034): avatar de 48 px, «Shiruvana», una línea con el estado de la Bóveda (cuántas cosas hay para revisar, «Todo en orden» o «Empezá por tu API Key») y como mucho un enlace a Inicio. Uno solo visible por pantalla. Nada de horarios, eventos, metas ni contenido de módulos.
Archivos:
- js/sidebar-nav.js
- tests/sidebar-nav.test.cjs
- ai-memory/status.md

Último hecho: SBR-3 publicado en DEV (07:36Z).

Plan BL-061 (Sidebar), aprobado:

- SBR-1 Sidebar desktop. Hecho, validado y en producción.
- SBR-2 Cuenta activa, «Falta permiso», «Nuevo». Hecho, validado y en producción.
- SBR-3 Celular: barra fija abajo + «Más». Publicado en DEV.
- SBR-4 Rincón de Shiruvana (DEC-034). En curso.
- SBR-5 Revisión y cierre (FEAT-009).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET, WEL): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `86afe37`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado (FEAT-007), en producción.
- BL-058 cerrada: Bienvenida, la puerta de entrada de la Bóveda (FEAT-008), en producción.
- BL-061: SBR-1 y SBR-2 en producción; SBR-3 en DEV; SBR-4 en curso.

## Esperando a Pablo

- [BL-061] Validación: abrí DEV en el celular (o el navegador angosto, menos de 900 px) con recarga completa. Abajo tiene que aparecer la barra con Inicio, Cartera, Metas, Armería y «Más»; «Más» abre la hoja con tu cuenta y los otros 6 módulos, y se cierra con «Cerrar», tocando afuera o eligiendo uno.
- [BL-062] Validación: abrí producción con Ctrl+F5 y revisá Inicio (Bienvenida con «Shiruvana te guía»), Metas y Eventos (cabecera nueva, «Hoy en tu cuenta») y la Sidebar a la izquierda con «Cuenta activa». Si algo no va, la vuelta atrás es la rama `rollback/pre-meta-welcome-sidebar`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-061] La zona segura del iPhone queda en 0 hasta que `index.html` pida `viewport-fit=cover` (no lo toco: LES-028); la barra igual deja su margen normal y no tapa nada.
- [BL-062] En producción la Bienvenida suma una clave nueva en el navegador de cada usuario: `gn:global:welcome` (último módulo, visitas y fecha de la última copia).
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-061 — SBR-1 publicado: la Sidebar a la izquierda en desktop, con Inicio y los módulos de la Bienvenida. Esperando la validación de Pablo antes de SBR-2.
Motivo: Pablo (06:37Z) aprobó la propuesta SBR-0, eligió la Sidebar a la izquierda y aprobó mi rincón global (DEC-034).
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 06:46Z
Próxima acción: con la validación de Pablo, SBR-2: tarjeta de cuenta activa con el estado de la Key, «Falta permiso» y «Nuevo» en los enlaces; se retiran «Próximas funciones» y «Próximos (Top 3)».

Micro-ciclo (cerrado):
SBR-1 — `sidebar-nav.js` 2.0.0 y su test en un commit (`24b13dd`, blobs 7a9cf59 y ce9f540, iguales a los locales). DEC-034 publicada antes (`782e5d0`).
Archivos:
- js/sidebar-nav.js
- tests/sidebar-nav.test.cjs
- ai-memory/decisions/DEC-034-rincon-global-de-shiruvana.md

Último hecho: SBR-1 en DEV. Desde 901 px la Sidebar va a la izquierda (252 px, fija al hacer scroll); Inicio primero, los 8 módulos con el orden, nombre, ícono y color de la Bienvenida y Cuentas aparte; el activo lleva la barra del color del módulo; la guarda de contraste de la Bienvenida también corre en la Sidebar. Mismos ids de enlace que usa el router. Corregido el oyente que se acumulaba y el activo en rutas internas. 15 tests, 20/20 mutaciones. `index.html` sigue pidiendo `sidebar-nav.js?v=1.2`: hace falta Ctrl+F5 (RSK-020).

Plan BL-061 (Sidebar), aprobado:

- SBR-1 Sidebar desktop. Hecho; espera validación.
- SBR-2 Cuenta activa con estado de la Key, «Falta permiso», «Nuevo»; salen los paneles viejos.
- SBR-3 Celular: barra fija abajo + «Más».
- SBR-4 Rincón de Shiruvana (DEC-034).
- SBR-5 Revisión y cierre (FEAT-009).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET, WEL): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `86afe37`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado (FEAT-007).
- BL-058 cerrada: Bienvenida, la puerta de entrada de la Bóveda (FEAT-008).
- BL-061 aprobada (Sidebar a la izquierda, DEC-034): SBR-1 publicado.

## Esperando a Pablo

- [BL-061] Validación: abrí DEV con Ctrl+F5 en una pantalla ancha. La navegación tiene que estar a la izquierda, con Inicio arriba y la barra de color en el módulo donde estás; al bajar, la Sidebar se queda fija. En el celular todavía se ve como antes (eso es SBR-3).
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-058] La Bienvenida queda en DEV; pasarla a producción lo decidís vos.
- [BL-057] Metas y Eventos queda solo en DEV: pasarlo a producción lo decidís vos.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

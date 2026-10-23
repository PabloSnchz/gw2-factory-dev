# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-061 — SBR-2 publicado: tarjeta «Cuenta activa» con el estado de la Key, «Falta permiso» y «Nuevo» en los enlaces; se ocultan «Próximas funciones» y «Próximos (Top 3)».
Motivo: falta la validación visual de Pablo antes de SBR-3.
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 07:20Z
Próxima acción: con la validación de Pablo, SBR-3 (celular: barra fija abajo con Inicio, Cartera, Metas, Armería y «Más»; hoja con foco atrapado, Escape y safe-area).

Micro-ciclo (cerrado):
SBR-2 — `sidebar-nav.js` 2.1.0, commit `d92f477` (blobs 8934573 y ed9b778, iguales a los locales). «Gato identificado» pasa a «Cuenta activa»: nombre de la cuenta, estado de su Key (completa, le falta un permiso, le faltan N, sin verificar o sin Key) y «Cambiar», que lleva al selector de arriba («Empezar» si no hay Key). Punto ámbar «Falta permiso» (con texto para el lector de pantalla) en los módulos que la Key activa no alcanza, con los mismos datos que «Tu Bóveda». «Nuevo» en los módulos con una novedad de 14 días o menos. «Próximas funciones» y «Próximos (Top 3)» ocultos; el panel de Logros sigue. Sin pedidos nuevos a la API. Tests: 22/22. Mutaciones: 21/21 en lo nuevo y 19/19 en lo de SBR-1.
Archivos:
- js/sidebar-nav.js
- tests/sidebar-nav.test.cjs
- ai-memory/status.md

Último hecho: SBR-2 publicado (`d92f477`).

Plan BL-061 (Sidebar), aprobado:

- SBR-1 Sidebar desktop. Hecho y validado.
- SBR-2 Cuenta activa, «Falta permiso», «Nuevo»; salen los paneles viejos. Publicado, espera validación.
- SBR-3 Celular: barra fija abajo + «Más».
- SBR-4 Rincón de Shiruvana (DEC-034).
- SBR-5 Revisión y cierre (FEAT-009).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET, WEL): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `86afe37`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado (FEAT-007).
- BL-058 cerrada: Bienvenida, la puerta de entrada de la Bóveda (FEAT-008).
- BL-061 aprobada (Sidebar a la izquierda, DEC-034): SBR-1 validado, SBR-2 publicado.

## Esperando a Pablo

- [BL-061] Validación: abrí DEV con Ctrl+F5 (index.html sigue pidiendo sidebar-nav.js?v=1.2). Arriba de la Sidebar está «Cuenta activa» con el nombre de tu cuenta, el estado de tu Key y «Cambiar»; los módulos que tu Key no alcanza tienen un punto ámbar y los que tienen novedad reciente dicen «Nuevo»; ya no aparecen «Próximas funciones» ni «Próximos (Top 3)».
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-058] La Bienvenida queda en DEV; pasarla a producción lo decidís vos.
- [BL-057] Metas y Eventos queda solo en DEV: pasarlo a producción lo decidís vos.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).

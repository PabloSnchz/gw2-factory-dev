# DEC-030 — El Gist queda deprecado; el respaldo va a una nube que el jugador ya tiene

- Estado: ACEPTADA — decisión de producto de Pablo (2026-10-22 15:48Z); el camino técnico lo propone la Factory
- Fecha: 2026-10-22
- Ámbito: gw2-factory-dev (`js/gist-sync.js`, `js/settings-manager.js`, la pantalla del Gist en `index.html`)
- Relacionadas: DISC-009, BL-054, LES-029, LES-028

## Contexto

La Bóveda tiene dos formas de respaldo: el archivo («Backup» y «Restaurar», `SettingsManager.exportAll` e `importAll`) y la sincronización con un GitHub Gist (`gist-sync.js`). Del legado llegó una idea para completar el Gist: un botón que restaure la foto de seguridad que se saca antes de cada descarga (DISC-009, versión original).

Pablo respondió que el Gist ya estaba decidido como deprecado:

- nunca se logró que levantara el respaldo de verdad;
- casi ningún jugador de La Bóveda tiene cuenta de GitHub.

Prefiere un respaldo contra nubes populares, como Google Drive o iCloud, que cualquier jugador ya tiene por su celular.

## Decisión

1. **El Gist queda deprecado.** No se invierte más en él: no hay botón de restaurar la foto, y BL-054 (deuda del import del Gist) se cierra. De todos modos ya estaba resuelta en DEV.
2. **El respaldo de La Bóveda es el archivo**, y se lleva a la nube en dos etapas (DISC-009):
   - **Etapa 1, «Guardar copia en…»**: el mismo archivo, entregado con el menú Compartir del sistema. Sirve para Drive, iCloud (Archivos) o lo que el jugador tenga, sin cuentas nuevas. Si no hay menú (PC), se descarga como hoy.
   - **Etapa 2, sincronización con Google Drive** en la carpeta oculta de la app (`appDataFolder`, alcance `drive.appdata`). Necesita un proyecto de Google Cloud de Pablo, así que espera su decisión.
   - **iCloud directo no se hace**: CloudKit JS exige una app nativa de Apple y la membresía del Apple Developer Program.
3. **El Gist sale de la pantalla junto con la etapa 1**: el botón nuevo ocupa su lugar. Antes de quitarlo, la pantalla avisa una vez a quien lo tenga configurado y le ofrece guardar una copia en archivo, para que nadie pierda su respaldo. El código y sus tests se retiran en el mismo micro-ciclo, con un test que pruebe que el aviso aparece.

## Consecuencias

- Menos superficie: se retira un módulo de 22,9 KB con su token de GitHub guardado en el navegador.
- El respaldo deja de depender de una cuenta que el jugador no tiene.
- La pantalla del Gist vive en `index.html` (69 KB, LES-028): el cambio se monta desde un `.js`, como el resto de los cambios de pantalla.

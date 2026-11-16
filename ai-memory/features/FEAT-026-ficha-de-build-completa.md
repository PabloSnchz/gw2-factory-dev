# FEAT-026 — La ficha de build completa: equipo, rasgos como en el juego, notas y cómo se juega

- Estado: LISTA PARA EVALUAR EN DEV — EQ-1 a EQ-10 hechos (cierre técnico 2026-11-16 00:10Z). Producción: solo si Pablo lo pide.
- Backlog: BL-084 · Plan y avance: docs/propuestas/BL-084-ficha-equipo-y-notas.md · Maquetas: docs/propuestas/bld2-maqueta.html, bld2-biblioteca.html · Decisiones: DEC-046 (datos sí, textos de guías no), DEC-047 (no invento rotaciones)
- Archivos: js/bld-items.js 1.0.1, js/bld-sheet.js 1.6.0, js/bld-rows.js 1.0.0, js/bld-gearview.js 1.0.0, js/bld-traitview.js 1.0.1, js/bld-notes.js 1.1.0, js/bld-play.js 1.2.0, js/bld-ae2.js 1.1.0, js/bld-import.js 1.1.0, js/bld-editor.js 1.4.0, js/bld-lib.js 1.9.0, js/bld-mine.js 1.5.0, js/bld-view.js 1.6.1, js/bld-ref.js 1.3.0, js/modules.json; datos assets/data/builds/gear.json (96 builds de Snow Crows, ids oficiales) y assets/data/builds/notes.json (104 notas: 36 PvE, 36 WvW, 32 PvP)
- Tests: tests/bld-sheet, bld-gearview, bld-traitview, bld-notes, bld-play, bld-items, bld-ae2, bld-mods (Importar), bld-editor, bld-ui y la guarda final tests/bld-eq10.test.cjs (contraste AA en los 19 temas de toda mezcla de color de la ficha, letra mínima, foco, controles nativos, ficha de las 104 builds en menos de 200 ms, topes de gear.json y notes.json). Guardianes con red: tests/bld-notes-refs-{pve,wvw,pvp}.smoke.cjs.

## Qué hace

- Cada build de la Biblioteca tiene su ficha en su propia pantalla (#/builds/ver/<id>): «← Biblioteca» (vuelve con los mismos filtros y el foco), camino modo · profesión · élite y anterior/siguiente sobre lo filtrado. Las de Mis builds, igual (#/builds/ver/m:<id>) con nombre y notas, Editar, Duplicar y Borrar.
- **Equipo** como Snow Crows: armadura, abalorios y reliquia (o amuleto en PvP), armas por juego con sus sigilos y «Otros»; íconos oficiales con su rareza y la descripción oficial en castellano con cursor, toque o Tab (Escape la cierra).
- **Rasgos y habilidades** como en el juego: barra de armas y habilidades con sus teclas, mecánica F1–F5 cuando hay una sola opción, las 3 líneas con su fondo oficial y el rasgo elegido encendido, guía de teclas.
- **Notas de Shiruvana** (con mis palabras, sobre la descripción oficial): habilidades, rasgos, equipo y reliquia en desplegables, y **Cómo se juega** con conceptos y control. Sin rotaciones inventadas: la ficha enlaza la de la guía. En WvW y PvP, aviso de que los valores de la API son de PvE.
- **Copiar AE2 (Alter Ego)** con el equipo real: estadísticas, runa, reliquia, armas y sigilos (en PvP, solo armas y sigilos).
- **Importar** y **Editor** muestran la misma ficha (Importar reconoce las builds de la Biblioteca y trae su equipo).
- La Biblioteca pasó a filas agrupadas por profesión y élite, con DPS y una sola barra de filtros.

## Pasos

EQ-1 equipo (gear.json) · EQ-2 referencias en castellano · EQ-3 ficha en su ruta · EQ-3b Biblioteca en filas y Mis builds · EQ-4 equipo · EQ-5 rasgos y habilidades · EQ-6 desplegables de notas · EQ-7 cómo se juega · EQ-8 las 104 notas (PvE, WvW, PvP) · EQ-9 AE2 real, Importar y Editor con la misma ficha (PATCH-356 a 361) · EQ-10 revisión final (RUN-284 a 287, PATCH-362, guarda bld-eq10).

## Revisión (EQ-10)

- ARREGLADO (ALTO): la banda de habilidades tenía un tinte de la profesión del 26 % y el texto no llegaba a 4.5:1 en catppuccin, everforest y one-dark (12 combinaciones, peor 3.36). Bajó a 14 % (peor 4.63) en bld-traitview 1.0.1; la guarda falla si vuelve a subir.
- Rendimiento: la ficha de las 104 builds se arma en ~11 ms en total (la más lenta 1,6 ms). notes.json pesa 212,7 KB y se pide recién al abrir una ficha (se parsea en 0,3 ms); gear.json 30,7 KB.
- BAJO: en una propia, el equipo y el AE2 son los de su build de base aunque se haya cambiado el código.
- BAJO: si el portapapeles falla, el AE2 no se puede copiar a mano (el aviso lo dice).
- BAJO: un AE2 importado no se cruza con la Biblioteca; en el Editor la barra de armas sale del código.
- BAJO: la API publica valores de PvE; en PvP las notas no dan segundos ni recargas (gw2-api#40).
- Pendiente de ojo humano: la vista en el navegador (no tengo navegador): Pablo valida en DEV.

## Aprendizajes

- LES-045: un módulo con versión fijada en tests se publica con sus tests en el mismo parche.
- El contraste de toda mezcla de color nueva se calcula contra los 19 temas antes de cerrar (LES-013 seguía valiendo: bld-ui medía solo las mezclas de la Biblioteca y el Editor; la guarda de EQ-10 mide las de la ficha).

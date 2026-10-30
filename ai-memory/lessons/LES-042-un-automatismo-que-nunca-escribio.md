# LES-042 — Un automatismo que nunca escribió no está probado

- Fecha: 2026-10-30
- Tarea: BL-082 CUR-1

## Qué pasó

La vigía de builds (BLD-10, 2026-10-28) buscaba «up to date for the September 15, 2026 patch» en el HTML crudo de MetaBattle. La página real lo parte con etiquetas y espacios («the <b> September 15, 2026 </b> patch»): la vigía nunca habría leído un parche. watch.json seguía con «manual (curación inicial)»; nadie lo notó porque «sin parche nuevo» y «no pude leer» se ven igual. Lo encontré al mirar el HTML real para CUR-1 (RUN-215).

## Qué aprendí

- Un lector de páginas se escribe contra una muestra real del HTML (sonda por diagnóstico), no contra el texto que veo en el navegador. Las etiquetas y espacios se quitan antes de buscar.
- Antes de dejar un automatismo solo, una prueba en seco contra las fuentes reales (CURATE_DRY) que compare con datos ya curados: el bench leído coincidió fila por fila con el de BENCH-1.
- Si un automatismo no puede leer, tiene que decirlo (resumen en Actions y lista `catalog.review`), no callarse como si no hubiera novedades.

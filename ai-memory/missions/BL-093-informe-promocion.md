# BL-093 — Informe del pasaje a producción de BL-092 (FEAT-028)

- Fecha: 2026-11-18 03:42Z (Pablo corrió la línea de PowerShell; vía PowerShell, DEC-036)
- Pedido: Pablo, 2026-11-18 03:27Z («quedó muchísimo mejor, cerrá BL-092 y prepará todo para pasar a PRD vía PowerShell»)
- Manifiesto: factory/promote/BL-093.txt (14 copias, 0 bajas)
- DEV fijo: f2f72e07793e212d530f9cdb8a20ca5b4c703b37
- Producción antes: 6dca6a951884bdcd6e34005f13ac46d15ddc4b28 (bot builds-watch del 2026-11-16)
- Producción ahora: 987fad7f8f236dd283dcf22124158ea3cfe185dc (un solo commit, padre 6dca6a9)
- Vuelta atrás: rama rollback/pre-bl-093 = 6dca6a9 (verificada)

## Lo que mostró el script

`Movimientos en el manifiesto: 14 | archivos cambiados en PRD: 14 | distintos: 0` → Pablo escribió SI.

## Control (RUN-302, sonda borrada en 9147920)

| Archivo | PRD | DEV |
|---|---|---|
| js/escena-kit.js | 1b317c7 | igual |
| css/escena-kit.css | fbbf4e7 | igual |
| css/universo.css | 6af1e63 | igual |
| assets/brand/gato/gato-sentado.webp | bc90056 | igual |
| assets/brand/gato/gato-festeja.webp | d7acfa9 | igual |
| assets/brand/gato/gato-camina.webp | 8b51da1 | igual |
| assets/brand/shiruvana/cuerpo-saluda.webp | a00e22c | igual |
| assets/brand/shiruvana/cuerpo-pensando.webp | b8abbaf | igual |
| assets/brand/shiruvana/cuerpo-sentada.webp | 85a61a9 | igual |
| css/themes/gato.css | 7d06fb2 | igual |
| js/theme-selector.js | 671bb7c | igual |
| js/shv-bubble.js | 3795474 | igual |
| js/modules.json | 3247fca | igual |
| index.html | 82c1c91 | igual |

- Manifiesto: 14/14 iguales a DEV. Cambios fuera del manifiesto: 0.
- Intactos (versión PRD): js/analytics.js, assets/meta-drops.json, assets/data/builds/watch.json, .github/workflows/github-metrics-to-ga4.yml.
- GitHub Pages de PRD: «pages build and deployment» de 987fad7, success (03:42:29Z).
- Sitio publicado (pablosnchz.github.io/gw2-wallet-ligero): index.html pide universo.css?v=1.5.0 y gato.css?v=2.0.0, theme-color #0B0B10; sirve universo.css 1.5.0, gato.css 2.0.0, theme-selector.js 1.3.0 y escena-kit.js.

## Validación en PRD (Pablo, en Chrome)

1. Abrir https://pablosnchz.github.io/gw2-wallet-ligero/ con el theme Gato Negro (recargar una vez).
2. Fondo «Taller» con chispas; barra de arriba y lateral oscuras.
3. Paneles oscuros con el color del módulo solo en el borde de arriba (Cartera, Metas, Cámara, Raids, Logros…), sin el verde agua de la Cámara.
4. Antetítulo de grupo arriba de cada título y cifras en ámbar.
5. Mi globo con el gato abajo a la derecha, plegado; se abre con algo nuevo.
6. Inicio: mi pose saludando; Cuentas sin cuentas o Compras fijadas vacías: pensando.
7. Con otro theme, todo como antes.

Con el OK de Pablo: BL-093 a DONE y FEAT-028 a «DISPONIBLE EN PRD».

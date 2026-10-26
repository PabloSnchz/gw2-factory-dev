# BL-073 — Informe final: promoción de BL-070 y BL-071 a producción

- **Fecha:** 2026-10-26
- **Pedido:** Pablo, 15:18Z: «llevar a PRD todo lo que estuvimos desarrollando, desde la Armería en adelante». Propuesta PRM-0 (15:30Z); a las 16:56Z eligió hacerlo **vía PowerShell** (yo preparo, él ejecuta, yo controlo) con D2 a D4 como recomendé.
- **Ejecución:** Pablo, 2026-10-26 17:37Z, con `factory/promote/promote.ps1` y el manifiesto `factory/promote/BL-073.txt`, desde DEV `cc5ae6b20c29443028da9c8a9c225cd0f7c123f1`.
- **Resultado:** HECHO. Producción = `3dbcee8ed19e8770230365223852622577fa9121` (un solo commit sobre `0b60eee`). Espera la validación de Pablo en producción.
- **Vuelta atrás:** rama `rollback/pre-bl-073` = `0b60eee` (verificada en GitHub).

## 1. Qué subió

67 movimientos, los mismos del manifiesto (el script informó «67 | 67 | distintos: 0»):

| Tipo | Cant. | Detalle |
|---|---|---|
| JS nuevos | 22 | `acc-*` (5), `act-*` (4), `inv-*` (6), `home-*` (2), `raids-*` (2), `gn-shell`, `gn-ui`, `gn-topbar` |
| JS modificados | 10 | `app`, `boot` (tope 40 módulos), `gn-frame`, `modules.json`, `router`, `settings-manager`, `shiruvana-places`, `sidebar-nav`, `wallet-theme` 2.1.1 (D2), `welcome-panel` |
| Datos | 19 | `assets/data/` accounts, activities, homestead, inventory, raids (+ 8 mechanics), `inventory-sets.json`; `assets/brand/pablo-bio.svg` |
| Páginas | 4 | `index.html` (el de DEV tal cual: GA `G-LB782QT9TR` condicionado al host de producción, DEC-006), `privacy.html`, `docs/user-guide.html`, `docs/user-guide-avanzado.html` |
| Bajas | 12 | `accounts-panel`, `activities`, `activities-theme`, `characters`, `characters-theme`, `fractal-tracker-theme`, `gist-sync`, `inventory-dashboard`, `inventory-hub`, `strike-tracker`; `docs/PRIVACIDAD.md`, `docs/user-guide-avanzado.md` |

No se tocaron (D4): `js/analytics.js` (difiere de DEV solo por el BOM), `assets/meta-drops.json` (versión de producción a propósito), `css/`, `assets/icons`, `assets/gifanim`, README, CHANGELOG, docs internos, `tests/`, `tools/`, `factory/`, `ai-memory/`, `assets/previews`. D3: la clave vieja `accounts:lastFile` queda en el navegador; se limpia después desde DEV.

## 2. Control independiente (PRD-5)

Comparado por la API de GitHub, en `3dbcee8` contra DEV:

- `js/`: mismos 70 nombres que DEV; todos los blobs iguales salvo `analytics.js` (BOM, esperado). Muestras: `router.js` `7ec9d84`, `modules.json` `cddf8b9`, `gn-frame.js` `f8ed6bd`, `wallet-theme.js` `0c588de`, `welcome-panel.js` `4395acf`, `sidebar-nav.js` `0d512e3`.
- `assets/data/`: árbol `dc0106a`, idéntico a DEV. `assets/brand/`: árbol `481c50e`, idéntico.
- `css/`: árbol `84dfc06`, idéntico.
- `index.html` `4aba215`, `privacy.html` `a29d210`, `docs/user-guide.html` `1698702`, `docs/user-guide-avanzado.html` `3825244`: iguales a DEV.
- Las 12 bajas ya no existen en producción.
- Rutas: todo `assets/` que pide el código de DEV existe en producción (sonda RUN-125).

## 3. Riesgos

| Riesgo | Nivel | Cómo quedó |
|---|---|---|
| Cambio de todo el sitio | ALTO | Un solo commit: no hubo ventana con mezcla de versiones. Vuelta atrás con la rama |
| Saltos de línea en Windows | MEDIO | `core.autocrlf=false` y control blob a blob: 0 distintos |
| Caché del navegador | BAJO | `?v` al día; validar con Ctrl+F5 (RSK-020) |
| Clave `accounts:lastFile` | BAJO | Queda sin uso; limpieza posterior (D3) |

## 4. Vuelta atrás

```powershell
cd $env:USERPROFILE\gw2-promo\prd; git reset --hard rollback/pre-bl-073; git push --force origin main
```

## 5. Validación para Pablo (producción)

Abrir https://pablosnchz.github.io/gw2-wallet-ligero/ con Ctrl+F5 (esperar 1 o 2 minutos a que Pages publique):

1. Barra superior nueva y pie con el aviso de ArenaNet, la leyenda no oficial, Privacidad y tu Link in Bio.
2. Sidebar en el orden nuevo e Inicio con el ícono nuevo.
3. Raids, Inventario (Multicuenta incluida), Actividades y Heredad: pantallas nuevas.
4. Cuentas: «Mis cuentas» y el Llavero abriendo tu `.enc` de siempre.
5. Ventanas: Keys, Guías, conversor y themes con la piel nueva; Esc cierra.
6. Guías y Privacidad desde la ventana «Guías» y desde el pie.
7. Un theme claro (Notion o macOS): todo se lee.

## 6. Lo que sigue

Con la validación de Pablo: BL-073 a DONE y DEC-036 ACEPTADA. Después, la limpieza de `accounts:lastFile` (D3) y lo que Pablo elija (READY: BL-060).

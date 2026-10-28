# RESULT de PATCH-266

- Fecha: 2026-10-28T04:31:44.934Z
- Estado: RECHAZADO
- Resumen: BL-082 BLD-1: la Sidebar suma Builds (#/builds) antes de Cuentas, también en «Más» del celular. welcome-panel.js no tiene lugar (48 KB), así que la entrada vive en sidebar-nav.js 2.3.0 (EXTRA).

Ningún archivo cambió. Motivo:

- la suite de tests pasaba y con el parche falla (4 fallas: tests/sidebar-nav.test.cjs: versión 2.2.6, tests/sidebar-nav.test.cjs: arma la Sidebar: Inicio, los 9 módulos en el orden de la Bienvenida y Cuentas aparte, tests/sidebar-nav.test.cjs: mismos ids y data-view que antes: el router y los demás módulos no cambian, tests/sidebar-nav.test.cjs: celular: la hoja «Más» es un diálogo con la cuenta activa y los otros 7 destinos)

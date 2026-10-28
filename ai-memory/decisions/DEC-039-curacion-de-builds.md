# DEC-039 — Curación de builds: fuentes, vigencia y carga por ruta

- Fecha: 2026-10-28
- Decide: Shiruvana (Pablo delegó las decisiones técnicas de BL-082, 03:58Z)
- Tarea: BL-082

## Decisión

1. **Fuentes**: Snow Crows primero (robots permite, código en la página), MetaBattle para huecos de WvW (robots solo prohíbe index.php?). Se guardan solo datos factuales (élite, modo, rol, armas, código, fechas) con crédito y enlace; ni textos, ni guías, ni imágenes. Si una fuente pide retirar algo, se retira.
2. **Sin scraping en el navegador**: la curación corre en CI (diagnose) con User-Agent identificado y pausas; el navegador solo lee catalog.json del propio sitio.
3. **Vigencia honesta**: `patch` = parche que la fuente declara. Si la fuente no declara, vale la fecha de la página. Lo anterior al último parche de balance queda «para revisar», no se maquilla como vigente. Por eso WvW muestra 36/36 élites con 29 vigentes.
4. **WvW**: 28 élites con build de Snow Crows; las 8 restantes (Subyugador, Jurafilos, Mechanista, Vendaval, Temerario, Certero, Espectro, Anticuario) desde MetaBattle WvW/WvW_Roaming (sub «roaming», salvo Espectro de apoyo).
5. **Carga por ruta**: los 11 módulos de Builds solo se cargan al entrar a #/builds (boot.js 1.2.0, `routes` en modules.json) para no pesar en el resto de la Bóveda.
6. **D1**: sin números de DPS propios (no hay datos públicos del simulador); se enlaza la fuente.

## Alternativas descartadas

- API de MetaBattle (api.php da 404).
- Usar la build de PvP como base de WvW: innecesario, MetaBattle cubre las 8.
- Marcar todo como vigente para cumplir 36/36: engañoso.

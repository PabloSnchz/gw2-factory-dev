# DEC-010 — Gato Design System (GDS) 1.0: fundamentos

- Estado: ACEPTADA
- Fecha: 2026-10-20
- Ámbito: Sistema visual del ecosistema (dashboard primero, webapp después)
- Misión: FACTORY-001B (MC-2)
- Especificación: `gw2-factory-dashboard/gds/GDS_FOUNDATION.md`

## Contexto

El Dashboard Factory v1 (FEAT-001) informa bien, pero su CSS mezcla colores y tamaños fijos dentro de las reglas y, medido, no cumple WCAG 2.1 AA en partes clave: badge "crítico" 3.70:1, texto de estado crítico sobre su tinte 4.08:1, borde de botones 1.29:1. Pablo pidió un sistema de diseño oficial, con identidad propia ("La Bóveda del Gato Negro"), inspirado en la metodología del Andreani Design System pero sin copiar su apariencia, y reutilizable por la webapp.

## Decisión

1. **Tokens en tres niveles**: primitivos (`--gds-p-*`, solo en `tokens.css`) → semánticos por rol (background, surface, fill, tint, border, text, icon, brand; espaciado; tipografía; forma; movimiento) → de componente (solo cuando un semántico no alcanza).
2. **Paleta La Bóveda**: la propuesta de Pablo se conserva como identidad (Obsidian, Arcane Violet, Jade, Amber, Crimson, Astral, Mist). Se ajustan 7 usos que no cumplían AA (ver LES-013 y GDS_FOUNDATION §3.3); `#7B5CFF` queda para bordes de acento y marca. Se agregan `surface-3`, bordes decorativo y de control, variantes hover/presionado y tokens de marca (el ámbar de los ojos del gato es exclusivo de la marca).
3. **Contraste medido, no supuesto**: `gds/contrast.mjs` calcula 57 pares de uso (incluye tintes translúcidos compuestos sobre la superficie). Todos cumplen AA.
4. **Escala de espaciado única** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64, con una sola excepción documentada (2 px de ajuste óptico).
5. **Roles tipográficos** headline-1/2, title-1/2, body-1/2, label-1/2, caption, code; en `rem`; nada por debajo de 12 px; sin fuentes descargadas.
6. **23 componentes base** (`.gds-*`, BEM) construidos solo con tokens semánticos; estados siempre con ícono + texto.
7. **Reglas verificables en CI** (`tests/gds.test.mjs`, 12 tests): sin hex/primitivos/medidas sueltas en componentes, referencias existentes, escala exacta, roles tipográficos, foco visible, movimiento reducido, contraste AA y tabla del documento idéntica al cálculo.
8. **Ubicación**: `gw2-factory-dashboard/gds/` mientras tenga un solo consumidor; se extrae a un repositorio o paquete propio cuando la webapp lo adopte.
9. **Andreani**: su documentación pública no se encontró; se usó como referencia metodológica la adaptación declarada en el dashboard histórico. No se tomó ningún color ni elemento de marca.

## Alternativas descartadas

- **Ajustar el CSS actual del panel**: no produce un sistema reutilizable ni corrige la falta de semántica.
- **Adoptar una librería externa (Tailwind, Material, etc.)**: agrega dependencias y build a un proyecto que no los tiene, y no da identidad propia.
- **Bajar la opacidad de los tintes para aprobar el contraste de los badges**: no alcanza para "peligro" (4.45:1 con 8 %) y deja los tintes casi invisibles; se aclaró el texto de estado.

## Consecuencias

- MC-2 no cambia nada visible: `index.html` no enlaza el GDS. La interfaz del panel se migra en MC-5.
- Todo cambio de token pasa por el test de contraste; todo componente nuevo debe documentarse en GDS_FOUNDATION §8 (el test lo exige).
- Cambios MAJOR o de identidad del GDS requieren una nueva DEC.

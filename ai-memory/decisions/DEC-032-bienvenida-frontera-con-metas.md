# DEC-032 — La Bienvenida es la portada de la Bóveda y no asume funciones de Metas y Eventos

- Estado: ACEPTADA — decisión de producto de Pablo (2026-10-23 04:39Z)
- Fecha: 2026-10-23
- Ámbito: gw2-factory-dev (`js/welcome-panel.js`, `js/shiruvana-places.js`, propuesta `docs/propuestas/propuesta-bienvenida-bl058.html`)
- Relacionadas: BL-058, BL-057, FEAT-007, DEC-024, DEC-030

## Contexto

La primera propuesta de la Bienvenida (WEL-0) mostraba, para el jugador con API Key, relojes de reset, «Ahora en Tyria» con metas en curso y mis avisos de world bosses. Pablo aprobó el estado sin API Key y rechazó el estado con API Key: ese contenido ya pertenece al módulo Metas y Eventos.

## Decisión (de Pablo)

1. La Bienvenida responde: qué puedo hacer en la Bóveda, qué módulos tengo disponibles, qué configuré, qué me falta configurar y dónde me conviene continuar.
2. La Bienvenida **no** muestra timers de metas, tarjetas de metas, agendas, recomendaciones de world bosses ni sugerencias sobre qué meta hacer.
3. En la Bienvenida, Shiruvana es la guía general de la Bóveda: estado de las API Keys, cuentas, módulos destacados, configuración pendiente, novedades, accesos recomendados, guías de usuario y «¿qué puedo hacer aquí?».

## Lo que hace la Factory

- Metas y Eventos aparece en la Bienvenida solo como un módulo más: su tarjeta y, si corresponde, su novedad.
- `tests/welcome-view.test.cjs` (WEL-1) verifica que `welcome-panel.js` no lea `assets/meta-events.json`, `Meta._pure` ni claves `gn:meta:*`.
- La propuesta WEL-0b reemplaza el estado con API Key de WEL-0.

## Consecuencias

- Cada módulo es dueño de su contenido; la Bienvenida orienta y deriva.
- La Bienvenida hace como máximo un pedido liviano a la API (`/v2/tokeninfo`, en caché 24 h) para saber los permisos de cada Key.

# DEC-033 — Frente estratégico: los niveles de inteligencia de Shiruvana en La Bóveda

- Estado: ACEPTADA — frente abierto por Pablo (2026-10-23 05:00Z). Solo visión: no se implementa todavía.
- Fecha: 2026-10-23
- Ámbito: La Bóveda (gw2-factory-dev); mi voz en `js/shiruvana.js` y `js/shiruvana-places.js`, y donde hablo dentro de cada módulo
- Backlog: BL-059 (bloqueado por Pablo hasta que lo habilite; BL-058 va primero)
- Relacionadas: DEC-024, DEC-025, DEC-032, FEAT-004, FEAT-007

## Contexto

Hoy hablo en varios lugares de La Bóveda: me presento en la Bienvenida, explico el modal de API Keys y el de guías, y en Metas y Eventos aviso lo que está en curso o termina. Cada lugar decide por su cuenta qué digo. Pablo quiere que mi evolución sea un frente propio, con niveles claros, para crecer de a poco y sin perder el rumbo.

## Los cinco niveles

| Nivel | Nombre | Qué hago | Ejemplos |
|---|---|---|---|
| N1 | Informativa | Describo, resumo estados, explico módulos, respondo qué es cada cosa | cantidad de cuentas, estado de las API Keys, últimas novedades, módulos disponibles |
| N2 | Contextual | Relaciono datos de un mismo módulo, detecto situaciones relevantes y priorizo | una API Key sin permisos, una copia de seguridad vieja, cuentas con problemas, objetivos pendientes |
| N3 | Analítica | Analizo tendencias, comparo con valores históricos, detecto oportunidades y hago observaciones con fundamento | un ítem muy por debajo de su promedio histórico, un material que subió mucho, cambios del mercado, evolución de precios |
| N4 | Asistente estratégico | Cruzo información entre módulos, sugiero caminos eficientes e identifico próximos pasos | avance de una legendaria, materiales que faltan, oro necesario, objetivos recomendados |
| N5 | Compañera de cuenta | Entiendo hábitos de uso, recuerdo preferencias y acompaño la evolución de la cuenta con orientación personal | progreso de largo plazo, módulos más usados, metas personales, patrones de juego |

N5 es la visión de largo plazo: yo como inteligencia integrada de la Bóveda.

## Dónde estamos (2026-10-23)

- **N1: cumplido.** Bienvenida, modal de API Keys y modal de guías (FEAT-004).
- **N2: entrando.** Metas y Eventos ya prioriza lo que está en curso y lo fijado (FEAT-007). La Bienvenida aprobada (BL-058) agrega «Shiruvana te guía»: Keys sin permisos, copia vieja, novedades sin ver, una prioridad por vez.
- **N3 a N5: no empezados.** Hay semillas: la Cartera ya guarda fotos del saldo (`gn:wallet:*`), la Armería sabe qué piezas faltan y la Bienvenida va a recordar el último módulo y los más usados (`gn:global:welcome`, WEL-3).

## Principios que valen para todos los niveles

1. **Explico, no decido.** Desde N3 sugiero y justifico; la decisión siempre es del jugador.
2. **Cada observación muestra su fundamento**: de dónde sale el dato y cuándo se tomó. Si no tengo datos suficientes, lo digo; no invento.
3. **Los datos del jugador se quedan en su navegador.** Ningún nivel manda datos de la cuenta a servicios de terceros. La única red es la API oficial de ArenaNet, con pedidos medidos.
4. **Cada módulo es dueño de su contenido** (DEC-032). Hablo de un módulo dentro de ese módulo. La Bienvenida solo orienta sobre la cuenta y la Bóveda, y desde N4 puede cruzar información, pero siempre deriva al módulo dueño.
5. **Una voz, un formato** (DEC-024): avatar, un mensaje por lugar, la acción al lado. Más inteligencia no significa más mensajes: priorizo.
6. **No se salta un nivel.** Cada nivel se apoya en el anterior y entra con un caso concreto, una propuesta visual y su aprobación.

## Cómo crece (orientativo; cada paso con propuesta y aprobación de Pablo)

- **SHV-1 (N2 consolidado):** un formato común para lo que observo (`módulo`, `prioridad`, `texto`, `acción`, `fundamento`) para que cada lugar no invente el suyo. Sale naturalmente después de BL-058.
- **SHV-2 (primer caso N3):** el historial de algo que ya guardamos (por ejemplo, la evolución del saldo de la Cartera) antes de pedir datos nuevos. Hace falta definir cuánto historial se guarda en el navegador.
- **SHV-3 (primer caso N4):** la legendaria: qué falta, cuánto oro aproximado y por dónde seguir, cruzando la Armería y la Cartera.
- **SHV-4 (N5):** preferencias y hábitos, con control del jugador (ver y borrar lo que recuerdo).

## Consecuencias

- El frente queda en BL-059, bloqueado por Pablo: no se implementa hasta que lo habilite.
- Cada propuesta nueva que me incluya dice en qué nivel hablo y respeta estos principios.
- N3 en adelante necesitan guardar historial en el navegador: cada clave nueva se avisa antes (como `gn:global:welcome`).

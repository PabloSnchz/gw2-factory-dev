# 📜 Cambios de La Bóveda desde la Factory (2026-10-19 en adelante)

Continúa `CHANGELOG.md`, que llega hasta la v6.7.1 y la sección `[Unreleased]` de la época de QwenPaw. Va aparte porque `CHANGELOG.md` (79 KB) no entra en una publicación de la Factory (LES-028); cuando se pueda, se unen (BL-053).

Cada entrada dice si está en **producción** (`gw2-wallet-ligero`) o solo en **DEV**. Lo que pasa a producción lo decide Pablo.

---

## 2026-10-22 — En producción (BL-050)

### Armería Legendaria
- **La legendaria se abre como pantalla**, no como modal: cabecera grande con ícono, receta en árbol a página completa, Materiales totales fijo al costado, "← Volver a la Armería" y Escape; en pantallas angostas, pestañas (BL-047, BL-049).
- **"Tengo" real** en Materiales totales: lee banco y almacén de materiales; antes estaba siempre en 0 (BL-045).
- **Chips con la jerga de la comunidad**: Abalorio y Espaldar (BL-046).
- **Expansión real de cada legendaria**, con Secrets of the Obscure, Janthir Wilds y Visions of Eternity (por ejemplo Klobjarne Geirr en Janthir Wilds y Verano Infinito en Visions of Eternity); catálogo y filtros en orden de salida (BL-046).
- **Íconos**: primero los del árbol abierto, con respaldo directo a la API; si fallan, la pantalla lo dice y ofrece Reintentar (BL-049).

### Actividades — PSNA
- Muestra el **día correcto** según la rotación semanal y el cambio de las 08:00 UTC; si no hay datos lo dice, en vez de mostrar otro día (BL-013, FEAT-003).
- Dice **de qué día son los lugares y cuándo cambian**, con cuenta regresiva que corre sola y la hora local (BL-044).
- **Renovado**: volvió el ícono del waypoint (servido por La Bóveda), día y cuenta regresiva en grande, cada lugar es un botón "Copiar" que confirma "✓ Copiado" (BL-048).

## 2026-10-21 — En producción

### Meta & Eventos (BL-034, BL-042, FEAT-005)
- 5 metas nuevas de Janthir Wilds y Visions of Eternity y la Convergencia del Nexo de la Eternidad.
- Secretos del Bosque cada 2 h; Monte Balrior pasa a Janthir con su horario real.
- Las convergencias tienen tipo propio y el filtro "Convergence" funciona; el filtro de expansión se arma desde los datos.

### Identidad Gato Negro (BL-038, BL-039, FEAT-004)
- Gato oficial como logo, pie y favicon; theme oficial "Gato Negro" por defecto (se migra una sola vez; "Bóveda" queda como opción).
- Guías con la marca y el theme activo; bio con los colores oficiales.
- Mi voz (Shiruvana) en la bienvenida, el modal de API Keys y el de guías.

## Solo en DEV

### Cartera renovada (2026-10-22, BL-056, FEAT-006)
- **Una pantalla con tres pestañas**: Mi cartera, Todas las cuentas y Cambio de divisas. El conversor ya no es un modal.
- **Mi cartera**: cabecera con la cuenta, chips por categoría, las divisas fijadas con ★ arriba, tarjetas y tabla con el lenguaje de la pantalla de la legendaria.
- **Cambio de divisas**: dos columnas, «Shiruvana recomienda» y Populares plegado; Escape funciona.
- **Todas las cuentas**: tarjetas de resumen, columnas como chips con «＋ Agregar divisa…» y buscador, cuenta, cabecera y totales fijos, el mayor valor en dorado y tarjetas en el celular. Una cuenta que no se pudo leer muestra «— ⚠» con el motivo y el total dice «Total (n de m)»; antes sumaba ceros.
- Una preferencia nueva en el navegador: `gn:wallet:hidezero` («ocultar en cero»). Si no ves los cambios, Ctrl+F5 (RSK-020).

### Otros
- **Sin Analytics en DEV**: GA4 solo se carga en el host de producción (BL-002, FEAT-002).
- **Generadores de la Armería** en `tools/legendary/`: catálogo, precios, recetas y precursores se regeneran cuando sale una legendaria nueva. Las recetas salen de crafty_legend (MIT), fijado a un commit (BL-043, MIG-2).
- **Red de tests**: 95 archivos en CI, 73 traídos del legado de QwenPaw (BL-043, MIG-4).
- **Documentación** al día: `docs/BRIEFING.md`, `docs/DESARROLLADORES.md`, `docs/GW2-API-HECHOS.md` (BL-004, MIG-1, MIG-5).
- Al regenerar las recetas, los textos del árbol dicen "Forja Mística" y ya no nombran archivos internos (MIG-2c).

## Antes de la Factory

La Armería Legendaria (catálogo de 206 legendarias, modos Catálogo y Progreso, cola de crafteo de hasta 5 y árbol de receta) llegó en la época de QwenPaw y no tiene entrada en `CHANGELOG.md`. Su historia completa queda en `gw2-wallet-agents`, que se archiva al terminar BL-043.

# 📜 Cambios de La Bóveda desde la Factory (2026-10-19 en adelante)

Continúa `CHANGELOG.md`, que llega hasta la v6.7.1 y la sección `[Unreleased]` de la época de QwenPaw. Va aparte porque `CHANGELOG.md` (79 KB) no entra en una publicación de la Factory (LES-028); cuando se pueda, se unen (BL-053).

Cada entrada dice si está en **producción** (`gw2-wallet-ligero`) o solo en **DEV**. Lo que pasa a producción lo decide Pablo.

---

## 2026-10-24 — En producción: Logros renovado, superficies y marco común (BL-067, BL-069, FEAT-012, FEAT-013)

- **Logros con cabecera y tres pestañas**: «Casi listos», «Por categoría» y «Colecciones legendarias»; cuatro indicadores (puntos de logro, al alcance, a un paso y con recompensa) y mi línea solo si hay algo cerca.
- **Tarjetas «te falta»**: el ícono oficial del logro destacado, «Te faltan N de M», barra verde que pasa a dorada desde el 95 %, recompensas con su ícono y «Wiki ↗». Los que están a un paso llevan anillo dorado y «A UN PASO».
- **«Por categoría» agrupada** por expansión o modo, con el ícono oficial de cada categoría, buscador y «Con pendientes / Todas». El panel viejo de Logros de la barra lateral ya no está.
- **«Ver en la Armería →»** cuando el logro da una legendaria o una pieza de una sola.
- **Superficies y marco común**: bandeja oscura, tarjetas elevadas y barras con pista en la Cámara del Brujo, Logros, Actividades, Raids y Strikes, Inventario y Personajes y Cuentas; cabecera común con el ícono oficial de cada módulo. Se lee en los 19 themes, foco visible, movimiento reducido y 44 px en el celular. Sin cambios de comportamiento ni de datos.
- **Lector de pantalla**: al filtrar Logros se anuncia cuántos quedan, ya no la grilla entera.
- Sin claves nuevas en el navegador. Si no ves los cambios, recargá con Ctrl+F5 (RSK-020).
- Vuelta atrás: rama `rollback/pre-restyle-ciclo`.

## 2026-10-24 — En producción: la Cámara del Brujo renovada (BL-064, BL-068, FEAT-011)

- **Cabecera** con la temporada, los resets con cuenta regresiva, la AA disponible, el avance del día y de la semana y «¿Por qué tarda?»; mi línea solo si hay algo para hacer.
- **Tres pestañas**: Objetivos (Listos para reclamar, En curso y Reclamados), Tienda (−/+, fijados, «Gestionar» con «Deshacer») y Todas las cuentas (Objetivos semanales y Compras fijadas con −/+ por cuenta).
- Se lee en los 19 themes. Desde BL-069, con las superficies del marco común: íconos de la Tienda a 52 px y lo fijado en dorado.
- Vuelta atrás: rama `rollback/pre-camara-armeria` (BL-068) y `rollback/pre-restyle-ciclo` (BL-069).

## 2026-10-23 — En producción desde el 2026-10-24: la Armería renovada (BL-064, BL-068, FEAT-010)

- **Cabecera** con cuánto tenés («N de 206»), buscador que no distingue acentos ni mayúsculas y pestañas Catálogo / Mi cola.
- **Filtros en una fila**: «Todas / Las tengo / Me faltan», tipo, expansión y generación.
- **Tarjetas que se usan con teclado**: el nombre abre la receta y «+ A la cola» es un botón aparte. «✓ La tengo» reemplaza a «PENDING». El precio dice «≈» con su fecha, o «No se vende».
- **Secciones por expansión** con su progreso; en el celular, una columna y botones de 44 px.
- **«Mi cola» es una vista propia**: numerada, las 3 primeras destacadas, «Ver receta y materiales» y «Quitar».
- **Armaduras por set**: 132 piezas sueltas pasan a 23 tarjetas (7 sets × 3 pesos, más Eikasia y Selachimorpha) con «tenés N de 6 piezas»; buscar una pieza abre su set.
- **Se lee en los 19 themes** (verificado por un test) y el foco ya no salta al principio al tocar un filtro o la lista.
- Sin claves nuevas en el navegador ni pedidos nuevos a la API. Si no ves los cambios, recargá con Ctrl+F5 (RSK-020).

## 2026-10-23 — En producción: la Sidebar en el celular y mi rincón (BL-061, BL-063, FEAT-009)

- **En el celular** (hasta 900 px) la navegación ya no queda al fondo de la página: barra fija abajo con Inicio, Cartera, Metas, Armería y «Más». «Más» abre una hoja con la cuenta activa y los otros 6 destinos; se cierra con «Cerrar», Escape, tocando afuera o eligiendo un destino. Un punto ámbar en «Más» avisa si adentro hay algo para revisar.
- **Mi rincón** (DEC-034) al pie de la Sidebar en la computadora y al pie de la hoja «Más» en el celular: una sola línea sobre el estado de tu Bóveda («Empezá por tu API Key», «Todo en orden en tu Bóveda» o «Tengo N cosas para revisar; la primera: …») y, si hace falta, un enlace a Inicio. Nunca habla de horarios, eventos ni metas.
- **«Nuevo» aparece desde la primera carga** y la Sidebar corrige su contraste desde el principio; antes arrancaba antes que la Bienvenida.
- **Revisión final:** se lee en los 19 themes (verificado por un test), controles de 44 px en el celular, foco visible en todo lo que se toca y avisos que el lector de pantalla lee como texto: «(falta permiso)», «(nuevo)» y «(hay algo para revisar)».
- Sin claves nuevas en el navegador ni pedidos nuevos a la API. Si no ves los cambios, recargá con Ctrl+F5 (RSK-020).
- Vuelta atrás: rama `rollback/pre-sidebar-final`.

## 2026-10-23 — En producción: Sidebar a la izquierda (BL-061, SBR-1 y SBR-2)

- **A la izquierda** desde 901 px de ancho y fija al hacer scroll. En el celular, barra fija abajo (entrada de arriba).
- **Inicio** primero, después los 8 módulos en el mismo orden, nombre, ícono y color que la Bienvenida, y Cuentas aparte. El módulo en el que estás se marca con su color, también en las pantallas internas (por ejemplo, una legendaria abierta marca la Armería).
- **«Cuenta activa»** reemplaza a «Gato identificado»: nombre de la cuenta, estado de su API Key (completa, le falta un permiso, sin verificar o sin Key) y «Cambiar», que lleva al selector de arriba.
- **Avisos en los módulos**: un punto ámbar si a tu Key le falta el permiso que ese módulo necesita y «Nuevo» si tiene una novedad de 14 días o menos.
- Ya no aparecen «Próximas funciones» ni «Próximos (Top 3)», que repetía lo de Metas y Eventos.
- Se lee en los 19 themes. Sin pedidos nuevos a la API ni claves nuevas en el navegador.

## 2026-10-23 — En producción: Bienvenida renovada, la puerta de entrada de la Bóveda (BL-058, FEAT-008)

- **Cabecera** con el gato, la cuenta activa y tres pastillas: API Key, Cuentas y Copia (con «Guardar copia» a un clic).
- **«Shiruvana te guía»** reemplaza el saludo heredado: un mensaje por vez, lo más importante primero (lo que impide funcionar, permisos faltantes, copia pendiente, configuración incompleta, por dónde seguir y un truco de la Bóveda), cada uno con el botón que lo resuelve, «Siguiente» y «Preguntame».
- **«Seguí donde quedaste»**: el último módulo que abriste y los que más usás.
- **«Tu Bóveda»**: Keys y permisos (qué falta y cómo arreglarlo), cuenta activa, copia de seguridad y theme, con «N de 4 listo». Los módulos que tu Key no alcanza dicen «Falta permiso».
- **Módulos, Novedades y Guías y ayuda**: los 9 módulos como tarjetas, lo nuevo de la Bóveda y las guías y el Discord.
- **Sin API Key**: tres pasos para empezar.
- **Solo la Bóveda**: sin horarios, metas, agendas ni world bosses; eso vive en Metas y Eventos (DEC-032).
- **Se lee en los 19 themes**: en macOS y Notion el verde y el ámbar de los estados ya no se pierden sobre el blanco. Controles de 44 px en el celular, foco visible y anuncios para lector de pantalla.
- Una clave nueva en el navegador: `gn:global:welcome` (último módulo, visitas y fecha de la última copia).

## 2026-10-23 — En producción: Metas y Eventos renovado (BL-057, FEAT-007)

- **Cabecera nueva**: «Metas y Eventos · Horarios en tu hora local · 49 metas» con botones de Local, Servidor (UTC), Reset diario (00:00 UTC) y Reset semanal (lunes 07:30 UTC) con cuenta regresiva; el reset cercano se pone dorado.
- **«Hoy en tu cuenta»**: N de 19 que la API puede seguir (jefes del mundo y cofres de mapa), con barra fina, «↻ Actualizar» y «¿Por qué 19?». Las otras metas ya no dicen «Pendiente» en rojo: la API no las informa.
- **Secciones**: «Ahora» (en curso y lo que empieza en 20 min), agenda de las próximas 3 horas por tu hora local, Fijadas (hasta 6) y todas las metas por expansión, en orden de salida. Todo se redibuja solo cada 30 s.
- **Filtros desde los datos**, en español y con su cantidad; antes 14 metas no tenían tipo para filtrar y «Fractal Incursion» no tenía ninguna.
- **Metas que cruzan la medianoche UTC** siguen «En curso» después de las 00:00 (BL-041).
- **Vistas previas de infusiones**: en DEV salen de La Bóveda (8 de 10). En producción hoy se ven las 2 que ya estaban (piñata y burbujas); las otras 6 dicen «Sin vista previa» hasta que sus archivos `.webp` estén en `assets/previews/` de producción (son imágenes: la Factory no las puede subir). Chak y Dragon's End dicen «Sin vista previa» con el nombre de la infusión; ya no se ven imágenes rotas (DEC-031).
- **Mi voz** avisa lo que está en curso y cuándo termina, con el nombre en negrita y el waypoint a un clic; cerca del reset, lo que te queda para hoy.
- Sin «Vista compacta» (aprobado por Pablo). Sin claves nuevas en el navegador.
- Vuelta atrás de las tres entregas del 2026-10-23: rama `rollback/pre-meta-welcome-sidebar` (BL-062). Si no ves los cambios, recargá con Ctrl+F5 (RSK-020).

## 2026-10-22 — En producción: la Cartera renovada (BL-056, FEAT-006)

- **Una pantalla con tres pestañas**: Mi cartera, Todas las cuentas y Cambio de divisas. El conversor ya no es un modal.
- **Mi cartera**: cabecera con la cuenta, chips por categoría, las divisas fijadas con ★ arriba, tarjetas y tabla con el lenguaje de la pantalla de la legendaria.
- **Cambio de divisas**: dos columnas, «Shiruvana recomienda» y Populares plegado; Escape funciona.
- **Todas las cuentas**: tarjetas de resumen, columnas como chips con «＋ Agregar divisa…» y buscador, cuenta, cabecera y totales fijos, el mayor valor en dorado y tarjetas en el celular. Una cuenta que no se pudo leer muestra «— ⚠» con el motivo y el total dice «Total (n de m)»; antes sumaba ceros.
- Una preferencia nueva en el navegador: `gn:wallet:hidezero` («ocultar en cero»). Si no ves los cambios, Ctrl+F5 (RSK-020).
- Vuelta atrás: rama `rollback/pre-cartera` (REQ-011).

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

- **Sin Analytics en DEV**: GA4 solo se carga en el host de producción (BL-002, FEAT-002).
- **Generadores de la Armería** en `tools/legendary/`: catálogo, precios, recetas y precursores se regeneran cuando sale una legendaria nueva. Las recetas salen de crafty_legend (MIT), fijado a un commit (BL-043, MIG-2).
- **Red de tests**: 95 archivos en CI, 73 traídos del legado de QwenPaw (BL-043, MIG-4).
- **Documentación** al día: `docs/BRIEFING.md`, `docs/DESARROLLADORES.md`, `docs/GW2-API-HECHOS.md` (BL-004, MIG-1, MIG-5).
- Al regenerar las recetas, los textos del árbol dicen "Forja Mística" y ya no nombran archivos internos (MIG-2c).

## Antes de la Factory

La Armería Legendaria (catálogo de 206 legendarias, modos Catálogo y Progreso, cola de crafteo de hasta 5 y árbol de receta) llegó en la época de QwenPaw y no tiene entrada en `CHANGELOG.md`. Su historia completa queda en `gw2-wallet-agents`, que se archiva al terminar BL-043.

# DEC-028 — La Guarida es un lanzador con el GDS; yo soy su anfitriona, no su operadora

- Estado: ACEPTADA — Pablo pidió la realineación (BL-052, 2026-10-22 05:10Z) y aprobó la propuesta (05:36Z: "aprobado, llevala a prd de la guarida").
- Fecha: 2026-10-22
- Ámbito: la-guarida. No cambia La Bóveda ni el Centro de decisiones.
- Reemplaza: DEC-027
- Relacionadas: DEC-024, DEC-025, BL-040, BL-051, BL-052

## Contexto

En BL-051 (DEC-027) llevé a La Guarida funciones del Centro de decisiones: estado de la Factory, chips de decisiones y validaciones y un resumen mío que leía `ai-memory/status.md`. Pablo detectó la desviación: lo que se comparte entre los dos sitios es el lenguaje visual del Gato Design System, no la función. La Guarida es su lanzador personal; el Centro de decisiones es el lugar de la operación de la Factory.

## Decisión

### 1. Separación de funciones

- La Guarida no muestra información operativa de la Factory: ni decisiones, ni validaciones, ni backlog, ni estado, ni tareas.
- La Guarida no le pide nada a GitHub ni a la memoria de la Factory. Al abrir, borra la copia vieja `guarida:factory:v1`.
- El Centro de decisiones queda como un enlace más dentro del menú «Ecosistema», junto a La Bóveda y la bio: solo navegación.

### 2. Lenguaje visual compartido

- Tokens, paneles con título, contador y descripción, badges, tarjetas con borde fino y brillo arcano, tipografía y espaciados del panel, sobre las variables de cada theme (los 19 siguen funcionando).
- Cabecera: marca, navegación propia de La Guarida (Inicio, Favoritos, Categorías, Lanzador, Widgets) y herramientas (theme, Editar, «＋ Agregar», «Backup», «Ecosistema»).
- Wiki, Foros y ANet Keys salen de la cabecera y pasan al menú «Ecosistema», en el grupo Guild Wars 2, y al portal. No muevo datos de Pablo a sus categorías: no toco su `localStorage` de favoritos y categorías.

### 3. Mi papel: anfitriona

| Pieza | Qué hace | Límites |
|---|---|---|
| Portal «¿A dónde vamos?» | Barra en el resumen con mi avatar (único lugar fijo). Ctrl+K o «/» la abren. Busca en favoritos, enlaces, apps, juegos, atajos y acciones (theme, edición, agregar, backup). Tolera errores de tipeo y acentos; Enter abre el primero | Busca solo en La Guarida, sin red. Abre cada resultado haciendo clic en el elemento real: reusa la lógica existente (Chrome forzado, `launch:`, modo edición) |
| «Lo de siempre» | Hasta 5 accesos más abiertos en esta franja del día (mañana 05–12, tarde 12–19, noche 19–05) | Aprende solo en el navegador (`guarida:uso:v1`), no sale de la PC y no entra en el backup (data.js no se toca). Aparece con 10 aperturas o más |
| Consejos de orden | Un aviso abajo a la derecha: enlaces repetidos, categorías vacías, backup de hace más de 30 días o nunca hecho, Guarida sin favoritos | Como mucho uno por día; nunca en modo edición; cada uno trae su acción y «Ahora no» lo silencia 30 días |

Nunca aparezco en favoritos, categorías, lanzador, widgets ni en el modal.

## Consecuencias

- La Guarida deja de depender de GitHub y del formato de `status.md`.
- El backup no guarda «Lo de siempre»; es un dato de comodidad que se reconstruye solo.
- Sumar otro lugar donde yo aparezca en La Guarida es decisión de Pablo; textos, tamaños y reglas de los consejos los ajusta la Factory.

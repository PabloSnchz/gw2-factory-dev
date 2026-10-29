# DEC-043 — Referencia de daño por parecido, nunca un DPS inventado (BENCH-2)

- Fecha: 2026-10-29
- Estado: aplicada en DEV (js/bld-bench.js 1.0.0 nuevo; PATCH-292: bld-lib 1.7.0, bld-mine 1.4.0)
- Contexto: Pablo pidió el bench «calculado para las builds propias» (2026-10-29 18:40Z). No hay forma honesta de calcular el DPS de una build cualquiera: el simulador de Snow Crows no tiene datos públicos y un número estimado por mí parecería medido. Se aprobó BENCH-2 como referencia por parecido (18:55Z).

## Decisión
1. **Solo números medidos**: muestro el DPS de una build MEDIDA por Snow Crows (bench.json, DEC-042), con la etiqueta «Referencia», barra rayada y la frase «No es el DPS de esta build».
2. **Parecido explicable**: misma profesión y élite obligatorias; después tipo de daño (+4), rol de bendiciones (+2, «boon» genérico +1) y cada arma en común (+1). La tarjeta dice en qué se parece. A igual puntaje, la de más DPS (techo de esa forma de jugar).
3. **Biblioteca**: solo PvE y solo builds que hacen daño. Curación y tanque, y WvW/PvP, siguen diciendo por qué no hay número.
4. **Mis builds**: primero la build de la Biblioteca de la que salió (mismo código o misma fuente): si tiene bench, ese bench («en que se basa»; si cambió el código, se avisa). Si no, la de la Biblioteca más parecida por líneas y rasgos (desde 50 %), que aporta daño y rol; si es de WvW/PvP o de curación se dice sin número. Si nada se parece, la referencia usa solo la élite (o el núcleo) y lo dice.
5. **Arquitectura**: módulo puro aparte (js/bld-bench.js) que usan bld-lib y bld-mine; Mis builds reutiliza el catálogo y el bench que carga la Biblioteca (GNBldLib.preload), sin pedidos nuevos.

## Riesgos aceptados
- La referencia puede ser optimista (techo de la élite cuando solo coincide la élite): mitigado con la etiqueta, la frase y los motivos visibles.
- CSS de .bld-bench duplicado en bld-lib y bld-bench (deuda BAJA).

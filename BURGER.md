# Burger Club — variante propia jugable

El usuario eligió un mazo propio el 27/09/2026. La pantalla burger.html ahora ofrece Burger Club, con identidad y catálogo distintos del producto comercial Burger Up.

## Implementado
- 72 cartas (12 combinaciones de dos mitades, 6 copias de cada una), 21 pedidos propios.
- 2–4 asientos configurables como persona o IA fácil/media/difícil.
- Mercado, colocación en dos bases, espátula, venta, mejora, descarte y reposición.
- Final por agotamiento de pedidos o 20 turnos por persona, cerrando la ronda.
- Guardado local validado y continuación con protección visual de la mano.
- Resultados de cuenta separados bajo burger-club; historial y récords.
- Motor probado con 27 partidas del mazo propio y pruebas de final y privacidad de IA.

## Diseño de IA
Fácil elige entre movimientos legales; media favorece tamaño y perfectos; difícil evalúa además requisitos de pedidos públicos. No ve manos rivales ni orden de mazos. Es una heurística inicial: no usa espátula ni mejora y todavía no tiene calibración de dificultad con jugadores.

## Catálogo comercial
Sigue incompleto y bloqueado como burger-up-v2. Ver BURGER-TABLETOPIA.md para los hallazgos de la investigación. No presentar el mazo propio como inventario original.

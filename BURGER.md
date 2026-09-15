# Burger Up — implementación en desarrollo

## Estado real

- Motor de fases y puntuación escrito, con catálogo inyectable y acciones atómicas.
- 16 pruebas, incluidas 60 partidas sintéticas completas de 2, 3 y 4 personas.
- Página `burger.html`: práctica interactiva de colocación con tres cartas verificadas. No es una partida comercial ni registra resultados.
- Vista previa integrada en la colección y en el build; no habilitada en la API de resultados. El despliegue no convierte la práctica en una partida completa.
- El catálogo comercial está bloqueado deliberadamente hasta verificar todas las cartas. Los datos de las pruebas son sintéticos y nunca se cargan desde la interfaz.

## Fuentes

Reglamento final, versión 2 (8/12/2016), del editor distribuido por Tabletopia:
https://c.tabletopia.com/games/burger-up/rules/burgerup-rulebook-v2-20161208/en

Campaña original (contiene reglas de borrador; no mezclar su puntuación de prestigio con la versión 2):
https://www.kickstarter.com/projects/chaoticpattern/burger-up-building-burgers-of-epic-proportions-2-4

La sección Try the Game enlaza un Print & Play de PREVIEW para 2 jugadores:
http://assets.ruleandmake.com/products/burger-up/burger_up-pnp-bw.a4.pdf
El host no resolvió durante la consulta. La consulta exacta al índice CDX de Internet Archive devolvió cero capturas. No se descargó este archivo ni se verificó su mazo.

Tabletopia ofrece el juego, pero requiere registro para abrir la mesa. No se creó una cuenta ni se extrajeron recursos privados.

## Catálogo pendiente

Faltan las 72 cartas físicas con ambas mitades, símbolos de siguiente ingrediente, perfectos y multiplicidades; y 9 de los 21 pedidos. Hay tres ejemplos visuales de cartas en la página 1 del reglamento, y 12 condiciones de pedidos legibles en las páginas 1–7. No inferir cantidades a partir de fotos de ejemplo. No ampliar un mazo de preview a cuatro jugadores sin verificar que coincide con la edición final.

## Reglas implementadas

- Preparación de 2/3/4 personas: seleccionar 12/14/18 pedidos; 3 visibles con $1 cada uno, mercado de 3; cada jugador recibe $2, 4 cartas, dos bases y espátula limpia.
- Fases estrictas: mercado, construcción, venta, limpieza. Las tres primeras pueden omitirse.
- Mercado $1 por carta; no se repone hasta el inicio de limpieza.
- Hasta 3 colocaciones totales entre ambas bases, o 4 tras mejorar. Orientación fija al colocar; los tipos determinan encaje y las palabras clave determinan pedidos.
- Pan intermedio comodín; no suma tamaño ni recompensa por perfectos. Consume una colocación.
- Espátula dos usos, exclusivamente en construcción; mueve un sufijo completo al otro stack o al descarte, sin cambiar orientación ni orden. Comprueba la unión nueva y no consume colocación desde la mano.
- Venta de una sola hamburguesa y un solo pedido. Recompensas 1/3/5/10 por tamaños 1–3/4–6/7–9/10+. Monedas del pedido y $1 por perfecto adicionales.
- Mejora únicamente con Colosal, en lugar de los $10; conserva monedas del pedido y perfectos, mantiene la otra hamburguesa. No vuelve a mejorar.
- Reposición de pedido y aumento de $1 en los pendientes tras cada venta.
- Limpieza repone primero el mercado, luego permite descartar y robar hasta 4. Reciclaje determinista del descarte, sin bucles si no hay cartas disponibles.
- Final al no poder reponer un pedido, NO al robar el último pedido del mazo. Termina la ronda en curso; el primer jugador no repite turno.
- Dinero + 4/2/0 por espátula + 5 por mayoría única de pedidos. Empate en mayoría no da bonus.

## Casos que requieren confirmación editorial

- Even Stevens: el texto dice cantidades iguales de Meat, Sauce, Salad y Cheese; aún no se ha confirmado si exige al menos uno de cada uno. El motor interpreta igualdad literal y requiere al menos un ingrediente general. NO habilitar la partida comercial hasta resolverlo.
- Última ronda: al no reponer se incrementan los pedidos restantes, aplicando la regla de aumento a los disponibles. El reglamento describe literalmente los tres pedidos del caso normal; confirmar esta extensión con una FAQ.
- Sunny Side Up: se interpreta huevo como carta superior efectiva; un pan intermedio encima invalida el requisito. Confirmar si una FAQ excluye panes en la comprobación de “on top”.
- Mazo y descarte vacíos simultáneamente: el motor deja de robar para evitar bloquear la interfaz. Es una protección técnica, no una regla editorial inventada para decidir el ganador.

## Antes de producción

Completar y verificar catálogo; resolver ambigüedades; implementar pantalla de partida completa, guardado validado, historial mediante accounts.js y alta en allowlist de API/build/servidor; añadir la tarjeta en el catálogo; probar interfaz, API y motor; desplegar y verificar. La práctica no debe confundirse con la entrega del juego completo.

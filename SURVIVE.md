# Survive the Island — edición base 2024

Fuente: https://cdn.svc.asmodee.net/production-asmodeeca/uploads/2024/07/ZYGSTI01EN_RULES_20240227-low.pdf

## Estado

Partida jugable en `survive.html`: mesa compartida, preparación alternada, guía por etapa, decisiones privadas, guardado, resultados e historial de cuenta. Asientos humanos o IA fácil, media y difícil en cualquier combinación de 2 a 5 participantes. Gráficos esquemáticos propios; no utiliza imágenes de Board Game Arena.

Catálogo de las 40 losetas transcrito de la página 8 del reglamento. Tablero y componentes contrastados visualmente con la implementación licenciada de la edición 2024 en Board Game Arena: https://es.boardgamearena.com/archive/replay/260709-1025/?table=880564038&player=94396489&comments=

## Contrato de implementación

- 2–5 personas. A dos, cada persona controla dos colores como un único equipo: veinte aventureros y cuatro balsas. En los demás casos, diez y dos.
- Preparación alternada de aventureros y luego balsas. Con cinco personas, primero se ocupan las cuarenta losetas y luego se admite el segundo aventurero. Elegir valores antes de colocar; esconderlos durante la partida, también los eliminados.
- Turno: acción (hasta tres movimientos más habilidades), hundimiento y criaturas. Quien empieza sin aventureros pendientes retira dos losetas.
- Cada nadador puede realizar un solo movimiento de natación por turno. Salir del agua también lo consume; desplazamientos de habilidades se contabilizan aparte.
- Las balsas tienen tres plazas. Se controla con mayoría o empate frente a cada oponente. El jugador activo elige pasajeros si no entran todos; no decidirlo automáticamente.
- Retirar cualquier loseta del terreno más bajo restante; no exigir contacto con el mar. Playa antes que bosque antes que montaña.
- Aplicar efectos inmediatamente. Guardar habilidades en secreto para turnos posteriores. Repelente puede responder fuera de turno: pausar interacción y ofrecerlo a los dueños afectados antes de eliminar o empujar.
- Serpiente: un espacio acuático, elimina balsas y todos los aventureros. Tiburón: uno o dos espacios acuáticos, elimina nadadores. Kaiju: uno o dos espacios de agua o tierra, destruye balsas y desplaza el resto. Una interacción detiene el movimiento inmediatamente.
- El jugador activo elige orden y destinos de los empujes; las cadenas requieren una cola de resoluciones y ventanas de repelente. Ningún elemento entra donde hay Kaiju salvo otro Kaiju.
- Si la reserva de la criatura está agotada, elegir cuál recolocar. Balsa agotada: elegir una vacía del tablero; si no existe, no aparece.
- Remolino afecta casilla y vecinas acuáticas; volcán elimina ocupantes y bloquea su casilla. El tercero termina inmediatamente, sin completar ronda.
- Fin también cuando todos están rescatados o eliminados. Sumar exclusivamente tesoros rescatados, empates compartidos.

## Componentes y geometría comprobados

- Diez aventureros por color: dos de cada valor, de 1 a 5. A dos participantes se usan dos colores por equipo.
- Dado: dos caras de serpiente, dos de tiburón y dos de Kaiju; cada criatura tiene probabilidad 1/3.
- Cuarenta posiciones de isla, un hueco central y cinco posiciones iniciales de serpiente. Trece filas alternadas de once y doce posiciones. Las esquinas no son agua: cada uno de los cuatro refugios se representa con tres posiciones de entrada equivalentes. El rescate es inmediato al entrar, sin desplazamiento posterior dentro del refugio.
- El guardado comprueba conexiones y refugios contra el tablero actual. Rechaza los guardados de desarrollo con la costa anterior.

## Resoluciones y validación

Pruebas de movimientos, embarque disputado, ataques, repelentes, empujes, habilidades, agotamiento de reserva, volcanes y puntuación. Simulaciones completas de 2–5 participantes en las tres dificultades, con serialización y restauración durante la partida. La IA consulta información pública y recuerda sus propios tesoros; no recibe reversos sin revelar, tesoros rivales ni el estado del generador aleatorio.

Caso no desarrollado explícitamente por el reglamento: un Kaiju no puede iniciar un movimiento que obligue a empujar una criatura sin ningún destino legal (por ejemplo, la serpiente central completamente rodeada por tierra). Se aplica esa restricción para conservar las reglas de movimiento de la criatura y evitar una resolución imposible. Es una interpretación de implementación, no una aclaración oficial del editor.

# Asientos y rivales automáticos

`players.js` es el contrato compartido. Cada `player.controller` contiene `type: human | ai` y `level: easy | medium | hard`. Usar `seatFields` y `configureSeats` en la preparación, `isAI` para proteger acciones humanas y `controller` para la dificultad. Los guardados antiguos con `machine: true` conservan IA en el segundo asiento.

Los adaptadores en `bots.js` consultan las acciones legales del motor. Fácil elige al azar entre opciones legales; medio prioriza recompensa inmediata; difícil agrega valoración de recursos, posiciones y objetivos. Son heurísticas locales, sin servicios externos ni garantía de victoria. No se modifican reglas, recursos ni puntuaciones por dificultad.

Cada nuevo juego debe aportar su adaptador, preservar controller al guardar, cancelar el temporizador al salir de la partida, ocultar información privada de la IA y probar partidas completas con distintos tamaños y niveles. La configuración común no crea por sí sola una estrategia para un juego nuevo. Burger Up y Survive todavía necesitan completar sus motores e interfaz de partida antes de activar rivales.

La cuenta se asocia al primer asiento humano. Al enviar resultados, ese participante figura primero para mantener la compatibilidad con el historial existente; una mesa solo de IA no registra un récord personal.

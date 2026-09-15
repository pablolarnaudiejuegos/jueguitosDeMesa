# Reportes y validación

Actualizado: 2026-09-14. Cada captura nueva se agrega como caso independiente.

| Reporte | Diagnóstico | Resolución |
| --- | --- | --- |
| Camino visible en Gran ciudad no conecta | El motor definía campo donde la imagen muestra camino | Corregido y probado; migración de partidas antiguas |
| Nacimiento con agua arriba no conecta | Imagen de tramo recto asignada al nacimiento | Corregido nacimiento y lago; revisado inventario del río |
| Curvas separadas por rectas bloqueadas | Restricción demasiado amplia | Se permite repetir giro tras rectas; prueba de la captura |
| Dos curvas consecutivas que vuelven hacia arriba | U inmediata, bloqueo válido | Mensaje específico junto a los controles; girar la ficha hacia abajo es válido |
| Seguidor no disponible en ciudad recién extendida | La misma ciudad ya tiene un seguidor azul | No cambiar la regla; posición visual del seguidor corregida y mensaje con nombre del ocupante |
| Camino recto sobre camino inferior no conecta | También hay un camino en el vecino derecho; el borde derecho de la ficha recta es campo | Bloqueo válido; prueba del hueco y mensaje del borde incompatible al pasar el puntero |

## Verificación completada

- 23 pruebas automáticas aprobadas.
- 30.976 combinaciones de pares de losetas, giros y lados.
- 22.528 combinaciones de huecos rodeados por cuatro vecinos.
- Tipos de río en las cuatro orientaciones, ambos sentidos de recorrido, U inmediata y giros separados por rectas.
- 100 partidas con río y 20 sin río, puntuación, conservación de seguidores y serialización.
- No equivale a probar todos los tableros posibles. Las pruebas de conexiones comprueban las definiciones lógicas; la correspondencia con imágenes requiere revisión visual separada.

## Alcance pendiente del producto

- Mazo completo de terreno y granjeros (fuera de estos reportes).
- Seguir agregando las capturas nuevas a esta lista y a las pruebas cuando corresponda.

## Bonsái — integrado
Juego base 1–4, solitario clásico y Tokonoma; guía por fase y guardado separado. Ver BONSAI.md para alcance, convenciones y verificación. 39 pruebas aprobadas (14 Bonsái + 25 Carcassonne).

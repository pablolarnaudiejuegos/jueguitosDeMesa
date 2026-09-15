# Bonsái en Mesa Abierta

Implementación del juego base para 1–4 personas en un dispositivo. Abrir `/bonsai.html`, o la card de la colección. Interfaz en español; referencia de reglas en inglés:
https://www.dvgiochi.com/giochi/bonsai/download/Bonsai_ENG-Rules_WEB.pdf

## Incluido

- Mazo por participantes: 32 (1–2), 43 (3), 47 (4). Los efectos de las cinco familias están implementados.
- Meditar, recompensas de posición, maestro, ayudante, crecimientos acumulativos y herramientas.
- Cultivo hexagonal, maceta, validación de apoyos y frutos, cupos comodín y deshacer colocaciones antes de cerrar la acción.
- Objetivos compartidos, renuncia persistente, límite por color y puntuación detallada.
- Ronda final, desempate por orden inicial y solitario con dificultades 80/100/120/140 más tres objetivos.
- Tokonoma opcional.
- Guía en cada etapa, cambio de jugador con pantalla de privacidad y exportación de guardado.
- Guardado independiente: `mesa-abierta-bonsai-v1`. Carcassonne conserva `mesa-abierta-v1`.
- Ilustraciones SVG propias. No se reutiliza código ni arte de BGA.

## Alcance y convenciones explícitas

No incluye Wabi Sabi, otras expansiones ni los cinco escenarios especiales. No incluye multijugador en red.

Tres detalles no totalmente precisados por el texto consultado están documentados también en la ayuda:

1. La poda conserva apoyos legales: al retirar una pieza se incluyen las dependientes que pierdan apoyo. Entre alternativas se minimiza el número retirado, no los puntos.
2. En solitario, agotar el mazo mediante un descarte también activa el turno adicional.
3. En Tokonoma, el grupo impar mayor de cartas sin pergamino se mezcla con los pergaminos en la parte inicial.

El inventario de efectos fue contrastado con la referencia pública del desarrollador de BGA (hechos del material, no código reutilizado):
https://github.com/PhilipDavis/BGA-Bonsai/blob/e1f99cf9b347807b6b24f6f49bb8401187704ae8/modules/BonsaiMats.php

## Verificación

`node --test` ejecuta 39 pruebas: 14 de Bonsái y 25 existentes de Carcassonne, todas aprobadas al integrar.

Bonsái incluye 375.000 comparaciones del predicado local con un oráculo geométrico independiente, 80 partidas completas simuladas entre los cuatro tamaños, serialización en cada paso, pruebas de reservas/cupos, objetivos, poda, puntuación, mercado y final de solitario.

En navegador se verificó entrada desde la colección, inicio, cultivo, colocación, consumo de inventario y cambio de jugador. No se jugó una partida completa manual en navegador; las simulaciones validan el motor, no todos los recorridos visuales. Los escenarios y modos excluidos no están certificados.

## Archivos

- `bonsai-engine.js`: reglas y reducer transaccional.
- `bonsai.js`: interfaz y guía.
- `bonsai.css`: presentación adaptable.
- `bonsai.html`: entrada.
- `bonsai.test.js`: pruebas del motor.

Para agregar un caso reproducible, usar una semilla en `createBonsai`, y añadir prueba antes de modificar una regla. No inferir conexiones desde la ilustración: el dibujo y los permisos deben provenir del mismo estado geométrico.

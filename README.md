# Mesa Abierta

Aplicación central de juegos de mesa, con catálogo por cards y un primer juego local inspirado en Carcassonne.

## Ejecutar

Requiere Node.js. No necesita instalar dependencias.

```powershell
cd C:\Users\pablo\Desktop\AppJuegosMesa
npm start
```

Abrir http://localhost:4173. Para verificar el motor: `npm test`.

## Alcance de esta versión

- Biblioteca preparada para incorporar más juegos.
- Partidas de 2 a 5 personas compartiendo un dispositivo.
- Sin río: 44 losetas (43 del mazo más la inicial). Con río: 55 (12 de río y 43 de terreno), con imágenes originales extraídas de material del editor.
- Río clásico activado por defecto, desactivable al preparar la partida. Nacimiento inicial, diez intermedias mezcladas, lago al final y transición al terreno; prohibición de U inmediata (dos curvas consecutivas en el mismo sentido), ocupación de zonas terrestres y agua sin seguidores ni puntos.
- Rotación por clic sobre la loseta, controles en ambos sentidos, tecla R sin límite de giros. Solo se habilitan posiciones legales para la orientación actual.
- validación de todos los bordes, ciudades y caminos con conectividad independiente, monasterios, escudos y seguidores.
- Puntuación automática, mayorías, empates y puntuación final.
- Guardado de una partida en localStorage. Nueva partida reemplaza el guardado.
- Diseño adaptable, desplazamiento del tablero y zoom.

Es un prototipo independiente, no una reproducción completa del juego comercial. El mazo de terreno es reducido y su distribución es propia. No implementa granjeros, abad ni otras expansiones. No incluye usuarios, multijugador por red o IA. Las fuentes web son opcionales: hay fuentes locales de respaldo.

## Fuentes

- Página del editor y acceso a reglamentos: https://www.zmangames.com/game/carcassonne/
- Reglamento base indexado del editor: https://images-cdn.zmangames.com/us-east-1/filer_public/d5/20/d5208d61-8583-478b-a06d-b49fc9cd7aaa/zm7810_carcassonne_rules.pdf

Se consultaron las explicaciones públicas y extractos indexados del editor. Para el río se usa el inventario clásico de 12 losetas del reglamento Big Box, página 22, y la preparación clásica con nacimiento y lago. El texto de la página 9 de ese PDF corresponde a la variante de 17 losetas, que no se implementa. El mazo de terreno de 72 losetas y los campos quedan pendientes.

- Reglamento e inventario: https://cdn.svc.asmodee.net/production-zman/uploads/2024/10/Carcassonne-Big-Box-Rulebook.pdf
- Preparación clásica: https://images.zmangames.com/filer_public/39/ae/39aecf66-33ea-48a1-a53a-fcb885cb084b/carcassonne_v3_supplement_en_fixed_jan_20.pdf

Las partidas antiguas conservan el modo sin río y migran sus conexiones al cargar, corrigiendo la entrada del camino de Gran ciudad. La migración no recalcula puntuaciones históricas.

## Estructura

- `app.js`: catálogo, pantallas y representación de losetas.
- `engine.js`: reglas y estado de la adaptación inicial.
- `engine.test.js`: pruebas del motor y simulación de partidas completas.
- `river.test.js`: conexión del camino de Gran ciudad, migración, reglas del río y 100 partidas completas con río.
- `style.css`: diseño visual y adaptación móvil.
- `server.js`: servidor local sin dependencias externas.

Siguiente etapa: completar y verificar el inventario oficial y las reglas de campos, y extraer un registro de juegos cuando se incorpore el segundo título.

## Imágenes
Ver `assets/tiles/SOURCES.md` para procedencia y correspondencia.

Las curvas separadas por rectas pueden repetir sentido. Si una loseta de río no encaja en ninguna orientación se descarta; si se agota el río se continúa con terreno. Aclaración clásica: https://modernjive.com/carcassonne/carcassonnetheriver.htm

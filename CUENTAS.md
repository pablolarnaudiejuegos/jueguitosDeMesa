# Cuentas y resultados

Ejecutar `npm start` y abrir http://localhost:4173/profile.html.

Registro por nombre de usuario y contraseña (mínimo 10 caracteres). Recuperación mediante código privado mostrado una sola vez. No hay envío de correo. Contraseñas derivadas con scrypt, sesiones con cookie HttpOnly SameSite Strict, expiración de 7 días, limitación de intentos y control de origen.

Los datos viven en private-data/accounts.json, excluidos del servidor estático y de Git. Respaldar esa carpeta con el servidor detenido. No borrar para actualizar. MESA_DATA_DIR permite cambiar su ubicación.

Iniciar sesión antes de crear una partida. La cuenta se asocia al asiento 1; demás participantes son invitados. Partidas anteriores o comenzadas como invitado no se adjudican retroactivamente. Se conservan todos los puntajes; el récord personal usa el asiento 1 y se separa por juego/modalidad. Reintentos identificados por id evitan duplicados. Los resultados pendientes se reenvían al abrir la aplicación con la cuenta correspondiente.

Rival automático inicial para dos jugadores en ambos juegos. Respeta las validaciones del motor. No usa servicios externos ni modelo de lenguaje. Es una estrategia básica, no un rival experto.

Esta versión está alojada localmente (127.0.0.1). Para publicación: dominio, HTTPS, almacenamiento durable, copias de seguridad y operación de un único proceso o migración de persistencia a una base transaccional. MESA_HTTPS=1 activa Secure en las cookies detrás de HTTPS. Los puntajes provienen del cliente y no son aptos para rankings públicos verificados.

Pruebas: npm test. auth.test.js usa datos temporales aislados; accounts.test.js simula 16 partidas completas de máquina.

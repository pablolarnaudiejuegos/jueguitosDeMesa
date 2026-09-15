# Vercel y MongoDB
Equipo: pablolarnaudiejuegos-6828. Atlas: proyecto 6aa989ed5ac7a6c69ead35eb.
Configuración Vercel: Other, Node 22, npm run build, salida public.
Variables privadas: MONGODB_URI y MONGODB_DB=mesa_abierta.
Configurar usuario Atlas readWrite limitado a esa base y acceso de red correspondiente.
Usar base separada para previews.

El build excluye private-data y archivos del servidor. La API se ejecuta como función.
MongoDB conserva usuarios, sesiones y resultados; los índices únicos evitan duplicados.
Las partidas en curso siguen en localStorage. Los récords se calculan desde los resultados guardados. Puntuaciones recibidas del cliente, no verificadas contra fraude.

Importación: configurar MONGODB_URI privadamente; ejecutar node scripts/migrate.mjs para simular, luego node scripts/migrate.mjs --apply. Usa una transacción y no sobrescribe documentos existentes. Las sesiones no se transfieren. Conservar respaldo local e importar antes del registro público.

Pendiente: acceso a Vercel y Atlas, conexión real, importación y despliegue. Validar registro/login/recuperación/historial privado en producción y verificar que /private-data/accounts.json no sea público.

require('dotenv').config(); // Carga las variables de entorno desde el archivo .env
const mysql = require('mysql'); // Importando el módulo de base de datos

// Configuración de la conexión
const conexion = mysql.createConnection({
    host     : process.env.MYSQLHOST || 'localhost', // Usará la variable de entorno o 'localhost' como predeterminado
    user     : process.env.MYSQLUSER || 'root',      // Usará la variable de entorno o 'root' como predeterminado
    password : process.env.MYSQLPASSWORD || '',      // Usará la variable de entorno o contraseña vacía como predeterminado
    database : process.env.MYSQLDATABASE || 'crud_nodes_db', // Usará la variable de entorno o tu base de datos local
    port     : process.env.MYSQLPORT || 3306         // Usará la variable de entorno o el puerto 3306
});

// Conexión a la base de datos
conexion.connect((error) => {
    if (error) {
        console.error('El error de conexión es: ' + error);
        return;
    }
    console.log('¡Conectado a la Base de Datos!');
});

module.exports = conexion;

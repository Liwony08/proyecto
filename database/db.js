require('dotenv').config(); // Cargar variables de entorno desde .env
const mysql = require('mysql2'); // Importando el módulo de base de datos

// Configuración de la conexión
const conexion = mysql.createConnection({
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE || 'crud_nodes_db',
    port: process.env.MYSQLPORT || 3306
});

// Conexión a la base de datos
conexion.connect((error) => {
    if (error) {
        console.error('El error de conexión es: ' + error.message);
        return;
    }
    console.log('Conectado a la Base de Datos');
});

module.exports = conexion;

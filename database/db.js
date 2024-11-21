require('dotenv').config(); // Cargar variables de entorno
const mysql = require('mysql2');

// Configuración de la conexión
const conexion = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

// Probar la conexión
conexion.connect((error) => {
  if (error) {
    console.error('Error al conectar con la base de datos:', error.message);
    return;
  }
  console.log('Conexión exitosa a la base de datos');
});

module.exports = conexion;

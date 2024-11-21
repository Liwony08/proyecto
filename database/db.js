require('dotenv').config();
const mysql = require('mysql2');

const conexion = mysql.createConnection({
  host: process.env.MYSQLHOST, // Host proporcionado por Railway
  user: process.env.MYSQLUSER, // Usuario proporcionado por Railway
  password: process.env.MYSQLPASSWORD, // Contraseña proporcionada por Railway
  database: process.env.MYSQLDATABASE, // Nombre de la base de datos (probablemente "railway")
  port: process.env.MYSQLPORT // Puerto proporcionado por Railway
});

conexion.connect((error) => {
  if (error) {
    console.error('Error al conectar con la base de datos:', error.message);
    return;
  }
  console.log('Conexión exitosa a la base de datos');
});

module.exports = conexion;

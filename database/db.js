const mysql = require('mysql'); //importando el modulo de base de datos
const conexion = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'crud_nodes_db'  
});

conexion.connect((error)=>{
    if (error) {
      console.error('El error de conexión es: ' + error);
      return;
    }
    console.log('¡Conectado a la Base de Datos!');
  });
module.exports = conexion;
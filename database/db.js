const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
})

connection.connect((err)=>{
    if(err){
        console.log('El error de conexion es: ', err);
        return;
    } else {
        console.log('Conectado a la base de datos');
    }
})

module.exports = connection;
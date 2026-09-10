const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    charset: 'utf8mb4'
});

connection.connect((error) => {
    if (error) {
        console.error('Error al conectar con MySQL:', error.message);
        return;
    }

    console.log('Conexión con MySQL exitosa');
});

module.exports = connection;
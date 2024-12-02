const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool principal
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Pool para base de datos de clientes
const clientPool = mysql.createPool({
    host: process.env.DB_CLIENT_HOST,
    user: process.env.DB_CLIENT_USER,
    password: process.env.DB_CLIENT_PASSWORD,
    database: process.env.DB_CLIENT_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = {
    pool,
    clientPool
};
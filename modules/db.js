/*
    Slutprojekt Backend Databaser (FE23 Grit Academy)
    Kristoffer Bengtsson

    db.js
    Modules initializing MySQL database connection and proving the db handle for other modules. 
*/
import mysql from 'mysql2/promise';
import dotenv from 'dotenv/config';


// Establish connection to mysql database
// https://sidorares.github.io/node-mysql2/docs/documentation
const db = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default db;
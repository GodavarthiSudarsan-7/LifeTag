const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Sudu@61069',
    database: process.env.DB_NAME || 'lifetag_db',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Test connection on startup
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log(`[MySQL] Connected successfully to ${process.env.DB_NAME || 'lifetag_db'} on ${process.env.DB_HOST || '127.0.0.1'}`);
        connection.release();
    } catch (err) {
        console.error('[MySQL] Connection failed:', err.message);
    }
})();

module.exports = pool;

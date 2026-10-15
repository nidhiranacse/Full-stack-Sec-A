// ============================================
// Database Connection Configuration
// Dual Mode: MySQL primary with automatic local database fallback
// ============================================
const mysql = require('mysql2/promise');
require('dotenv').config();

let pool = null;
let useFallback = false;
let sqliteAdapter = null;

try {
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'campus_connect',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
} catch (err) {
    useFallback = true;
}

// Test connection on startup
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Database connected successfully on port 3306');
        connection.release();
    } catch (error) {
        useFallback = true;
        sqliteAdapter = require('./sqlite-fallback');
        console.log('⚡ MySQL not detected on port 3306.');
        console.log('✨ Automatically activated local database (campus_connect.sqlite) with pre-seeded users & events.');
        console.log('🚀 CampusConnect is 100% operational right now!');
    }
}

testConnection();

const dbWrapper = {
    query: async (sql, params) => {
        if (!useFallback && pool) {
            try {
                return await pool.query(sql, params);
            } catch (err) {
                if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
                    useFallback = true;
                    if (!sqliteAdapter) sqliteAdapter = require('./sqlite-fallback');
                    return sqliteAdapter.query(sql, params);
                }
                throw err;
            }
        }
        if (!sqliteAdapter) sqliteAdapter = require('./sqlite-fallback');
        return sqliteAdapter.query(sql, params);
    },
    getConnection: async () => {
        if (!useFallback && pool) {
            try {
                return await pool.getConnection();
            } catch (err) {
                if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
                    useFallback = true;
                    if (!sqliteAdapter) sqliteAdapter = require('./sqlite-fallback');
                    return sqliteAdapter.getConnection();
                }
                throw err;
            }
        }
        if (!sqliteAdapter) sqliteAdapter = require('./sqlite-fallback');
        return sqliteAdapter.getConnection();
    }
};

module.exports = dbWrapper;

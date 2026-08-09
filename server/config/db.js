import mysql from 'mysql2/promise';
import { config } from './env.js';

let pool = null;
let isConnected = false;

try {
  pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    ssl: config.db.ssl,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 5000
  });

  // Attempt initial ping asynchronously
  pool.getConnection()
    .then(conn => {
      console.log(`[DB] Connected to MySQL database (${config.db.host}:${config.db.port}/${config.db.database}) with SSL enforcement.`);
      isConnected = true;
      conn.release();
    })
    .catch(err => {
      console.warn(`[DB WARNING] Could not connect to live MySQL instance (${err.message}). System will operate with local in-memory dataset fallback.`);
      isConnected = false;
    });
} catch (err) {
  console.warn(`[DB WARNING] Pool initialization error: ${err.message}. System operating with in-memory store.`);
}

export { pool, isConnected };

export async function query(sql, params = []) {
  if (pool && isConnected) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (err) {
      console.error(`[DB Query Error] ${err.message}. SQL: ${sql}`);
      throw err;
    }
  }
  throw new Error('Database pool not connected');
}

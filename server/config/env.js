import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
dotenv.config(); // fallback to current dir .env

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'vtacs-super-secret-jwt-key-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vtacs_db',
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
  },
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  osrmBaseUrl: process.env.OSRM_BASE_URL || 'http://router.project-osrm.org'
};

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, isConnected } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  console.log('====================================================');
  console.log('       V-TACS DATABASE SEED RUNNER (PUNE REGION)    ');
  console.log('====================================================');

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedPath = path.join(__dirname, 'seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    if (isConnected && pool) {
      const conn = await pool.getConnection();
      console.log('[SEED] Connected to MySQL. Applying DDL schema...');

      // Split SQL queries by semicolon
      const schemaStatements = schemaSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of schemaStatements) {
        await conn.query(statement);
      }
      console.log('[SEED] Tables created successfully.');

      console.log('[SEED] Inserting seed records (Hospitals, Ambulances, Users)...');
      const seedStatements = seedSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of seedStatements) {
        try {
          await conn.query(statement);
        } catch (err) {
          // Ignore duplicate entry errors if re-running seed
          if (err.code !== 'ER_DUP_ENTRY') {
            console.warn(`[SEED WARN] Statement notice: ${err.message}`);
          }
        }
      }

      conn.release();
      console.log('====================================================');
      console.log(' ✅ SEED SUCCESSFUL! MYSQL DATABASE IS LIVE & READY ');
      console.log('====================================================');
      process.exit(0);
    } else {
      console.log('[SEED NOTICE] Live MySQL connection not active. Utilizing in-memory dataset store fallback.');
      console.log('V-TACS is ready to run in fallback mode!');
      process.exit(0);
    }
  } catch (error) {
    console.error('[SEED ERROR] Failed to seed database:', error.message);
    process.exit(1);
  }
}

runSeed();

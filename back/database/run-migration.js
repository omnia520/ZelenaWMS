const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function runMigration(sqlFile) {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(path.join(__dirname, sqlFile), 'utf8');
    console.log(`Ejecutando: ${sqlFile}`);
    await client.query(sql);
    console.log('✓ Migración ejecutada exitosamente');
  } catch (error) {
    console.error('✗ Error al ejecutar migración:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Obtener el nombre del archivo SQL desde los argumentos
const sqlFile = process.argv[2] || 'create_proveedores.sql';
runMigration(sqlFile);

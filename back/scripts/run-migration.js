require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const migrationFile = process.argv[2] || '003_add_missing_estados_and_columns.sql';
  const migrationPath = path.join(__dirname, '..', 'database', 'migrations', migrationFile);

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();

    console.log('Reading migration file:', migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration...');
    await client.query(sql);

    console.log('✅ Migration completed successfully!');

    client.release();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

runMigration();

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

async function verifyTable() {
  const client = await pool.connect();
  try {
    // Verificar que la tabla existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'proveedores'
      );
    `);
    console.log('Tabla existe:', tableExists.rows[0].exists);

    // Obtener estructura de la tabla
    const columns = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'proveedores'
      ORDER BY ordinal_position;
    `);

    console.log('\nEstructura de la tabla proveedores:');
    console.table(columns.rows);

    // Verificar índices
    const indexes = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'proveedores'
      ORDER BY indexname;
    `);

    console.log('\nÍndices creados:');
    indexes.rows.forEach(idx => {
      console.log(`- ${idx.indexname}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyTable();

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'wms_db'
});

async function verifyMigration() {
  const client = await pool.connect();

  try {
    console.log('📋 Usuarios en la base de datos:\n');

    const result = await client.query(`
      SELECT usuario_id, nombre, nombre_usuario, email, rol, activo
      FROM usuarios
      ORDER BY usuario_id
    `);

    console.table(result.rows);

    console.log('\n✅ Total de usuarios:', result.rows.length);
    console.log('\n🔐 Puedes iniciar sesión con cualquiera de estos nombres de usuario y su contraseña');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyMigration();

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'wms_db'
});

async function checkEstados() {
  const client = await pool.connect();

  try {
    console.log('📋 Estados definidos en la base de datos:\n');

    // Obtener el constraint de la tabla
    const constraintQuery = `
      SELECT
        pg_get_constraintdef(oid) as constraint_def
      FROM pg_constraint
      WHERE conname LIKE '%ordenes_venta%estado%'
        AND conrelid = 'ordenes_venta'::regclass;
    `;

    const constraintResult = await client.query(constraintQuery);

    if (constraintResult.rows.length > 0) {
      console.log('🔍 Constraint de estados:');
      console.log(constraintResult.rows[0].constraint_def);
      console.log('\n');
    }

    // Obtener estados en uso
    const estadosEnUso = await client.query(`
      SELECT estado, COUNT(*) as cantidad
      FROM ordenes_venta
      GROUP BY estado
      ORDER BY estado
    `);

    if (estadosEnUso.rows.length > 0) {
      console.log('📊 Estados actualmente en uso:\n');
      console.table(estadosEnUso.rows);
    } else {
      console.log('ℹ️  No hay órdenes en la base de datos aún.');
    }

    console.log('\n✅ Estados válidos según schema:');
    console.log('  1. Pendiente_Aprobacion (estado por defecto)');
    console.log('  2. Aprobada');
    console.log('  3. En_Alistamiento');
    console.log('  4. En_Empaque');
    console.log('  5. Lista_Facturar');
    console.log('  6. Facturada');
    console.log('  7. Rechazada');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkEstados();

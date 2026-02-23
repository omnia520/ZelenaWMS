/**
 * Script para verificar si la columna stock_reservado existe en la tabla productos
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST.includes('azure') ? { rejectUnauthorized: false } : false,
});

async function verificarColumna() {
  try {
    console.log('🔍 Verificando columna stock_reservado...\n');

    // Verificar si la columna existe
    const result = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'productos'
      AND column_name = 'stock_reservado'
    `);

    if (result.rows.length > 0) {
      console.log('✅ La columna stock_reservado existe en la tabla productos');
      console.log('   Tipo de dato:', result.rows[0].data_type);
      console.log('   Valor por defecto:', result.rows[0].column_default);

      // Verificar datos de ejemplo
      const sampleResult = await pool.query(`
        SELECT producto_id, codigo, nombre, stock_actual, stock_reservado,
               (stock_actual - COALESCE(stock_reservado, 0)) as cantidad_disponible
        FROM productos
        LIMIT 5
      `);

      console.log('\n📊 Datos de ejemplo:');
      console.table(sampleResult.rows);

    } else {
      console.log('❌ La columna stock_reservado NO existe en la tabla productos');
      console.log('\n📝 Necesitas ejecutar la migración:');
      console.log('   psql -U postgres -d wms_db -f database/migrations/002_add_stock_reservado_column.sql');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verificarColumna();

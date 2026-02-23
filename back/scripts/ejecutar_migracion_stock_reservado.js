const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function ejecutarMigracion() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Conectando a la base de datos...');
    const client = await pool.connect();

    console.log('Ejecutando migración: agregar columna stock_reservado...');

    // Agregar columna stock_reservado si no existe
    const checkColumn = await client.query(`
      SELECT 1
      FROM information_schema.columns
      WHERE table_name='productos' AND column_name='stock_reservado'
    `);

    if (checkColumn.rows.length === 0) {
      console.log('Agregando columna stock_reservado...');
      await client.query(`
        ALTER TABLE productos
        ADD COLUMN stock_reservado INTEGER DEFAULT 0 NOT NULL
      `);
      console.log('✓ Columna stock_reservado agregada exitosamente');
    } else {
      console.log('✓ Columna stock_reservado ya existe');
    }

    // Asegurar que todos los productos existentes tengan stock_reservado = 0
    console.log('Inicializando stock_reservado en productos existentes...');
    const updateResult = await client.query(`
      UPDATE productos SET stock_reservado = 0 WHERE stock_reservado IS NULL
    `);
    console.log(`✓ ${updateResult.rowCount} productos actualizados`);

    // Agregar constraint para evitar valores negativos
    const checkConstraint = await client.query(`
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'productos_stock_reservado_check'
    `);

    if (checkConstraint.rows.length === 0) {
      console.log('Agregando constraint para stock_reservado...');
      await client.query(`
        ALTER TABLE productos
        ADD CONSTRAINT productos_stock_reservado_check
        CHECK (stock_reservado >= 0)
      `);
      console.log('✓ Constraint productos_stock_reservado_check agregado exitosamente');
    } else {
      console.log('✓ Constraint productos_stock_reservado_check ya existe');
    }

    console.log('\n✅ Migración completada exitosamente!');
    console.log('Ahora puedes reiniciar el servidor backend y crear órdenes sin problemas.');

    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando la migración:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

ejecutarMigracion();

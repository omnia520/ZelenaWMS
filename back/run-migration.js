const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
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

  try {
    console.log('🔌 Conectando a la base de datos...');
    console.log('   Host: ' + process.env.DB_HOST);
    console.log('   Database: ' + process.env.DB_NAME);
    console.log('');

    const migrationPath = path.join(__dirname, 'database', 'migrations', '009_add_cantidad_reservada_inventario.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Ejecutando migración: 009_add_cantidad_reservada_inventario.sql');
    console.log('');

    await pool.query(migrationSQL);

    console.log('✅ ¡Migración ejecutada exitosamente!');
    console.log('');
    console.log('📊 Verificando cambios...');

    const checkResult = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'inventario_ubicaciones'
      AND column_name = 'cantidad_reservada'
    `);

    if (checkResult.rows.length > 0) {
      console.log('✅ Columna cantidad_reservada agregada correctamente:');
      console.log('   - Tabla: inventario_ubicaciones');
      console.log('   - Tipo: ' + checkResult.rows[0].data_type);
      console.log('   - Default: ' + checkResult.rows[0].column_default);
    } else {
      console.log('⚠️  No se pudo verificar la columna.');
    }

    console.log('');
    console.log('🎉 ¡Sistema de reserva de inventario listo para usar!');
    console.log('');
    console.log('📝 Configuración actual:');
    console.log('   ENABLE_INVENTORY_RESERVATION=' + process.env.ENABLE_INVENTORY_RESERVATION);

  } catch (error) {
    console.error('❌ Error al ejecutar la migración:');
    console.error('   ' + error.message);
    console.error('');

    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('ℹ️  La migración ya fue ejecutada anteriormente.');
      console.log('   El sistema de reserva de inventario ya está disponible.');
    } else {
      console.error('Detalles del error:');
      console.error(error);
    }
  } finally {
    await pool.end();
    console.log('');
    console.log('🔌 Conexión cerrada.');
  }
}

runMigration();

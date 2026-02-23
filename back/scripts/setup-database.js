const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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

async function executeSQLFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`\n📄 Ejecutando: ${path.basename(filePath)}`);

    await pool.query(sql);

    console.log(`✓ ${path.basename(filePath)} ejecutado exitosamente`);
    return true;
  } catch (error) {
    console.error(`✗ Error en ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

async function setupDatabase() {
  console.log('🚀 Iniciando configuración de la base de datos...\n');

  try {
    // Verificar conexión
    const client = await pool.connect();
    console.log('✓ Conexión a la base de datos exitosa\n');
    client.release();

    // Ejecutar schema (estructura de tablas)
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSuccess = await executeSQLFile(schemaPath);

    if (!schemaSuccess) {
      console.log('\n⚠️  Advertencia: Puede que las tablas ya existan. Continuando con los datos...\n');
    }

    // Ejecutar seed (datos de prueba)
    const seedPath = path.join(__dirname, '../database/seed.sql');
    const seedSuccess = await executeSQLFile(seedPath);

    if (seedSuccess) {
      console.log('\n✅ Base de datos configurada exitosamente con datos de prueba');
      console.log('\n📊 Datos creados:');
      console.log('   - 5 Usuarios (Vendedor, Jefe Bodega, Operarios, Facturación)');
      console.log('   - 5 Clientes del sector belleza');
      console.log('   - 15 Productos de maquillaje');
      console.log('   - 10 Ubicaciones de almacén');
      console.log('   - 6 Órdenes de venta en diferentes estados');
      console.log('   - 1 Recepción de mercancía');
      console.log('\n🔑 Credenciales de acceso:');
      console.log('   Email: admin@wms.com');
      console.log('   Password: admin123');
    }

  } catch (error) {
    console.error('\n❌ Error general:', error.message);
  } finally {
    await pool.end();
    console.log('\n👋 Proceso finalizado');
  }
}

setupDatabase();

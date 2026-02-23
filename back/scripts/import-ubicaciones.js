const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión a Azure
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

async function importUbicaciones() {
  const client = await pool.connect();

  try {
    console.log('🔄 Conectando a la base de datos de Azure...');

    // Leer el archivo CSV
    const csvPath = path.join(__dirname, '../../Ubicaciones.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lineas = csvContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    console.log(`📦 Se encontraron ${lineas.length} ubicaciones en el CSV`);
    console.log('📌 Las ubicaciones existentes se mantendrán, solo se agregarán las nuevas\n');

    await client.query('BEGIN');

    console.log('📝 Insertando ubicaciones...');
    let insertadas = 0;
    let errores = 0;

    for (let i = 0; i < lineas.length; i++) {
      const codigo = lineas[i];

      try {
        // Insertar la ubicación con el código completo
        await client.query(
          `INSERT INTO ubicaciones (codigo, descripcion, orden_ruta, activa)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (codigo) DO NOTHING`,
          [codigo, `Ubicación ${codigo}`, i + 1, true]
        );
        insertadas++;

        if (insertadas % 20 === 0) {
          console.log(`   ✓ ${insertadas}/${lineas.length} ubicaciones insertadas...`);
        }
      } catch (error) {
        errores++;
        console.log(`   ✗ Error al insertar ${codigo}:`, error.message);
      }
    }

    await client.query('COMMIT');

    console.log('\n✅ Proceso completado!');
    console.log(`   • Ubicaciones insertadas: ${insertadas}`);
    console.log(`   • Errores: ${errores}`);

    // Verificar el total de ubicaciones
    const result = await client.query('SELECT COUNT(*) FROM ubicaciones WHERE activa = true');
    console.log(`   • Total de ubicaciones activas en la BD: ${result.rows[0].count}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar el script
importUbicaciones();

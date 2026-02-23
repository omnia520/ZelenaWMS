const { query } = require('../src/config/db');

async function agregarColumnas() {
  console.log('📝 Agregando columnas necesarias...\n');

  try {
    // Columnas en ordenes_venta
    console.log('Columnas en ordenes_venta:');

    await query(`ALTER TABLE ordenes_venta ADD COLUMN IF NOT EXISTS fecha_inicio_alistamiento TIMESTAMP NULL`);
    console.log('  ✅ fecha_inicio_alistamiento');

    await query(`ALTER TABLE ordenes_venta ADD COLUMN IF NOT EXISTS fecha_fin_alistamiento TIMESTAMP NULL`);
    console.log('  ✅ fecha_fin_alistamiento');

    await query(`ALTER TABLE ordenes_venta ADD COLUMN IF NOT EXISTS fecha_inicio_empaque TIMESTAMP NULL`);
    console.log('  ✅ fecha_inicio_empaque');

    await query(`ALTER TABLE ordenes_venta ADD COLUMN IF NOT EXISTS fecha_fin_empaque TIMESTAMP NULL`);
    console.log('  ✅ fecha_fin_empaque');

    await query(`ALTER TABLE ordenes_venta ADD COLUMN IF NOT EXISTS observacion_alistador TEXT NULL`);
    console.log('  ✅ observacion_alistador');

    await query(`ALTER TABLE ordenes_venta ADD COLUMN IF NOT EXISTS observacion_empacador TEXT NULL`);
    console.log('  ✅ observacion_empacador');

    // Columnas en orden_detalles
    console.log('\nColumnas en orden_detalles:');

    await query(`ALTER TABLE orden_detalles ADD COLUMN IF NOT EXISTS alistamiento_completado BOOLEAN DEFAULT FALSE`);
    console.log('  ✅ alistamiento_completado');

    await query(`ALTER TABLE orden_detalles ADD COLUMN IF NOT EXISTS empaque_completado BOOLEAN DEFAULT FALSE`);
    console.log('  ✅ empaque_completado');

    console.log('\n✨ ¡Todas las columnas agregadas correctamente!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }

  process.exit(0);
}

agregarColumnas().catch(error => {
  console.error('❌ Error general:', error);
  process.exit(1);
});

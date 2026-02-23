const { query } = require('../src/config/db');

async function actualizarTodo() {
  console.log('🔧 Actualizando base de datos...\n');

  try {
    // 1. Actualizar estados existentes
    console.log('📝 Paso 1: Actualizando estados existentes...');

    await query(`UPDATE ordenes_venta SET estado = 'Aprobada' WHERE estado = 'Aprobado'`);
    console.log('  ✅ "Aprobado" → "Aprobada"');

    await query(`UPDATE ordenes_venta SET estado = 'En_Alistamiento' WHERE estado = 'En Alistamiento'`);
    console.log('  ✅ "En Alistamiento" → "En_Alistamiento"');

    await query(`UPDATE ordenes_venta SET estado = 'Listo_Para_Despachar' WHERE estado = 'Listo para despachar'`);
    console.log('  ✅ "Listo para despachar" → "Listo_Para_Despachar"');

    await query(`UPDATE ordenes_venta SET estado = 'Pendiente_Aprobacion' WHERE estado = 'Pendiente'`);
    console.log('  ✅ "Pendiente" → "Pendiente_Aprobacion"');

    await query(`UPDATE ordenes_venta SET estado = 'Facturada' WHERE estado = 'Terminado'`);
    console.log('  ✅ "Terminado" → "Facturada"');

    // 2. Eliminar constraint existente
    console.log('\n📝 Paso 2: Eliminando constraint anterior...');
    await query('ALTER TABLE ordenes_venta DROP CONSTRAINT IF EXISTS ordenes_venta_estado_check');
    console.log('  ✅ Constraint eliminado');

    // 3. Agregar nuevo constraint
    console.log('\n📝 Paso 3: Creando nuevo constraint...');
    await query(`
      ALTER TABLE ordenes_venta
      ADD CONSTRAINT ordenes_venta_estado_check
      CHECK (estado IN (
        'Borrador',
        'Pendiente_Aprobacion',
        'Aprobada',
        'En_Alistamiento',
        'Listo_Para_Empacar',
        'En_Empaque',
        'Listo_Para_Despachar',
        'Lista_Facturar',
        'Facturada',
        'Rechazada'
      ))
    `);
    console.log('  ✅ Nuevo constraint creado');

    // 4. Verificar
    console.log('\n📝 Paso 4: Verificando cambios...');
    const result = await query('SELECT DISTINCT estado FROM ordenes_venta ORDER BY estado');
    console.log('\n  Estados actuales en la base de datos:');
    result.rows.forEach(row => {
      console.log(`    ✓ ${row.estado}`);
    });

    console.log('\n✨ ¡Base de datos actualizada correctamente!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }

  process.exit(0);
}

actualizarTodo().catch(error => {
  console.error('❌ Error general:', error);
  process.exit(1);
});

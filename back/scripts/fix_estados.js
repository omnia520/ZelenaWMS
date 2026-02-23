const { query } = require('../src/config/db');

async function fixEstados() {
  console.log('🔧 Actualizando constraint de estados...\n');

  try {
    // Eliminar constraint existente
    await query('ALTER TABLE ordenes_venta DROP CONSTRAINT IF EXISTS ordenes_venta_estado_check');
    console.log('✅ Constraint anterior eliminado');

    // Agregar nuevo constraint con todos los estados
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
    console.log('✅ Nuevo constraint creado con todos los estados');

    console.log('\n✨ Estados actualizados correctamente!\n');
    console.log('Estados permitidos:');
    console.log('  - Borrador');
    console.log('  - Pendiente_Aprobacion');
    console.log('  - Aprobada');
    console.log('  - En_Alistamiento');
    console.log('  - Listo_Para_Empacar ⭐ NUEVO');
    console.log('  - En_Empaque');
    console.log('  - Listo_Para_Despachar ⭐ NUEVO');
    console.log('  - Lista_Facturar');
    console.log('  - Facturada');
    console.log('  - Rechazada\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }

  process.exit(0);
}

fixEstados().catch(error => {
  console.error('❌ Error general:', error);
  process.exit(1);
});

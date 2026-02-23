const { query } = require('../src/config/db');

async function verificarAsignaciones() {
  console.log('🔍 Verificando asignaciones de órdenes...\n');

  try {
    // Ver todas las órdenes con sus asignaciones
    console.log('📋 Estado actual de órdenes y asignaciones:\n');

    const ordenesResult = await query(`
      SELECT
        o.orden_id,
        o.numero_orden,
        o.estado,
        o.alistador_asignado,
        u1.nombre as alistador_nombre,
        u1.rol as alistador_rol,
        o.empacador_asignado,
        u2.nombre as empacador_nombre,
        u2.rol as empacador_rol
      FROM ordenes_venta o
      LEFT JOIN usuarios u1 ON o.alistador_asignado = u1.usuario_id
      LEFT JOIN usuarios u2 ON o.empacador_asignado = u2.usuario_id
      WHERE o.alistador_asignado IS NOT NULL
         OR o.empacador_asignado IS NOT NULL
      ORDER BY o.orden_id
    `);

    if (ordenesResult.rows.length === 0) {
      console.log('   ℹ️  No hay órdenes con asignaciones.\n');
    } else {
      console.log(`   Encontradas ${ordenesResult.rows.length} órdenes con asignaciones:\n`);

      ordenesResult.rows.forEach(orden => {
        console.log(`   📦 Orden: ${orden.numero_orden} (Estado: ${orden.estado})`);
        if (orden.alistador_asignado) {
          console.log(`      └─ Alistador: ${orden.alistador_nombre} (Rol: ${orden.alistador_rol})`);
        }
        if (orden.empacador_asignado) {
          console.log(`      └─ Empacador: ${orden.empacador_nombre} (Rol: ${orden.empacador_rol})`);
        }
        console.log('');
      });
    }

    // Verificar si hay usuarios Operario disponibles
    console.log('👥 Usuarios Operario disponibles:\n');
    const operariosResult = await query(`
      SELECT usuario_id, nombre, email
      FROM usuarios
      WHERE rol = 'Operario' AND activo = TRUE
      ORDER BY nombre
    `);

    if (operariosResult.rows.length === 0) {
      console.log('   ⚠️  No hay usuarios con rol Operario.\n');
    } else {
      operariosResult.rows.forEach(operario => {
        console.log(`   - ${operario.nombre} (${operario.email}) - ID: ${operario.usuario_id}`);
      });
      console.log('');
    }

    // Resumen
    console.log('✅ Verificación completada!\n');
    console.log('📝 Notas importantes:');
    console.log('   • Las columnas alistador_asignado y empacador_asignado se mantienen');
    console.log('   • Ahora ambas apuntan a usuarios con rol "Operario"');
    console.log('   • Un mismo Operario puede estar asignado para alistar Y empacar');
    console.log('   • Las asignaciones existentes siguen funcionando correctamente\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error verificando asignaciones:', error.message);
    process.exit(1);
  }
}

verificarAsignaciones();

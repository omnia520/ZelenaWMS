const { query } = require('../src/config/db');

async function corregirAsignaciones() {
  console.log('🔧 Corrigiendo asignaciones de órdenes...\n');

  try {
    // Obtener operarios disponibles
    const operariosResult = await query(`
      SELECT usuario_id, nombre
      FROM usuarios
      WHERE rol = 'Operario' AND activo = TRUE
      ORDER BY usuario_id
      LIMIT 4
    `);

    if (operariosResult.rows.length < 2) {
      console.log('❌ Error: Se necesitan al menos 2 operarios activos.\n');
      process.exit(1);
    }

    const operarios = operariosResult.rows;
    console.log(`👥 Operarios disponibles: ${operarios.length}`);
    operarios.forEach(op => console.log(`   - ${op.nombre} (ID: ${op.usuario_id})`));
    console.log('');

    // Obtener órdenes con asignaciones incorrectas
    const ordenesIncorrectasResult = await query(`
      SELECT
        o.orden_id,
        o.numero_orden,
        o.estado,
        o.alistador_asignado,
        u1.rol as alistador_rol,
        o.empacador_asignado,
        u2.rol as empacador_rol
      FROM ordenes_venta o
      LEFT JOIN usuarios u1 ON o.alistador_asignado = u1.usuario_id
      LEFT JOIN usuarios u2 ON o.empacador_asignado = u2.usuario_id
      WHERE (o.alistador_asignado IS NOT NULL AND u1.rol != 'Operario')
         OR (o.empacador_asignado IS NOT NULL AND u2.rol != 'Operario')
    `);

    console.log(`📋 Órdenes con asignaciones incorrectas: ${ordenesIncorrectasResult.rows.length}\n`);

    if (ordenesIncorrectasResult.rows.length === 0) {
      console.log('✅ No hay órdenes con asignaciones incorrectas. Todo está correcto!\n');
      process.exit(0);
    }

    let corregidas = 0;

    for (const orden of ordenesIncorrectasResult.rows) {
      console.log(`🔄 Corrigiendo orden: ${orden.numero_orden}`);

      let nuevoAlistador = orden.alistador_asignado;
      let nuevoEmpacador = orden.empacador_asignado;

      // Asignar operarios de forma alternada
      const operarioAlistador = operarios[corregidas % operarios.length];
      const operarioEmpacador = operarios[(corregidas + 1) % operarios.length];

      if (orden.alistador_rol !== 'Operario') {
        nuevoAlistador = operarioAlistador.usuario_id;
        console.log(`   └─ Alistador cambiado a: ${operarioAlistador.nombre}`);
      }

      if (orden.empacador_rol !== 'Operario') {
        nuevoEmpacador = operarioEmpacador.usuario_id;
        console.log(`   └─ Empacador cambiado a: ${operarioEmpacador.nombre}`);
      }

      await query(`
        UPDATE ordenes_venta
        SET alistador_asignado = $1, empacador_asignado = $2
        WHERE orden_id = $3
      `, [nuevoAlistador, nuevoEmpacador, orden.orden_id]);

      corregidas++;
      console.log('');
    }

    console.log(`✅ Se corrigieron ${corregidas} órdenes exitosamente!\n`);

    // Verificación final
    console.log('📊 Verificación final:');
    const verificacionResult = await query(`
      SELECT
        COUNT(*) as total_ordenes,
        COUNT(CASE WHEN u1.rol = 'Operario' THEN 1 END) as alistadores_correctos,
        COUNT(CASE WHEN u2.rol = 'Operario' THEN 1 END) as empacadores_correctos
      FROM ordenes_venta o
      LEFT JOIN usuarios u1 ON o.alistador_asignado = u1.usuario_id
      LEFT JOIN usuarios u2 ON o.empacador_asignado = u2.usuario_id
      WHERE o.alistador_asignado IS NOT NULL OR o.empacador_asignado IS NOT NULL
    `);

    const stats = verificacionResult.rows[0];
    console.log(`   Total de órdenes asignadas: ${stats.total_ordenes}`);
    console.log(`   Alistadores Operario: ${stats.alistadores_correctos}`);
    console.log(`   Empacadores Operario: ${stats.empacadores_correctos}\n`);

    console.log('🎉 Proceso completado!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error corrigiendo asignaciones:', error.message);
    process.exit(1);
  }
}

corregirAsignaciones();

const { query } = require('../src/config/db');

async function ejecutarMigracion() {
  console.log('🔄 Ejecutando migración: Unificar roles a Operario...\n');

  try {
    // IMPORTANTE: Primero eliminar el constraint, luego actualizar usuarios

    // Paso 1: Eliminar el constraint antiguo
    console.log('📝 Paso 1: Eliminando constraint antiguo...');
    await query(`
      ALTER TABLE usuarios
      DROP CONSTRAINT IF EXISTS usuarios_rol_check
    `);
    console.log('   ✅ Constraint antiguo eliminado\n');

    // Paso 2: Actualizar usuarios existentes (ahora sin restricción)
    console.log('📝 Paso 2: Actualizando usuarios existentes con rol Alistador o Empacador...');
    const updateResult = await query(`
      UPDATE usuarios
      SET rol = 'Operario'
      WHERE rol IN ('Alistador', 'Empacador')
    `);
    console.log(`   ✅ ${updateResult.rowCount} usuarios actualizados\n`);

    // Paso 3: Agregar el nuevo constraint
    console.log('📝 Paso 3: Agregando nuevo constraint con rol Operario...');
    await query(`
      ALTER TABLE usuarios
      ADD CONSTRAINT usuarios_rol_check
      CHECK (rol IN ('Vendedor', 'Jefe_Bodega', 'Operario', 'Facturacion', 'Administrador'))
    `);
    console.log('   ✅ Nuevo constraint agregado\n');

    // Verificación
    console.log('📝 Verificación: Roles actuales en la base de datos:');
    const rolesResult = await query('SELECT DISTINCT rol FROM usuarios ORDER BY rol');
    rolesResult.rows.forEach(row => console.log(`   - ${row.rol}`));

    console.log('\n✨ Migración completada exitosamente!\n');
    console.log('🎉 Ahora puedes registrar usuarios con el rol "Operario".\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error ejecutando migración:', error.message);
    if (error.detail) console.error('Detalle:', error.detail);
    if (error.hint) console.error('Sugerencia:', error.hint);
    process.exit(1);
  }
}

ejecutarMigracion();

const { query } = require('../src/config/db');

async function addJefeBodega() {
  try {
    console.log('Agregando usuario Jefe de Bodega...');

    const sql = `
      INSERT INTO usuarios (nombre, nombre_usuario, email, telefono, rol, password_hash, activo)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING usuario_id, nombre, nombre_usuario, email, rol, activo, fecha_creacion
    `;

    const values = [
      'Pedro Ramírez',
      'jefe_bodega',
      'jefe.bodega@wms.com',
      '3001122334',
      'Jefe_Bodega',
      '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', // password123
      true
    ];

    const result = await query(sql, values);

    console.log('\n✓ Usuario creado exitosamente:');
    console.log('  ID:', result.rows[0].usuario_id);
    console.log('  Nombre:', result.rows[0].nombre);
    console.log('  Usuario:', result.rows[0].nombre_usuario);
    console.log('  Email:', result.rows[0].email);
    console.log('  Rol:', result.rows[0].rol);
    console.log('  Contraseña: password123');

    // Listar todos los Jefes de Bodega
    const listResult = await query(
      `SELECT usuario_id, nombre, nombre_usuario, email, telefono, rol, activo, fecha_creacion
       FROM usuarios
       WHERE rol = 'Jefe_Bodega'
       ORDER BY fecha_creacion DESC`,
      []
    );

    console.log('\n✓ Usuarios con rol Jefe de Bodega:');
    listResult.rows.forEach(user => {
      console.log(`  - ${user.nombre} (${user.nombre_usuario}) - ${user.email || 'Sin email'}`);
    });

    process.exit(0);
  } catch (error) {
    if (error.code === '23505') {
      console.error('\n✗ Error: El nombre de usuario o email ya existe');
      console.error('  Detalle:', error.detail);
    } else {
      console.error('\n✗ Error al crear usuario:', error.message);
    }
    process.exit(1);
  }
}

addJefeBodega();

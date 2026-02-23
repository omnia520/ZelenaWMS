const bcrypt = require('bcrypt');
const { query } = require('../src/config/db');

async function addJefeBodega() {
  try {
    console.log('Generando hash de contraseña...');

    // Generar un nuevo hash con bcrypt
    const password = 'bodega123';
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    console.log('Hash generado correctamente');
    console.log('Agregando usuario Jefe de Bodega...');

    const sql = `
      INSERT INTO usuarios (nombre, nombre_usuario, email, telefono, rol, password_hash, activo)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING usuario_id, nombre, nombre_usuario, email, rol, activo, fecha_creacion
    `;

    const values = [
      'Carlos Mendoza',           // Nombre completo
      'jefebodega',               // Nombre de usuario (sin guión bajo)
      'carlos.mendoza@wms.com',   // Email
      '3009988776',               // Teléfono
      'Jefe_Bodega',              // Rol
      password_hash,              // Hash recién generado
      true                        // Activo
    ];

    const result = await query(sql, values);

    console.log('\n✓ Usuario creado exitosamente:');
    console.log('  ID:', result.rows[0].usuario_id);
    console.log('  Nombre:', result.rows[0].nombre);
    console.log('  Usuario:', result.rows[0].nombre_usuario);
    console.log('  Email:', result.rows[0].email);
    console.log('  Rol:', result.rows[0].rol);
    console.log('  Contraseña:', password);
    console.log('\n==============================================');
    console.log('CREDENCIALES PARA LOGIN:');
    console.log('Usuario: ' + result.rows[0].nombre_usuario);
    console.log('Contraseña: ' + password);
    console.log('==============================================\n');

    // Verificar que podemos encontrar el usuario
    const verifyResult = await query(
      `SELECT usuario_id, nombre, nombre_usuario, email, rol, activo
       FROM usuarios
       WHERE nombre_usuario = $1`,
      [result.rows[0].nombre_usuario]
    );

    if (verifyResult.rows.length > 0) {
      console.log('✓ Verificación exitosa: Usuario encontrado en la base de datos');
    } else {
      console.log('✗ Error: No se pudo encontrar el usuario después de crearlo');
    }

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

const { pool } = require('../src/config/db');

async function fixPasswords() {
  const client = await pool.connect();

  try {
    console.log('🔐 Actualizando contraseñas...\n');

    // Hash para admin123
    const hashAdmin = '$2b$10$FW.MAsQzJFg9NL2P6T7qAu5QrlT8yL0okCd8qE19N0wL9Ae0Fa8t.';

    // Hash para password123
    const hashPassword = '$2b$10$v7fpkcxG2W1dZMqSQApM8OqvNnUTiNZx1Y22pCoS8anCXIw0R06Wi';

    await client.query('UPDATE usuarios SET password_hash = $1 WHERE nombre_usuario = $2', [hashAdmin, 'admin']);
    console.log('✓ Admin actualizado');

    await client.query('UPDATE usuarios SET password_hash = $1 WHERE nombre_usuario = $2', [hashPassword, 'vendedor1']);
    console.log('✓ Vendedor1 actualizado');

    await client.query('UPDATE usuarios SET password_hash = $1 WHERE nombre_usuario = $2', [hashPassword, 'jefe_bodega']);
    console.log('✓ Jefe_bodega actualizado');

    await client.query('UPDATE usuarios SET password_hash = $1 WHERE nombre_usuario = $2', [hashPassword, 'operario1']);
    console.log('✓ Operario1 actualizado');

    await client.query('UPDATE usuarios SET password_hash = $1 WHERE nombre_usuario = $2', [hashPassword, 'operario2']);
    console.log('✓ Operario2 actualizado');

    await client.query('UPDATE usuarios SET password_hash = $1 WHERE nombre_usuario = $2', [hashPassword, 'facturacion']);
    console.log('✓ Facturacion actualizado');

    console.log('\n✅ Todas las contraseñas actualizadas correctamente\n');
    console.log('Credenciales:');
    console.log('  - admin / admin123');
    console.log('  - vendedor1 / password123');
    console.log('  - jefe_bodega / password123');
    console.log('  - operario1 / password123');
    console.log('  - operario2 / password123');
    console.log('  - facturacion / password123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixPasswords();

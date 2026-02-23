const bcrypt = require('bcrypt');
const { query } = require('../src/config/db');

const usuarios = [
  { nombre: 'Juan Pérez', email: 'operario1@wms.com', telefono: '3001234567', rol: 'Operario', password: 'password123' },
  { nombre: 'María García', email: 'operario2@wms.com', telefono: '3001234568', rol: 'Operario', password: 'password123' },
  { nombre: 'Carlos Rodríguez', email: 'operario3@wms.com', telefono: '3001234569', rol: 'Operario', password: 'password123' },
  { nombre: 'Ana Martínez', email: 'operario4@wms.com', telefono: '3001234570', rol: 'Operario', password: 'password123' },
  { nombre: 'Luis Sánchez', email: 'vendedor1@wms.com', telefono: '3001234571', rol: 'Vendedor', password: 'password123' },
  { nombre: 'Sofia López', email: 'jefe@wms.com', telefono: '3001234572', rol: 'Jefe_Bodega', password: 'password123' }
];

async function crearUsuarios() {
  console.log('🔐 Generando usuarios de prueba...\n');

  for (const usuario of usuarios) {
    try {
      // Verificar si el usuario ya existe
      const existente = await query('SELECT * FROM usuarios WHERE email = $1', [usuario.email]);

      if (existente.rows.length > 0) {
        console.log(`⚠️  ${usuario.email} ya existe, actualizando contraseña...`);

        // Actualizar solo la contraseña
        const password_hash = await bcrypt.hash(usuario.password, 10);
        await query('UPDATE usuarios SET password_hash = $1 WHERE email = $2', [password_hash, usuario.email]);

        console.log(`✅ Contraseña actualizada para ${usuario.email}`);
      } else {
        // Crear nuevo usuario
        const password_hash = await bcrypt.hash(usuario.password, 10);

        await query(
          `INSERT INTO usuarios (nombre, email, password_hash, telefono, rol, activo)
           VALUES ($1, $2, $3, $4, $5, TRUE)`,
          [usuario.nombre, usuario.email, password_hash, usuario.telefono, usuario.rol]
        );

        console.log(`✅ Usuario creado: ${usuario.email}`);
      }
    } catch (error) {
      console.error(`❌ Error con ${usuario.email}:`, error.message);
    }
  }

  console.log('\n✨ Proceso completado!\n');
  console.log('Usuarios disponibles (contraseña: password123):');
  console.log('- operario1@wms.com (puede alistar y empacar)');
  console.log('- operario2@wms.com (puede alistar y empacar)');
  console.log('- operario3@wms.com (puede alistar y empacar)');
  console.log('- operario4@wms.com (puede alistar y empacar)');
  console.log('- vendedor1@wms.com');
  console.log('- jefe@wms.com');

  process.exit(0);
}

crearUsuarios().catch(error => {
  console.error('❌ Error general:', error);
  process.exit(1);
});

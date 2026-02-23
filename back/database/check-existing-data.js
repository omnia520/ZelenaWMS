const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function checkData() {
  const client = await pool.connect();
  try {
    // Verificar usuarios
    const usuarios = await client.query('SELECT usuario_id, nombre, rol FROM usuarios LIMIT 5');
    console.log('\n=== USUARIOS ===');
    console.table(usuarios.rows);

    // Verificar productos
    const productos = await client.query('SELECT producto_id, codigo, nombre FROM productos LIMIT 10');
    console.log('\n=== PRODUCTOS ===');
    console.table(productos.rows);

    // Verificar ubicaciones
    const ubicaciones = await client.query('SELECT ubicacion_id, codigo, descripcion FROM ubicaciones LIMIT 10');
    console.log('\n=== UBICACIONES ===');
    console.table(ubicaciones.rows);

    // Verificar proveedores actuales
    const proveedores = await client.query('SELECT proveedor_id, nombre FROM proveedores');
    console.log('\n=== PROVEEDORES ACTUALES ===');
    console.table(proveedores.rows);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkData();

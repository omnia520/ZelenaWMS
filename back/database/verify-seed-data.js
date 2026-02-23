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

async function verifyData() {
  const client = await pool.connect();
  try {
    console.log('\n========================================');
    console.log('  VERIFICACIÓN DE DATOS DE PRUEBA');
    console.log('========================================\n');

    // Verificar proveedores
    const proveedores = await client.query(`
      SELECT
        proveedor_id,
        nombre,
        nit,
        activo,
        tolerancia_porcentaje
      FROM proveedores
      ORDER BY proveedor_id
    `);
    console.log('=== PROVEEDORES CREADOS ===');
    console.table(proveedores.rows);
    console.log(`Total: ${proveedores.rows.length} proveedores\n`);

    // Verificar recepciones por proveedor
    const recepcionesPorProveedor = await client.query(`
      SELECT
        p.nombre as proveedor,
        COUNT(r.recepcion_id) as total_recepciones,
        MIN(r.fecha_recepcion) as primera_recepcion,
        MAX(r.fecha_recepcion) as ultima_recepcion
      FROM proveedores p
      LEFT JOIN recepciones r ON p.proveedor_id = r.proveedor_id
      WHERE p.activo = TRUE
      GROUP BY p.proveedor_id, p.nombre
      ORDER BY total_recepciones DESC
    `);
    console.log('=== RECEPCIONES POR PROVEEDOR ===');
    console.table(recepcionesPorProveedor.rows);

    // Verificar recepciones totales
    const recepciones = await client.query(`
      SELECT
        r.numero_documento,
        p.nombre as proveedor,
        r.fecha_recepcion,
        u.nombre as recibido_por,
        COUNT(rd.detalle_recepcion_id) as items
      FROM recepciones r
      JOIN proveedores p ON r.proveedor_id = p.proveedor_id
      LEFT JOIN usuarios u ON r.usuario_recibe = u.usuario_id
      LEFT JOIN recepcion_detalles rd ON r.recepcion_id = rd.recepcion_id
      GROUP BY r.recepcion_id, r.numero_documento, p.nombre, r.fecha_recepcion, u.nombre
      ORDER BY r.fecha_recepcion DESC
      LIMIT 15
    `);
    console.log('\n=== ÚLTIMAS RECEPCIONES ===');
    console.table(recepciones.rows);
    console.log(`Total de recepciones: ${recepciones.rows.length}\n`);

    // Verificar inventario actualizado
    const inventario = await client.query(`
      SELECT
        p.codigo,
        p.nombre,
        p.stock_actual,
        COUNT(iu.ubicacion_id) as ubicaciones_con_stock
      FROM productos p
      LEFT JOIN inventario_ubicaciones iu ON p.producto_id = iu.producto_id
      WHERE iu.cantidad > 0
      GROUP BY p.producto_id, p.codigo, p.nombre
      ORDER BY p.stock_actual DESC
    `);
    console.log('=== INVENTARIO ACTUALIZADO ===');
    console.table(inventario.rows);

    // Estadísticas generales
    const stats = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM proveedores WHERE activo = TRUE) as proveedores_activos,
        (SELECT COUNT(*) FROM proveedores WHERE activo = FALSE) as proveedores_inactivos,
        (SELECT COUNT(*) FROM recepciones) as total_recepciones,
        (SELECT COUNT(*) FROM recepcion_detalles) as total_items_recibidos,
        (SELECT SUM(cantidad_recibida) FROM recepcion_detalles) as total_unidades_recibidas
    `);
    console.log('\n=== ESTADÍSTICAS GENERALES ===');
    console.table(stats.rows);

    console.log('\n========================================');
    console.log('  ✓ DATOS DE PRUEBA CARGADOS EXITOSAMENTE');
    console.log('========================================\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyData();

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function verifySeedData() {
  try {
    console.log('\n=== VERIFICACIÓN DE DATOS SEMBRADOS ===\n');

    // Total de productos
    const productos = await pool.query('SELECT COUNT(*) as count FROM productos');
    console.log(`✓ Total Productos: ${productos.rows[0].count}`);

    // Total de ubicaciones
    const ubicaciones = await pool.query('SELECT COUNT(*) as count FROM ubicaciones');
    console.log(`✓ Total Ubicaciones: ${ubicaciones.rows[0].count}`);

    // Total de asociaciones
    const inventario = await pool.query('SELECT COUNT(*) as count FROM inventario_ubicaciones');
    console.log(`✓ Total Inventario-Ubicaciones: ${inventario.rows[0].count}\n`);

    // Resumen por categoría
    const categorias = await pool.query(`
      SELECT
        categoria,
        COUNT(*) as total_productos,
        SUM(stock_actual) as stock_total
      FROM productos
      WHERE categoria IS NOT NULL
      GROUP BY categoria
      ORDER BY categoria
    `);
    console.log('=== RESUMEN POR CATEGORÍA ===');
    categorias.rows.forEach(row => {
      console.log(`${row.categoria}: ${row.total_productos} productos, Stock total: ${row.stock_total}`);
    });

    // Resumen por estantería
    const estanterias = await pool.query(`
      SELECT
        estanteria,
        COUNT(*) as total_ubicaciones
      FROM ubicaciones
      GROUP BY estanteria
      ORDER BY estanteria
    `);
    console.log('\n=== RESUMEN POR ESTANTERÍA ===');
    estanterias.rows.forEach(row => {
      console.log(`${row.estanteria}: ${row.total_ubicaciones} ubicaciones`);
    });

    // Muestra de productos con ubicaciones
    const muestra = await pool.query(`
      SELECT
        p.codigo,
        p.nombre,
        p.categoria,
        p.stock_actual as stock_producto,
        u.codigo as codigo_ubicacion,
        u.estanteria,
        iu.cantidad as cantidad_en_ubicacion,
        iu.es_ubicacion_primaria
      FROM productos p
      JOIN inventario_ubicaciones iu ON p.producto_id = iu.producto_id
      JOIN ubicaciones u ON iu.ubicacion_id = u.ubicacion_id
      WHERE p.categoria IN ('Ferretería', 'Alimentos', 'Electrónica')
      ORDER BY p.codigo, iu.es_ubicacion_primaria DESC, u.codigo
      LIMIT 15
    `);
    console.log('\n=== MUESTRA DE PRODUCTOS CON UBICACIONES ===');
    muestra.rows.forEach(row => {
      const tipo = row.es_ubicacion_primaria ? 'PRIMARIA' : 'SECUNDARIA';
      console.log(`${row.codigo} - ${row.nombre.substring(0, 30).padEnd(30)} | ${row.codigo_ubicacion.padEnd(10)} | ${tipo.padEnd(10)} | Cant: ${row.cantidad_en_ubicacion}`);
    });

    // Verificar consistencia
    const inconsistencias = await pool.query(`
      SELECT
        p.codigo,
        p.nombre,
        p.stock_actual as stock_declarado,
        COALESCE(SUM(iu.cantidad), 0) as stock_en_ubicaciones
      FROM productos p
      LEFT JOIN inventario_ubicaciones iu ON p.producto_id = iu.producto_id
      GROUP BY p.producto_id, p.codigo, p.nombre, p.stock_actual
      HAVING p.stock_actual != COALESCE(SUM(iu.cantidad), 0)
      ORDER BY p.codigo
    `);

    console.log('\n=== VERIFICACIÓN DE CONSISTENCIA ===');
    if (inconsistencias.rows.length === 0) {
      console.log('✓ Todos los productos tienen stock consistente con sus ubicaciones');
    } else {
      console.log('⚠ PRODUCTOS CON INCONSISTENCIAS:');
      inconsistencias.rows.forEach(row => {
        console.log(`${row.codigo}: Declarado=${row.stock_declarado}, En ubicaciones=${row.stock_en_ubicaciones}`);
      });
    }

    console.log('\n=== VERIFICACIÓN COMPLETADA ===\n');

  } catch (error) {
    console.error('Error durante la verificación:', error);
  } finally {
    await pool.end();
  }
}

verifySeedData();

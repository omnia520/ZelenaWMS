const { query } = require('../config/db');

/**
 * Obtiene la lista de picking optimizada por rutas de ubicación
 * @param {number} orden_id - ID de la orden
 * @returns {Array} Lista de productos ordenados por ruta óptima
 */
async function getOptimizedPickingList(orden_id) {
  const sql = `
    SELECT
      od.detalle_id,
      od.cantidad_pedida,
      od.cantidad_alistada,
      od.comentarios_item,
      p.producto_id,
      p.codigo as producto_codigo,
      p.nombre as producto_nombre,
      p.imagen_url as producto_imagen,
      p.stock_actual,
      iu.ubicacion_id,
      u.codigo as ubicacion_codigo,
      u.descripcion as ubicacion_descripcion,
      u.estanteria,
      u.fila,
      u.nivel,
      u.orden_ruta,
      iu.cantidad as cantidad_en_ubicacion,
      iu.es_ubicacion_primaria
    FROM orden_detalles od
    JOIN productos p ON od.producto_id = p.producto_id
    LEFT JOIN inventario_ubicaciones iu ON p.producto_id = iu.producto_id
    LEFT JOIN ubicaciones u ON iu.ubicacion_id = u.ubicacion_id
    WHERE od.orden_id = $1 AND u.activa = true
    ORDER BY
      u.orden_ruta ASC,
      u.estanteria ASC,
      u.fila ASC,
      u.nivel ASC,
      iu.es_ubicacion_primaria DESC
  `;

  const result = await query(sql, [orden_id]);

  // Agrupar por producto (un producto puede estar en múltiples ubicaciones)
  const productosAgrupados = {};

  result.rows.forEach(row => {
    if (!productosAgrupados[row.producto_id]) {
      productosAgrupados[row.producto_id] = {
        detalle_id: row.detalle_id,
        producto_id: row.producto_id,
        producto_codigo: row.producto_codigo,
        producto_nombre: row.producto_nombre,
        producto_imagen: row.producto_imagen,
        cantidad_pedida: row.cantidad_pedida,
        cantidad_alistada: row.cantidad_alistada,
        comentarios_item: row.comentarios_item,
        stock_actual: row.stock_actual,
        ubicaciones: []
      };
    }

    if (row.ubicacion_id) {
      productosAgrupados[row.producto_id].ubicaciones.push({
        ubicacion_id: row.ubicacion_id,
        codigo: row.ubicacion_codigo,
        descripcion: row.ubicacion_descripcion,
        estanteria: row.estanteria,
        fila: row.fila,
        nivel: row.nivel,
        orden_ruta: row.orden_ruta,
        cantidad_en_ubicacion: row.cantidad_en_ubicacion,
        es_primaria: row.es_ubicacion_primaria
      });
    }
  });

  // Convertir a array y ordenar por la primera ubicación de cada producto
  const pickingList = Object.values(productosAgrupados).sort((a, b) => {
    const ubicacionA = a.ubicaciones[0] || { orden_ruta: 999999 };
    const ubicacionB = b.ubicaciones[0] || { orden_ruta: 999999 };
    return ubicacionA.orden_ruta - ubicacionB.orden_ruta;
  });

  return pickingList;
}

/**
 * Calcula estadísticas de la ruta de picking
 * @param {Array} pickingList - Lista de picking
 * @returns {Object} Estadísticas
 */
function calculatePickingStats(pickingList) {
  const totalItems = pickingList.length;
  const totalUnidades = pickingList.reduce((sum, item) => sum + item.cantidad_pedida, 0);
  const ubicacionesUnicas = new Set();

  pickingList.forEach(item => {
    item.ubicaciones.forEach(ub => {
      ubicacionesUnicas.add(ub.ubicacion_id);
    });
  });

  const itemsSinUbicacion = pickingList.filter(item => item.ubicaciones.length === 0);

  return {
    total_items: totalItems,
    total_unidades: totalUnidades,
    ubicaciones_a_visitar: ubicacionesUnicas.size,
    items_sin_ubicacion: itemsSinUbicacion.length,
    productos_sin_ubicacion: itemsSinUbicacion.map(i => ({
      producto_id: i.producto_id,
      producto_codigo: i.producto_codigo,
      producto_nombre: i.producto_nombre,
      cantidad_pedida: i.cantidad_pedida
    }))
  };
}

/**
 * Sugiere ubicaciones alternativas para un producto
 * @param {number} producto_id - ID del producto
 * @returns {Array} Lista de ubicaciones disponibles
 */
async function getSuggestedLocations(producto_id) {
  const sql = `
    SELECT
      u.ubicacion_id,
      u.codigo,
      u.descripcion,
      u.orden_ruta,
      iu.cantidad,
      iu.es_ubicacion_primaria
    FROM inventario_ubicaciones iu
    JOIN ubicaciones u ON iu.ubicacion_id = u.ubicacion_id
    WHERE iu.producto_id = $1 AND u.activa = true AND iu.cantidad > 0
    ORDER BY iu.es_ubicacion_primaria DESC, u.orden_ruta ASC
  `;

  const result = await query(sql, [producto_id]);
  return result.rows;
}

module.exports = {
  getOptimizedPickingList,
  calculatePickingStats,
  getSuggestedLocations
};

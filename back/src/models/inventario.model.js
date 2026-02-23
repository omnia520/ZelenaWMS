const { query, getClient } = require('../config/db');

class InventarioModel {
  /**
   * Reservar inventario para una orden (solo usando stock_actual de productos)
   * @param {Object} client - Cliente de transacción de PostgreSQL
   * @param {Array} detalles - Array de objetos {producto_id, cantidad}
   * @returns {Promise<Object>} - {success, productosInsuficientes}
   */
  static async reservarInventario(client, detalles) {
    const productosInsuficientes = [];
    const reservasRealizadas = [];

    try {
      for (const detalle of detalles) {
        const { producto_id, cantidad } = detalle;

        // Verificar disponibilidad y bloquear el producto
        const productoResult = await client.query(`
          SELECT
            producto_id,
            codigo,
            nombre,
            stock_actual,
            COALESCE(stock_reservado, 0) as stock_reservado
          FROM productos
          WHERE producto_id = $1
          FOR UPDATE
        `, [producto_id]);

        if (productoResult.rows.length === 0) {
          productosInsuficientes.push({
            producto_id,
            mensaje: 'Producto no encontrado'
          });
          continue;
        }

        const producto = productoResult.rows[0];
        const cantidad_disponible = producto.stock_actual - producto.stock_reservado;

        // Verificar si hay suficiente stock disponible
        if (cantidad_disponible < cantidad) {
          productosInsuficientes.push({
            producto_id,
            codigo: producto.codigo,
            nombre: producto.nombre,
            cantidad_solicitada: cantidad,
            cantidad_disponible: cantidad_disponible,
            mensaje: `Stock insuficiente. Disponibles: ${cantidad_disponible} unidades`
          });
          continue;
        }

        // Reservar el stock en la tabla productos
        await client.query(`
          UPDATE productos
          SET stock_reservado = COALESCE(stock_reservado, 0) + $1
          WHERE producto_id = $2
        `, [cantidad, producto_id]);

        reservasRealizadas.push({
          producto_id,
          cantidad_reservada: cantidad
        });
      }

      return {
        success: productosInsuficientes.length === 0,
        productosInsuficientes,
        reservasRealizadas
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Liberar inventario reservado de una orden (solo usando stock_reservado de productos)
   * @param {Object} client - Cliente de transacción de PostgreSQL
   * @param {Array} detalles - Array de objetos {producto_id, cantidad}
   */
  static async liberarInventario(client, detalles) {
    try {
      for (const detalle of detalles) {
        const { producto_id, cantidad } = detalle;

        // Liberar el stock reservado en la tabla productos
        await client.query(`
          UPDATE productos
          SET stock_reservado = GREATEST(COALESCE(stock_reservado, 0) - $1, 0)
          WHERE producto_id = $2
        `, [cantidad, producto_id]);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Descontar inventario definitivamente (cuando se finaliza/factura la orden)
   * @param {Object} client - Cliente de transacción de PostgreSQL
   * @param {Array} detalles - Array de objetos {producto_id, cantidad}
   */
  static async descontarInventario(client, detalles) {
    try {
      for (const detalle of detalles) {
        const { producto_id, cantidad } = detalle;

        // Descontar del stock_actual y liberar la reserva
        await client.query(`
          UPDATE productos
          SET
            stock_actual = stock_actual - $1,
            stock_reservado = GREATEST(COALESCE(stock_reservado, 0) - $1, 0)
          WHERE producto_id = $2
        `, [cantidad, producto_id]);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener inventario de ubicaciones con cantidades reservadas
   * @param {Object} filters - Filtros opcionales {producto_id, ubicacion_id, bodega_id}
   */
  static async getInventarioConReservas(filters = {}) {
    let sql = `
      SELECT
        iu.inventario_id,
        iu.producto_id,
        p.codigo as producto_codigo,
        p.nombre as producto_nombre,
        iu.ubicacion_id,
        u.codigo as ubicacion_codigo,
        u.descripcion as ubicacion_descripcion,
        u.bodega_id,
        b.nombre as bodega_nombre,
        iu.cantidad as cantidad_total,
        iu.cantidad_reservada,
        (iu.cantidad - iu.cantidad_reservada) as cantidad_disponible,
        iu.es_ubicacion_primaria,
        iu.fecha_actualizacion
      FROM inventario_ubicaciones iu
      INNER JOIN productos p ON iu.producto_id = p.producto_id
      INNER JOIN ubicaciones u ON iu.ubicacion_id = u.ubicacion_id
      INNER JOIN bodegas b ON u.bodega_id = b.bodega_id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.producto_id) {
      sql += ` AND iu.producto_id = $${paramCount}`;
      values.push(filters.producto_id);
      paramCount++;
    }

    if (filters.ubicacion_id) {
      sql += ` AND iu.ubicacion_id = $${paramCount}`;
      values.push(filters.ubicacion_id);
      paramCount++;
    }

    if (filters.bodega_id) {
      sql += ` AND u.bodega_id = $${paramCount}`;
      values.push(filters.bodega_id);
      paramCount++;
    }

    sql += ' ORDER BY p.nombre, u.codigo';

    const result = await query(sql, values);
    return result.rows;
  }
}

module.exports = InventarioModel;

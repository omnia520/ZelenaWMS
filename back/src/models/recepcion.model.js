const { query, getClient } = require('../config/db');
const ProductoModel = require('./producto.model');
const ProveedorModel = require('./proveedor.model');

class RecepcionModel {
  // Crear recepción con detalles (transacción)
  static async create(recepcionData, detalles, usuario_id) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Buscar el nombre del proveedor por su ID
      const proveedor = await ProveedorModel.findById(recepcionData.proveedor_id);
      if (!proveedor) {
        throw new Error('Proveedor no encontrado');
      }

      // Crear recepción
      const recepcionSql = `
        INSERT INTO recepciones (numero_documento, proveedor, fecha_recepcion, usuario_recibe, observaciones, foto_soporte)
        VALUES ($1, $2, COALESCE($3, CURRENT_DATE), $4, $5, $6)
        RETURNING *
      `;
      const recepcionValues = [
        recepcionData.numero_documento,
        proveedor.nombre,  // Guardar el nombre del proveedor, no el ID
        recepcionData.fecha_recepcion || null,
        usuario_id,
        recepcionData.observaciones || null,
        recepcionData.foto_soporte || null
      ];

      const recepcionResult = await client.query(recepcionSql, recepcionValues);
      const recepcion = recepcionResult.rows[0];

      // Crear detalles y actualizar inventario
      if (detalles && detalles.length > 0) {
        for (const detalle of detalles) {
          let producto_id = detalle.producto_id;

          // Si el detalle indica que es un producto nuevo, crearlo primero
          if (detalle.es_nuevo && detalle.codigo_producto) {
            // Verificar si el producto ya existe por código
            const productoExistente = await ProductoModel.findByCodigo(detalle.codigo_producto);

            if (productoExistente) {
              producto_id = productoExistente.producto_id;
            } else {
              // Crear el nuevo producto
              const nuevoProducto = await ProductoModel.create({
                codigo: detalle.codigo_producto,
                nombre: detalle.nombre_producto,
                descripcion: null,
                categoria: detalle.categoria || null,
                precio_base: detalle.precio_base || 0,
                stock_actual: 0, // Se actualizará con el inventario
                activo: true
              });
              producto_id = nuevoProducto.producto_id;
            }
          } else if (detalle.codigo_producto && !detalle.producto_id) {
            // Si solo se proporcionó el código, buscar el producto
            const productoExistente = await ProductoModel.findByCodigo(detalle.codigo_producto);
            if (productoExistente) {
              producto_id = productoExistente.producto_id;
            } else {
              throw new Error(`Producto con código ${detalle.codigo_producto} no encontrado`);
            }
          }

          // Insertar detalle
          const detalleSql = `
            INSERT INTO recepcion_detalles (recepcion_id, producto_id, cantidad_recibida, ubicacion_id)
            VALUES ($1, $2, $3, $4)
          `;
          await client.query(detalleSql, [
            recepcion.recepcion_id,
            producto_id,
            detalle.cantidad_recibida,
            detalle.ubicacion_id
          ]);

          // Actualizar stock del producto
          await client.query(
            'UPDATE productos SET stock_actual = stock_actual + $1 WHERE producto_id = $2',
            [detalle.cantidad_recibida, producto_id]
          );

          // Actualizar inventario por ubicación
          await client.query(`
            INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad)
            VALUES ($1, $2, $3)
            ON CONFLICT (producto_id, ubicacion_id)
            DO UPDATE SET cantidad = inventario_ubicaciones.cantidad + $3
          `, [producto_id, detalle.ubicacion_id, detalle.cantidad_recibida]);
        }
      }

      await client.query('COMMIT');
      return recepcion;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Buscar por ID
  static async findById(recepcion_id) {
    const sql = `
      SELECT
        r.*,
        u.nombre as usuario_nombre,
        r.proveedor as proveedor_nombre
      FROM recepciones r
      LEFT JOIN usuarios u ON r.usuario_recibe = u.usuario_id
      WHERE r.recepcion_id = $1
    `;
    const result = await query(sql, [recepcion_id]);
    return result.rows[0];
  }

  // Obtener detalles de recepción
  static async getDetalles(recepcion_id) {
    const sql = `
      SELECT
        rd.*,
        p.codigo as producto_codigo,
        p.nombre as producto_nombre,
        ub.codigo as ubicacion_codigo,
        ub.descripcion as ubicacion_descripcion
      FROM recepcion_detalles rd
      JOIN productos p ON rd.producto_id = p.producto_id
      LEFT JOIN ubicaciones ub ON rd.ubicacion_id = ub.ubicacion_id
      WHERE rd.recepcion_id = $1
      ORDER BY rd.detalle_recepcion_id ASC
    `;
    const result = await query(sql, [recepcion_id]);
    return result.rows;
  }

  // Listar todas con filtros
  static async findAll(filters = {}) {
    let sql = `
      SELECT
        r.*,
        u.nombre as usuario_nombre,
        r.proveedor as proveedor_nombre
      FROM recepciones r
      LEFT JOIN usuarios u ON r.usuario_recibe = u.usuario_id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.fecha_desde) {
      sql += ` AND r.fecha_recepcion >= $${paramCount}`;
      values.push(filters.fecha_desde);
      paramCount++;
    }

    if (filters.fecha_hasta) {
      sql += ` AND r.fecha_recepcion <= $${paramCount}`;
      values.push(filters.fecha_hasta);
      paramCount++;
    }

    if (filters.proveedor_nombre) {
      sql += ` AND LOWER(r.proveedor) LIKE LOWER($${paramCount})`;
      values.push(`%${filters.proveedor_nombre}%`);
      paramCount++;
    }

    if (filters.search) {
      sql += ` AND (
        LOWER(r.proveedor) LIKE LOWER($${paramCount}) OR
        LOWER(r.numero_documento) LIKE LOWER($${paramCount})
      )`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    sql += ' ORDER BY r.fecha_creacion DESC';

    const result = await query(sql, values);
    return result.rows;
  }

  // Eliminar recepción
  static async delete(recepcion_id) {
    const sql = `DELETE FROM recepciones WHERE recepcion_id = $1 RETURNING *`;
    const result = await query(sql, [recepcion_id]);
    return result.rows[0];
  }
}

module.exports = RecepcionModel;

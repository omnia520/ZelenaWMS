const { query } = require('../config/db');

class BodegaModel {
  // Crear bodega
  static async create(bodegaData) {
    const sql = `
      INSERT INTO bodegas (codigo, nombre, descripcion, direccion, ciudad, responsable_id, activa)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      bodegaData.codigo,
      bodegaData.nombre,
      bodegaData.descripcion || null,
      bodegaData.direccion || null,
      bodegaData.ciudad || null,
      bodegaData.responsable_id || null,
      bodegaData.activa !== undefined ? bodegaData.activa : true
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Buscar por ID con información del responsable
  static async findById(bodega_id) {
    const sql = `
      SELECT
        b.*,
        u.nombre as responsable_nombre
      FROM bodegas b
      LEFT JOIN usuarios u ON b.responsable_id = u.usuario_id
      WHERE b.bodega_id = $1
    `;
    const result = await query(sql, [bodega_id]);
    return result.rows[0];
  }

  // Buscar por código
  static async findByCodigo(codigo) {
    const sql = `SELECT * FROM bodegas WHERE codigo = $1`;
    const result = await query(sql, [codigo]);
    return result.rows[0];
  }

  // Listar todas con filtros
  static async findAll(filters = {}) {
    let sql = `
      SELECT
        b.*,
        u.nombre as responsable_nombre,
        COUNT(DISTINCT ib.producto_id) as total_productos,
        COALESCE(SUM(ib.cantidad), 0) as total_items
      FROM bodegas b
      LEFT JOIN usuarios u ON b.responsable_id = u.usuario_id
      LEFT JOIN inventario_bodegas ib ON b.bodega_id = ib.bodega_id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.activa !== undefined) {
      sql += ` AND b.activa = $${paramCount}`;
      values.push(filters.activa);
      paramCount++;
    }

    if (filters.search) {
      sql += ` AND (
        LOWER(b.nombre) LIKE LOWER($${paramCount}) OR
        LOWER(b.codigo) LIKE LOWER($${paramCount}) OR
        LOWER(b.ciudad) LIKE LOWER($${paramCount})
      )`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    sql += ` GROUP BY b.bodega_id, u.nombre ORDER BY b.nombre ASC`;

    const result = await query(sql, values);
    return result.rows;
  }

  // Actualizar bodega
  static async update(bodega_id, bodegaData) {
    const sql = `
      UPDATE bodegas
      SET codigo = $1,
          nombre = $2,
          descripcion = $3,
          direccion = $4,
          ciudad = $5,
          responsable_id = $6,
          activa = $7
      WHERE bodega_id = $8
      RETURNING *
    `;
    const values = [
      bodegaData.codigo,
      bodegaData.nombre,
      bodegaData.descripcion,
      bodegaData.direccion,
      bodegaData.ciudad,
      bodegaData.responsable_id,
      bodegaData.activa,
      bodega_id
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Activar/Desactivar bodega
  static async toggleActive(bodega_id, activa) {
    const sql = `
      UPDATE bodegas
      SET activa = $1
      WHERE bodega_id = $2
      RETURNING *
    `;
    const result = await query(sql, [activa, bodega_id]);
    return result.rows[0];
  }

  // Obtener inventario de una bodega
  static async getInventario(bodega_id, filters = {}) {
    let sql = `
      SELECT
        ib.*,
        p.codigo as producto_codigo,
        p.nombre as producto_nombre,
        p.categoria as producto_categoria,
        p.precio_venta
      FROM inventario_bodegas ib
      JOIN productos p ON ib.producto_id = p.producto_id
      WHERE ib.bodega_id = $1
    `;
    const values = [bodega_id];
    let paramCount = 2;

    if (filters.con_stock) {
      sql += ` AND ib.cantidad > 0`;
    }

    if (filters.search) {
      sql += ` AND (
        LOWER(p.nombre) LIKE LOWER($${paramCount}) OR
        LOWER(p.codigo) LIKE LOWER($${paramCount})
      )`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    sql += ` ORDER BY p.nombre ASC`;

    const result = await query(sql, values);
    return result.rows;
  }

  // Obtener cantidad de un producto en una bodega
  static async getCantidadProducto(bodega_id, producto_id) {
    const sql = `
      SELECT cantidad
      FROM inventario_bodegas
      WHERE bodega_id = $1 AND producto_id = $2
    `;
    const result = await query(sql, [bodega_id, producto_id]);
    return result.rows[0]?.cantidad || 0;
  }

  // Actualizar cantidad de un producto en una bodega
  static async updateCantidadProducto(bodega_id, producto_id, cantidad) {
    const sql = `
      INSERT INTO inventario_bodegas (bodega_id, producto_id, cantidad, fecha_actualizacion)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (bodega_id, producto_id)
      DO UPDATE SET
        cantidad = $3,
        fecha_actualizacion = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await query(sql, [bodega_id, producto_id, cantidad]);
    return result.rows[0];
  }

  // Eliminar bodega
  static async delete(bodega_id) {
    const sql = `DELETE FROM bodegas WHERE bodega_id = $1 RETURNING *`;
    const result = await query(sql, [bodega_id]);
    return result.rows[0];
  }
}

module.exports = BodegaModel;

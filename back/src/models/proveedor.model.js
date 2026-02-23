const { query } = require('../config/db');

class ProveedorModel {
  // Crear proveedor
  static async create(proveedorData) {
    const sql = `
      INSERT INTO proveedores (nombre, nit, contacto, telefono, email, direccion, tolerancia_porcentaje)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      proveedorData.nombre,
      proveedorData.nit || null,
      proveedorData.contacto || null,
      proveedorData.telefono || null,
      proveedorData.email || null,
      proveedorData.direccion || null,
      proveedorData.tolerancia_porcentaje || 0
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Buscar por ID
  static async findById(proveedor_id) {
    const sql = `SELECT * FROM proveedores WHERE proveedor_id = $1`;
    const result = await query(sql, [proveedor_id]);
    return result.rows[0];
  }

  // Buscar por nombre (case-insensitive)
  static async findByNombre(nombre) {
    const sql = `SELECT * FROM proveedores WHERE LOWER(nombre) = LOWER($1)`;
    const result = await query(sql, [nombre]);
    return result.rows[0];
  }

  // Buscar por NIT
  static async findByNit(nit) {
    const sql = `SELECT * FROM proveedores WHERE nit = $1`;
    const result = await query(sql, [nit]);
    return result.rows[0];
  }

  // Listar todos con filtros
  static async findAll(filters = {}) {
    let sql = `SELECT * FROM proveedores WHERE 1=1`;
    const values = [];
    let paramCount = 1;

    if (filters.activo !== undefined) {
      sql += ` AND activo = $${paramCount}`;
      values.push(filters.activo);
      paramCount++;
    }

    if (filters.search) {
      sql += ` AND (
        LOWER(nombre) LIKE LOWER($${paramCount}) OR
        nit LIKE $${paramCount} OR
        LOWER(contacto) LIKE LOWER($${paramCount})
      )`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    sql += ' ORDER BY nombre ASC';

    const result = await query(sql, values);
    return result.rows;
  }

  // Actualizar proveedor
  static async update(proveedor_id, proveedorData) {
    const sql = `
      UPDATE proveedores
      SET nombre = $1,
          nit = $2,
          contacto = $3,
          telefono = $4,
          email = $5,
          direccion = $6,
          tolerancia_porcentaje = $7
      WHERE proveedor_id = $8
      RETURNING *
    `;
    const values = [
      proveedorData.nombre,
      proveedorData.nit,
      proveedorData.contacto,
      proveedorData.telefono,
      proveedorData.email,
      proveedorData.direccion,
      proveedorData.tolerancia_porcentaje,
      proveedor_id
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Activar/Desactivar
  static async toggleActive(proveedor_id, activo) {
    const sql = `
      UPDATE proveedores
      SET activo = $1
      WHERE proveedor_id = $2
      RETURNING *
    `;
    const result = await query(sql, [activo, proveedor_id]);
    return result.rows[0];
  }

  // Eliminar
  static async delete(proveedor_id) {
    const sql = `DELETE FROM proveedores WHERE proveedor_id = $1 RETURNING *`;
    const result = await query(sql, [proveedor_id]);
    return result.rows[0];
  }

  // Obtener estadísticas de recepciones por proveedor
  static async getRecepcionStats(proveedor_id) {
    // Primero obtener el nombre del proveedor
    const proveedor = await this.findById(proveedor_id);
    if (!proveedor) {
      return { total_recepciones: 0, ultima_recepcion: null };
    }

    const sql = `
      SELECT
        COUNT(*) as total_recepciones,
        MAX(fecha_recepcion) as ultima_recepcion
      FROM recepciones
      WHERE proveedor = $1
    `;
    const result = await query(sql, [proveedor.nombre]);
    return result.rows[0];
  }
}

module.exports = ProveedorModel;

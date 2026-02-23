const { query } = require('../config/db');

class ClienteModel {
  // Crear cliente
  static async create(clienteData, creado_por) {
    const sql = `
      INSERT INTO clientes (nit_cc, razon_social, telefono, email, ciudad, departamento, direccion, creado_por)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      clienteData.nit_cc,
      clienteData.razon_social,
      clienteData.telefono || null,
      clienteData.email || null,
      clienteData.ciudad || null,
      clienteData.departamento || null,
      clienteData.direccion || null,
      creado_por
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Buscar por ID
  static async findById(cliente_id) {
    const sql = `
      SELECT c.*, u.nombre as creado_por_nombre
      FROM clientes c
      LEFT JOIN usuarios u ON c.creado_por = u.usuario_id
      WHERE c.cliente_id = $1
    `;
    const result = await query(sql, [cliente_id]);
    return result.rows[0];
  }

  // Buscar por NIT/CC
  static async findByNit(nit_cc) {
    const sql = `SELECT * FROM clientes WHERE nit_cc = $1`;
    const result = await query(sql, [nit_cc]);
    return result.rows[0];
  }

  // Listar todos con filtros
  static async findAll(filters = {}) {
    let sql = `
      SELECT c.*, u.nombre as creado_por_nombre
      FROM clientes c
      LEFT JOIN usuarios u ON c.creado_por = u.usuario_id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.activo !== undefined) {
      sql += ` AND c.activo = $${paramCount}`;
      values.push(filters.activo);
      paramCount++;
    }

    if (filters.ciudad) {
      sql += ` AND LOWER(c.ciudad) LIKE LOWER($${paramCount})`;
      values.push(`%${filters.ciudad}%`);
      paramCount++;
    }

    if (filters.search) {
      sql += ` AND (
        LOWER(c.razon_social) LIKE LOWER($${paramCount}) OR
        c.nit_cc LIKE $${paramCount}
      )`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    sql += ' ORDER BY c.fecha_creacion DESC';

    const result = await query(sql, values);
    return result.rows;
  }

  // Actualizar cliente
  static async update(cliente_id, clienteData) {
    const sql = `
      UPDATE clientes
      SET nit_cc = $1,
          razon_social = $2,
          telefono = $3,
          email = $4,
          ciudad = $5,
          departamento = $6,
          direccion = $7
      WHERE cliente_id = $8
      RETURNING *
    `;
    const values = [
      clienteData.nit_cc,
      clienteData.razon_social,
      clienteData.telefono,
      clienteData.email,
      clienteData.ciudad,
      clienteData.departamento,
      clienteData.direccion,
      cliente_id
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Activar/Desactivar
  static async toggleActive(cliente_id, activo) {
    const sql = `
      UPDATE clientes
      SET activo = $1
      WHERE cliente_id = $2
      RETURNING *
    `;
    const result = await query(sql, [activo, cliente_id]);
    return result.rows[0];
  }

  // Eliminar (soft delete recomendado, pero incluyo delete real)
  static async delete(cliente_id) {
    const sql = `DELETE FROM clientes WHERE cliente_id = $1 RETURNING *`;
    const result = await query(sql, [cliente_id]);
    return result.rows[0];
  }
}

module.exports = ClienteModel;

const { query } = require('../config/db');

class UsuarioModel {
  // Crear usuario
  static async create(userData) {
    const sql = `
      INSERT INTO usuarios (nombre, nombre_usuario, email, telefono, rol, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING usuario_id, nombre, nombre_usuario, email, telefono, rol, activo, fecha_creacion
    `;
    const values = [
      userData.nombre,
      userData.nombre_usuario,
      userData.email || null,
      userData.telefono || null,
      userData.rol,
      userData.password_hash
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Buscar por email
  static async findByEmail(email) {
    const sql = `
      SELECT usuario_id, nombre, nombre_usuario, email, telefono, rol, password_hash, activo, fecha_creacion
      FROM usuarios
      WHERE email = $1
    `;
    const result = await query(sql, [email]);
    return result.rows[0];
  }

  // Buscar por nombre de usuario
  static async findByNombreUsuario(nombre_usuario) {
    const sql = `
      SELECT usuario_id, nombre, nombre_usuario, email, telefono, rol, password_hash, activo, fecha_creacion
      FROM usuarios
      WHERE nombre_usuario = $1
    `;
    const result = await query(sql, [nombre_usuario]);
    return result.rows[0];
  }

  // Buscar por ID
  static async findById(usuario_id) {
    const sql = `
      SELECT usuario_id, nombre, nombre_usuario, email, telefono, rol, activo, fecha_creacion
      FROM usuarios
      WHERE usuario_id = $1
    `;
    const result = await query(sql, [usuario_id]);
    return result.rows[0];
  }

  // Listar todos los usuarios
  static async findAll(filters = {}) {
    let sql = `
      SELECT usuario_id, nombre, nombre_usuario, email, telefono, rol, activo, fecha_creacion
      FROM usuarios
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.rol) {
      sql += ` AND rol = $${paramCount}`;
      values.push(filters.rol);
      paramCount++;
    }

    if (filters.activo !== undefined) {
      sql += ` AND activo = $${paramCount}`;
      values.push(filters.activo);
      paramCount++;
    }

    sql += ' ORDER BY fecha_creacion DESC';

    const result = await query(sql, values);
    return result.rows;
  }

  // Actualizar usuario
  static async update(usuario_id, userData) {
    const sql = `
      UPDATE usuarios
      SET nombre = $1, nombre_usuario = $2, email = $3, telefono = $4, rol = $5
      WHERE usuario_id = $6
      RETURNING usuario_id, nombre, nombre_usuario, email, telefono, rol, activo, fecha_creacion
    `;
    const values = [
      userData.nombre,
      userData.nombre_usuario,
      userData.email,
      userData.telefono,
      userData.rol,
      usuario_id
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Activar/Desactivar usuario
  static async toggleActive(usuario_id, activo) {
    const sql = `
      UPDATE usuarios
      SET activo = $1
      WHERE usuario_id = $2
      RETURNING usuario_id, nombre, nombre_usuario, email, activo
    `;
    const result = await query(sql, [activo, usuario_id]);
    return result.rows[0];
  }

  // Actualizar contraseña
  static async updatePassword(usuario_id, password_hash) {
    const sql = `
      UPDATE usuarios
      SET password_hash = $1
      WHERE usuario_id = $2
      RETURNING usuario_id
    `;
    const result = await query(sql, [password_hash, usuario_id]);
    return result.rows[0];
  }
}

module.exports = UsuarioModel;

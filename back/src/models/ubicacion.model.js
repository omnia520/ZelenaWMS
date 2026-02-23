const { query } = require('../config/db');

class UbicacionModel {
  // Crear ubicación
  static async create(ubicacionData) {
    const sql = `
      INSERT INTO ubicaciones (codigo, descripcion, estanteria, fila, nivel, orden_ruta, activa)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      ubicacionData.codigo,
      ubicacionData.descripcion || null,
      ubicacionData.estanteria || null,
      ubicacionData.fila || null,
      ubicacionData.nivel || null,
      ubicacionData.orden_ruta || 0,
      ubicacionData.activa !== undefined ? ubicacionData.activa : true
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Buscar por ID
  static async findById(ubicacion_id) {
    const sql = `SELECT * FROM ubicaciones WHERE ubicacion_id = $1`;
    const result = await query(sql, [ubicacion_id]);
    return result.rows[0];
  }

  // Buscar por código
  static async findByCodigo(codigo) {
    const sql = `SELECT * FROM ubicaciones WHERE codigo = $1`;
    const result = await query(sql, [codigo]);
    return result.rows[0];
  }

  // Listar todas con filtros
  static async findAll(filters = {}) {
    let sql = `SELECT * FROM ubicaciones WHERE 1=1`;
    const values = [];
    let paramCount = 1;

    if (filters.activa !== undefined) {
      sql += ` AND activa = $${paramCount}`;
      values.push(filters.activa);
      paramCount++;
    }

    if (filters.estanteria) {
      sql += ` AND estanteria = $${paramCount}`;
      values.push(filters.estanteria);
      paramCount++;
    }

    sql += ' ORDER BY orden_ruta ASC, codigo ASC';

    const result = await query(sql, values);
    return result.rows;
  }

  // Actualizar ubicación
  static async update(ubicacion_id, ubicacionData) {
    const sql = `
      UPDATE ubicaciones
      SET codigo = $1,
          descripcion = $2,
          estanteria = $3,
          fila = $4,
          nivel = $5,
          orden_ruta = $6,
          activa = $7
      WHERE ubicacion_id = $8
      RETURNING *
    `;
    const values = [
      ubicacionData.codigo,
      ubicacionData.descripcion,
      ubicacionData.estanteria,
      ubicacionData.fila,
      ubicacionData.nivel,
      ubicacionData.orden_ruta,
      ubicacionData.activa,
      ubicacion_id
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Asignar producto a ubicación
  static async asignarProducto(producto_id, ubicacion_id, cantidad, es_primaria = false) {
    const sql = `
      INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad, es_ubicacion_primaria)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (producto_id, ubicacion_id)
      DO UPDATE SET cantidad = $3, es_ubicacion_primaria = $4, fecha_actualizacion = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await query(sql, [producto_id, ubicacion_id, cantidad, es_primaria]);
    return result.rows[0];
  }

  // Obtener inventario de una ubicación
  static async getInventario(ubicacion_id) {
    const sql = `
      SELECT
        iu.*,
        p.codigo as producto_codigo,
        p.nombre as producto_nombre,
        p.imagen_url as producto_imagen
      FROM inventario_ubicaciones iu
      JOIN productos p ON iu.producto_id = p.producto_id
      WHERE iu.ubicacion_id = $1
      ORDER BY p.nombre ASC
    `;
    const result = await query(sql, [ubicacion_id]);
    return result.rows;
  }

  // Actualizar cantidad en ubicación
  static async updateCantidad(producto_id, ubicacion_id, cantidad) {
    const sql = `
      UPDATE inventario_ubicaciones
      SET cantidad = cantidad + $1
      WHERE producto_id = $2 AND ubicacion_id = $3
      RETURNING *
    `;
    const result = await query(sql, [cantidad, producto_id, ubicacion_id]);
    return result.rows[0];
  }

  // Eliminar asignación producto-ubicación
  static async removeProducto(producto_id, ubicacion_id) {
    const sql = `
      DELETE FROM inventario_ubicaciones
      WHERE producto_id = $1 AND ubicacion_id = $2
      RETURNING *
    `;
    const result = await query(sql, [producto_id, ubicacion_id]);
    return result.rows[0];
  }

  // Eliminar ubicación
  static async delete(ubicacion_id) {
    const sql = `DELETE FROM ubicaciones WHERE ubicacion_id = $1 RETURNING *`;
    const result = await query(sql, [ubicacion_id]);
    return result.rows[0];
  }

  // Buscar ubicaciones de un producto por referencia
  static async findProductoUbicaciones(referencia) {
    const sql = `
      SELECT
        p.producto_id,
        p.codigo,
        p.nombre,
        p.descripcion,
        p.precio_base,
        p.imagen_url,
        json_agg(
          json_build_object(
            'ubicacion_id', u.ubicacion_id,
            'codigo', u.codigo,
            'descripcion', u.descripcion,
            'estanteria', u.estanteria,
            'fila', u.fila,
            'nivel', u.nivel,
            'cantidad', iu.cantidad,
            'es_ubicacion_primaria', iu.es_ubicacion_primaria,
            'fecha_actualizacion', iu.fecha_actualizacion
          ) ORDER BY iu.es_ubicacion_primaria DESC, u.orden_ruta ASC
        ) as ubicaciones
      FROM productos p
      LEFT JOIN inventario_ubicaciones iu ON p.producto_id = iu.producto_id
      LEFT JOIN ubicaciones u ON iu.ubicacion_id = u.ubicacion_id
      WHERE p.codigo ILIKE $1
      GROUP BY p.producto_id
    `;
    const result = await query(sql, [`%${referencia}%`]);
    return result.rows;
  }

  // Buscar productos en una ubicación por código
  static async findUbicacionProductos(codigoUbicacion) {
    const sql = `
      SELECT
        u.ubicacion_id,
        u.codigo,
        u.descripcion,
        u.estanteria,
        u.fila,
        u.nivel,
        u.orden_ruta,
        u.activa,
        json_agg(
          json_build_object(
            'producto_id', p.producto_id,
            'codigo', p.codigo,
            'nombre', p.nombre,
            'descripcion', p.descripcion,
            'precio_base', p.precio_base,
            'imagen_url', p.imagen_url,
            'cantidad', iu.cantidad,
            'es_ubicacion_primaria', iu.es_ubicacion_primaria,
            'fecha_actualizacion', iu.fecha_actualizacion
          ) ORDER BY p.nombre ASC
        ) FILTER (WHERE p.producto_id IS NOT NULL) as productos
      FROM ubicaciones u
      LEFT JOIN inventario_ubicaciones iu ON u.ubicacion_id = iu.ubicacion_id
      LEFT JOIN productos p ON iu.producto_id = p.producto_id
      WHERE u.codigo ILIKE $1
      GROUP BY u.ubicacion_id
    `;
    const result = await query(sql, [`%${codigoUbicacion}%`]);
    return result.rows;
  }

  // Obtener sugerencias de productos para autocomplete
  static async getSugerenciasProductos(termino) {
    const sql = `
      SELECT
        producto_id,
        codigo,
        nombre
      FROM productos
      WHERE codigo ILIKE $1 OR nombre ILIKE $1
      ORDER BY codigo ASC
      LIMIT 10
    `;
    const result = await query(sql, [`%${termino}%`]);
    return result.rows;
  }

  // Obtener sugerencias de ubicaciones para autocomplete
  static async getSugerenciasUbicaciones(termino) {
    const sql = `
      SELECT
        ubicacion_id,
        codigo,
        descripcion,
        estanteria,
        fila,
        nivel
      FROM ubicaciones
      WHERE codigo ILIKE $1 OR descripcion ILIKE $1
      ORDER BY codigo ASC
      LIMIT 10
    `;
    const result = await query(sql, [`%${termino}%`]);
    return result.rows;
  }

  // Mover producto de una ubicación a otra
  static async moverProducto(producto_id, ubicacion_origen_id, ubicacion_destino_id, cantidad) {
    const { getClient } = require('../config/db');
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Verificar que existe el inventario en la ubicación origen
      const checkSql = `
        SELECT * FROM inventario_ubicaciones
        WHERE producto_id = $1 AND ubicacion_id = $2
      `;
      const checkResult = await client.query(checkSql, [producto_id, ubicacion_origen_id]);

      if (checkResult.rows.length === 0) {
        throw new Error('El producto no existe en la ubicación origen');
      }

      const inventarioOrigen = checkResult.rows[0];

      if (inventarioOrigen.cantidad < cantidad) {
        throw new Error('Cantidad insuficiente en la ubicación origen');
      }

      // Actualizar o eliminar de la ubicación origen
      if (inventarioOrigen.cantidad === cantidad) {
        // Eliminar completamente si se mueve toda la cantidad
        const deleteSql = `
          DELETE FROM inventario_ubicaciones
          WHERE producto_id = $1 AND ubicacion_id = $2
        `;
        await client.query(deleteSql, [producto_id, ubicacion_origen_id]);
      } else {
        // Restar cantidad
        const updateSql = `
          UPDATE inventario_ubicaciones
          SET cantidad = cantidad - $1,
              fecha_actualizacion = CURRENT_TIMESTAMP
          WHERE producto_id = $2 AND ubicacion_id = $3
        `;
        await client.query(updateSql, [cantidad, producto_id, ubicacion_origen_id]);
      }

      // Agregar o actualizar en la ubicación destino
      const upsertSql = `
        INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad, es_ubicacion_primaria)
        VALUES ($1, $2, $3, false)
        ON CONFLICT (producto_id, ubicacion_id)
        DO UPDATE SET
          cantidad = inventario_ubicaciones.cantidad + $3,
          fecha_actualizacion = CURRENT_TIMESTAMP
        RETURNING *
      `;
      const result = await client.query(upsertSql, [producto_id, ubicacion_destino_id, cantidad]);

      await client.query('COMMIT');

      return {
        origen: inventarioOrigen,
        destino: result.rows[0],
        cantidad_movida: cantidad
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = UbicacionModel;

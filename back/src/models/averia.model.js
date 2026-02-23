const { query, getClient } = require('../config/db');

class AveriaModel {
  // Crear avería simple (sin evidencias)
  static async create(averiaData, usuario_id) {
    const sql = `
      INSERT INTO averias (producto_id, cantidad, tipo_averia, descripcion, ubicacion_id, foto_url, reportado_por, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pendiente')
      RETURNING *
    `;
    const values = [
      averiaData.producto_id,
      averiaData.cantidad,
      averiaData.tipo_averia,
      averiaData.descripcion || null,
      averiaData.ubicacion_id || null,
      averiaData.foto_url || null,
      usuario_id
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Crear avería con múltiples evidencias (transacción)
  static async createWithEvidencias(averiaData, evidencias, usuario_id) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Crear la avería
      const sqlAveria = `
        INSERT INTO averias (producto_id, cantidad, tipo_averia, descripcion, ubicacion_id, reportado_por, estado)
        VALUES ($1, $2, $3, $4, $5, $6, 'Pendiente')
        RETURNING *
      `;
      const valuesAveria = [
        averiaData.producto_id,
        averiaData.cantidad,
        averiaData.tipo_averia,
        averiaData.descripcion || null,
        averiaData.ubicacion_id || null,
        usuario_id
      ];

      const resultAveria = await client.query(sqlAveria, valuesAveria);
      const averia = resultAveria.rows[0];

      // Insertar evidencias si hay
      const evidenciasInsertadas = [];
      if (evidencias && evidencias.length > 0) {
        for (let i = 0; i < evidencias.length; i++) {
          const ev = evidencias[i];
          const sqlEvidencia = `
            INSERT INTO averia_evidencias (averia_id, foto_url, descripcion, orden)
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `;
          const resultEv = await client.query(sqlEvidencia, [
            averia.averia_id,
            ev.foto_url,
            ev.descripcion || null,
            i
          ]);
          evidenciasInsertadas.push(resultEv.rows[0]);
        }
      }

      await client.query('COMMIT');

      return {
        ...averia,
        evidencias: evidenciasInsertadas
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Buscar por ID con evidencias
  static async findById(averia_id) {
    const sql = `
      SELECT
        a.*,
        p.codigo as producto_codigo,
        p.nombre as producto_nombre,
        u.codigo as ubicacion_codigo,
        u.descripcion as ubicacion_descripcion,
        ur.nombre as reportado_por_nombre,
        ures.nombre as resuelto_por_nombre
      FROM averias a
      JOIN productos p ON a.producto_id = p.producto_id
      LEFT JOIN ubicaciones u ON a.ubicacion_id = u.ubicacion_id
      LEFT JOIN usuarios ur ON a.reportado_por = ur.usuario_id
      LEFT JOIN usuarios ures ON a.resuelto_por = ures.usuario_id
      WHERE a.averia_id = $1
    `;
    const result = await query(sql, [averia_id]);

    if (!result.rows[0]) {
      return null;
    }

    // Obtener evidencias
    const sqlEvidencias = `
      SELECT * FROM averia_evidencias
      WHERE averia_id = $1
      ORDER BY orden ASC
    `;
    const evidenciasResult = await query(sqlEvidencias, [averia_id]);

    return {
      ...result.rows[0],
      evidencias: evidenciasResult.rows
    };
  }

  // Listar todas con filtros
  static async findAll(filters = {}) {
    let sql = `
      SELECT
        a.*,
        p.codigo as producto_codigo,
        p.nombre as producto_nombre,
        u.codigo as ubicacion_codigo,
        ur.nombre as reportado_por_nombre
      FROM averias a
      JOIN productos p ON a.producto_id = p.producto_id
      LEFT JOIN ubicaciones u ON a.ubicacion_id = u.ubicacion_id
      LEFT JOIN usuarios ur ON a.reportado_por = ur.usuario_id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.estado) {
      sql += ` AND a.estado = $${paramCount}`;
      values.push(filters.estado);
      paramCount++;
    }

    if (filters.tipo_averia) {
      sql += ` AND a.tipo_averia = $${paramCount}`;
      values.push(filters.tipo_averia);
      paramCount++;
    }

    if (filters.producto_id) {
      sql += ` AND a.producto_id = $${paramCount}`;
      values.push(filters.producto_id);
      paramCount++;
    }

    if (filters.reportado_por) {
      sql += ` AND a.reportado_por = $${paramCount}`;
      values.push(filters.reportado_por);
      paramCount++;
    }

    if (filters.search) {
      sql += ` AND (p.codigo ILIKE $${paramCount} OR p.nombre ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    sql += ' ORDER BY a.fecha_reporte DESC';

    const result = await query(sql, values);
    return result.rows;
  }

  // Obtener estadísticas
  static async getStats() {
    const sql = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE estado = 'Pendiente') as pendientes,
        COUNT(*) FILTER (WHERE estado = 'Repuesta') as repuestas,
        COUNT(*) FILTER (WHERE estado = 'Descartada') as descartadas
      FROM averias
    `;
    const result = await query(sql);
    return result.rows[0];
  }

  // Actualizar estado con ajuste de inventario
  static async updateEstado(averia_id, estado, usuario_id = null) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Obtener datos actuales de la avería
      const averiaActual = await client.query(
        'SELECT * FROM averias WHERE averia_id = $1',
        [averia_id]
      );

      if (!averiaActual.rows[0]) {
        throw new Error('Avería no encontrada');
      }

      const averia = averiaActual.rows[0];
      const estadoAnterior = averia.estado;

      // Si cambia a Repuesta o Descartada y no se ha ajustado inventario
      if ((estado === 'Repuesta' || estado === 'Descartada') && !averia.inventario_ajustado) {
        await this.ajustarInventario(client, averia, estado);
      }

      // Si vuelve a Pendiente desde un estado resuelto, revertir ajuste
      if (estado === 'Pendiente' && averia.inventario_ajustado) {
        await this.revertirAjusteInventario(client, averia, estadoAnterior);
      }

      // Actualizar estado
      let sql = `UPDATE averias SET estado = $1`;
      const values = [estado];
      let paramCount = 2;

      // Si es resolución, guardar quién y cuándo
      if ((estado === 'Repuesta' || estado === 'Descartada') && usuario_id) {
        sql += `, resuelto_por = $${paramCount}, fecha_resolucion = CURRENT_TIMESTAMP`;
        values.push(usuario_id);
        paramCount++;
      }

      // Si vuelve a Pendiente, limpiar datos de resolución
      if (estado === 'Pendiente') {
        sql += `, resuelto_por = NULL, fecha_resolucion = NULL, inventario_ajustado = FALSE, cantidad_ajustada = 0`;
      }

      sql += ` WHERE averia_id = $${paramCount} RETURNING *`;
      values.push(averia_id);

      const result = await client.query(sql, values);
      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Ajustar inventario según estado
  static async ajustarInventario(client, averia, estado) {
    const { producto_id, cantidad, ubicacion_id, averia_id } = averia;

    if (estado === 'Repuesta') {
      // Reponer: incrementar stock (el producto vuelve al inventario)
      await client.query(
        'UPDATE productos SET stock_actual = stock_actual + $1 WHERE producto_id = $2',
        [cantidad, producto_id]
      );

      // Si tiene ubicación, actualizar inventario_ubicaciones
      if (ubicacion_id) {
        await client.query(`
          INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad)
          VALUES ($1, $2, $3)
          ON CONFLICT (producto_id, ubicacion_id)
          DO UPDATE SET cantidad = inventario_ubicaciones.cantidad + $3, fecha_actualizacion = CURRENT_TIMESTAMP
        `, [producto_id, ubicacion_id, cantidad]);
      }
    } else if (estado === 'Descartada') {
      // Descartar: decrementar stock (baja definitiva)
      await client.query(
        'UPDATE productos SET stock_actual = GREATEST(stock_actual - $1, 0) WHERE producto_id = $2',
        [cantidad, producto_id]
      );

      // Si tiene ubicación, actualizar inventario_ubicaciones
      if (ubicacion_id) {
        await client.query(`
          UPDATE inventario_ubicaciones
          SET cantidad = GREATEST(cantidad - $1, 0), fecha_actualizacion = CURRENT_TIMESTAMP
          WHERE producto_id = $2 AND ubicacion_id = $3
        `, [cantidad, producto_id, ubicacion_id]);
      }
    }

    // Marcar avería como ajustada
    await client.query(
      'UPDATE averias SET inventario_ajustado = TRUE, cantidad_ajustada = $1 WHERE averia_id = $2',
      [cantidad, averia_id]
    );
  }

  // Revertir ajuste de inventario (cuando vuelve a Pendiente)
  static async revertirAjusteInventario(client, averia, estadoAnterior) {
    const { producto_id, cantidad_ajustada, ubicacion_id } = averia;

    if (estadoAnterior === 'Repuesta') {
      // Revertir reposición: decrementar stock
      await client.query(
        'UPDATE productos SET stock_actual = GREATEST(stock_actual - $1, 0) WHERE producto_id = $2',
        [cantidad_ajustada, producto_id]
      );

      if (ubicacion_id) {
        await client.query(`
          UPDATE inventario_ubicaciones
          SET cantidad = GREATEST(cantidad - $1, 0), fecha_actualizacion = CURRENT_TIMESTAMP
          WHERE producto_id = $2 AND ubicacion_id = $3
        `, [cantidad_ajustada, producto_id, ubicacion_id]);
      }
    } else if (estadoAnterior === 'Descartada') {
      // Revertir descarte: incrementar stock
      await client.query(
        'UPDATE productos SET stock_actual = stock_actual + $1 WHERE producto_id = $2',
        [cantidad_ajustada, producto_id]
      );

      if (ubicacion_id) {
        await client.query(`
          INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad)
          VALUES ($1, $2, $3)
          ON CONFLICT (producto_id, ubicacion_id)
          DO UPDATE SET cantidad = inventario_ubicaciones.cantidad + $3, fecha_actualizacion = CURRENT_TIMESTAMP
        `, [producto_id, ubicacion_id, cantidad_ajustada]);
      }
    }
  }

  // Actualizar datos de avería
  static async update(averia_id, averiaData) {
    const sql = `
      UPDATE averias
      SET cantidad = $1,
          tipo_averia = $2,
          descripcion = $3,
          ubicacion_id = $4
      WHERE averia_id = $5
      RETURNING *
    `;
    const values = [
      averiaData.cantidad,
      averiaData.tipo_averia,
      averiaData.descripcion,
      averiaData.ubicacion_id,
      averia_id
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Agregar evidencia a avería existente
  static async addEvidencia(averia_id, foto_url, descripcion = null) {
    // Obtener el máximo orden actual
    const maxOrden = await query(
      'SELECT COALESCE(MAX(orden), -1) + 1 as nuevo_orden FROM averia_evidencias WHERE averia_id = $1',
      [averia_id]
    );

    const sql = `
      INSERT INTO averia_evidencias (averia_id, foto_url, descripcion, orden)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await query(sql, [averia_id, foto_url, descripcion, maxOrden.rows[0].nuevo_orden]);
    return result.rows[0];
  }

  // Eliminar evidencia
  static async deleteEvidencia(evidencia_id) {
    const sql = `DELETE FROM averia_evidencias WHERE evidencia_id = $1 RETURNING *`;
    const result = await query(sql, [evidencia_id]);
    return result.rows[0];
  }

  // Obtener evidencias de una avería
  static async getEvidencias(averia_id) {
    const sql = `
      SELECT * FROM averia_evidencias
      WHERE averia_id = $1
      ORDER BY orden ASC
    `;
    const result = await query(sql, [averia_id]);
    return result.rows;
  }

  // Eliminar avería (las evidencias se eliminan por CASCADE)
  static async delete(averia_id) {
    const sql = `DELETE FROM averias WHERE averia_id = $1 RETURNING *`;
    const result = await query(sql, [averia_id]);
    return result.rows[0];
  }
}

module.exports = AveriaModel;

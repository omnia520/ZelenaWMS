const { query, getClient } = require('../config/db');
const BodegaModel = require('./bodega.model');

class TransferenciaModel {
  // Crear transferencia con detalles (transacción)
  static async create(transferenciaData, detalles, usuario_id) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Generar número de transferencia
      const numeroTransferencia = `TRF-${Date.now()}`;

      // Crear transferencia
      const transferenciaSql = `
        INSERT INTO transferencias_bodega
        (numero_transferencia, bodega_origen_id, bodega_destino_id, usuario_id, estado, observaciones)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const transferenciaValues = [
        numeroTransferencia,
        transferenciaData.bodega_origen_id,
        transferenciaData.bodega_destino_id,
        usuario_id,
        transferenciaData.estado || 'Completada',
        transferenciaData.observaciones || null
      ];

      const transferenciaResult = await client.query(transferenciaSql, transferenciaValues);
      const transferencia = transferenciaResult.rows[0];

      // Crear detalles y actualizar inventarios
      if (detalles && detalles.length > 0) {
        for (const detalle of detalles) {
          // Verificar que hay suficiente stock en bodega origen
          const stockOrigenResult = await client.query(
            'SELECT cantidad FROM inventario_bodegas WHERE bodega_id = $1 AND producto_id = $2',
            [transferenciaData.bodega_origen_id, detalle.producto_id]
          );

          const stockOrigen = stockOrigenResult.rows[0]?.cantidad || 0;

          if (stockOrigen < detalle.cantidad) {
            throw new Error(`Stock insuficiente en bodega origen para el producto ${detalle.producto_id}`);
          }

          // Insertar detalle de transferencia
          const detalleSql = `
            INSERT INTO transferencia_detalles (transferencia_id, producto_id, cantidad)
            VALUES ($1, $2, $3)
          `;
          await client.query(detalleSql, [
            transferencia.transferencia_id,
            detalle.producto_id,
            detalle.cantidad
          ]);

          // Reducir cantidad en bodega origen
          await client.query(`
            UPDATE inventario_bodegas
            SET cantidad = cantidad - $1,
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE bodega_id = $2 AND producto_id = $3
          `, [detalle.cantidad, transferenciaData.bodega_origen_id, detalle.producto_id]);

          // Aumentar cantidad en bodega destino
          await client.query(`
            INSERT INTO inventario_bodegas (bodega_id, producto_id, cantidad, fecha_actualizacion)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            ON CONFLICT (bodega_id, producto_id)
            DO UPDATE SET
              cantidad = inventario_bodegas.cantidad + $3,
              fecha_actualizacion = CURRENT_TIMESTAMP
          `, [transferenciaData.bodega_destino_id, detalle.producto_id, detalle.cantidad]);
        }
      }

      await client.query('COMMIT');
      return transferencia;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Buscar por ID con información completa
  static async findById(transferencia_id) {
    const sql = `
      SELECT
        t.*,
        bo.nombre as bodega_origen_nombre,
        bo.codigo as bodega_origen_codigo,
        bd.nombre as bodega_destino_nombre,
        bd.codigo as bodega_destino_codigo,
        u.nombre as usuario_nombre
      FROM transferencias_bodega t
      LEFT JOIN bodegas bo ON t.bodega_origen_id = bo.bodega_id
      LEFT JOIN bodegas bd ON t.bodega_destino_id = bd.bodega_id
      LEFT JOIN usuarios u ON t.usuario_id = u.usuario_id
      WHERE t.transferencia_id = $1
    `;
    const result = await query(sql, [transferencia_id]);
    return result.rows[0];
  }

  // Obtener detalles de transferencia
  static async getDetalles(transferencia_id) {
    const sql = `
      SELECT
        td.*,
        p.codigo as producto_codigo,
        p.nombre as producto_nombre
      FROM transferencia_detalles td
      JOIN productos p ON td.producto_id = p.producto_id
      WHERE td.transferencia_id = $1
      ORDER BY td.detalle_id ASC
    `;
    const result = await query(sql, [transferencia_id]);
    return result.rows;
  }

  // Listar todas con filtros
  static async findAll(filters = {}) {
    let sql = `
      SELECT
        t.*,
        bo.nombre as bodega_origen_nombre,
        bd.nombre as bodega_destino_nombre,
        u.nombre as usuario_nombre
      FROM transferencias_bodega t
      LEFT JOIN bodegas bo ON t.bodega_origen_id = bo.bodega_id
      LEFT JOIN bodegas bd ON t.bodega_destino_id = bd.bodega_id
      LEFT JOIN usuarios u ON t.usuario_id = u.usuario_id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.bodega_origen_id) {
      sql += ` AND t.bodega_origen_id = $${paramCount}`;
      values.push(filters.bodega_origen_id);
      paramCount++;
    }

    if (filters.bodega_destino_id) {
      sql += ` AND t.bodega_destino_id = $${paramCount}`;
      values.push(filters.bodega_destino_id);
      paramCount++;
    }

    if (filters.estado) {
      sql += ` AND t.estado = $${paramCount}`;
      values.push(filters.estado);
      paramCount++;
    }

    if (filters.fecha_desde) {
      sql += ` AND t.fecha_transferencia >= $${paramCount}`;
      values.push(filters.fecha_desde);
      paramCount++;
    }

    if (filters.fecha_hasta) {
      sql += ` AND t.fecha_transferencia <= $${paramCount}`;
      values.push(filters.fecha_hasta);
      paramCount++;
    }

    sql += ' ORDER BY t.fecha_transferencia DESC';

    const result = await query(sql, values);
    return result.rows;
  }

  // Cancelar transferencia (solo si está pendiente)
  static async cancel(transferencia_id) {
    const sql = `
      UPDATE transferencias_bodega
      SET estado = 'Cancelada'
      WHERE transferencia_id = $1 AND estado = 'Pendiente'
      RETURNING *
    `;
    const result = await query(sql, [transferencia_id]);
    return result.rows[0];
  }

  // Eliminar transferencia
  static async delete(transferencia_id) {
    const sql = `DELETE FROM transferencias_bodega WHERE transferencia_id = $1 RETURNING *`;
    const result = await query(sql, [transferencia_id]);
    return result.rows[0];
  }
}

module.exports = TransferenciaModel;

const { query, getClient } = require('../config/db');
const InventarioModel = require('./inventario.model');

class OrdenModel {
  // Crear orden con detalles (transacción)
  static async create(ordenData, detalles, vendedor_id) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Verificar si la reserva de inventario está habilitada
      const reservaHabilitada = process.env.ENABLE_INVENTORY_RESERVATION === 'true';

      // Si la reserva está habilitada, verificar y reservar inventario
      if (reservaHabilitada) {
        const detallesInventario = detalles.map(d => ({
          producto_id: d.producto_id,
          cantidad: d.cantidad_pedida
        }));

        const resultadoReserva = await InventarioModel.reservarInventario(client, detallesInventario);

        if (!resultadoReserva.success) {
          // Si hay productos con stock insuficiente, rechazar la creación
          await client.query('ROLLBACK');
          const error = new Error('Stock insuficiente para algunos productos');
          error.productosInsuficientes = resultadoReserva.productosInsuficientes;
          error.statusCode = 400;
          throw error;
        }
      }

      // Generar número de orden consecutivo simple: ORD-1, ORD-2, ORD-3, etc.
      // Ignora números tipo timestamp (> 10,000) y empieza desde 1
      const ultimaOrdenSql = `
        SELECT numero_orden FROM ordenes_venta
        WHERE numero_orden ~ '^ORD-[0-9]+$'
        ORDER BY orden_id DESC
      `;
      const ultimaOrdenResult = await client.query(ultimaOrdenSql);

      let numeroConsecutivo = 1;

      // Buscar el número consecutivo más alto, ignorando timestamps viejos
      if (ultimaOrdenResult.rows.length > 0) {
        let maxNumero = 0;

        for (const row of ultimaOrdenResult.rows) {
          const match = row.numero_orden.match(/^ORD-(\d+)$/);
          if (match) {
            const num = parseInt(match[1]);
            // Solo considerar números menores a 10,000 (ignorar timestamps tipo 2024017, 202413, etc.)
            if (num < 10000 && num > maxNumero) {
              maxNumero = num;
            }
          }
        }

        // Si encontramos algún número válido, usar el siguiente
        if (maxNumero > 0) {
          numeroConsecutivo = maxNumero + 1;
        }
      }

      const numeroOrden = `ORD-${numeroConsecutivo}`;

      // Crear orden
      const ordenSql = `
        INSERT INTO ordenes_venta
        (numero_orden, cliente_id, vendedor_id, estado, subtotal, descuento_total, impuestos_total, total, comentarios)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const ordenValues = [
        numeroOrden,
        ordenData.cliente_id,
        vendedor_id,
        ordenData.estado || 'Pendiente_Aprobacion',
        ordenData.subtotal || 0,
        ordenData.descuento_total || 0,
        ordenData.impuestos_total || 0,
        ordenData.total || 0,
        ordenData.comentarios || null
      ];

      const ordenResult = await client.query(ordenSql, ordenValues);
      const orden = ordenResult.rows[0];

      // Crear detalles
      if (detalles && detalles.length > 0) {
        for (const detalle of detalles) {
          const detalleSql = `
            INSERT INTO orden_detalles
            (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal, comentarios_item, numero_cajas)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `;
          const detalleValues = [
            orden.orden_id,
            detalle.producto_id,
            detalle.cantidad_pedida,
            detalle.precio_unitario,
            detalle.descuento_porcentaje || 0,
            detalle.subtotal,
            detalle.comentarios_item || null,
            detalle.numero_cajas || 0
          ];

          await client.query(detalleSql, detalleValues);
        }
      }

      await client.query('COMMIT');
      return orden;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Obtener orden por ID con detalles
  static async findById(orden_id) {
    const sql = `
      SELECT
        o.*,
        c.razon_social as cliente_nombre,
        c.nit_cc as cliente_nit,
        c.direccion as cliente_direccion,
        c.ciudad as cliente_ciudad,
        c.departamento as cliente_departamento,
        v.nombre as vendedor_nombre,
        j.nombre as aprobado_por_nombre,
        a.nombre as alistador_nombre,
        e.nombre as empacador_nombre
      FROM ordenes_venta o
      LEFT JOIN clientes c ON o.cliente_id = c.cliente_id
      LEFT JOIN usuarios v ON o.vendedor_id = v.usuario_id
      LEFT JOIN usuarios j ON o.aprobado_por = j.usuario_id
      LEFT JOIN usuarios a ON o.alistador_asignado = a.usuario_id
      LEFT JOIN usuarios e ON o.empacador_asignado = e.usuario_id
      WHERE o.orden_id = $1
    `;
    const result = await query(sql, [orden_id]);
    return result.rows[0];
  }

  // Obtener detalles de orden
  static async getDetalles(orden_id) {
    const sql = `
      SELECT
        od.*,
        p.codigo as producto_codigo,
        p.nombre as producto_nombre,
        p.imagen_url as producto_imagen
      FROM orden_detalles od
      JOIN productos p ON od.producto_id = p.producto_id
      WHERE od.orden_id = $1
      ORDER BY od.detalle_id ASC
    `;
    const result = await query(sql, [orden_id]);
    return result.rows;
  }

  // Listar órdenes con filtros
  static async findAll(filters = {}) {
    let sql = `
      SELECT
        o.*,
        c.razon_social as cliente_nombre,
        v.nombre as vendedor_nombre
      FROM ordenes_venta o
      LEFT JOIN clientes c ON o.cliente_id = c.cliente_id
      LEFT JOIN usuarios v ON o.vendedor_id = v.usuario_id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.estado) {
      sql += ` AND o.estado = $${paramCount}`;
      values.push(filters.estado);
      paramCount++;
    }

    if (filters.vendedor_id) {
      sql += ` AND o.vendedor_id = $${paramCount}`;
      values.push(filters.vendedor_id);
      paramCount++;
    }

    if (filters.alistador_id) {
      sql += ` AND o.alistador_asignado = $${paramCount}`;
      values.push(filters.alistador_id);
      paramCount++;
    }

    if (filters.empacador_id) {
      sql += ` AND o.empacador_asignado = $${paramCount}`;
      values.push(filters.empacador_id);
      paramCount++;
    }

    if (filters.cliente_id) {
      sql += ` AND o.cliente_id = $${paramCount}`;
      values.push(filters.cliente_id);
      paramCount++;
    }

    // Búsqueda general por número de orden, cliente o vendedor
    if (filters.search) {
      sql += ` AND (
        LOWER(o.numero_orden) LIKE LOWER($${paramCount}) OR
        LOWER(c.razon_social) LIKE LOWER($${paramCount}) OR
        LOWER(v.nombre) LIKE LOWER($${paramCount})
      )`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    sql += ' ORDER BY o.fecha_creacion DESC';

    const result = await query(sql, values);
    return result.rows;
  }

  // Actualizar estado
  static async updateEstado(orden_id, estado, usuario_id = null) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Verificar si la reserva de inventario está habilitada
      const reservaHabilitada = process.env.ENABLE_INVENTORY_RESERVATION === 'true';

      // Si el estado es "Rechazada" y la reserva está habilitada, liberar inventario
      if (estado === 'Rechazada' && reservaHabilitada) {
        // Obtener detalles de la orden para liberar inventario
        const detallesResult = await client.query(`
          SELECT producto_id, cantidad_pedida
          FROM orden_detalles
          WHERE orden_id = $1
        `, [orden_id]);

        if (detallesResult.rows.length > 0) {
          const detallesInventario = detallesResult.rows.map(d => ({
            producto_id: d.producto_id,
            cantidad: d.cantidad_pedida
          }));

          await InventarioModel.liberarInventario(client, detallesInventario);
        }
      }

      let sql = `UPDATE ordenes_venta SET estado = $1`;
      const values = [estado, orden_id];
      let paramCount = 3;

      // Si el estado es "Aprobada", guardar quién aprobó y cuándo
      if (estado === 'Aprobada' && usuario_id) {
        sql += `, aprobado_por = $${paramCount}, fecha_aprobacion = CURRENT_TIMESTAMP`;
        values.splice(2, 0, usuario_id);
        paramCount++;
      }

      sql += ` WHERE orden_id = $2 RETURNING *`;

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

  // Iniciar alistamiento (cambiar estado, guardar fecha de inicio y auto-asignar operario)
  static async iniciarAlistamiento(orden_id, operario_id) {
    const sql = `
      UPDATE ordenes_venta
      SET estado = 'En_Alistamiento',
          fecha_inicio_alistamiento = CURRENT_TIMESTAMP,
          alistador_asignado = $2
      WHERE orden_id = $1
      RETURNING *
    `;
    const result = await query(sql, [orden_id, operario_id]);
    return result.rows[0];
  }

  // Finalizar alistamiento (guardar observación y cambiar estado)
  static async finalizarAlistamiento(orden_id, observacion_alistador) {
    const sql = `
      UPDATE ordenes_venta
      SET estado = 'Listo_Para_Empacar',
          fecha_fin_alistamiento = CURRENT_TIMESTAMP,
          observacion_alistador = $2
      WHERE orden_id = $1
      RETURNING *
    `;
    const result = await query(sql, [orden_id, observacion_alistador]);
    return result.rows[0];
  }

  // Iniciar empaque (cambiar estado, guardar fecha de inicio y auto-asignar operario)
  static async iniciarEmpaque(orden_id, operario_id) {
    const sql = `
      UPDATE ordenes_venta
      SET estado = 'En_Empaque',
          fecha_inicio_empaque = CURRENT_TIMESTAMP,
          empacador_asignado = $2
      WHERE orden_id = $1
      RETURNING *
    `;
    const result = await query(sql, [orden_id, operario_id]);
    return result.rows[0];
  }

  // Finalizar empaque (guardar observación, número de cajas y cambiar estado)
  static async finalizarEmpaque(orden_id, observacion_empacador, numero_cajas) {
    // Primero verificar que todos los detalles tengan el alistamiento completado
    const checkAlistamientoSql = `
      SELECT COUNT(*) as total,
             COUNT(*) FILTER (WHERE alistamiento_completado = TRUE) as completados
      FROM orden_detalles
      WHERE orden_id = $1
    `;
    const checkResult = await query(checkAlistamientoSql, [orden_id]);
    const { total, completados } = checkResult.rows[0];

    if (parseInt(total) !== parseInt(completados)) {
      throw new Error('No se puede finalizar el empaque porque el alistamiento de la orden aún no está completo');
    }

    // Si el alistamiento está completo, proceder a finalizar el empaque
    const sql = `
      UPDATE ordenes_venta
      SET estado = 'Listo_Para_Despachar',
          fecha_fin_empaque = CURRENT_TIMESTAMP,
          observacion_empacador = $2,
          numero_cajas = $3
      WHERE orden_id = $1
      RETURNING *
    `;
    const result = await query(sql, [orden_id, observacion_empacador, numero_cajas || 0]);
    return result.rows[0];
  }

  // Marcar detalle como alistado completamente
  static async marcarDetalleAlistadoCompletado(detalle_id) {
    const sql = `
      UPDATE orden_detalles
      SET alistamiento_completado = TRUE
      WHERE detalle_id = $1
      RETURNING *
    `;
    const result = await query(sql, [detalle_id]);
    return result.rows[0];
  }

  // Marcar detalle como empacado completamente
  static async marcarDetalleEmpaqueCompletado(detalle_id) {
    const sql = `
      UPDATE orden_detalles
      SET empaque_completado = TRUE
      WHERE detalle_id = $1
      RETURNING *
    `;
    const result = await query(sql, [detalle_id]);
    return result.rows[0];
  }

  // Asignar alistador y empacador
  static async asignarPersonal(orden_id, alistador_id, empacador_id) {
    const sql = `
      UPDATE ordenes_venta
      SET alistador_asignado = $1, empacador_asignado = $2
      WHERE orden_id = $3
      RETURNING *
    `;
    const result = await query(sql, [alistador_id, empacador_id, orden_id]);
    return result.rows[0];
  }

  // Actualizar cantidades alistadas
  static async updateCantidadAlistada(detalle_id, cantidad_alistada) {
    const sql = `
      UPDATE orden_detalles
      SET cantidad_alistada = $1
      WHERE detalle_id = $2
      RETURNING *
    `;
    const result = await query(sql, [cantidad_alistada, detalle_id]);
    return result.rows[0];
  }

  // Actualizar cantidades empacadas
  static async updateCantidadEmpacada(detalle_id, cantidad_empacada) {
    const sql = `
      UPDATE orden_detalles
      SET cantidad_empacada = $1
      WHERE detalle_id = $2
      RETURNING *
    `;
    const result = await query(sql, [cantidad_empacada, detalle_id]);
    return result.rows[0];
  }

  // Agregar observación
  static async addObservacion(observacionData) {
    const sql = `
      INSERT INTO observaciones_proceso
      (orden_id, detalle_id, tipo_proceso, usuario_id, observacion, foto_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      observacionData.orden_id,
      observacionData.detalle_id || null,
      observacionData.tipo_proceso,
      observacionData.usuario_id,
      observacionData.observacion,
      observacionData.foto_url || null
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Obtener observaciones de una orden
  static async getObservaciones(orden_id) {
    const sql = `
      SELECT
        op.*,
        u.nombre as usuario_nombre,
        u.rol as usuario_rol
      FROM observaciones_proceso op
      JOIN usuarios u ON op.usuario_id = u.usuario_id
      WHERE op.orden_id = $1
      ORDER BY op.fecha_creacion DESC
    `;
    const result = await query(sql, [orden_id]);
    return result.rows;
  }

  // Obtener órdenes pendientes con información completa (cliente y vendedor)
  static async findPendientes() {
    const sql = `
      SELECT
        o.orden_id,
        o.numero_orden,
        o.fecha_creacion,
        o.total,
        o.comentarios,
        c.cliente_id,
        c.nit_cc as cliente_nit,
        c.razon_social as cliente_nombre,
        c.telefono as cliente_telefono,
        c.direccion as cliente_direccion,
        v.usuario_id as vendedor_id,
        v.nombre as vendedor_nombre,
        v.telefono as vendedor_telefono
      FROM ordenes_venta o
      LEFT JOIN clientes c ON o.cliente_id = c.cliente_id
      LEFT JOIN usuarios v ON o.vendedor_id = v.usuario_id
      WHERE o.estado = 'Pendiente_Aprobacion'
      ORDER BY o.fecha_creacion ASC
    `;
    const result = await query(sql);
    return result.rows;
  }

  // Finalizar revisión (cambiar estado de Listo_Para_Despachar a Finalizado)
  static async finalizarRevision(orden_id) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Verificar si la reserva de inventario está habilitada
      const reservaHabilitada = process.env.ENABLE_INVENTORY_RESERVATION === 'true';

      // Si la reserva está habilitada, descontar inventario definitivamente
      if (reservaHabilitada) {
        // Obtener detalles de la orden para descontar inventario
        const detallesResult = await client.query(`
          SELECT producto_id, cantidad_pedida
          FROM orden_detalles
          WHERE orden_id = $1
        `, [orden_id]);

        if (detallesResult.rows.length > 0) {
          const detallesInventario = detallesResult.rows.map(d => ({
            producto_id: d.producto_id,
            cantidad: d.cantidad_pedida
          }));

          await InventarioModel.descontarInventario(client, detallesInventario);
        }
      }

      const sql = `
        UPDATE ordenes_venta
        SET estado = 'Finalizado',
            fecha_finalizacion = CURRENT_TIMESTAMP
        WHERE orden_id = $1 AND estado = 'Listo_Para_Despachar'
        RETURNING *
      `;
      const result = await client.query(sql, [orden_id]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Eliminar orden
  static async delete(orden_id) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Verificar si la reserva de inventario está habilitada
      const reservaHabilitada = process.env.ENABLE_INVENTORY_RESERVATION === 'true';

      // Si la reserva está habilitada, liberar inventario antes de eliminar
      if (reservaHabilitada) {
        // Obtener detalles de la orden para liberar inventario
        const detallesResult = await client.query(`
          SELECT producto_id, cantidad_pedida
          FROM orden_detalles
          WHERE orden_id = $1
        `, [orden_id]);

        if (detallesResult.rows.length > 0) {
          const detallesInventario = detallesResult.rows.map(d => ({
            producto_id: d.producto_id,
            cantidad: d.cantidad_pedida
          }));

          await InventarioModel.liberarInventario(client, detallesInventario);
        }
      }

      // Eliminar detalles
      await client.query('DELETE FROM orden_detalles WHERE orden_id = $1', [orden_id]);

      // Eliminar observaciones
      await client.query('DELETE FROM observaciones_proceso WHERE orden_id = $1', [orden_id]);

      // Eliminar orden
      const result = await client.query('DELETE FROM ordenes_venta WHERE orden_id = $1 RETURNING *', [orden_id]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = OrdenModel;

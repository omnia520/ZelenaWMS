const { query } = require('../config/db');

class DesempenoModel {
  /**
   * Obtener KPIs de un usuario específico
   */
  static async getKPIsByUsuario(usuario_id, filtros = {}) {
    const { fecha_inicio, fecha_fin, tipo_actividad } = filtros;

    // Query base para Picking
    // Alistamiento completado si: tiene fecha_fin O ya inició empaque
    const pickingQuery = `
      SELECT
        COUNT(*) FILTER (WHERE fecha_fin_alistamiento IS NOT NULL OR fecha_inicio_empaque IS NOT NULL) as ordenes_completadas,
        COALESCE(SUM(total_alistado) FILTER (WHERE fecha_fin_alistamiento IS NOT NULL OR fecha_inicio_empaque IS NOT NULL), 0) as unidades_procesadas,
        COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(fecha_fin_alistamiento, fecha_inicio_empaque) - fecha_inicio_alistamiento))) FILTER (WHERE fecha_fin_alistamiento IS NOT NULL OR fecha_inicio_empaque IS NOT NULL), 0) as tiempo_total_segundos,
        COUNT(*) FILTER (WHERE fecha_fin_alistamiento IS NULL AND fecha_inicio_empaque IS NULL AND fecha_inicio_alistamiento IS NOT NULL) as en_progreso
      FROM (
        SELECT
          o.orden_id,
          o.fecha_inicio_alistamiento,
          o.fecha_fin_alistamiento,
          o.fecha_inicio_empaque,
          COALESCE(SUM(od.cantidad_alistada), 0) as total_alistado
        FROM ordenes_venta o
        LEFT JOIN orden_detalles od ON o.orden_id = od.orden_id
        WHERE o.alistador_asignado = $1
          AND o.fecha_inicio_alistamiento IS NOT NULL
          ${fecha_inicio ? `AND o.fecha_inicio_alistamiento >= $2::date` : ''}
          ${fecha_fin ? `AND o.fecha_inicio_alistamiento < (${fecha_inicio ? '$3' : '$2'}::date + interval '1 day')` : ''}
        GROUP BY o.orden_id, o.fecha_inicio_alistamiento, o.fecha_fin_alistamiento, o.fecha_inicio_empaque
      ) sub
    `;

    // Query base para Packing
    // Empaque completado si: tiene fecha_fin O estado posterior (Listo_Para_Despachar, Finalizado, etc.)
    const packingQuery = `
      SELECT
        COUNT(*) FILTER (WHERE fecha_fin_empaque IS NOT NULL OR estado IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado')) as ordenes_completadas,
        COALESCE(SUM(total_empacado) FILTER (WHERE fecha_fin_empaque IS NOT NULL OR estado IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado')), 0) as unidades_procesadas,
        COALESCE(SUM(
          CASE
            WHEN fecha_fin_empaque IS NOT NULL THEN EXTRACT(EPOCH FROM (fecha_fin_empaque - fecha_inicio_empaque))
            WHEN estado IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado') THEN EXTRACT(EPOCH FROM (COALESCE(fecha_fin_empaque, fecha_inicio_empaque + interval '30 minutes') - fecha_inicio_empaque))
            ELSE NULL
          END
        ) FILTER (WHERE fecha_fin_empaque IS NOT NULL OR estado IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado')), 0) as tiempo_total_segundos,
        COUNT(*) FILTER (WHERE fecha_fin_empaque IS NULL AND estado NOT IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado') AND fecha_inicio_empaque IS NOT NULL) as en_progreso
      FROM (
        SELECT
          o.orden_id,
          o.fecha_inicio_empaque,
          o.fecha_fin_empaque,
          o.estado,
          COALESCE(SUM(od.cantidad_empacada), 0) as total_empacado
        FROM ordenes_venta o
        LEFT JOIN orden_detalles od ON o.orden_id = od.orden_id
        WHERE o.empacador_asignado = $1
          AND o.fecha_inicio_empaque IS NOT NULL
          ${fecha_inicio ? `AND o.fecha_inicio_empaque >= $2::date` : ''}
          ${fecha_fin ? `AND o.fecha_inicio_empaque < (${fecha_inicio ? '$3' : '$2'}::date + interval '1 day')` : ''}
        GROUP BY o.orden_id, o.fecha_inicio_empaque, o.fecha_fin_empaque, o.estado
      ) sub
    `;

    const params = [usuario_id];
    if (fecha_inicio) params.push(fecha_inicio);
    if (fecha_fin) params.push(fecha_fin);

    const result = {
      picking: null,
      packing: null
    };

    // Ejecutar queries según filtro de tipo
    if (!tipo_actividad || tipo_actividad === 'Picking') {
      const pickingResult = await query(pickingQuery, params);
      const p = pickingResult.rows[0];
      const tiempoTotalHoras = parseFloat(p.tiempo_total_segundos) / 3600;
      result.picking = {
        ordenes_completadas: parseInt(p.ordenes_completadas) || 0,
        unidades_procesadas: parseInt(p.unidades_procesadas) || 0,
        tiempo_total_segundos: parseFloat(p.tiempo_total_segundos) || 0,
        tiempo_promedio_segundos: p.ordenes_completadas > 0
          ? parseFloat(p.tiempo_total_segundos) / parseInt(p.ordenes_completadas)
          : 0,
        ordenes_por_hora: tiempoTotalHoras > 0
          ? parseFloat((parseInt(p.ordenes_completadas) / tiempoTotalHoras).toFixed(2))
          : 0,
        unidades_por_hora: tiempoTotalHoras > 0
          ? parseFloat((parseInt(p.unidades_procesadas) / tiempoTotalHoras).toFixed(2))
          : 0,
        en_progreso: parseInt(p.en_progreso) || 0
      };
    }

    if (!tipo_actividad || tipo_actividad === 'Packing') {
      const packingResult = await query(packingQuery, params);
      const p = packingResult.rows[0];
      const tiempoTotalHoras = parseFloat(p.tiempo_total_segundos) / 3600;
      result.packing = {
        ordenes_completadas: parseInt(p.ordenes_completadas) || 0,
        unidades_procesadas: parseInt(p.unidades_procesadas) || 0,
        tiempo_total_segundos: parseFloat(p.tiempo_total_segundos) || 0,
        tiempo_promedio_segundos: p.ordenes_completadas > 0
          ? parseFloat(p.tiempo_total_segundos) / parseInt(p.ordenes_completadas)
          : 0,
        ordenes_por_hora: tiempoTotalHoras > 0
          ? parseFloat((parseInt(p.ordenes_completadas) / tiempoTotalHoras).toFixed(2))
          : 0,
        unidades_por_hora: tiempoTotalHoras > 0
          ? parseFloat((parseInt(p.unidades_procesadas) / tiempoTotalHoras).toFixed(2))
          : 0,
        en_progreso: parseInt(p.en_progreso) || 0
      };
    }

    return result;
  }

  /**
   * Obtener historial de actividades de un usuario
   */
  static async getHistorialByUsuario(usuario_id, filtros = {}, paginacion = {}) {
    const { fecha_inicio, fecha_fin, tipo_actividad } = filtros;
    const { page = 1, limit = 20 } = paginacion;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT * FROM (
        -- Picking (completado si: tiene fecha_fin O ya inició empaque)
        SELECT
          o.orden_id,
          o.numero_orden,
          'Picking' AS tipo_actividad,
          o.fecha_inicio_alistamiento AS fecha_inicio,
          COALESCE(o.fecha_fin_alistamiento, o.fecha_inicio_empaque) AS fecha_fin,
          CASE
            WHEN o.fecha_fin_alistamiento IS NOT NULL OR o.fecha_inicio_empaque IS NOT NULL
            THEN EXTRACT(EPOCH FROM (COALESCE(o.fecha_fin_alistamiento, o.fecha_inicio_empaque) - o.fecha_inicio_alistamiento))
            ELSE NULL
          END AS duracion_segundos,
          COALESCE(SUM(od.cantidad_alistada), 0)::INTEGER AS unidades_procesadas,
          CASE
            WHEN o.fecha_fin_alistamiento IS NOT NULL OR o.fecha_inicio_empaque IS NOT NULL THEN 'Completada'
            ELSE 'En_Progreso'
          END AS estado_actividad
        FROM ordenes_venta o
        LEFT JOIN orden_detalles od ON o.orden_id = od.orden_id
        WHERE o.alistador_asignado = $1
          AND o.fecha_inicio_alistamiento IS NOT NULL
        GROUP BY o.orden_id, o.numero_orden, o.fecha_inicio_alistamiento, o.fecha_fin_alistamiento, o.fecha_inicio_empaque

        UNION ALL

        -- Packing (completado si: tiene fecha_fin O estado posterior)
        SELECT
          o.orden_id,
          o.numero_orden,
          'Packing' AS tipo_actividad,
          o.fecha_inicio_empaque AS fecha_inicio,
          o.fecha_fin_empaque AS fecha_fin,
          CASE
            WHEN o.fecha_fin_empaque IS NOT NULL THEN EXTRACT(EPOCH FROM (o.fecha_fin_empaque - o.fecha_inicio_empaque))
            WHEN o.estado IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado') THEN EXTRACT(EPOCH FROM (COALESCE(o.fecha_fin_empaque, o.fecha_inicio_empaque + interval '30 minutes') - o.fecha_inicio_empaque))
            ELSE NULL
          END AS duracion_segundos,
          COALESCE(SUM(od.cantidad_empacada), 0)::INTEGER AS unidades_procesadas,
          CASE
            WHEN o.fecha_fin_empaque IS NOT NULL OR o.estado IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado') THEN 'Completada'
            ELSE 'En_Progreso'
          END AS estado_actividad
        FROM ordenes_venta o
        LEFT JOIN orden_detalles od ON o.orden_id = od.orden_id
        WHERE o.empacador_asignado = $1
          AND o.fecha_inicio_empaque IS NOT NULL
        GROUP BY o.orden_id, o.numero_orden, o.fecha_inicio_empaque, o.fecha_fin_empaque, o.estado
      ) actividades
      WHERE 1=1
    `;

    const params = [usuario_id];
    let paramCount = 2;

    if (tipo_actividad) {
      sql += ` AND tipo_actividad = $${paramCount}`;
      params.push(tipo_actividad);
      paramCount++;
    }

    if (fecha_inicio) {
      sql += ` AND fecha_inicio >= $${paramCount}::date`;
      params.push(fecha_inicio);
      paramCount++;
    }

    if (fecha_fin) {
      sql += ` AND fecha_inicio < ($${paramCount}::date + interval '1 day')`;
      params.push(fecha_fin);
      paramCount++;
    }

    // Count total
    const countSql = `SELECT COUNT(*) as total FROM (${sql}) as count_query`;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination
    sql += ` ORDER BY fecha_inicio DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    return {
      actividades: result.rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtener KPIs globales consolidados
   */
  static async getKPIsGlobales(filtros = {}) {
    const { fecha_inicio, fecha_fin, tipo_actividad } = filtros;

    let params = [];
    let paramCount = 1;

    // Condiciones de fecha (fecha_fin incluye todo el día)
    let fechaCondPicking = '';
    let fechaCondPacking = '';

    if (fecha_inicio) {
      fechaCondPicking += ` AND o.fecha_inicio_alistamiento >= $${paramCount}::date`;
      fechaCondPacking += ` AND o.fecha_inicio_empaque >= $${paramCount}::date`;
      params.push(fecha_inicio);
      paramCount++;
    }

    if (fecha_fin) {
      fechaCondPicking += ` AND o.fecha_inicio_alistamiento < ($${paramCount}::date + interval '1 day')`;
      fechaCondPacking += ` AND o.fecha_inicio_empaque < ($${paramCount}::date + interval '1 day')`;
      params.push(fecha_fin);
      paramCount++;
    }

    const result = {
      picking: null,
      packing: null
    };

    if (!tipo_actividad || tipo_actividad === 'Picking') {
      const pickingQuery = `
        SELECT
          COUNT(*) FILTER (WHERE fecha_fin_alistamiento IS NOT NULL OR fecha_inicio_empaque IS NOT NULL) as ordenes_completadas,
          COALESCE(SUM(total_alistado) FILTER (WHERE fecha_fin_alistamiento IS NOT NULL OR fecha_inicio_empaque IS NOT NULL), 0) as unidades_procesadas,
          COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(fecha_fin_alistamiento, fecha_inicio_empaque) - fecha_inicio_alistamiento))) FILTER (WHERE fecha_fin_alistamiento IS NOT NULL OR fecha_inicio_empaque IS NOT NULL), 0) as tiempo_total_segundos,
          COUNT(*) FILTER (WHERE fecha_fin_alistamiento IS NULL AND fecha_inicio_empaque IS NULL AND fecha_inicio_alistamiento IS NOT NULL) as en_progreso,
          COUNT(DISTINCT alistador_asignado) as operarios_activos
        FROM (
          SELECT
            o.orden_id,
            o.alistador_asignado,
            o.fecha_inicio_alistamiento,
            o.fecha_fin_alistamiento,
            o.fecha_inicio_empaque,
            COALESCE(SUM(od.cantidad_alistada), 0) as total_alistado
          FROM ordenes_venta o
          LEFT JOIN orden_detalles od ON o.orden_id = od.orden_id
          WHERE o.alistador_asignado IS NOT NULL
            AND o.fecha_inicio_alistamiento IS NOT NULL
            ${fechaCondPicking}
          GROUP BY o.orden_id, o.alistador_asignado, o.fecha_inicio_alistamiento, o.fecha_fin_alistamiento, o.fecha_inicio_empaque
        ) sub
      `;

      const pickingResult = await query(pickingQuery, params);
      const p = pickingResult.rows[0];
      const tiempoTotalHoras = parseFloat(p.tiempo_total_segundos) / 3600;

      result.picking = {
        ordenes_completadas: parseInt(p.ordenes_completadas) || 0,
        unidades_procesadas: parseInt(p.unidades_procesadas) || 0,
        tiempo_total_segundos: parseFloat(p.tiempo_total_segundos) || 0,
        ordenes_por_hora: tiempoTotalHoras > 0
          ? parseFloat((parseInt(p.ordenes_completadas) / tiempoTotalHoras).toFixed(2))
          : 0,
        unidades_por_hora: tiempoTotalHoras > 0
          ? parseFloat((parseInt(p.unidades_procesadas) / tiempoTotalHoras).toFixed(2))
          : 0,
        en_progreso: parseInt(p.en_progreso) || 0,
        operarios_activos: parseInt(p.operarios_activos) || 0
      };
    }

    if (!tipo_actividad || tipo_actividad === 'Packing') {
      const packingQuery = `
        SELECT
          COUNT(*) FILTER (WHERE fecha_fin_empaque IS NOT NULL OR estado IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado')) as ordenes_completadas,
          COALESCE(SUM(total_empacado) FILTER (WHERE fecha_fin_empaque IS NOT NULL OR estado IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado')), 0) as unidades_procesadas,
          COALESCE(SUM(
            CASE
              WHEN fecha_fin_empaque IS NOT NULL THEN EXTRACT(EPOCH FROM (fecha_fin_empaque - fecha_inicio_empaque))
              WHEN estado IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado') THEN EXTRACT(EPOCH FROM (COALESCE(fecha_fin_empaque, fecha_inicio_empaque + interval '30 minutes') - fecha_inicio_empaque))
              ELSE NULL
            END
          ) FILTER (WHERE fecha_fin_empaque IS NOT NULL OR estado IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado')), 0) as tiempo_total_segundos,
          COUNT(*) FILTER (WHERE fecha_fin_empaque IS NULL AND estado NOT IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado') AND fecha_inicio_empaque IS NOT NULL) as en_progreso,
          COUNT(DISTINCT empacador_asignado) as operarios_activos
        FROM (
          SELECT
            o.orden_id,
            o.empacador_asignado,
            o.fecha_inicio_empaque,
            o.fecha_fin_empaque,
            o.estado,
            COALESCE(SUM(od.cantidad_empacada), 0) as total_empacado
          FROM ordenes_venta o
          LEFT JOIN orden_detalles od ON o.orden_id = od.orden_id
          WHERE o.empacador_asignado IS NOT NULL
            AND o.fecha_inicio_empaque IS NOT NULL
            ${fechaCondPacking}
          GROUP BY o.orden_id, o.empacador_asignado, o.fecha_inicio_empaque, o.fecha_fin_empaque, o.estado
        ) sub
      `;

      const packingResult = await query(packingQuery, params);
      const p = packingResult.rows[0];
      const tiempoTotalHoras = parseFloat(p.tiempo_total_segundos) / 3600;

      result.packing = {
        ordenes_completadas: parseInt(p.ordenes_completadas) || 0,
        unidades_procesadas: parseInt(p.unidades_procesadas) || 0,
        tiempo_total_segundos: parseFloat(p.tiempo_total_segundos) || 0,
        ordenes_por_hora: tiempoTotalHoras > 0
          ? parseFloat((parseInt(p.ordenes_completadas) / tiempoTotalHoras).toFixed(2))
          : 0,
        unidades_por_hora: tiempoTotalHoras > 0
          ? parseFloat((parseInt(p.unidades_procesadas) / tiempoTotalHoras).toFixed(2))
          : 0,
        en_progreso: parseInt(p.en_progreso) || 0,
        operarios_activos: parseInt(p.operarios_activos) || 0
      };
    }

    return result;
  }

  /**
   * Obtener desempeño por usuario (tabla comparativa)
   */
  static async getDesempenoPorUsuario(filtros = {}) {
    const { fecha_inicio, fecha_fin, tipo_actividad } = filtros;

    let params = [];
    let paramCount = 1;

    let fechaCondPicking = '';
    let fechaCondPacking = '';

    if (fecha_inicio) {
      fechaCondPicking += ` AND o.fecha_inicio_alistamiento >= $${paramCount}::date`;
      fechaCondPacking += ` AND o.fecha_inicio_empaque >= $${paramCount}::date`;
      params.push(fecha_inicio);
      paramCount++;
    }

    if (fecha_fin) {
      fechaCondPicking += ` AND o.fecha_inicio_alistamiento < ($${paramCount}::date + interval '1 day')`;
      fechaCondPacking += ` AND o.fecha_inicio_empaque < ($${paramCount}::date + interval '1 day')`;
      params.push(fecha_fin);
      paramCount++;
    }

    const sql = `
      WITH picking_stats AS (
        SELECT
          o.alistador_asignado as usuario_id,
          COUNT(*) FILTER (WHERE o.fecha_fin_alistamiento IS NOT NULL OR o.fecha_inicio_empaque IS NOT NULL) as ordenes,
          COALESCE(SUM(sub.total_alistado) FILTER (WHERE o.fecha_fin_alistamiento IS NOT NULL OR o.fecha_inicio_empaque IS NOT NULL), 0) as unidades,
          COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(o.fecha_fin_alistamiento, o.fecha_inicio_empaque) - o.fecha_inicio_alistamiento))) FILTER (WHERE o.fecha_fin_alistamiento IS NOT NULL OR o.fecha_inicio_empaque IS NOT NULL), 0) as tiempo_segundos
        FROM ordenes_venta o
        LEFT JOIN (
          SELECT orden_id, COALESCE(SUM(cantidad_alistada), 0) as total_alistado
          FROM orden_detalles
          GROUP BY orden_id
        ) sub ON o.orden_id = sub.orden_id
        WHERE o.alistador_asignado IS NOT NULL
          AND o.fecha_inicio_alistamiento IS NOT NULL
          ${fechaCondPicking}
        GROUP BY o.alistador_asignado
      ),
      packing_stats AS (
        SELECT
          o.empacador_asignado as usuario_id,
          COUNT(*) FILTER (WHERE o.fecha_fin_empaque IS NOT NULL OR o.estado IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado')) as ordenes,
          COALESCE(SUM(sub.total_empacado) FILTER (WHERE o.fecha_fin_empaque IS NOT NULL OR o.estado IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado')), 0) as unidades,
          COALESCE(SUM(
            CASE
              WHEN o.fecha_fin_empaque IS NOT NULL THEN EXTRACT(EPOCH FROM (o.fecha_fin_empaque - o.fecha_inicio_empaque))
              WHEN o.estado IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado') THEN EXTRACT(EPOCH FROM (COALESCE(o.fecha_fin_empaque, o.fecha_inicio_empaque + interval '30 minutes') - o.fecha_inicio_empaque))
              ELSE NULL
            END
          ) FILTER (WHERE o.fecha_fin_empaque IS NOT NULL OR o.estado IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado')), 0) as tiempo_segundos
        FROM ordenes_venta o
        LEFT JOIN (
          SELECT orden_id, COALESCE(SUM(cantidad_empacada), 0) as total_empacado
          FROM orden_detalles
          GROUP BY orden_id
        ) sub ON o.orden_id = sub.orden_id
        WHERE o.empacador_asignado IS NOT NULL
          AND o.fecha_inicio_empaque IS NOT NULL
          ${fechaCondPacking}
        GROUP BY o.empacador_asignado
      ),
      all_users AS (
        SELECT DISTINCT usuario_id FROM picking_stats
        UNION
        SELECT DISTINCT usuario_id FROM packing_stats
      )
      SELECT
        u.usuario_id,
        us.nombre as usuario_nombre,
        COALESCE(p.ordenes, 0)::INTEGER as picking_ordenes,
        COALESCE(p.unidades, 0)::INTEGER as picking_unidades,
        COALESCE(p.tiempo_segundos, 0)::NUMERIC as picking_tiempo_segundos,
        COALESCE(pk.ordenes, 0)::INTEGER as packing_ordenes,
        COALESCE(pk.unidades, 0)::INTEGER as packing_unidades,
        COALESCE(pk.tiempo_segundos, 0)::NUMERIC as packing_tiempo_segundos
      FROM all_users u
      JOIN usuarios us ON u.usuario_id = us.usuario_id
      LEFT JOIN picking_stats p ON u.usuario_id = p.usuario_id
      LEFT JOIN packing_stats pk ON u.usuario_id = pk.usuario_id
      ORDER BY (COALESCE(p.ordenes, 0) + COALESCE(pk.ordenes, 0)) DESC
    `;

    const result = await query(sql, params);

    // Procesar resultados para agregar métricas calculadas
    return result.rows.map(row => {
      const pickingHoras = parseFloat(row.picking_tiempo_segundos) / 3600;
      const packingHoras = parseFloat(row.packing_tiempo_segundos) / 3600;

      return {
        usuario_id: row.usuario_id,
        nombre: row.usuario_nombre,
        picking: {
          ordenes: row.picking_ordenes,
          unidades: row.picking_unidades,
          tiempo_segundos: parseFloat(row.picking_tiempo_segundos),
          tiempo_promedio_segundos: row.picking_ordenes > 0
            ? parseFloat(row.picking_tiempo_segundos) / row.picking_ordenes
            : 0,
          ordenes_por_hora: pickingHoras > 0
            ? parseFloat((row.picking_ordenes / pickingHoras).toFixed(2))
            : 0,
          unidades_por_hora: pickingHoras > 0
            ? parseFloat((row.picking_unidades / pickingHoras).toFixed(2))
            : 0
        },
        packing: {
          ordenes: row.packing_ordenes,
          unidades: row.packing_unidades,
          tiempo_segundos: parseFloat(row.packing_tiempo_segundos),
          tiempo_promedio_segundos: row.packing_ordenes > 0
            ? parseFloat(row.packing_tiempo_segundos) / row.packing_ordenes
            : 0,
          ordenes_por_hora: packingHoras > 0
            ? parseFloat((row.packing_ordenes / packingHoras).toFixed(2))
            : 0,
          unidades_por_hora: packingHoras > 0
            ? parseFloat((row.packing_unidades / packingHoras).toFixed(2))
            : 0
        },
        total_ordenes: row.picking_ordenes + row.packing_ordenes,
        total_unidades: row.picking_unidades + row.packing_unidades
      };
    });
  }

  /**
   * Obtener rankings
   */
  static async getRankings(filtros = {}, metrica = 'unidades', limite = 5) {
    const { fecha_inicio, fecha_fin, tipo_actividad } = filtros;

    let params = [];
    let paramCount = 1;

    let fechaCond = '';
    if (fecha_inicio) {
      fechaCond += paramCount === 1 ? ' AND ' : ' AND ';
      fechaCond += tipo_actividad === 'Packing'
        ? `o.fecha_inicio_empaque >= $${paramCount}::date`
        : `o.fecha_inicio_alistamiento >= $${paramCount}::date`;
      params.push(fecha_inicio);
      paramCount++;
    }

    if (fecha_fin) {
      fechaCond += ' AND ';
      fechaCond += tipo_actividad === 'Packing'
        ? `o.fecha_inicio_empaque < ($${paramCount}::date + interval '1 day')`
        : `o.fecha_inicio_alistamiento < ($${paramCount}::date + interval '1 day')`;
      params.push(fecha_fin);
      paramCount++;
    }

    params.push(limite);

    let sql;
    if (tipo_actividad === 'Packing') {
      sql = `
        SELECT
          o.empacador_asignado as usuario_id,
          u.nombre as usuario_nombre,
          COUNT(*) FILTER (WHERE o.fecha_fin_empaque IS NOT NULL OR o.estado IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado')) as ordenes,
          COALESCE(SUM(sub.total_empacado) FILTER (WHERE o.fecha_fin_empaque IS NOT NULL OR o.estado IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado')), 0)::INTEGER as unidades
        FROM ordenes_venta o
        JOIN usuarios u ON o.empacador_asignado = u.usuario_id
        LEFT JOIN (
          SELECT orden_id, COALESCE(SUM(cantidad_empacada), 0) as total_empacado
          FROM orden_detalles
          GROUP BY orden_id
        ) sub ON o.orden_id = sub.orden_id
        WHERE o.empacador_asignado IS NOT NULL
          AND o.fecha_inicio_empaque IS NOT NULL
          ${fechaCond}
        GROUP BY o.empacador_asignado, u.nombre
        HAVING COUNT(*) FILTER (WHERE o.fecha_fin_empaque IS NOT NULL OR o.estado IN ('Listo_Para_Despachar', 'Finalizado', 'Facturada', 'Despachado')) > 0
        ORDER BY ${metrica === 'ordenes' ? 'ordenes' : 'unidades'} DESC
        LIMIT $${paramCount}
      `;
    } else {
      sql = `
        SELECT
          o.alistador_asignado as usuario_id,
          u.nombre as usuario_nombre,
          COUNT(*) FILTER (WHERE o.fecha_fin_alistamiento IS NOT NULL OR o.fecha_inicio_empaque IS NOT NULL) as ordenes,
          COALESCE(SUM(sub.total_alistado) FILTER (WHERE o.fecha_fin_alistamiento IS NOT NULL OR o.fecha_inicio_empaque IS NOT NULL), 0)::INTEGER as unidades
        FROM ordenes_venta o
        JOIN usuarios u ON o.alistador_asignado = u.usuario_id
        LEFT JOIN (
          SELECT orden_id, COALESCE(SUM(cantidad_alistada), 0) as total_alistado
          FROM orden_detalles
          GROUP BY orden_id
        ) sub ON o.orden_id = sub.orden_id
        WHERE o.alistador_asignado IS NOT NULL
          AND o.fecha_inicio_alistamiento IS NOT NULL
          ${fechaCond}
        GROUP BY o.alistador_asignado, u.nombre
        HAVING COUNT(*) FILTER (WHERE o.fecha_fin_alistamiento IS NOT NULL OR o.fecha_inicio_empaque IS NOT NULL) > 0
        ORDER BY ${metrica === 'ordenes' ? 'ordenes' : 'unidades'} DESC
        LIMIT $${paramCount}
      `;
    }

    const result = await query(sql, params);

    return result.rows.map((row, index) => ({
      posicion: index + 1,
      usuario_id: row.usuario_id,
      nombre: row.usuario_nombre,
      ordenes: parseInt(row.ordenes),
      unidades: parseInt(row.unidades),
      valor: metrica === 'ordenes' ? parseInt(row.ordenes) : parseInt(row.unidades)
    }));
  }

  /**
   * Obtener lista de operarios
   */
  static async getOperarios() {
    const sql = `
      SELECT usuario_id, nombre, email
      FROM usuarios
      WHERE rol IN ('Operario', 'Jefe_Bodega', 'Administrador')
        AND activo = true
      ORDER BY nombre ASC
    `;

    const result = await query(sql);
    return result.rows;
  }
}

module.exports = DesempenoModel;

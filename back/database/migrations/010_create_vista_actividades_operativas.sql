-- =====================================================
-- MIGRACIÓN: Crear vista y índices para desempeño operativo
-- Fecha: 2026-01-19
-- Descripción: Vista unificada de actividades de Picking y Packing
-- =====================================================

-- Crear índices para mejorar performance de las consultas
CREATE INDEX IF NOT EXISTS idx_ordenes_alistador ON ordenes_venta(alistador_asignado) WHERE alistador_asignado IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ordenes_empacador ON ordenes_venta(empacador_asignado) WHERE empacador_asignado IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha_inicio_alistamiento ON ordenes_venta(fecha_inicio_alistamiento) WHERE fecha_inicio_alistamiento IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha_fin_alistamiento ON ordenes_venta(fecha_fin_alistamiento) WHERE fecha_fin_alistamiento IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha_inicio_empaque ON ordenes_venta(fecha_inicio_empaque) WHERE fecha_inicio_empaque IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha_fin_empaque ON ordenes_venta(fecha_fin_empaque) WHERE fecha_fin_empaque IS NOT NULL;

-- Índices compuestos para filtros de fecha + usuario
CREATE INDEX IF NOT EXISTS idx_ordenes_alistador_fechas ON ordenes_venta(alistador_asignado, fecha_fin_alistamiento DESC) WHERE alistador_asignado IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ordenes_empacador_fechas ON ordenes_venta(empacador_asignado, fecha_fin_empaque DESC) WHERE empacador_asignado IS NOT NULL;

-- Crear vista unificada de actividades operativas
CREATE OR REPLACE VIEW vista_actividades_operativas AS
-- Actividades de Picking (Alistamiento)
SELECT
    o.orden_id,
    o.numero_orden,
    'Picking' AS tipo_actividad,
    o.alistador_asignado AS usuario_id,
    u.nombre AS usuario_nombre,
    o.fecha_inicio_alistamiento AS fecha_inicio,
    o.fecha_fin_alistamiento AS fecha_fin,
    CASE
        WHEN o.fecha_fin_alistamiento IS NOT NULL AND o.fecha_inicio_alistamiento IS NOT NULL
        THEN EXTRACT(EPOCH FROM (o.fecha_fin_alistamiento - o.fecha_inicio_alistamiento))
        ELSE NULL
    END AS duracion_segundos,
    COALESCE(SUM(od.cantidad_alistada), 0)::INTEGER AS unidades_procesadas,
    o.estado AS estado_orden,
    CASE
        WHEN o.fecha_fin_alistamiento IS NOT NULL THEN 'Completada'
        WHEN o.fecha_inicio_alistamiento IS NOT NULL THEN 'En_Progreso'
        ELSE 'Pendiente'
    END AS estado_actividad,
    o.fecha_creacion
FROM ordenes_venta o
LEFT JOIN usuarios u ON o.alistador_asignado = u.usuario_id
LEFT JOIN orden_detalles od ON o.orden_id = od.orden_id
WHERE o.alistador_asignado IS NOT NULL
  AND o.fecha_inicio_alistamiento IS NOT NULL
GROUP BY o.orden_id, o.numero_orden, o.alistador_asignado, u.nombre,
         o.fecha_inicio_alistamiento, o.fecha_fin_alistamiento, o.estado, o.fecha_creacion

UNION ALL

-- Actividades de Packing (Empaque)
SELECT
    o.orden_id,
    o.numero_orden,
    'Packing' AS tipo_actividad,
    o.empacador_asignado AS usuario_id,
    u.nombre AS usuario_nombre,
    o.fecha_inicio_empaque AS fecha_inicio,
    o.fecha_fin_empaque AS fecha_fin,
    CASE
        WHEN o.fecha_fin_empaque IS NOT NULL AND o.fecha_inicio_empaque IS NOT NULL
        THEN EXTRACT(EPOCH FROM (o.fecha_fin_empaque - o.fecha_inicio_empaque))
        ELSE NULL
    END AS duracion_segundos,
    COALESCE(SUM(od.cantidad_empacada), 0)::INTEGER AS unidades_procesadas,
    o.estado AS estado_orden,
    CASE
        WHEN o.fecha_fin_empaque IS NOT NULL THEN 'Completada'
        WHEN o.fecha_inicio_empaque IS NOT NULL THEN 'En_Progreso'
        ELSE 'Pendiente'
    END AS estado_actividad,
    o.fecha_creacion
FROM ordenes_venta o
LEFT JOIN usuarios u ON o.empacador_asignado = u.usuario_id
LEFT JOIN orden_detalles od ON o.orden_id = od.orden_id
WHERE o.empacador_asignado IS NOT NULL
  AND o.fecha_inicio_empaque IS NOT NULL
GROUP BY o.orden_id, o.numero_orden, o.empacador_asignado, u.nombre,
         o.fecha_inicio_empaque, o.fecha_fin_empaque, o.estado, o.fecha_creacion;

-- Agregar comentario a la vista
COMMENT ON VIEW vista_actividades_operativas IS 'Vista unificada de actividades de Picking y Packing para reportes de desempeño operativo';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Vista vista_actividades_operativas creada exitosamente';
    RAISE NOTICE 'Índices de desempeño creados exitosamente';
END $$;

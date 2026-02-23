-- Migración: Agregar estados faltantes y columnas necesarias
-- Fecha: 2025-12-03

-- Paso 1: Eliminar el constraint existente para los estados
ALTER TABLE ordenes_venta
DROP CONSTRAINT IF EXISTS ordenes_venta_estado_check;

-- Paso 2: Agregar el nuevo constraint con todos los estados
ALTER TABLE ordenes_venta
ADD CONSTRAINT ordenes_venta_estado_check
CHECK (estado IN (
    'Borrador',
    'Pendiente_Aprobacion',
    'Aprobada',
    'En_Alistamiento',
    'Listo_Para_Empacar',
    'En_Empaque',
    'Listo_Para_Despachar',
    'Lista_Facturar',
    'Facturada',
    'Finalizado',
    'Rechazada'
));

-- Paso 3: Agregar columna fecha_finalizacion si no existe
ALTER TABLE ordenes_venta
ADD COLUMN IF NOT EXISTS fecha_finalizacion TIMESTAMP NULL;

-- Paso 4: Agregar columnas para tracking de alistamiento y empaque si no existen
ALTER TABLE orden_detalles
ADD COLUMN IF NOT EXISTS alistamiento_completado BOOLEAN DEFAULT FALSE;

ALTER TABLE orden_detalles
ADD COLUMN IF NOT EXISTS empaque_completado BOOLEAN DEFAULT FALSE;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes_venta(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha_creacion ON ordenes_venta(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_orden_detalles_orden_id ON orden_detalles(orden_id);

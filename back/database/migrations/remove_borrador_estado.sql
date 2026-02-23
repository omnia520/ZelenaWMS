-- Migración: Eliminar estado 'Borrador' de órdenes de venta
-- Fecha: 2025-11-07

-- Primero, actualizar cualquier orden existente con estado 'Borrador' a 'Pendiente_Aprobacion'
UPDATE ordenes_venta
SET estado = 'Pendiente_Aprobacion'
WHERE estado = 'Borrador';

-- Eliminar el constraint existente
ALTER TABLE ordenes_venta
DROP CONSTRAINT IF EXISTS ordenes_venta_estado_check;

-- Agregar el nuevo constraint sin 'Borrador'
ALTER TABLE ordenes_venta
ADD CONSTRAINT ordenes_venta_estado_check
CHECK (estado IN ('Pendiente_Aprobacion', 'Aprobada', 'En_Alistamiento', 'En_Empaque', 'Lista_Facturar', 'Facturada', 'Rechazada'));

-- Cambiar el valor por defecto
ALTER TABLE ordenes_venta
ALTER COLUMN estado SET DEFAULT 'Pendiente_Aprobacion';

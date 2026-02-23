-- Agregar estado 'Finalizado' a la tabla ordenes_venta
ALTER TABLE ordenes_venta
DROP CONSTRAINT IF EXISTS ordenes_venta_estado_check;

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

-- Agregar fecha de finalización
ALTER TABLE ordenes_venta
ADD COLUMN IF NOT EXISTS fecha_finalizacion TIMESTAMP NULL;

-- Comentario: Ejecutar esta migración con:
-- psql -U postgres -d wms_db -f database/migrations/add_finalizado_estado.sql

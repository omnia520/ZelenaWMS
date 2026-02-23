-- Actualizar el constraint de estados para incluir los nuevos estados

ALTER TABLE ordenes_venta DROP CONSTRAINT IF EXISTS ordenes_venta_estado_check;

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
  'Rechazada'
));

SELECT 'Constraint actualizado correctamente!' as mensaje;

-- Migración: Agregar campos de fecha de inicio de procesos
-- Fecha: 2025-11-07

-- Agregar campos para registrar cuando se inicia cada proceso
ALTER TABLE ordenes_venta
ADD COLUMN fecha_inicio_alistamiento TIMESTAMP NULL,
ADD COLUMN fecha_fin_alistamiento TIMESTAMP NULL,
ADD COLUMN fecha_inicio_empaque TIMESTAMP NULL,
ADD COLUMN fecha_fin_empaque TIMESTAMP NULL,
ADD COLUMN observacion_alistador TEXT,
ADD COLUMN observacion_empacador TEXT;

-- Comentarios descriptivos
COMMENT ON COLUMN ordenes_venta.fecha_inicio_alistamiento IS 'Fecha y hora en que se inició el alistamiento';
COMMENT ON COLUMN ordenes_venta.fecha_fin_alistamiento IS 'Fecha y hora en que se finalizó el alistamiento';
COMMENT ON COLUMN ordenes_venta.fecha_inicio_empaque IS 'Fecha y hora en que se inició el empaque';
COMMENT ON COLUMN ordenes_venta.fecha_fin_empaque IS 'Fecha y hora en que se finalizó el empaque';
COMMENT ON COLUMN ordenes_venta.observacion_alistador IS 'Observaciones del alistador';
COMMENT ON COLUMN ordenes_venta.observacion_empacador IS 'Observaciones del empacador';

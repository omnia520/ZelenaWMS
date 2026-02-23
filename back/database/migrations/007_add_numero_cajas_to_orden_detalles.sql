-- Migración: Agregar campo numero_cajas a la tabla orden_detalles
-- Fecha: 2025-12-19
-- Descripción: Permite registrar el número de cajas para cada producto en una orden

-- Agregar columna numero_cajas
ALTER TABLE orden_detalles
ADD COLUMN numero_cajas INTEGER DEFAULT 0;

-- Agregar comentario a la columna
COMMENT ON COLUMN orden_detalles.numero_cajas IS 'Número de cajas del producto en esta orden';

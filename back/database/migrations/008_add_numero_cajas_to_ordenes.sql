-- Migración: Agregar campo numero_cajas a la tabla ordenes_venta
-- Descripción: Campo para registrar el número total de cajas del empaque de una orden
-- Nota: Este es diferente de numero_cajas en orden_detalles (que es por producto)

-- Verificar si la columna existe antes de agregarla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ordenes_venta'
        AND column_name = 'numero_cajas'
    ) THEN
        ALTER TABLE ordenes_venta
        ADD COLUMN numero_cajas INTEGER DEFAULT 0;

        COMMENT ON COLUMN ordenes_venta.numero_cajas IS 'Número total de cajas utilizadas en el empaque';
    END IF;
END $$;

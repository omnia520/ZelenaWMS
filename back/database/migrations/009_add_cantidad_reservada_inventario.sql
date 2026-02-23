-- Migración: Agregar campo cantidad_reservada a inventario_ubicaciones
-- Descripción: Sistema de reserva de inventario para órdenes de venta
-- Permite reservar cantidades cuando se crea una orden y descontarlas al finalizar/facturar

-- Agregar columna cantidad_reservada a inventario_ubicaciones
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'inventario_ubicaciones'
        AND column_name = 'cantidad_reservada'
    ) THEN
        ALTER TABLE inventario_ubicaciones
        ADD COLUMN cantidad_reservada INTEGER DEFAULT 0 NOT NULL;

        COMMENT ON COLUMN inventario_ubicaciones.cantidad_reservada IS 'Cantidad reservada por órdenes pendientes (no disponible para venta)';
    END IF;
END $$;

-- Agregar constraint para asegurar que cantidad_reservada no sea negativa
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'inventario_ubicaciones'
        AND constraint_name = 'inventario_ubicaciones_cantidad_reservada_check'
    ) THEN
        ALTER TABLE inventario_ubicaciones
        ADD CONSTRAINT inventario_ubicaciones_cantidad_reservada_check
        CHECK (cantidad_reservada >= 0);
    END IF;
END $$;

-- Agregar constraint para asegurar que cantidad_reservada no exceda cantidad total
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'inventario_ubicaciones'
        AND constraint_name = 'inventario_ubicaciones_reservada_no_excede_total'
    ) THEN
        ALTER TABLE inventario_ubicaciones
        ADD CONSTRAINT inventario_ubicaciones_reservada_no_excede_total
        CHECK (cantidad_reservada <= cantidad);
    END IF;
END $$;

-- Crear índice para consultas de disponibilidad
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'inventario_ubicaciones'
        AND indexname = 'idx_inventario_ubicaciones_producto_disponibilidad'
    ) THEN
        CREATE INDEX idx_inventario_ubicaciones_producto_disponibilidad
        ON inventario_ubicaciones(producto_id, cantidad, cantidad_reservada);
    END IF;
END $$;

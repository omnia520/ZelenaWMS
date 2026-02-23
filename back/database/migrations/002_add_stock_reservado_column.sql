-- =====================================================
-- MIGRACIÓN: Agregar columna stock_reservado a productos
-- Fecha: 2026-01-12
-- Descripción: Agrega campo para controlar inventario reservado
-- =====================================================

-- Agregar columna stock_reservado si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='productos' AND column_name='stock_reservado'
    ) THEN
        ALTER TABLE productos
        ADD COLUMN stock_reservado INTEGER DEFAULT 0 NOT NULL;

        RAISE NOTICE 'Columna stock_reservado agregada exitosamente';
    ELSE
        RAISE NOTICE 'Columna stock_reservado ya existe';
    END IF;
END $$;

-- Asegurar que todos los productos existentes tengan stock_reservado = 0
UPDATE productos SET stock_reservado = 0 WHERE stock_reservado IS NULL;

-- Agregar constraint para evitar valores negativos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'productos_stock_reservado_check'
    ) THEN
        ALTER TABLE productos
        ADD CONSTRAINT productos_stock_reservado_check
        CHECK (stock_reservado >= 0);

        RAISE NOTICE 'Constraint productos_stock_reservado_check agregado exitosamente';
    END IF;
END $$;

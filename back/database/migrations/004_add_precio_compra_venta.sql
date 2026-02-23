-- Migración: Agregar campos precio_compra y precio_venta a productos
-- Fecha: 2025-12-03

-- Paso 1: Agregar columnas precio_compra y precio_venta
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS precio_compra DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS precio_venta DECIMAL(10,2) DEFAULT 0;

-- Paso 2: Copiar el valor de precio_base a precio_venta para productos existentes
UPDATE productos
SET precio_venta = precio_base
WHERE precio_venta = 0 AND precio_base > 0;

-- Paso 3: Opcional - Mantener precio_base por compatibilidad o eliminarlo después
-- ALTER TABLE productos DROP COLUMN precio_base;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_precio_venta ON productos(precio_venta);
CREATE INDEX IF NOT EXISTS idx_productos_precio_compra ON productos(precio_compra);

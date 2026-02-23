-- Migration: Add subcategoria and marca fields to productos
-- Date: 2025-12-17

-- Add subcategoria and marca columns
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS subcategoria VARCHAR(100),
ADD COLUMN IF NOT EXISTS marca VARCHAR(100);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_productos_subcategoria ON productos(subcategoria);
CREATE INDEX IF NOT EXISTS idx_productos_marca ON productos(marca);
CREATE INDEX IF NOT EXISTS idx_productos_categoria_subcategoria ON productos(categoria, subcategoria);

-- Add comments
COMMENT ON COLUMN productos.subcategoria IS 'Subcategoría del producto, relacionada con la categoría principal';
COMMENT ON COLUMN productos.marca IS 'Marca comercial del producto';

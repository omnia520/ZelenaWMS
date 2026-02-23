-- Migración: Modificar tabla recepciones para usar FK a proveedores
-- Paso 1: Agregar columna proveedor_id
ALTER TABLE recepciones
ADD COLUMN proveedor_id BIGINT;

-- Paso 2: Migrar datos existentes (crear proveedores a partir de nombres únicos en recepciones)
-- Solo si existen recepciones con datos
INSERT INTO proveedores (nombre, activo)
SELECT DISTINCT
  proveedor,
  TRUE
FROM recepciones
WHERE proveedor IS NOT NULL
  AND proveedor != ''
  AND NOT EXISTS (
    SELECT 1 FROM proveedores p
    WHERE LOWER(p.nombre) = LOWER(recepciones.proveedor)
  );

-- Paso 3: Actualizar proveedor_id en recepciones con los IDs correspondientes
UPDATE recepciones r
SET proveedor_id = p.proveedor_id
FROM proveedores p
WHERE LOWER(p.nombre) = LOWER(r.proveedor);

-- Paso 4: Eliminar la columna antigua proveedor (VARCHAR)
ALTER TABLE recepciones
DROP COLUMN proveedor;

-- Paso 5: Agregar la foreign key constraint
ALTER TABLE recepciones
ADD CONSTRAINT fk_recepciones_proveedor
FOREIGN KEY (proveedor_id) REFERENCES proveedores(proveedor_id);

-- Paso 6: Crear índice para búsquedas por proveedor
CREATE INDEX IF NOT EXISTS idx_recepciones_proveedor_id
ON recepciones(proveedor_id);

-- Confirmación
SELECT 'Migración completada: tabla recepciones ahora usa FK a proveedores' as status;

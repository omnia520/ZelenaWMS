-- Migración: Crear tabla proveedores y actualizar tabla recepciones
-- Fecha: 2025-12-03

-- Paso 1: Crear tabla proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    proveedor_id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL UNIQUE,
    nit VARCHAR(20),
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    tolerancia_porcentaje DECIMAL(5,2) DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Paso 2: Insertar proveedores existentes desde la tabla recepciones
INSERT INTO proveedores (nombre, activo)
SELECT DISTINCT proveedor, TRUE
FROM recepciones
WHERE proveedor IS NOT NULL AND proveedor != ''
ON CONFLICT (nombre) DO NOTHING;

-- Paso 3: Agregar columna proveedor_id a recepciones
ALTER TABLE recepciones
ADD COLUMN IF NOT EXISTS proveedor_id INTEGER;

-- Paso 4: Actualizar proveedor_id en recepciones existentes
UPDATE recepciones r
SET proveedor_id = p.proveedor_id
FROM proveedores p
WHERE r.proveedor = p.nombre;

-- Paso 5: Agregar foreign key constraint
ALTER TABLE recepciones
ADD CONSTRAINT fk_recepciones_proveedor
FOREIGN KEY (proveedor_id) REFERENCES proveedores(proveedor_id);

-- Paso 6 (Opcional): Puedes mantener la columna proveedor para referencia
-- o eliminarla después de verificar que todo funciona correctamente
-- ALTER TABLE recepciones DROP COLUMN proveedor;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_proveedores_nombre ON proveedores(nombre);
CREATE INDEX IF NOT EXISTS idx_proveedores_activo ON proveedores(activo);
CREATE INDEX IF NOT EXISTS idx_recepciones_proveedor_id ON recepciones(proveedor_id);

-- Migración: Sistema de Múltiples Bodegas/Almacenes
-- Fecha: 2025-12-03
-- Permite gestionar múltiples bodegas y transferencias entre ellas

-- Paso 1: Crear tabla de bodegas
CREATE TABLE IF NOT EXISTS bodegas (
    bodega_id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    direccion TEXT,
    ciudad VARCHAR(50),
    responsable_id INTEGER,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (responsable_id) REFERENCES usuarios(usuario_id)
);

-- Paso 2: Crear tabla de inventario por bodega
CREATE TABLE IF NOT EXISTS inventario_bodegas (
    inventario_bodega_id SERIAL PRIMARY KEY,
    bodega_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER DEFAULT 0,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bodega_id) REFERENCES bodegas(bodega_id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(producto_id) ON DELETE CASCADE,
    UNIQUE(bodega_id, producto_id)
);

-- Paso 3: Crear tabla de transferencias entre bodegas
CREATE TABLE IF NOT EXISTS transferencias_bodega (
    transferencia_id SERIAL PRIMARY KEY,
    numero_transferencia VARCHAR(50) UNIQUE NOT NULL,
    bodega_origen_id INTEGER NOT NULL,
    bodega_destino_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    fecha_transferencia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'Completada' CHECK (estado IN ('Pendiente', 'En_Transito', 'Completada', 'Cancelada')),
    observaciones TEXT,
    FOREIGN KEY (bodega_origen_id) REFERENCES bodegas(bodega_id),
    FOREIGN KEY (bodega_destino_id) REFERENCES bodegas(bodega_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id)
);

-- Paso 4: Crear tabla de detalles de transferencias
CREATE TABLE IF NOT EXISTS transferencia_detalles (
    detalle_id SERIAL PRIMARY KEY,
    transferencia_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    FOREIGN KEY (transferencia_id) REFERENCES transferencias_bodega(transferencia_id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(producto_id)
);

-- Paso 5: Crear bodega principal por defecto y migrar inventario existente
INSERT INTO bodegas (codigo, nombre, descripcion, activa)
VALUES ('BOD-001', 'Bodega Principal', 'Bodega principal del sistema', TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- Paso 6: Migrar inventario existente de productos a la bodega principal
INSERT INTO inventario_bodegas (bodega_id, producto_id, cantidad)
SELECT
    (SELECT bodega_id FROM bodegas WHERE codigo = 'BOD-001'),
    producto_id,
    stock_actual
FROM productos
WHERE stock_actual > 0
ON CONFLICT (bodega_id, producto_id) DO UPDATE
SET cantidad = EXCLUDED.cantidad;

-- Paso 7: Migrar inventario de ubicaciones a la bodega principal
INSERT INTO inventario_bodegas (bodega_id, producto_id, cantidad)
SELECT
    (SELECT bodega_id FROM bodegas WHERE codigo = 'BOD-001'),
    producto_id,
    SUM(cantidad) as total_cantidad
FROM inventario_ubicaciones
GROUP BY producto_id
ON CONFLICT (bodega_id, producto_id) DO UPDATE
SET cantidad = inventario_bodegas.cantidad + EXCLUDED.cantidad;

-- Paso 8: Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_bodegas_activa ON bodegas(activa);
CREATE INDEX IF NOT EXISTS idx_inventario_bodegas_bodega ON inventario_bodegas(bodega_id);
CREATE INDEX IF NOT EXISTS idx_inventario_bodegas_producto ON inventario_bodegas(producto_id);
CREATE INDEX IF NOT EXISTS idx_transferencias_bodega_origen ON transferencias_bodega(bodega_origen_id);
CREATE INDEX IF NOT EXISTS idx_transferencias_bodega_destino ON transferencias_bodega(bodega_destino_id);
CREATE INDEX IF NOT EXISTS idx_transferencias_fecha ON transferencias_bodega(fecha_transferencia);
CREATE INDEX IF NOT EXISTS idx_transferencia_detalles_transferencia ON transferencia_detalles(transferencia_id);

-- Paso 9: Crear función para actualizar stock_actual en productos
CREATE OR REPLACE FUNCTION actualizar_stock_total_producto()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE productos
    SET stock_actual = (
        SELECT COALESCE(SUM(cantidad), 0)
        FROM inventario_bodegas
        WHERE producto_id = NEW.producto_id
    )
    WHERE producto_id = NEW.producto_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Paso 10: Crear trigger para mantener sincronizado el stock_actual
DROP TRIGGER IF EXISTS trigger_actualizar_stock_total ON inventario_bodegas;
CREATE TRIGGER trigger_actualizar_stock_total
AFTER INSERT OR UPDATE OR DELETE ON inventario_bodegas
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock_total_producto();

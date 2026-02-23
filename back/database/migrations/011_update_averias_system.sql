-- Migración: Sistema Mejorado de Averías con Múltiples Evidencias
-- Fecha: 2026-02-05
-- Descripción: Actualiza estados de averías, agrega soporte para múltiples imágenes
--              y campos para tracking de ajustes de inventario

-- ============================================
-- PASO 1: Modificar estados válidos de avería
-- Nuevos estados: Pendiente, Repuesta, Descartada
-- ============================================

-- Primero actualizar registros existentes al nuevo esquema de estados
UPDATE averias SET estado = 'Pendiente' WHERE estado IN ('Abierta', 'En_Revision');
UPDATE averias SET estado = 'Descartada' WHERE estado = 'Cerrada';

-- Eliminar constraint existente y crear nueva
ALTER TABLE averias DROP CONSTRAINT IF EXISTS averias_estado_check;
ALTER TABLE averias
ADD CONSTRAINT averias_estado_check
CHECK (estado IN ('Pendiente', 'Repuesta', 'Descartada'));

-- Cambiar valor por defecto
ALTER TABLE averias ALTER COLUMN estado SET DEFAULT 'Pendiente';

-- ============================================
-- PASO 2: Renombrar columnas para mejor semántica
-- cerrado_por -> resuelto_por
-- fecha_cierre -> fecha_resolucion
-- ============================================

ALTER TABLE averias RENAME COLUMN cerrado_por TO resuelto_por;
ALTER TABLE averias RENAME COLUMN fecha_cierre TO fecha_resolucion;

-- ============================================
-- PASO 3: Agregar campos para tracking de inventario
-- ============================================

ALTER TABLE averias ADD COLUMN IF NOT EXISTS inventario_ajustado BOOLEAN DEFAULT FALSE;
ALTER TABLE averias ADD COLUMN IF NOT EXISTS cantidad_ajustada INTEGER DEFAULT 0;

-- ============================================
-- PASO 4: Crear tabla para múltiples evidencias/imágenes
-- ============================================

CREATE TABLE IF NOT EXISTS averia_evidencias (
    evidencia_id SERIAL PRIMARY KEY,
    averia_id INTEGER NOT NULL,
    foto_url VARCHAR(500) NOT NULL,
    descripcion VARCHAR(255),
    orden INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (averia_id) REFERENCES averias(averia_id) ON DELETE CASCADE
);

-- ============================================
-- PASO 5: Migrar foto_url existente a la tabla de evidencias
-- ============================================

INSERT INTO averia_evidencias (averia_id, foto_url, orden)
SELECT averia_id, foto_url, 0
FROM averias
WHERE foto_url IS NOT NULL AND foto_url != '';

-- ============================================
-- PASO 6: Crear índices para optimizar consultas
-- ============================================

CREATE INDEX IF NOT EXISTS idx_averias_estado ON averias(estado);
CREATE INDEX IF NOT EXISTS idx_averias_fecha_reporte ON averias(fecha_reporte);
CREATE INDEX IF NOT EXISTS idx_averias_producto ON averias(producto_id);
CREATE INDEX IF NOT EXISTS idx_averia_evidencias_averia ON averia_evidencias(averia_id);

-- ============================================
-- NOTA: Se mantiene columna foto_url en averias temporalmente
-- para compatibilidad. Se puede eliminar en migración futura:
-- ALTER TABLE averias DROP COLUMN foto_url;
-- ============================================

-- Comentario para verificación
COMMENT ON TABLE averia_evidencias IS 'Almacena múltiples imágenes/evidencias por avería';
COMMENT ON COLUMN averias.inventario_ajustado IS 'Indica si ya se realizó el ajuste de inventario';
COMMENT ON COLUMN averias.cantidad_ajustada IS 'Cantidad que se ajustó en el inventario';

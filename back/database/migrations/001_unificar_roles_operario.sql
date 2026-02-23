-- Migración: Unificar roles Alistador y Empacador en Operario
-- Fecha: 2025-11-18
-- Descripción: Esta migración unifica los roles de Alistador y Empacador en un único rol llamado Operario
-- que puede realizar ambas funciones (alistar y empacar)

-- Paso 1: Actualizar usuarios existentes con rol 'Alistador' o 'Empacador' a 'Operario'
UPDATE usuarios
SET rol = 'Operario'
WHERE rol IN ('Alistador', 'Empacador');

-- Paso 2: Eliminar el constraint antiguo de roles
ALTER TABLE usuarios
DROP CONSTRAINT IF EXISTS usuarios_rol_check;

-- Paso 3: Agregar el nuevo constraint con el rol 'Operario' en lugar de 'Alistador' y 'Empacador'
ALTER TABLE usuarios
ADD CONSTRAINT usuarios_rol_check
CHECK (rol IN ('Vendedor', 'Jefe_Bodega', 'Operario', 'Facturacion', 'Administrador'));

-- Nota: Las columnas alistador_asignado y empacador_asignado en ordenes_venta se mantienen
-- para preservar el historial y la funcionalidad de asignación dual, pero ahora ambas
-- apuntarán a usuarios con rol 'Operario'

-- Verificación
SELECT DISTINCT rol FROM usuarios ORDER BY rol;

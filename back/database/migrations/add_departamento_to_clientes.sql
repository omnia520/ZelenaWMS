-- Migración: Agregar columna departamento a la tabla clientes
-- Fecha: 2025-11-07

-- Agregar columna departamento
ALTER TABLE clientes
ADD COLUMN departamento VARCHAR(50);

-- Comentario descriptivo
COMMENT ON COLUMN clientes.departamento IS 'Departamento o estado del cliente';

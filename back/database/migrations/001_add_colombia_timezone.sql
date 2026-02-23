-- =====================================================
-- Migración: Configuración de Zona Horaria Colombia
-- Fecha: 2025-12-20
-- Descripción: Agrega función helper para zona horaria de Colombia
-- =====================================================

-- Establecer zona horaria de la sesión a Colombia
SET timezone = 'America/Bogota';

-- Función helper para obtener la hora actual de Colombia
CREATE OR REPLACE FUNCTION now_colombia()
RETURNS TIMESTAMP AS $$
BEGIN
  RETURN NOW() AT TIME ZONE 'America/Bogota';
END;
$$ LANGUAGE plpgsql;

-- Comentario sobre la función
COMMENT ON FUNCTION now_colombia() IS 'Retorna la fecha y hora actual en zona horaria de Colombia (UTC-5)';

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Migración completada: Zona horaria de Colombia configurada';
  RAISE NOTICE 'La aplicación ahora registrará todas las fechas en hora de Colombia (UTC-5)';
END $$;

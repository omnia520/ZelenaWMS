-- Migración para agregar columna nombre_usuario y hacer email opcional
-- Ejecutar este script en la base de datos wms_db

-- 1. Agregar columna nombre_usuario
ALTER TABLE usuarios
ADD COLUMN nombre_usuario VARCHAR(50);

-- 2. Hacer que email sea opcional (nullable)
ALTER TABLE usuarios
ALTER COLUMN email DROP NOT NULL;

-- 3. Actualizar usuarios existentes con un nombre de usuario basado en su email
UPDATE usuarios
SET nombre_usuario = LOWER(SPLIT_PART(email, '@', 1))
WHERE nombre_usuario IS NULL;

-- 4. Ahora hacer nombre_usuario NOT NULL y UNIQUE
ALTER TABLE usuarios
ALTER COLUMN nombre_usuario SET NOT NULL;

ALTER TABLE usuarios
ADD CONSTRAINT usuarios_nombre_usuario_unique UNIQUE (nombre_usuario);

-- 5. Eliminar la restricción UNIQUE del email (ya que ahora es opcional)
ALTER TABLE usuarios
DROP CONSTRAINT usuarios_email_key;

-- 6. Agregar índice para nombre_usuario
CREATE INDEX idx_usuarios_nombre_usuario ON usuarios(nombre_usuario);

-- 7. Actualizar el usuario admin para tener nombre_usuario = 'admin'
UPDATE usuarios
SET nombre_usuario = 'admin'
WHERE email = 'admin@wms.com';

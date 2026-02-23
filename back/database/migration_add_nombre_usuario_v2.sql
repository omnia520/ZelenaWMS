-- Migración mejorada para agregar columna nombre_usuario y hacer email opcional
-- Maneja duplicados automáticamente

-- 1. Agregar columna nombre_usuario si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='usuarios' AND column_name='nombre_usuario'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN nombre_usuario VARCHAR(50);
    END IF;
END $$;

-- 2. Hacer que email sea opcional (nullable) si aún no lo es
ALTER TABLE usuarios ALTER COLUMN email DROP NOT NULL;

-- 3. Actualizar usuarios existentes con un nombre de usuario único
-- Usando ROW_NUMBER para evitar duplicados
WITH numbered_users AS (
    SELECT
        usuario_id,
        LOWER(SPLIT_PART(email, '@', 1)) as base_username,
        ROW_NUMBER() OVER (PARTITION BY LOWER(SPLIT_PART(email, '@', 1)) ORDER BY usuario_id) as rn
    FROM usuarios
    WHERE nombre_usuario IS NULL
)
UPDATE usuarios
SET nombre_usuario = CASE
    WHEN nu.rn = 1 THEN nu.base_username
    ELSE nu.base_username || nu.rn
END
FROM numbered_users nu
WHERE usuarios.usuario_id = nu.usuario_id;

-- 4. Ahora hacer nombre_usuario NOT NULL
ALTER TABLE usuarios ALTER COLUMN nombre_usuario SET NOT NULL;

-- 5. Agregar constraint UNIQUE para nombre_usuario si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'usuarios_nombre_usuario_unique'
    ) THEN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_nombre_usuario_unique UNIQUE (nombre_usuario);
    END IF;
END $$;

-- 6. Eliminar la restricción UNIQUE del email si existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'usuarios_email_key'
    ) THEN
        ALTER TABLE usuarios DROP CONSTRAINT usuarios_email_key;
    END IF;
END $$;

-- 7. Crear índice para nombre_usuario si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_usuarios_nombre_usuario'
    ) THEN
        CREATE INDEX idx_usuarios_nombre_usuario ON usuarios(nombre_usuario);
    END IF;
END $$;

-- 8. Actualizar el usuario admin para tener nombre_usuario = 'admin'
UPDATE usuarios
SET nombre_usuario = 'admin'
WHERE email = 'admin@wms.com' OR usuario_id = 1;

-- Mostrar los usuarios actualizados
SELECT usuario_id, nombre, nombre_usuario, email FROM usuarios ORDER BY usuario_id;

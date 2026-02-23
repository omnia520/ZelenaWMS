-- Agregar columna password_hash a la tabla usuarios si no existe

-- Verificar si la columna existe y agregarla si no
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'usuarios'
        AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE usuarios
        ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '';

        RAISE NOTICE 'Columna password_hash agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna password_hash ya existe';
    END IF;
END $$;

-- Actualizar constraint para que password_hash sea NOT NULL sin default
ALTER TABLE usuarios ALTER COLUMN password_hash DROP DEFAULT;

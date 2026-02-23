-- Script para agregar un usuario con rol Jefe de Bodega
-- Contraseña: password123
-- Hash generado con bcrypt (10 rounds)

INSERT INTO usuarios (nombre, nombre_usuario, email, telefono, rol, password_hash, activo)
VALUES (
    'Pedro Ramírez',                           -- Nombre completo
    'jefe_bodega',                             -- Nombre de usuario para login
    'jefe.bodega@wms.com',                     -- Email (opcional)
    '3001122334',                              -- Teléfono (opcional)
    'Jefe_Bodega',                             -- Rol
    '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG',  -- password123
    TRUE                                        -- Usuario activo
)
RETURNING usuario_id, nombre, nombre_usuario, email, rol;

-- Para verificar que se creó correctamente
SELECT usuario_id, nombre, nombre_usuario, email, telefono, rol, activo, fecha_creacion
FROM usuarios
WHERE rol = 'Jefe_Bodega'
ORDER BY fecha_creacion DESC;

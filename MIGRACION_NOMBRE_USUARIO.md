# Migración: Cambio de Email a Nombre de Usuario

## Cambios Realizados

Se ha modificado el sistema para que los usuarios se registren y autentiquen usando **nombre de usuario** en lugar de email.

### Cambios en el Frontend:

1. **Formulario de Registro** (`front/src/pages/auth/Register.jsx`):
   - Ahora incluye un campo obligatorio "Nombre de Usuario"
   - El campo "Email" es opcional
   - Los roles disponibles son solo: Vendedor y Operario

2. **Formulario de Login** (`front/src/pages/auth/Login.jsx`):
   - Ahora usa "Nombre de Usuario" en lugar de "Email"
   - Credenciales de prueba actualizadas a: Usuario: `admin`, Password: `admin123`

### Cambios en el Backend:

1. **Modelo de Usuario** (`back/src/models/usuario.model.js`):
   - Agregado método `findByNombreUsuario()`
   - Actualizado método `create()` para incluir `nombre_usuario`
   - Todos los métodos ahora incluyen `nombre_usuario` en sus resultados

2. **Controlador de Autenticación** (`back/src/controllers/auth.controller.js`):
   - **Registro**: Ahora requiere `nombre_usuario` (obligatorio) y hace `email` opcional
   - **Login**: Ahora usa `nombre_usuario` en lugar de `email`

## Instrucciones de Migración

### Paso 1: Ejecutar la Migración SQL

Antes de iniciar el servidor, debes ejecutar el script de migración en tu base de datos PostgreSQL:

```bash
# Opción 1: Desde psql
psql -U postgres -d wms_db -f back/database/migration_add_nombre_usuario.sql

# Opción 2: Desde la línea de comandos de PostgreSQL
psql -U postgres
\c wms_db
\i back/database/migration_add_nombre_usuario.sql
```

### Paso 2: Verificar la Migración

La migración realiza las siguientes operaciones:

1. Agrega la columna `nombre_usuario` a la tabla `usuarios`
2. Hace que la columna `email` sea opcional (nullable)
3. Asigna automáticamente nombres de usuario a los usuarios existentes (basado en la parte antes del @ del email)
4. Hace `nombre_usuario` NOT NULL y UNIQUE
5. Elimina la restricción UNIQUE del email
6. Actualiza el usuario admin para tener `nombre_usuario = 'admin'`

### Paso 3: Iniciar los Servidores

```bash
# Backend
cd back
npm run dev

# Frontend (en otra terminal)
cd front
npm run dev
```

### Paso 4: Probar el Sistema

**Login con el usuario admin:**
- Usuario: `admin`
- Contraseña: `admin123`

**Registro de nuevos usuarios:**
- Solo podrán registrarse como Vendedor u Operario
- El nombre de usuario es obligatorio
- El email es opcional

## Credenciales de Prueba

Después de ejecutar la migración, podrás iniciar sesión con:

- **Usuario:** admin
- **Contraseña:** admin123

## Notas Importantes

- Los usuarios existentes automáticamente tendrán un `nombre_usuario` basado en su email
- El email ya no es obligatorio para nuevos registros
- El login ahora solo acepta nombre de usuario (no email)
- Los nombres de usuario deben ser únicos en el sistema

# 🚀 Guía Rápida de Inicio - Backend WMS

## Inicio Rápido (5 minutos)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar PostgreSQL

**Opción A - Usando pgAdmin o cliente SQL:**
```sql
CREATE DATABASE wms_db;
```

**Opción B - Desde terminal:**
```bash
psql -U postgres -c "CREATE DATABASE wms_db;"
```

### 3. Configurar variables de entorno

Edita el archivo `.env` con tus credenciales de PostgreSQL:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_AQUI
DB_NAME=wms_db
```

### 4. Crear tablas en la base de datos
```bash
psql -U postgres -d wms_db -f database/schema.sql
```

### 5. (Opcional) Cargar datos de prueba
```bash
psql -U postgres -d wms_db -f database/seed.sql
```

### 6. Iniciar el servidor
```bash
npm run dev
```

Deberías ver:
```
✓ Conectado a la base de datos PostgreSQL
✓ Prueba de conexión exitosa

====================================
  🚀 Servidor WMS iniciado
====================================
  Entorno: development
  Puerto: 3000
  URL: http://localhost:3000
  Health: http://localhost:3000/health
  API: http://localhost:3000/api
====================================
```

## 🧪 Probar que funciona

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Login con usuario administrador
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wms.com",
    "password": "admin123"
  }'
```

Guarda el `token` que te devuelve.

### 3. Consultar productos (requiere token)
```bash
curl http://localhost:3000/api/productos \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 📊 Usuarios de Ejemplo

Si cargaste `seed.sql`, tienes estos usuarios (contraseña: `password123`):

| Email | Rol | Uso |
|-------|-----|-----|
| admin@wms.com | Administrador | Gestión completa |
| vendedor@wms.com | Vendedor | Crear órdenes |
| jefe@wms.com | Jefe_Bodega | Aprobar, asignar |
| alistador@wms.com | Alistador | Picking |
| empacador@wms.com | Empacador | Empaque |
| facturacion@wms.com | Facturacion | Facturación |

## 🔧 Comandos Útiles

```bash
# Desarrollo (auto-reload)
npm run dev

# Producción
npm start

# Ver logs de PostgreSQL
# Windows: Ver servicios
# Linux/Mac: sudo tail -f /var/log/postgresql/postgresql-*.log
```

## 📱 Endpoints Principales

- **POST** `/api/auth/login` - Iniciar sesión
- **GET** `/api/productos` - Listar productos
- **GET** `/api/clientes` - Listar clientes
- **GET** `/api/ordenes` - Listar órdenes
- **GET** `/api/ordenes/:id/picking-list` - Picking list optimizado
- **GET** `/api/ubicaciones` - Listar ubicaciones

Ver `README.md` para la lista completa de endpoints.

## 🐛 Solución de Problemas Comunes

### Error: "Connection refused" o "ECONNREFUSED"
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `.env`
- Verifica que la base de datos `wms_db` exista

### Error: "relation does not exist"
- Ejecuta el schema: `psql -U postgres -d wms_db -f database/schema.sql`

### Error: "password authentication failed"
- Verifica el password en `.env`
- Verifica que el usuario tenga permisos en PostgreSQL

### Puerto 3000 ya está en uso
- Cambia el `PORT` en `.env`
- O mata el proceso: `npx kill-port 3000`

## 📚 Siguiente Paso

Lee el `README.md` completo para entender la arquitectura y todos los endpoints disponibles.

## 🎯 Flujo de Trabajo Típico

1. **Vendedor** crea una orden → Estado: `Borrador`
2. **Vendedor** envía a aprobación → Estado: `Pendiente_Aprobacion`
3. **Jefe de Bodega** aprueba → Estado: `Aprobada`
4. **Jefe de Bodega** asigna alistador y empacador
5. **Alistador** ve picking list optimizado
6. **Alistador** registra alistamiento → Estado: `En_Alistamiento`
7. **Empacador** registra empaque → Estado: `En_Empaque`
8. **Facturación** revisa y factura → Estado: `Facturada`

¡Listo! 🎉

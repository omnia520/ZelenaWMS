# Backend Sistema WMS - Gestión de Ventas, Alistamiento y Empaque

Backend completo para el Sistema WMS (Warehouse Management System) con gestión de ventas, alistamiento, empaque, ubicaciones, recepciones y averías.

## 🚀 Características

- ✅ Autenticación JWT con roles (RBAC)
- ✅ Gestión completa de Clientes
- ✅ Catálogo de Productos con imágenes
- ✅ Órdenes de venta con flujo completo (Borrador → Facturada)
- ✅ Sistema de aprobación de órdenes
- ✅ Asignación de alistadores y empacadores
- ✅ Picking List con rutas optimizadas
- ✅ Gestión de ubicaciones en bodega
- ✅ Inventario por ubicaciones
- ✅ Recepciones de mercancía
- ✅ Gestión de averías
- ✅ Observaciones por proceso
- ✅ Auditoría de cambios

## 📋 Requisitos Previos

- Node.js >= 16.x
- PostgreSQL >= 12.x
- npm o yarn

## 🔧 Instalación

### 1. Clonar e instalar dependencias

```bash
cd back
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura tus variables:

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Configuración de Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
DB_NAME=wms_db

# Configuración JWT
JWT_SECRET=tu_clave_secreta_super_segura_aqui_cambiala
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Crear la base de datos

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE wms_db;

# Salir
\q
```

### 4. Ejecutar el schema de la base de datos

```bash
psql -U postgres -d wms_db -f database/schema.sql
```

Esto creará todas las tablas, índices, triggers y un usuario administrador inicial:
- Email: `admin@wms.com`
- Contraseña: `admin123`

### 5. Iniciar el servidor

**Modo desarrollo (con auto-reload):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 📚 API Endpoints

### Autenticación (`/api/auth`)
- `POST /register` - Registrar usuario
- `POST /login` - Iniciar sesión
- `GET /profile` - Obtener perfil (requiere auth)
- `PUT /change-password` - Cambiar contraseña (requiere auth)

### Clientes (`/api/clientes`)
- `POST /` - Crear cliente
- `GET /` - Listar clientes (con filtros)
- `GET /:id` - Obtener cliente por ID
- `PUT /:id` - Actualizar cliente
- `PATCH /:id/toggle-active` - Activar/Desactivar
- `DELETE /:id` - Eliminar cliente

### Productos (`/api/productos`)
- `POST /` - Crear producto
- `GET /` - Listar productos (con filtros)
- `GET /categorias` - Obtener categorías
- `GET /:id` - Obtener producto por ID
- `GET /:id/ubicaciones` - Obtener producto con ubicaciones
- `PUT /:id` - Actualizar producto
- `PATCH /:id/stock` - Actualizar stock
- `PATCH /:id/imagen` - Actualizar imagen
- `DELETE /:id` - Eliminar producto

### Órdenes de Venta (`/api/ordenes`)
- `POST /` - Crear orden
- `GET /` - Listar órdenes (con filtros)
- `GET /:id` - Obtener orden completa
- `GET /:id/picking-list` - Obtener picking list optimizado
- `PATCH /:id/estado` - Actualizar estado (aprobar/rechazar)
- `PATCH /:id/asignar` - Asignar alistador/empacador
- `PATCH /:id/alistamiento` - Registrar alistamiento
- `PATCH /:id/empaque` - Registrar empaque
- `POST /:id/observaciones` - Agregar observación
- `DELETE /:id` - Eliminar orden

### Ubicaciones (`/api/ubicaciones`)
- `POST /` - Crear ubicación
- `GET /` - Listar ubicaciones
- `GET /:id` - Obtener ubicación por ID
- `GET /:id/inventario` - Obtener inventario de ubicación
- `PUT /:id` - Actualizar ubicación
- `POST /:id/asignar-producto` - Asignar producto a ubicación
- `PATCH /:id/cantidad` - Actualizar cantidad en ubicación
- `DELETE /:id/productos/:producto_id` - Remover producto
- `DELETE /:id` - Eliminar ubicación

### Recepciones (`/api/recepciones`)
- `POST /` - Registrar recepción
- `GET /` - Listar recepciones
- `GET /:id` - Obtener recepción por ID
- `DELETE /:id` - Eliminar recepción

### Averías (`/api/averias`)
- `POST /` - Reportar avería
- `GET /` - Listar averías (con filtros)
- `GET /:id` - Obtener avería por ID
- `PATCH /:id/estado` - Actualizar estado
- `PUT /:id` - Actualizar avería
- `DELETE /:id` - Eliminar avería

## 👥 Roles y Permisos

- **Vendedor**: Crear/editar clientes y órdenes
- **Jefe_Bodega**: Aprobar órdenes, asignar personal, gestionar ubicaciones, recepciones
- **Alistador**: Ver y completar picking lists
- **Empacador**: Ver y completar tareas de empaque
- **Facturacion**: Revisar y facturar órdenes
- **Administrador**: Acceso completo al sistema

## 🔐 Autenticación

Todas las rutas excepto `/api/auth/login` y `/api/auth/register` requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

## 📦 Estructura del Proyecto

```
back/
├── database/
│   └── schema.sql          # Esquema de la base de datos
├── src/
│   ├── config/
│   │   └── db.js           # Configuración PostgreSQL
│   ├── controllers/        # Controladores de rutas
│   ├── middlewares/        # Middlewares (auth, errors)
│   ├── models/             # Modelos de datos
│   ├── routes/             # Definición de rutas
│   ├── utils/              # Utilidades (picking routes)
│   └── app.js              # Configuración Express
├── .env                    # Variables de entorno
├── .env.example            # Ejemplo de variables
├── server.js               # Punto de entrada
└── package.json            # Dependencias
```

## 🧪 Testing con Postman/Thunder Client

### 1. Login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@wms.com",
  "password": "admin123"
}
```

### 2. Crear Cliente
```http
POST http://localhost:3000/api/clientes
Authorization: Bearer <tu_token>
Content-Type: application/json

{
  "nit_cc": "900123456",
  "razon_social": "Empresa XYZ S.A.S",
  "telefono": "3001234567",
  "email": "contacto@xyz.com",
  "ciudad": "Bogotá",
  "direccion": "Calle 123 #45-67"
}
```

### 3. Crear Producto
```http
POST http://localhost:3000/api/productos
Authorization: Bearer <tu_token>
Content-Type: application/json

{
  "codigo": "PROD001",
  "nombre": "Labial Rojo Mate",
  "descripcion": "Labial de larga duración",
  "categoria": "Maquillaje",
  "precio_base": 25000,
  "stock_actual": 100,
  "imagen_url": "https://example.com/imagen.jpg"
}
```

## 🛠 Tecnologías Utilizadas

- **Node.js** - Runtime
- **Express** - Framework web
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas
- **pg** - Driver PostgreSQL
- **dotenv** - Variables de entorno
- **cors** - CORS
- **morgan** - Logger HTTP

## 📝 Notas Importantes

1. **Seguridad**: Cambia el `JWT_SECRET` en producción
2. **Base de Datos**: Realiza backups regulares
3. **Contraseñas**: El usuario inicial debe cambiar su contraseña
4. **CORS**: Configura `CORS_ORIGIN` según tu frontend
5. **Logs**: Revisa los logs de la consola para debugging

## 📄 Licencia

Este proyecto es parte de un sistema WMS personalizado.

## 👨‍💻 Soporte

Para soporte o consultas, contacta al equipo de desarrollo.

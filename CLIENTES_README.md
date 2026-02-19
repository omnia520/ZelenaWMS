# Módulo de Clientes - Sistema WMS

## ✅ Funcionalidad Implementada

Se ha implementado completamente el módulo de gestión de clientes para el sistema WMS, permitiendo a los usuarios con rol de **Vendedor**, **Jefe de Bodega** y **Administrador** crear y gestionar clientes.

## 🎨 Características del Frontend

### Páginas Creadas

1. **Clientes.jsx** - Componente principal que maneja el estado
2. **ClientesList.jsx** - Lista de clientes con búsqueda y filtros
3. **ClienteForm.jsx** - Formulario para crear/editar clientes

### Funcionalidades

✅ **Crear Cliente** (Vendedor, Jefe_Bodega, Administrador)
- Formulario moderno con validaciones
- Campos: NIT/CC*, Razón Social*, Teléfono, Email, Ciudad, Dirección
- Campos requeridos marcados con asterisco
- Feedback visual en tiempo real

✅ **Listar Clientes** (Todos los usuarios autenticados)
- Vista de tarjetas moderna y responsiva
- Buscador en tiempo real (por nombre, NIT o email)
- Filtro por estado (Activos/Inactivos/Todos)
- Contador de resultados

✅ **Editar Cliente** (Vendedor, Jefe_Bodega, Administrador)
- Mismo formulario que crear, pre-llenado con datos existentes
- Validación de NIT único

✅ **Activar/Desactivar Cliente** (Jefe_Bodega, Administrador)
- Toggle de estado sin eliminar el registro
- Confirmación visual del cambio

✅ **Eliminar Cliente** (Solo Administrador)
- Confirmación antes de eliminar
- Eliminación permanente de la base de datos

### Diseño Moderno

- **Colores**: Paleta consistente con el resto del sistema
- **Iconos**: Lucide-react para indicadores visuales
- **Tarjetas**: Diseño en grid responsivo
- **Animaciones**: Transiciones suaves en hover y acciones
- **Badges**: Indicadores de estado (Activo/Inactivo)
- **Loading States**: Spinners durante carga de datos

## 🔧 Backend Existente

El backend YA ESTÁ COMPLETAMENTE FUNCIONAL. Los archivos relevantes son:

### Controlador
`back/src/controllers/cliente.controller.js`
- ✅ create - Crear cliente
- ✅ getAll - Listar con filtros
- ✅ getById - Obtener por ID
- ✅ update - Actualizar cliente
- ✅ toggleActive - Activar/Desactivar
- ✅ delete - Eliminar cliente

### Modelo
`back/src/models/cliente.model.js`
- Todas las operaciones de base de datos implementadas
- Validación de NIT único
- Búsqueda por filtros

### Rutas
`back/src/routes/clientes.routes.js`
- ✅ POST /api/clientes - Crear (Vendedor, Jefe_Bodega, Admin)
- ✅ GET /api/clientes - Listar (Autenticado)
- ✅ GET /api/clientes/:id - Ver uno (Autenticado)
- ✅ PUT /api/clientes/:id - Actualizar (Vendedor, Jefe_Bodega, Admin)
- ✅ PATCH /api/clientes/:id/toggle-active - Activar/Desactivar (Jefe_Bodega, Admin)
- ✅ DELETE /api/clientes/:id - Eliminar (Admin)

### API Client
`front/src/services/api.js`
- Ya incluye todas las funciones de clientesAPI

## 🚀 Cómo Usar

### 1. Asegúrate de que el backend esté corriendo

```bash
cd back
npm run dev
```

El servidor debe estar en `http://localhost:3000`

### 2. Inicia el frontend

```bash
cd front
npm run dev
```

El frontend estará en `http://localhost:5173`

### 3. Inicia sesión

Usa las credenciales de prueba:
- **Email**: admin@wms.com
- **Password**: admin123

O crea un usuario con rol **Vendedor**

### 4. Accede al módulo de Clientes

1. Click en "Clientes" en el menú lateral
2. Click en "Nuevo Cliente" para crear uno
3. Completa el formulario:
   - **NIT/CC** (obligatorio)
   - **Razón Social/Nombre** (obligatorio)
   - **Email** (opcional)
   - **Teléfono** (opcional)
   - **Ciudad** (opcional)
   - **Dirección** (opcional)
4. Click en "Crear Cliente"

### 5. Gestiona Clientes

- **Buscar**: Usa el buscador para filtrar por nombre, NIT o email
- **Filtrar**: Selecciona "Activos", "Inactivos" o "Todos"
- **Editar**: Click en "Editar" en la tarjeta del cliente
- **Activar/Desactivar**: Click en el botón correspondiente
- **Eliminar**: Click en el icono de basura (solo Admin)

## 🎯 Permisos por Rol

| Acción | Vendedor | Jefe_Bodega | Alistador | Empacador | Facturación | Admin |
|--------|----------|-------------|-----------|-----------|-------------|-------|
| Ver clientes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear cliente | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Editar cliente | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Activar/Desactivar | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Eliminar cliente | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## 📱 Diseño Responsivo

El módulo está completamente optimizado para:
- 📱 **Móvil** (1 columna)
- 📱 **Tablet** (2 columnas)
- 💻 **Desktop** (3 columnas)

## 🔐 Seguridad

- ✅ Autenticación JWT requerida
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Validación de datos en backend
- ✅ Verificación de NIT único
- ✅ Tokens automáticos en cada petición

## 🐛 Troubleshooting

### Error: "Token no proporcionado" o "Token inválido"
- Cierra sesión y vuelve a iniciar sesión
- Verifica que el backend esté corriendo

### Error: "Ya existe un cliente con este NIT/CC"
- El NIT debe ser único en el sistema
- Verifica si el cliente ya existe

### No aparece el botón "Nuevo Cliente"
- Verifica tu rol de usuario
- Solo Vendedor, Jefe_Bodega y Administrador pueden crear clientes

### Los clientes no se cargan
- Verifica que el backend esté corriendo en el puerto correcto
- Revisa la consola del navegador para errores
- Verifica la conexión a la base de datos PostgreSQL

## 🎉 ¡Listo!

El módulo de clientes está completamente funcional y listo para usar. Los vendedores ya pueden crear, editar y gestionar sus clientes desde una interfaz moderna e intuitiva.

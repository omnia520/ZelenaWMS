# Módulo de Registro de Usuarios - Sistema WMS

## ✅ Funcionalidad Implementada

Se ha implementado un sistema completo de registro de usuarios con selector de roles para el sistema WMS.

## 🎨 Características del Frontend

### Página Creada

**Register.jsx** - Formulario completo de registro con las siguientes características:

### Campos del Formulario

1. **Nombre Completo** ⭐ (Requerido)
   - Campo de texto para el nombre completo del usuario

2. **Correo Electrónico** ⭐ (Requerido)
   - Campo de email con validación
   - Verifica que el email no esté registrado

3. **Teléfono** (Opcional)
   - Campo numérico para contacto

4. **Rol en el Sistema** ⭐ (Requerido)
   - Selector desplegable con 6 roles disponibles
   - Cada rol muestra su descripción
   - Vista previa de las funciones del rol seleccionado

5. **Contraseña** ⭐ (Requerido)
   - Mínimo 6 caracteres
   - Campo de tipo password

6. **Confirmar Contraseña** ⭐ (Requerido)
   - Validación de coincidencia con la contraseña

### Roles Disponibles

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Vendedor** | Crear y gestionar órdenes de venta | Clientes, Órdenes |
| **Jefe de Bodega** | Aprobar órdenes y gestionar inventario | Aprobaciones, Inventario, Ubicaciones |
| **Alistador** | Realizar picking de productos | Picking Lists, Alistamiento |
| **Empacador** | Empacar órdenes para despacho | Empaque, Preparación |
| **Facturación** | Procesar facturación de órdenes | Facturación, Revisión |
| **Administrador** | Acceso completo al sistema | Control Total |

## 🎯 Validaciones Implementadas

### Frontend (JavaScript)

✅ **Campos requeridos:**
- Nombre no vacío
- Email no vacío
- Rol seleccionado
- Contraseña no vacía

✅ **Validaciones de contraseña:**
- Mínimo 6 caracteres
- Confirmación de contraseña coincide

✅ **Validación de email:**
- Formato válido de email (HTML5)

### Backend (Node.js)

✅ **Validaciones del controlador:**
- Todos los campos requeridos presentes
- Email único (no duplicado)
- Rol válido (entre los 6 permitidos)
- Hash seguro de contraseña con bcrypt

## 🔧 Backend Existente

El backend YA ESTÁ COMPLETAMENTE FUNCIONAL.

### Endpoint de Registro

**POST** `/api/auth/register`

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@wms.com",
  "telefono": "3001234567",
  "rol": "Vendedor",
  "password": "password123"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "usuario_id": 1,
      "nombre": "Juan Pérez",
      "email": "juan@wms.com",
      "rol": "Vendedor"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response Error (409):**
```json
{
  "success": false,
  "message": "El email ya está registrado"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Rol inválido",
  "rolesPermitidos": ["Vendedor", "Jefe_Bodega", "Alistador", "Empacador", "Facturacion", "Administrador"]
}
```

## 🚀 Cómo Usar

### 1. Asegúrate de que el backend esté corriendo

```bash
cd back
npm run dev
```

### 2. Inicia el frontend

```bash
cd front
npm run dev
```

### 3. Accede al registro

Hay dos formas de llegar:

**Opción A - Desde Login:**
1. Ve a `http://localhost:5173/login`
2. Click en "¿No tienes cuenta? Regístrate aquí"

**Opción B - Directo:**
1. Ve a `http://localhost:5173/register`

### 4. Completa el formulario

1. **Nombre Completo**: Ingresa tu nombre completo
2. **Email**: Usa un email válido y único
3. **Teléfono**: (Opcional) Número de contacto
4. **Rol**: Selecciona el rol apropiado del desplegable
   - Verás la descripción de cada rol
   - Al seleccionar, aparece un resumen del rol
5. **Contraseña**: Mínimo 6 caracteres
6. **Confirmar Contraseña**: Debe coincidir con la anterior
7. Click en **"Crear Cuenta"**

### 5. Resultado

- ✅ **Éxito**: Serás redirigido automáticamente al Dashboard
- ❌ **Error**: Verás un mensaje específico del problema
  - Email ya registrado
  - Contraseñas no coinciden
  - Campos requeridos faltantes
  - etc.

## 🎨 Diseño Moderno

### Características Visuales

✨ **Header:**
- Logo de la empresa
- Título "Crear Cuenta"
- Subtítulo descriptivo

✨ **Formulario:**
- Campos organizados en columnas (responsive)
- Iconos descriptivos en cada campo
- Placeholders informativos
- Indicadores de campos requeridos (*)

✨ **Selector de Rol:**
- Descripción inline de cada rol
- Preview del rol seleccionado en box azul
- Formato: "Nombre - Descripción"

✨ **Estados de Carga:**
- Botón con spinner animado
- Texto "Registrando..."
- Deshabilita el botón durante el proceso

✨ **Navegación:**
- Botón "Volver al inicio de sesión" en la parte superior
- Link a login en la parte inferior

✨ **Información Adicional:**
- Box informativo con descripción de todos los roles
- Código de colores: azul para información

### Diseño Responsivo

📱 **Móvil:**
- Formulario en una columna
- Campos apilados verticalmente

💻 **Desktop:**
- Email y Teléfono en dos columnas
- Contraseñas en dos columnas
- Formulario centrado con ancho máximo

## 🔐 Seguridad

✅ **Hash de Contraseñas:**
- bcrypt con 10 salt rounds
- Nunca se almacena contraseña en texto plano

✅ **JWT Automático:**
- Al registrarse, recibe token inmediatamente
- Auto-login después del registro

✅ **Email Único:**
- Validación de duplicados en backend
- Mensaje claro si el email ya existe

✅ **Rol Validado:**
- Solo acepta roles predefinidos
- Previene inyección de roles inválidos

## 🧪 Casos de Prueba

### Caso 1: Registro Exitoso
```
Nombre: Juan Pérez
Email: juan.perez@wms.com
Teléfono: 3001234567
Rol: Vendedor
Password: password123
Confirmar: password123
```
**Resultado:** ✅ Usuario creado, redirige a Dashboard

### Caso 2: Email Duplicado
```
Email: admin@wms.com (ya existe)
```
**Resultado:** ❌ "El email ya está registrado"

### Caso 3: Contraseñas No Coinciden
```
Password: password123
Confirmar: password456
```
**Resultado:** ❌ "Las contraseñas no coinciden"

### Caso 4: Contraseña Corta
```
Password: 12345 (menos de 6)
```
**Resultado:** ❌ "La contraseña debe tener al menos 6 caracteres"

### Caso 5: Sin Rol
```
Rol: (no seleccionado)
```
**Resultado:** ❌ "Debes seleccionar un rol"

## 🌐 Flujo de Usuario

```
1. Usuario visita /register
   ↓
2. Completa el formulario
   ↓
3. Click en "Crear Cuenta"
   ↓
4. Validaciones frontend
   ↓
5. POST a /api/auth/register
   ↓
6. Validaciones backend
   ↓
7. Crear usuario en BD
   ↓
8. Generar tokens JWT
   ↓
9. Guardar token en localStorage
   ↓
10. Redirigir a /dashboard
```

## 📱 Acceso Directo

- **URL Login:** `http://localhost:5173/login`
- **URL Register:** `http://localhost:5173/register`
- **Navegación:** Los usuarios autenticados son redirigidos al Dashboard

## 🐛 Troubleshooting

### "El email ya está registrado"
- Usa un email diferente
- Verifica si el usuario ya existe en la base de datos

### "Las contraseñas no coinciden"
- Escribe la misma contraseña en ambos campos
- Verifica que no haya espacios extra

### No se puede seleccionar el rol
- Refresca la página
- Verifica que el backend esté corriendo

### Error al registrar usuario
- Verifica conexión a la base de datos PostgreSQL
- Revisa la consola del navegador para más detalles
- Verifica que el backend esté en puerto 3000

## 🎉 ¡Listo!

El módulo de registro está completamente funcional. Los usuarios pueden crear cuentas seleccionando su rol específico y comenzar a usar el sistema inmediatamente.

## 📸 Características Destacadas

✨ Selector de roles con descripciones inline
✨ Validación en tiempo real
✨ Auto-login después del registro
✨ Diseño moderno y profesional
✨ Completamente responsivo
✨ Mensajes de error claros y específicos
✨ Información contextual sobre roles

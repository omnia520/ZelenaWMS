# Frontend — Sistema WMS

Interfaz web del **Warehouse Management System (WMS)**. SPA desarrollada con React 19, Vite y TailwindCSS. Consume la API REST del backend en Node.js/Express.

## Stack

| Tecnología | Uso |
|---|---|
| React 19 | Framework UI |
| Vite 6 | Build tool y dev server |
| React Router 7 | Enrutamiento SPA |
| Zustand 5 | Estado global (autenticación) |
| Axios 1 | Cliente HTTP con interceptores |
| TailwindCSS 3 | Estilos utilitarios |
| Lucide React | Iconografía |

## Instalación y desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:5173)
npm run dev

# Build para producción
npm run build

# Vista previa del build
npm preview

# Lint
npm run lint
```

## Variables de entorno

Crear un archivo `.env.local` en esta carpeta:

```env
VITE_API_URL=http://localhost:3000/api
```

Para producción:
```env
VITE_API_URL=https://tu-api.azurewebsites.net/api
```

## Estructura

```
src/
├── App.jsx                     # Rutas y protección por rol
├── main.jsx                    # Punto de entrada React
├── pages/                      # Páginas de la aplicación
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Productos.jsx
│   ├── Ordenes.jsx
│   ├── AprobarOrdenes.jsx
│   ├── Clientes.jsx
│   ├── Ubicaciones.jsx
│   ├── ListaAlistamiento.jsx   # Órdenes en picking
│   ├── DetalleAlistamiento.jsx # Picking por orden
│   ├── ListaEmpaque.jsx        # Órdenes en empaque
│   ├── DetalleEmpaque.jsx      # Empaque por orden
│   ├── Recepciones.jsx
│   ├── Averias.jsx
│   ├── Almacenes.jsx
│   ├── Desempeno.jsx
│   └── Facturacion.jsx
├── components/
│   ├── layout/
│   │   └── Layout.jsx          # Sidebar + header principal
│   └── common/
│       └── AutocompleteInput.jsx
├── services/
│   └── api.js                  # Axios + todos los endpoints por módulo
├── store/
│   └── authStore.js            # Zustand: usuario, token, sesión
└── utils/
    └── dateUtils.js
```

## Rutas protegidas

Las rutas requieren autenticación y en algunos casos un rol específico:

| Ruta | Roles permitidos |
|---|---|
| `/dashboard` | Todos |
| `/productos` | Todos |
| `/ordenes` | Todos |
| `/ordenes/aprobar` | Jefe_Bodega, Administrador |
| `/clientes` | Vendedor, Jefe_Bodega, Facturacion, Administrador |
| `/ubicaciones` | Jefe_Bodega, Operario, Facturacion, Administrador |
| `/actividades/alistamiento` | Operario, Jefe_Bodega, Administrador |
| `/actividades/empaque` | Operario, Jefe_Bodega, Administrador |
| `/recepciones` | Jefe_Bodega, Administrador |
| `/proveedores` | Jefe_Bodega, Administrador |
| `/averias` | Todos |
| `/almacenes` | Jefe_Bodega, Administrador |
| `/desempeno` | Operario, Jefe_Bodega, Administrador |
| `/facturacion` | Facturacion, Jefe_Bodega, Administrador |

## Autenticación

El estado de sesión se maneja con **Zustand** y persiste en `localStorage`:

```javascript
// Iniciar sesión
const { login } = useAuthStore();
await login({ email, password });

// Cerrar sesión
const { logout } = useAuthStore();
logout(); // Limpia estado y redirige a /login
```

El cliente Axios inyecta el token automáticamente en cada petición:
```
Authorization: Bearer <jwt_token>
```

Si el servidor responde con `401`, la sesión se cierra y el usuario es redirigido al login.

## Despliegue en Azure

La carpeta `public/` incluye archivos de configuración para manejar el enrutamiento de React Router en Azure:

- **`staticwebapp.config.json`** — Para Azure Static Web Apps
- **`web.config`** — Para Azure App Service (IIS)

Ambos redirigen cualquier ruta al `index.html` para que React Router pueda procesarla. Se copian automáticamente al directorio `dist/` al ejecutar `npm run build`.

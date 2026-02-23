# WMS — Sistema de Gestión de Almacén

> **Warehouse Management System** full-stack para la gestión integral de ventas, alistamiento, empaque, inventario y facturación. Desarrollado con Node.js/Express/PostgreSQL en el backend y React/Vite/TailwindCSS en el frontend.

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Tecnologías](#tecnologías)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Base de Datos](#base-de-datos)
6. [Flujo de Órdenes](#flujo-de-órdenes)
7. [Roles y Permisos](#roles-y-permisos)
8. [Módulos del Sistema](#módulos-del-sistema)
9. [API REST — Referencia Completa](#api-rest--referencia-completa)
10. [Frontend — Páginas y Componentes](#frontend--páginas-y-componentes)
11. [Optimización de Rutas de Picking](#optimización-de-rutas-de-picking)
12. [Sistema de Inventario](#sistema-de-inventario)
13. [Configuración y Despliegue](#configuración-y-despliegue)
14. [Variables de Entorno](#variables-de-entorno)
15. [Guía de Inicio Rápido](#guía-de-inicio-rápido)
16. [Despliegue en Azure](#despliegue-en-azure)

---

## Descripción General

El **WMS (Warehouse Management System)** es una aplicación empresarial diseñada para digitalizar y optimizar todas las operaciones de un almacén o bodega. Cubre el ciclo de vida completo de una orden de venta: desde su creación por el equipo comercial, pasando por la aprobación del jefe de bodega, el alistamiento físico de productos, el empaque, hasta la facturación final.

### Características Principales

- **Gestión de Órdenes de Venta** con flujo de aprobación multi-etapa
- **Picking optimizado** por ruta de bodega para minimizar desplazamientos
- **Control de inventario** por ubicación física (estantería/fila/nivel)
- **Reserva de stock** automática al aprobar órdenes
- **Reportes de averías** con evidencia fotográfica
- **Recepciones de mercancía** con asignación a ubicaciones
- **Métricas de desempeño** por operario y equipo
- **Facturación** integrada al flujo de pedidos
- **Zona horaria Colombia** (UTC-5) configurada a nivel de base de datos
- **Despliegue en Azure** con soporte para Static Web Apps y App Service

---

## Tecnologías

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 18+ | Runtime del servidor |
| Express | 4.x | Framework HTTP |
| PostgreSQL | 14+ | Base de datos relacional |
| node-postgres (pg) | 8.x | Driver PostgreSQL |
| JSON Web Token (JWT) | 9.x | Autenticación |
| bcrypt | 5.x | Hashing de contraseñas |
| Multer | 1.x | Manejo de subida de archivos |
| Morgan | 1.x | Logging de peticiones HTTP |
| dotenv | 16.x | Variables de entorno |

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.x | Framework UI |
| Vite | 6.x | Build tool y dev server |
| Zustand | 5.x | Manejo de estado global |
| Axios | 1.x | Cliente HTTP |
| TailwindCSS | 3.x | Estilos utilitarios |
| React Router | 7.x | Enrutamiento SPA |
| Lucide React | — | Iconografía |

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                        │
│                                                                  │
│   React 19 + Vite + TailwindCSS + Zustand + React Router       │
│   ┌────────────────────────────────────────────────────────┐   │
│   │  Páginas: Dashboard, Órdenes, Picking, Empaque,        │   │
│   │  Inventario, Averías, Facturación, Desempeño...        │   │
│   └────────────────────┬───────────────────────────────────┘   │
└────────────────────────┼────────────────────────────────────────┘
                         │ HTTP / REST API (Axios + JWT)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js / Express)                  │
│                                                                  │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Routes  │→ │ Controllers  │→ │         Models           │  │
│  │ /api/*   │  │ (lógica de   │  │  (consultas PostgreSQL)  │  │
│  └──────────┘  │  negocio)    │  └──────────────────────────┘  │
│                └──────────────┘                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Middlewares: auth.js · errorHandler.js · upload.js     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Utils: picking-routes.js (optimización de rutas)       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ pg Pool (max 20 conexiones)
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL (wms_db)                           │
│                                                                  │
│  13 tablas · Índices · Triggers · Timezone: America/Bogota      │
└─────────────────────────────────────────────────────────────────┘
```

### Patrón MVC
El backend sigue el patrón **MVC (Model-View-Controller)**:
- **Models** (`src/models/*.model.js`): Métodos estáticos con queries SQL directas
- **Controllers** (`src/controllers/*.controller.js`): Lógica de negocio y validaciones
- **Routes** (`src/routes/*.routes.js`): Definición de endpoints y aplicación de middlewares

---

## Estructura del Proyecto

```
WMS/
├── back/                               # Backend (Node.js / Express)
│   ├── src/
│   │   ├── app.js                      # Configuración Express (CORS, middlewares)
│   │   ├── server.js                   # Punto de entrada, puerto 3000
│   │   ├── config/
│   │   │   └── db.js                   # Pool PostgreSQL + helpers de transacción
│   │   ├── controllers/
│   │   │   ├── auth.controller.js      # Login, registro, perfil
│   │   │   ├── clientes.controller.js  # CRUD clientes
│   │   │   ├── productos.controller.js # CRUD productos + stock
│   │   │   ├── ordenes.controller.js   # Ciclo de vida de órdenes
│   │   │   ├── ubicaciones.controller.js # Gestión de ubicaciones
│   │   │   ├── recepciones.controller.js # Recepción de mercancía
│   │   │   ├── averias.controller.js   # Reportes de daños
│   │   │   ├── bodegas.controller.js   # Gestión de bodegas
│   │   │   ├── transferencias.controller.js # Transferencias entre bodegas
│   │   │   ├── inventario.controller.js # Consulta de inventario
│   │   │   ├── proveedores.controller.js # CRUD proveedores
│   │   │   ├── desempeno.controller.js # KPIs y métricas
│   │   │   └── facturacion.controller.js # Facturas
│   │   ├── models/
│   │   │   ├── auth.model.js
│   │   │   ├── clientes.model.js
│   │   │   ├── productos.model.js
│   │   │   ├── ordenes.model.js
│   │   │   ├── ubicaciones.model.js
│   │   │   ├── recepciones.model.js
│   │   │   ├── averias.model.js
│   │   │   ├── bodegas.model.js
│   │   │   ├── transferencias.model.js
│   │   │   ├── proveedores.model.js
│   │   │   └── desempeno.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── clientes.routes.js
│   │   │   ├── productos.routes.js
│   │   │   ├── ordenes.routes.js
│   │   │   ├── ubicaciones.routes.js
│   │   │   ├── recepciones.routes.js
│   │   │   ├── averias.routes.js
│   │   │   ├── bodegas.routes.js
│   │   │   ├── transferencias.routes.js
│   │   │   ├── inventario.routes.js
│   │   │   ├── proveedores.routes.js
│   │   │   ├── desempeno.routes.js
│   │   │   └── upload.routes.js
│   │   ├── middlewares/
│   │   │   ├── auth.js                 # JWT verification + RBAC
│   │   │   ├── errorHandler.js         # Manejo centralizado de errores
│   │   │   └── upload.js               # Multer: fotos (máx 10 archivos)
│   │   └── utils/
│   │       └── picking-routes.js       # Algoritmo de optimización de ruta
│   ├── database/
│   │   ├── schema.sql                  # Esquema maestro de la BD
│   │   ├── seed.sql                    # Datos iniciales de prueba
│   │   └── migrations/
│   │       └── 001_add_colombia_timezone.sql
│   ├── uploads/                        # Imágenes subidas (evidencias, productos)
│   ├── .env                            # Variables de entorno (no versionado)
│   └── package.json
│
├── front/                              # Frontend (React / Vite)
│   ├── src/
│   │   ├── App.jsx                     # Rutas SPA + protección por rol
│   │   ├── main.jsx                    # Punto de entrada React
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Productos.jsx
│   │   │   ├── Ordenes.jsx
│   │   │   ├── AprobarOrdenes.jsx
│   │   │   ├── Clientes.jsx
│   │   │   ├── Ubicaciones.jsx
│   │   │   ├── ListaAlistamiento.jsx   # Lista de órdenes en picking
│   │   │   ├── DetalleAlistamiento.jsx # Picking de una orden
│   │   │   ├── ListaEmpaque.jsx        # Lista de órdenes en empaque
│   │   │   ├── DetalleEmpaque.jsx      # Empaque de una orden
│   │   │   ├── Recepciones.jsx
│   │   │   ├── Averias.jsx
│   │   │   ├── Almacenes.jsx
│   │   │   ├── Desempeno.jsx
│   │   │   └── Facturacion.jsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Layout.jsx          # Sidebar + header
│   │   │   └── common/
│   │   │       └── AutocompleteInput.jsx
│   │   ├── services/
│   │   │   └── api.js                  # Axios + interceptores + APIs por módulo
│   │   ├── store/
│   │   │   └── authStore.js            # Zustand: usuario, token, sesión
│   │   └── utils/
│   │       └── dateUtils.js
│   ├── public/
│   │   ├── staticwebapp.config.json    # Azure Static Web Apps SPA routing
│   │   └── web.config                  # Azure App Service IIS routing
│   └── package.json
│
├── CLAUDE.md                           # Instrucciones para Claude Code
└── README.md                           # Este archivo
```

---

## Base de Datos

### Diagrama Entidad-Relación (simplificado)

```
┌──────────────┐       ┌─────────────────────┐       ┌───────────────┐
│   usuarios   │       │    ordenes_venta     │       │    clientes   │
│──────────────│       │─────────────────────│       │───────────────│
│ usuario_id PK│◄──┐   │ orden_id PK         │──────►│ cliente_id PK │
│ nombre       │   │   │ numero_orden (UNIQ) │       │ nit_cc (UNIQ) │
│ email (UNIQ) │   │   │ cliente_id FK       │       │ razon_social  │
│ password_hash│   │   │ vendedor_id FK ─────┼──────►│ telefono      │
│ rol          │   │   │ estado (enum)       │       │ email         │
│ activo       │   │   │ total               │       │ ciudad        │
└──────────────┘   │   │ aprobado_por FK ────┼──┐    └───────────────┘
                   │   │ alistador_asignado ─┼──┤
                   │   │ empacador_asignado ─┼──┘
                   │   └──────────┬──────────┘
                   │              │ 1:N
                   │              ▼
                   │   ┌─────────────────────┐
                   │   │    orden_detalles   │
                   │   │─────────────────────│
                   │   │ detalle_id PK       │
                   │   │ orden_id FK         │
                   │   │ producto_id FK ─────┼──┐
                   │   │ cantidad_pedida      │  │
                   │   │ cantidad_alistada   │  │
                   │   │ cantidad_empacada   │  │
                   │   │ precio_unitario     │  │
                   │   │ subtotal            │  │
                   │   └─────────────────────┘  │
                   │                            │
                   │   ┌─────────────────────┐  │   ┌───────────────────────┐
                   │   │      productos      │◄─┘   │ inventario_ubicaciones│
                   │   │─────────────────────│      │───────────────────────│
                   │   │ producto_id PK      │◄─────│ inventario_id PK      │
                   │   │ codigo (UNIQ)       │      │ producto_id FK        │
                   │   │ nombre              │      │ ubicacion_id FK ──────┼──┐
                   │   │ categoria           │      │ cantidad              │  │
                   │   │ precio_venta        │      │ cantidad_reservada    │  │
                   │   │ stock_actual        │      │ es_ubicacion_primaria │  │
                   │   │ stock_reservado     │      └───────────────────────┘  │
                   │   └─────────────────────┘                                 │
                   │                                ┌──────────────────────┐   │
                   │   ┌─────────────────────┐      │      ubicaciones     │◄──┘
                   │   │      averias        │      │──────────────────────│
                   │   │─────────────────────│      │ ubicacion_id PK      │
                   │   │ averia_id PK        │      │ codigo (UNIQ)        │
                   │   │ producto_id FK      │      │ estanteria           │
                   │   │ tipo_averia (enum)  │      │ fila                 │
                   │   │ estado (enum)       │      │ nivel                │
                   │   │ reportado_por FK ───┼──────│ orden_ruta           │
                   │   └─────────────────────┘      └──────────────────────┘
                   │
                   │   ┌─────────────────────┐
                   └───│     recepciones     │
                       │─────────────────────│
                       │ recepcion_id PK     │
                       │ numero_documento    │
                       │ proveedor           │
                       │ usuario_recibe FK   │
                       └──────────┬──────────┘
                                  │ 1:N
                                  ▼
                       ┌─────────────────────┐
                       │  recepcion_detalles │
                       │─────────────────────│
                       │ detalle_recepcion_id│
                       │ recepcion_id FK     │
                       │ producto_id FK      │
                       │ ubicacion_id FK     │
                       │ cantidad_recibida   │
                       └─────────────────────┘
```

### Tablas Principales

#### `usuarios` — Usuarios del sistema
```sql
usuario_id    SERIAL PRIMARY KEY
nombre        VARCHAR(100) NOT NULL
email         VARCHAR(100) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
telefono      VARCHAR(20)
rol           ENUM('Vendedor','Jefe_Bodega','Operario','Facturacion','Administrador')
activo        BOOLEAN DEFAULT true
fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### `productos` — Catálogo de productos
```sql
producto_id   SERIAL PRIMARY KEY
codigo        VARCHAR(50) UNIQUE NOT NULL
nombre        VARCHAR(200) NOT NULL
descripcion   TEXT
categoria     VARCHAR(100)
subcategoria  VARCHAR(100)
marca         VARCHAR(100)
precio_base   DECIMAL(12,2)
precio_compra DECIMAL(12,2)
precio_venta  DECIMAL(12,2)
stock_actual  INTEGER DEFAULT 0
stock_reservado INTEGER DEFAULT 0
imagen_url    TEXT
activo        BOOLEAN DEFAULT true
```

#### `ordenes_venta` — Órdenes de venta
```sql
orden_id      SERIAL PRIMARY KEY
numero_orden  VARCHAR(20) UNIQUE  -- formato: ORD-1, ORD-2...
cliente_id    FK → clientes
vendedor_id   FK → usuarios
estado        ENUM(8 estados)
subtotal, descuento_total, impuestos_total, total  DECIMAL(12,2)
-- Campos de workflow:
aprobado_por, fecha_aprobacion
alistador_asignado, fecha_inicio_alistamiento, fecha_fin_alistamiento
empacador_asignado, fecha_inicio_empaque, fecha_fin_empaque
```

#### `ubicaciones` — Posiciones físicas en la bodega
```sql
ubicacion_id  SERIAL PRIMARY KEY
codigo        VARCHAR(50) UNIQUE  -- Ej: "EST-A-1-1"
estanteria    VARCHAR(20)         -- Letra: A, B, C...
fila          INTEGER             -- Número de fila
nivel         INTEGER             -- Altura: 1=suelo, 2=medio, 3=alto
orden_ruta    INTEGER             -- Para optimización de picking
activa        BOOLEAN DEFAULT true
```

#### `inventario_ubicaciones` — Stock por ubicación
```sql
inventario_id         SERIAL PRIMARY KEY
producto_id           FK → productos
ubicacion_id          FK → ubicaciones
cantidad              INTEGER DEFAULT 0
cantidad_reservada    INTEGER DEFAULT 0
es_ubicacion_primaria BOOLEAN DEFAULT false
fecha_actualizacion   TIMESTAMP  -- Auto-actualizado por trigger
UNIQUE (producto_id, ubicacion_id)
```

### Funciones y Triggers de Base de Datos

```sql
-- Función helper para timestamps en Colombia
CREATE FUNCTION now_colombia() RETURNS TIMESTAMP AS $$
  SELECT NOW() AT TIME ZONE 'America/Bogota';
$$ LANGUAGE SQL;

-- Trigger: actualizar fecha en inventario_ubicaciones
CREATE TRIGGER update_inventario_fecha
  BEFORE UPDATE ON inventario_ubicaciones
  FOR EACH ROW EXECUTE FUNCTION update_fecha_actualizacion();
```

### Configuración de Zona Horaria

Todas las conexiones a PostgreSQL se configuran automáticamente con la zona horaria de Colombia:

```javascript
// back/src/config/db.js
pool.on('connect', (client) => {
  client.query("SET timezone = 'America/Bogota'");
});
```

---

## Flujo de Órdenes

El sistema implementa un flujo de trabajo estricto con 8 estados posibles:

```
                    ┌─────────────────────────────────────────────────────┐
                    │                  FLUJO DE ESTADOS                    │
                    └─────────────────────────────────────────────────────┘

  [VENDEDOR]                     [JEFE_BODEGA]
      │                               │
      │  Crea orden                   │
      ▼                               │
 ┌─────────────────┐    Aprueba       │
 │   Pendiente     │──────────────────►  ┌─────────────┐
 │   Aprobacion    │                     │   Aprobada  │
 └─────────────────┘    Rechaza          └──────┬──────┘
                        │                       │
 ┌─────────────────┐◄───┘               Asigna operario
 │   Rechazada     │                           │
 └─────────────────┘                           ▼

                    [OPERARIO]         ┌──────────────────┐
                                       │  En_Alistamiento │  ← Picking
                                       └────────┬─────────┘    optimizado
                                                │
                                         Finaliza picking
                                                │
                                                ▼
                                       ┌──────────────────┐
                                       │   En_Empaque     │  ← Packing
                                       └────────┬─────────┘
                                                │
                    [FACTURACION]        Finaliza empaque
                         │                      │
                         │                      ▼
                         │             ┌──────────────────┐
                         │◄────────────│ Lista_Facturar   │
                         │             └──────────────────┘
                         │
                    Genera factura
                         │
                         ▼
                  ┌─────────────┐
                  │  Facturada  │  ← Estado final
                  └─────────────┘
```

### Detalle de Cada Estado

| Estado | Responsable | Acciones Disponibles |
|---|---|---|
| `Pendiente_Aprobacion` | Vendedor | Enviada a revisión del Jefe de Bodega |
| `Aprobada` | Jefe_Bodega | Asignar operario, iniciar alistamiento |
| `En_Alistamiento` | Operario | Registrar cantidades alistadas por ítem |
| `En_Empaque` | Operario | Registrar cantidades empacadas, número de cajas |
| `Lista_Facturar` | Facturación | Generar factura |
| `Facturada` | — | Estado terminal. Orden completada |
| `Rechazada` | Jefe_Bodega | Estado terminal. Orden cancelada |

---

## Roles y Permisos

El sistema implementa **RBAC (Role-Based Access Control)** con 5 roles:

```
┌─────────────────┬──────────┬────────────┬──────────┬──────────┬───────────────┐
│     Acción      │ Vendedor │Jefe_Bodega │ Operario │Facturac. │Administrador  │
├─────────────────┼──────────┼────────────┼──────────┼──────────┼───────────────┤
│ Crear órdenes   │    ✓     │     ✓      │    ✗     │    ✗     │      ✓        │
│ Aprobar órdenes │    ✗     │     ✓      │    ✗     │    ✗     │      ✓        │
│ Rechazar órdenes│    ✗     │     ✓      │    ✗     │    ✗     │      ✓        │
│ Asignar picking │    ✗     │     ✓      │    ✗     │    ✗     │      ✓        │
│ Hacer picking   │    ✗     │     ✓      │    ✓     │    ✗     │      ✓        │
│ Hacer empaque   │    ✗     │     ✓      │    ✓     │    ✗     │      ✓        │
│ Facturar        │    ✗     │     ✓      │    ✗     │    ✓     │      ✓        │
│ Gestionar invent│    ✗     │     ✓      │    ✗     │    ✗     │      ✓        │
│ Ver inventario  │    ✓     │     ✓      │    ✓     │    ✓     │      ✓        │
│ Gestionar produc│    ✗     │     ✓      │    ✗     │    ✗     │      ✓        │
│ Gestionar clientes│  ✓     │     ✓      │    ✗     │    ✓     │      ✓        │
│ Ver desempeño   │    ✗     │     ✓      │    ✓*    │    ✗     │      ✓        │
│ Ver rankings    │    ✗     │     ✓      │    ✗     │    ✗     │      ✓        │
│ Reportar averías│    ✓     │     ✓      │    ✓     │    ✓     │      ✓        │
│ Gestionar avería│    ✗     │     ✓      │    ✗     │    ✗     │      ✓        │
│ Administrar todo│    ✗     │     ✗      │    ✗     │    ✗     │      ✓        │
└─────────────────┴──────────┴────────────┴──────────┴──────────┴───────────────┘

* Solo puede ver su propio desempeño
```

### Implementación del RBAC

```javascript
// Middleware de autenticación
router.get('/endpoint', verifyToken, checkRole('Jefe_Bodega', 'Admin'), handler);

// verifyToken: valida JWT en header Authorization
// checkRole:   verifica que el rol del usuario esté en la lista permitida
```

---

## Módulos del Sistema

### 1. Autenticación y Usuarios

El sistema usa **JWT (JSON Web Token)** para autenticación stateless:

```
Login:
  POST /api/auth/login
  Body: { email, password }
  → Devuelve: { token, refreshToken, user }

Token flow:
  Request → Authorization: Bearer <token>
  Backend → Verifica firma JWT → Extrae usuario → Autoriza

  Si 401 → Frontend limpia sesión y redirige a /login
```

**Credenciales por defecto (admin):**
- Email: `admin@wms.com`
- Password: `admin123`

---

### 2. Gestión de Productos

CRUD completo del catálogo con:
- Código único por producto
- Categoría / Subcategoría / Marca
- Precio base, compra y venta
- Stock actual y reservado
- Imagen del producto
- Disponibilidad por ubicación
- Historial de órdenes

**Consulta de disponibilidad:**
```
GET /api/productos/:id/disponibilidad
→ { stock_actual, stock_reservado, stock_disponible, ubicaciones: [...] }
```

---

### 3. Órdenes de Venta

El módulo más complejo del sistema. Soporta:
- Creación de órdenes con múltiples ítems
- Cálculo automático de subtotales, descuentos e impuestos
- Numeración secuencial automática (`ORD-1`, `ORD-2`, ...)
- Filtros por estado, vendedor, cliente y rango de fechas
- Asignación de operarios para picking y empaque
- Observaciones por etapa del proceso

**Campos calculados automáticamente:**
```
subtotal = Σ(cantidad × precio_unitario)
descuento_total = Σ(subtotal × descuento_porcentaje / 100)
impuestos_total = (subtotal - descuento_total) × tasa_impuesto
total = subtotal - descuento_total + impuestos_total
```

---

### 4. Alistamiento (Picking)

El proceso de picking está optimizado para minimizar el recorrido del operario:

```
Operario accede a: /actividades/alistamiento/:ordenId

1. Sistema carga la "picking list" optimizada por ruta
2. Productos ordenados por: orden_ruta → estantería → fila → nivel
3. Operario registra cantidad alistada por ítem
4. Puede agregar observaciones e imágenes por ítem
5. Al finalizar: stock se descuenta del inventario
```

**Pantalla de picking mostraría:**
```
┌─────────────────────────────────────────────────┐
│  ORDEN ORD-42  │  Cliente: Empresa ABC           │
│  Items: 8      │  Ubicaciones: 5  │  Faltantes: 0│
├─────────────────────────────────────────────────┤
│ ① EST-A-1-1  │ Producto X  │ Pedir: 10 │ [___] │
│ ② EST-A-1-2  │ Producto Y  │ Pedir: 5  │ [___] │
│ ③ EST-B-2-1  │ Producto Z  │ Pedir: 20 │ [___] │
│ ④ EST-C-1-1  │ Producto W  │ Pedir: 3  │ [___] │
└─────────────────────────────────────────────────┘
```

---

### 5. Empaque (Packing)

Proceso posterior al picking:

```
1. Operario revisa cantidades alistadas
2. Registra cantidades empacadas (puede diferir si hay daños)
3. Registra número de cajas por ítem
4. Agrega observaciones de empaque
5. Al finalizar: orden pasa a "Lista_Facturar"
```

---

### 6. Gestión de Ubicaciones

Mapeo físico de la bodega:

```
Nomenclatura de ubicaciones:
  EST-A-1-1  →  Estantería A, Fila 1, Nivel 1 (suelo)
  EST-A-1-2  →  Estantería A, Fila 1, Nivel 2 (medio)
  EST-B-3-3  →  Estantería B, Fila 3, Nivel 3 (alto)

Funcionalidades:
  - Asignar productos a ubicaciones
  - Designar ubicación primaria vs. secundaria
  - Mover productos entre ubicaciones
  - Ver inventario completo de una ubicación
  - Autocomplete para búsqueda rápida
```

---

### 7. Recepciones de Mercancía

Proceso de entrada de inventario:

```
1. Crear recepción con número de documento y proveedor
2. Agregar ítems recibidos: producto + cantidad + ubicación destino
3. El sistema actualiza automáticamente el inventario en la ubicación
4. Soporta foto de soporte (documento de entrega, remisión, etc.)
```

---

### 8. Reportes de Averías

Sistema completo de gestión de daños:

```
Tipos de avería:
  - Daño      (producto dañado físicamente)
  - Faltante  (producto que debería estar pero no está)
  - Rotura    (envase roto)
  - Vencimiento (producto caducado)

Estados:
  Abierta → En_Revision → Cerrada

Al cerrar:
  - "Repuesta":   +stock (producto devuelto al inventario)
  - "Descartada": -stock (descuento permanente de inventario)

Evidencias: múltiples fotos por avería
```

---

### 9. Métricas de Desempeño

KPIs individuales y de equipo:

```
Métricas por operario:
  - Órdenes alistadas / empacadas (hoy, semana, mes)
  - Tiempo promedio de alistamiento
  - Tiempo promedio de empaque
  - Unidades procesadas

Vistas disponibles:
  - Mi Desempeño     (todos los roles)
  - Mi Historial     (todos los roles)
  - Global           (Jefe_Bodega, Admin)
  - Por Usuario      (Jefe_Bodega, Admin)
  - Rankings         (Jefe_Bodega, Admin)
```

---

### 10. Facturación

Módulo de cierre del ciclo de ventas:

```
Flujo:
  1. Facturación recibe órdenes en estado "Lista_Facturar"
  2. Verifica los detalles de picking y empaque
  3. Genera factura con numeración consecutiva
  4. Orden pasa a estado "Facturada"
  5. Factura queda registrada con: número, fecha, totales, usuario
```

---

### 11. Transferencias entre Bodegas

Para empresas con múltiples puntos de almacenamiento:

```
1. Seleccionar bodega origen y destino
2. Seleccionar productos y cantidades
3. Confirmar transferencia → ajuste automático de inventarios
4. Posibilidad de cancelar mientras está en tránsito
```

---

## API REST — Referencia Completa

### Base URL
```
Desarrollo:   http://localhost:3000
Producción:   https://<tu-api>.azurewebsites.net
```

### Autenticación
Todos los endpoints (excepto `/api/auth/login` y `/api/auth/register`) requieren:
```
Authorization: Bearer <jwt_token>
```

### Formato de Respuesta
```json
{
  "success": true,
  "message": "Descripción del resultado",
  "data": { ... }
}
```

---

#### Auth — `/api/auth`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/login` | Público | Iniciar sesión |
| `POST` | `/register` | Público | Registrar usuario |
| `GET` | `/profile` | Privado | Obtener perfil actual |
| `PUT` | `/change-password` | Privado | Cambiar contraseña |

---

#### Clientes — `/api/clientes`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `GET` | `/` | Todos | Listar clientes |
| `GET` | `/:id` | Todos | Obtener cliente |
| `POST` | `/` | Vendedor, Jefe_Bodega, Admin | Crear cliente |
| `PUT` | `/:id` | Vendedor, Jefe_Bodega, Admin | Actualizar cliente |
| `PATCH` | `/:id/toggle-active` | Jefe_Bodega, Admin | Activar/desactivar |
| `DELETE` | `/:id` | Admin | Eliminar cliente |

---

#### Productos — `/api/productos`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `GET` | `/` | Todos | Listar productos (con filtros) |
| `GET` | `/categorias` | Todos | Obtener categorías |
| `GET` | `/subcategorias` | Todos | Obtener subcategorías |
| `GET` | `/marcas` | Todos | Obtener marcas |
| `GET` | `/:id` | Todos | Detalle de producto |
| `GET` | `/:id/ubicaciones` | Todos | Ubicaciones del producto |
| `GET` | `/:id/ordenes` | Todos | Historial de órdenes |
| `GET` | `/:id/disponibilidad` | Todos | Stock disponible |
| `POST` | `/verificar-disponibilidad` | Todos | Verificar múltiples productos |
| `POST` | `/` | Jefe_Bodega, Admin | Crear producto |
| `PUT` | `/:id` | Jefe_Bodega, Admin | Actualizar producto |
| `PATCH` | `/:id/stock` | Jefe_Bodega, Admin | Ajustar stock |
| `PATCH` | `/:id/imagen` | Jefe_Bodega, Admin | Actualizar imagen |
| `DELETE` | `/:id` | Admin | Eliminar producto |

---

#### Órdenes — `/api/ordenes`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `GET` | `/` | Todos | Listar órdenes (con filtros) |
| `GET` | `/pendientes` | Jefe_Bodega, Admin | Órdenes por aprobar |
| `GET` | `/:id` | Todos | Detalle de orden |
| `GET` | `/:id/picking-list` | Operario, Jefe_Bodega, Admin | Lista de picking optimizada |
| `POST` | `/` | Vendedor, Jefe_Bodega, Admin | Crear orden |
| `PATCH` | `/:id/estado` | Jefe_Bodega, Admin | Cambiar estado |
| `PATCH` | `/:id/asignar` | Jefe_Bodega, Admin | Asignar operario |
| `POST` | `/:id/iniciar-alistamiento` | Operario, Jefe_Bodega, Admin | Iniciar picking |
| `PATCH` | `/:id/alistamiento` | Operario, Jefe_Bodega, Admin | Registrar cantidades |
| `PATCH` | `/detalles/:id/cantidad-alistada` | Operario, Jefe_Bodega, Admin | Guardar cantidad por ítem |
| `POST` | `/:id/finalizar-alistamiento` | Operario, Jefe_Bodega, Admin | Completar picking |
| `POST` | `/:id/iniciar-empaque` | Operario, Jefe_Bodega, Admin | Iniciar empaque |
| `PATCH` | `/:id/empaque` | Operario, Jefe_Bodega, Admin | Registrar empaque |
| `PATCH` | `/detalles/:id/cantidad-empacada` | Operario, Jefe_Bodega, Admin | Guardar cantidad por ítem |
| `POST` | `/:id/finalizar-empaque` | Operario, Jefe_Bodega, Admin | Completar empaque |
| `POST` | `/:id/observaciones` | Todos | Agregar observación |
| `POST` | `/:id/finalizar-revision` | Facturación, Jefe_Bodega, Admin | Marcar lista para facturar |
| `DELETE` | `/:id` | Admin | Eliminar orden |

---

#### Ubicaciones — `/api/ubicaciones`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `GET` | `/` | Todos | Listar ubicaciones |
| `GET` | `/:id` | Todos | Detalle de ubicación |
| `GET` | `/:id/inventario` | Todos | Inventario en ubicación |
| `GET` | `/sugerencias-productos` | Todos | Autocomplete de productos |
| `GET` | `/sugerencias-ubicaciones` | Todos | Autocomplete de ubicaciones |
| `GET` | `/buscar-producto` | Todos | Buscar por producto |
| `GET` | `/buscar-ubicacion` | Todos | Buscar por ubicación |
| `POST` | `/` | Jefe_Bodega, Admin | Crear ubicación |
| `PUT` | `/:id` | Jefe_Bodega, Admin | Actualizar ubicación |
| `POST` | `/:id/asignar-producto` | Jefe_Bodega, Admin | Asignar producto |
| `PATCH` | `/:id/cantidad` | Jefe_Bodega, Admin | Actualizar cantidad |
| `POST` | `/mover-producto` | Jefe_Bodega, Admin | Mover entre ubicaciones |
| `DELETE` | `/:id/productos/:pid` | Jefe_Bodega, Admin | Quitar producto |
| `DELETE` | `/:id` | Admin | Eliminar ubicación |

---

#### Recepciones — `/api/recepciones`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `GET` | `/` | Jefe_Bodega, Admin | Listar recepciones |
| `GET` | `/:id` | Jefe_Bodega, Admin | Detalle con ítems |
| `POST` | `/` | Jefe_Bodega, Admin | Crear recepción |
| `DELETE` | `/:id` | Admin | Eliminar recepción |

---

#### Averías — `/api/averias`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `GET` | `/` | Todos | Listar averías (con filtros) |
| `GET` | `/stats` | Todos | Estadísticas de daños |
| `GET` | `/:id` | Todos | Detalle con evidencias |
| `GET` | `/:id/evidencias` | Todos | Todas las fotos |
| `POST` | `/` | Todos | Reportar nueva avería |
| `POST` | `/:id/evidencias` | Todos | Agregar foto |
| `PATCH` | `/:id/estado` | Jefe_Bodega, Admin | Cambiar estado (ajusta inventario) |
| `PUT` | `/:id` | Jefe_Bodega, Admin | Actualizar datos |
| `DELETE` | `/:id/evidencias/:eid` | Jefe_Bodega, Admin | Quitar foto |
| `DELETE` | `/:id` | Admin | Eliminar avería |

---

#### Desempeño — `/api/desempeno`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `GET` | `/mi-desempeno` | Todos | Mis KPIs personales |
| `GET` | `/mi-historial` | Todos | Mi historial de actividad |
| `GET` | `/global` | Jefe_Bodega, Admin | KPIs globales del equipo |
| `GET` | `/por-usuario` | Jefe_Bodega, Admin | Comparativa por operario |
| `GET` | `/usuario/:id` | Jefe_Bodega, Admin | KPIs de un usuario |
| `GET` | `/usuario/:id/historial` | Jefe_Bodega, Admin | Historial de un usuario |
| `GET` | `/rankings` | Jefe_Bodega, Admin | Ranking de rendimiento |
| `GET` | `/operarios` | Jefe_Bodega, Admin | Lista de operarios |

---

#### Otros módulos

| Módulo | Base | Endpoints principales |
|---|---|---|
| Bodegas | `/api/bodegas` | CRUD + toggle-active + inventario |
| Transferencias | `/api/transferencias` | Crear + cancelar + listar |
| Inventario | `/api/inventario` | GET / (con info de reservas) |
| Proveedores | `/api/proveedores` | CRUD completo |
| Upload | `/api/upload` | POST /images, POST /image, DELETE /:filename |
| Sistema | `/health`, `/api/config` | Health check y configuración |

---

## Frontend — Páginas y Componentes

### Sistema de Rutas (`App.jsx`)

```jsx
<Routes>
  {/* Públicas */}
  <PublicRoute path="/login" />
  <PublicRoute path="/register" />

  {/* Protegidas — requieren autenticación */}
  <ProtectedRoute path="/dashboard" />
  <ProtectedRoute path="/productos" />
  <ProtectedRoute path="/ordenes" />
  <ProtectedRoute path="/ordenes/aprobar"     roles={['Jefe_Bodega','Admin']} />
  <ProtectedRoute path="/clientes"            roles={['Vendedor','Jefe_Bodega','Facturacion','Admin']} />
  <ProtectedRoute path="/ubicaciones"         roles={['Jefe_Bodega','Operario','Facturacion','Admin']} />
  <ProtectedRoute path="/actividades/alistamiento"      roles={['Operario','Jefe_Bodega','Admin']} />
  <ProtectedRoute path="/actividades/alistamiento/:id"  roles={['Operario','Jefe_Bodega','Admin']} />
  <ProtectedRoute path="/actividades/empaque"           roles={['Operario','Jefe_Bodega','Admin']} />
  <ProtectedRoute path="/actividades/empaque/:id"       roles={['Operario','Jefe_Bodega','Admin']} />
  <ProtectedRoute path="/recepciones"         roles={['Jefe_Bodega','Admin']} />
  <ProtectedRoute path="/proveedores"         roles={['Jefe_Bodega','Admin']} />
  <ProtectedRoute path="/averias" />
  <ProtectedRoute path="/almacenes"           roles={['Jefe_Bodega','Admin']} />
  <ProtectedRoute path="/desempeno"           roles={['Operario','Jefe_Bodega','Admin']} />
  <ProtectedRoute path="/facturacion"         roles={['Facturacion','Jefe_Bodega','Admin']} />
</Routes>
```

### Estado Global (`authStore.js` con Zustand)

```javascript
// Estado persistido en localStorage
{
  user: {
    usuario_id, nombre, email, rol, activo
  },
  token: "eyJhbGci...",
  isAuthenticated: true,

  // Acciones
  login(credentials) → actualiza estado + guarda en localStorage
  logout()           → limpia todo
  register(data)     → registra y autentica
}
```

### Cliente HTTP (`api.js`)

```javascript
// Instancia Axios configurada
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
});

// Interceptor: inyecta token automáticamente
api.interceptors.request.use(config => {
  const token = authStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: maneja expiración de sesión
api.interceptors.response.use(null, error => {
  if (error.response?.status === 401) {
    authStore.getState().logout();
    window.location.href = '/login';
  }
  throw error;
});
```

---

## Optimización de Rutas de Picking

Ubicado en `back/src/utils/picking-routes.js`, este módulo optimiza el recorrido del operario en la bodega:

### Algoritmo

```javascript
async function getOptimizedPickingList(orden_id) {
  // 1. Obtener todos los ítems de la orden con sus ubicaciones
  const items = await query(`
    SELECT od.*, p.*, u.*, iu.*
    FROM orden_detalles od
    JOIN productos p ON od.producto_id = p.producto_id
    LEFT JOIN inventario_ubicaciones iu ON p.producto_id = iu.producto_id
    LEFT JOIN ubicaciones u ON iu.ubicacion_id = u.ubicacion_id
    WHERE od.orden_id = $1
    ORDER BY
      u.orden_ruta ASC NULLS LAST,    -- Ruta de recorrido optimizada
      u.estanteria ASC NULLS LAST,    -- Sección A, B, C...
      u.fila ASC NULLS LAST,          -- Fila 1, 2, 3...
      u.nivel ASC NULLS LAST          -- Nivel 1 (suelo) primero
  `, [orden_id]);

  // 2. Calcular estadísticas
  const stats = {
    total_items: items.length,
    total_unidades: Σ(cantidad_pedida),
    ubicaciones_a_visitar: count(ubicaciones únicas),
    items_sin_ubicacion: count(sin ubicación asignada)
  };

  // 3. Retornar lista ordenada + estadísticas
  return { items, stats };
}
```

### Ventajas

- **Recorrido en serpentina**: El operario no retrocede — sigue el `orden_ruta` definido por el jefe de bodega
- **Agrupa por pasillo**: Todos los ítems de un mismo pasillo se recogen juntos
- **Nivel suelo primero**: Productos al nivel 1 antes de subir al nivel 2 o 3
- **Identifica faltantes**: Productos sin ubicación asignada se agrupan al final
- **Soporte multi-ubicación**: Si un producto está en varias ubicaciones, usa la primaria

---

## Sistema de Inventario

### Doble seguimiento de stock

```
productos.stock_actual     = Stock físico total en bodega
productos.stock_reservado  = Stock comprometido en órdenes aprobadas
stock_disponible           = stock_actual - stock_reservado
```

### Flujo de reservas (opcional)

Controlado por variable de entorno `ENABLE_INVENTORY_RESERVATION`:

```
Orden creada:
  → Sin cambio en stock

Orden aprobada:
  → stock_reservado += cantidad_pedida

Picking completado:
  → stock_actual    -= cantidad_alistada
  → stock_reservado -= cantidad_pedida

Orden rechazada:
  → stock_reservado -= cantidad_pedida (libera reserva)
```

### Inventario por ubicación

```sql
-- Cada producto puede estar en múltiples ubicaciones
inventario_ubicaciones:
  EST-A-1-1 │ Producto X │ 50 unidades │ ubicación primaria
  EST-B-2-1 │ Producto X │ 20 unidades │ ubicación secundaria

-- La picking list usa primero la ubicación primaria
```

---

## Configuración y Despliegue

### Requisitos del sistema

- **Node.js**: >= 18.x
- **PostgreSQL**: >= 14.x
- **npm**: >= 9.x

---

## Variables de Entorno

### Backend (`back/.env`)

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=wms_db

# JWT
JWT_SECRET=clave_secreta_muy_segura_aqui
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Funcionalidades opcionales
ENABLE_INVENTORY_RESERVATION=true
```

### Frontend (`front/.env.local`)

```env
VITE_API_URL=http://localhost:3000/api
```

Para producción en Azure:
```env
VITE_API_URL=https://tu-api.azurewebsites.net/api
```

---

## Guía de Inicio Rápido

### 1. Clonar y configurar

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd wms
```

### 2. Configurar la base de datos

```bash
# Crear la base de datos
psql -U postgres -c "CREATE DATABASE wms_db;"

# Aplicar el esquema
psql -U postgres -d wms_db -f back/database/schema.sql

# (Opcional) Cargar datos de prueba
psql -U postgres -d wms_db -f back/database/seed.sql
```

### 3. Configurar el backend

```bash
cd back

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL y JWT secret

# Iniciar en modo desarrollo (auto-reload)
npm run dev
```

El backend estará disponible en `http://localhost:3000`

**Verificar que funciona:**
```bash
curl http://localhost:3000/health
# → { "status": "ok", "timestamp": "...", "database": "connected" }
```

### 4. Configurar el frontend

```bash
cd front

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### 5. Primer acceso

Abrir `http://localhost:5173` en el navegador e iniciar sesión con:

```
Email:    admin@wms.com
Password: admin123
```

### Comandos útiles

```bash
# Backend
npm run dev    # Desarrollo con nodemon (auto-reload)
npm start      # Producción

# Frontend
npm run dev    # Servidor de desarrollo Vite
npm run build  # Build para producción (genera dist/)
npm run lint   # Lint del código
npm preview    # Vista previa del build de producción
```

---

## Despliegue en Azure

### Opción A: Azure Static Web Apps + Azure App Service

Esta es la configuración recomendada para producción:

```
┌─────────────────────────────────────────────────────┐
│  Azure Static Web Apps                               │
│  URL: https://<nombre>.azurestaticapps.net           │
│  Contenido: dist/ (build de React)                   │
│  Archivo: front/public/staticwebapp.config.json ✓   │
└──────────────────────────┬──────────────────────────┘
                           │ API calls
                           ▼
┌─────────────────────────────────────────────────────┐
│  Azure App Service (Node.js)                         │
│  URL: https://<nombre>.azurewebsites.net             │
│  Contenido: back/ (servidor Express)                 │
│  Base de datos: Azure Database for PostgreSQL        │
└─────────────────────────────────────────────────────┘
```

### Configuración incluida para Azure

**`front/public/staticwebapp.config.json`** — Para Azure Static Web Apps:
```json
{
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ]
}
```

**`front/public/web.config`** — Para Azure App Service (IIS):
```xml
<!-- Redirige todas las rutas a index.html para React Router -->
<rewrite>
  <rules>
    <rule name="React Routes" stopProcessing="true">
      <conditions>
        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
      </conditions>
      <action type="Rewrite" url="/index.html" />
    </rule>
  </rules>
</rewrite>
```

Ambos archivos se copian automáticamente al directorio `dist/` cuando ejecutas `npm run build`.

### Pasos de despliegue del frontend

```bash
cd front

# Configurar URL de la API de producción
echo "VITE_API_URL=https://tu-api.azurewebsites.net/api" > .env.production

# Generar build de producción
npm run build

# El directorio dist/ está listo para desplegarse en Azure
```

### Variables de entorno en Azure App Service

En el portal de Azure, configurar en **Configuración → Configuración de la aplicación**:

```
DB_HOST         = tu-servidor.postgres.database.azure.com
DB_PORT         = 5432
DB_USER         = adminuser@tu-servidor
DB_PASSWORD     = contraseña_segura
DB_NAME         = wms_db
JWT_SECRET      = clave_jwt_muy_larga_y_aleatoria
NODE_ENV        = production
CORS_ORIGIN     = https://tu-frontend.azurestaticapps.net
```

---

## Seguridad

### Medidas implementadas

| Área | Medida |
|---|---|
| Contraseñas | Hash con bcrypt (factor 10) |
| Sesiones | JWT con expiración de 24h |
| Autorización | RBAC en cada endpoint sensible |
| CORS | Orígenes permitidos configurables |
| SQL Injection | Consultas parametrizadas con `pg` |
| Uploads | Validación de tipo de archivo con Multer |
| Errores | No se exponen detalles internos en producción |

### Flujo JWT

```
1. Login: POST /api/auth/login
   → Backend valida email/password
   → Genera JWT firmado con JWT_SECRET
   → Devuelve token (24h) + refreshToken (7d)

2. Requests autenticadas:
   → Frontend incluye: Authorization: Bearer <token>
   → Backend verifica firma y expiración
   → Extrae { usuario_id, rol } del payload
   → Autoriza según rol

3. Token expirado:
   → Backend responde 401
   → Frontend limpia localStorage
   → Redirige a /login
```

---

## Manejo de Errores

### Backend — Respuestas de error estándar

```json
// 400 Bad Request
{ "success": false, "message": "Datos inválidos: el campo 'email' es requerido" }

// 401 Unauthorized
{ "success": false, "message": "Token inválido o expirado" }

// 403 Forbidden
{ "success": false, "message": "No tienes permisos para realizar esta acción" }

// 404 Not Found
{ "success": false, "message": "Recurso no encontrado" }

// 500 Internal Server Error (producción: sin detalles)
{ "success": false, "message": "Error interno del servidor" }
```

### Transacciones de base de datos

Para operaciones que modifican múltiples tablas se usan transacciones explícitas:

```javascript
const client = await getClient();
try {
  await client.query('BEGIN');

  // Operación 1: crear orden
  await client.query('INSERT INTO ordenes_venta ...');

  // Operación 2: crear detalles
  await client.query('INSERT INTO orden_detalles ...');

  // Operación 3: reservar stock
  await client.query('UPDATE productos SET stock_reservado ...');

  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');  // Revierte todo si falla algo
  throw error;
} finally {
  client.release();
}
```

---

## Endpoints de Sistema

```bash
# Health check
GET http://localhost:3000/health
→ { "status": "ok", "database": "connected", "timestamp": "..." }

# Información de la API
GET http://localhost:3000/
→ { "name": "WMS API", "version": "...", "endpoints": [...] }

# Configuración del sistema
GET http://localhost:3000/api/config
→ { "features": { "inventory_reservation": true }, ... }
```

---

## Licencia

Este proyecto fue desarrollado como solución privada de gestión de almacén.

---

*Documentación generada para WMS v1.0 — Última actualización: Febrero 2026*

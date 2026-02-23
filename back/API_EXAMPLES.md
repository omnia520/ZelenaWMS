# 📖 Ejemplos de API - Sistema WMS

Colección de ejemplos de requests para todos los endpoints de la API.

## 🔐 Autenticación

### Login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@wms.com",
  "password": "admin123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "usuario_id": 1,
      "nombre": "Administrador",
      "email": "admin@wms.com",
      "rol": "Administrador"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Registrar Usuario
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "nombre": "Pedro Sánchez",
  "email": "pedro@wms.com",
  "password": "password123",
  "telefono": "3001234567",
  "rol": "Vendedor"
}
```

### Obtener Perfil
```http
GET http://localhost:3000/api/auth/profile
Authorization: Bearer {token}
```

### Cambiar Contraseña
```http
PUT http://localhost:3000/api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "admin123",
  "newPassword": "newpassword456"
}
```

---

## 👥 Clientes

### Crear Cliente
```http
POST http://localhost:3000/api/clientes
Authorization: Bearer {token}
Content-Type: application/json

{
  "nit_cc": "900555666-7",
  "razon_social": "Distribuidora La Económica S.A.S",
  "telefono": "6012345678",
  "email": "ventas@laeconomica.com",
  "ciudad": "Bogotá",
  "direccion": "Carrera 50 #123-45"
}
```

### Listar Clientes
```http
GET http://localhost:3000/api/clientes
Authorization: Bearer {token}
```

### Listar Clientes Activos en Bogotá
```http
GET http://localhost:3000/api/clientes?activo=true&ciudad=Bogotá
Authorization: Bearer {token}
```

### Buscar Cliente
```http
GET http://localhost:3000/api/clientes?search=Distribuidora
Authorization: Bearer {token}
```

### Obtener Cliente por ID
```http
GET http://localhost:3000/api/clientes/1
Authorization: Bearer {token}
```

### Actualizar Cliente
```http
PUT http://localhost:3000/api/clientes/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "nit_cc": "900555666-7",
  "razon_social": "Distribuidora La Económica S.A.S",
  "telefono": "6019876543",
  "email": "contacto@laeconomica.com",
  "ciudad": "Bogotá",
  "direccion": "Carrera 50 #123-45 Oficina 201"
}
```

### Desactivar Cliente
```http
PATCH http://localhost:3000/api/clientes/1/toggle-active
Authorization: Bearer {token}
Content-Type: application/json

{
  "activo": false
}
```

---

## 📦 Productos

### Crear Producto
```http
POST http://localhost:3000/api/productos
Authorization: Bearer {token}
Content-Type: application/json

{
  "codigo": "GLOSS-001",
  "nombre": "Gloss Labial Transparente",
  "descripcion": "Brillo labial con acabado cristalino",
  "categoria": "Labiales",
  "precio_base": 22000,
  "stock_actual": 200,
  "imagen_url": "https://storage.firebase.com/gloss-transparente.jpg"
}
```

### Listar Productos
```http
GET http://localhost:3000/api/productos
Authorization: Bearer {token}
```

### Filtrar Productos por Categoría
```http
GET http://localhost:3000/api/productos?categoria=Labiales
Authorization: Bearer {token}
```

### Buscar Productos
```http
GET http://localhost:3000/api/productos?search=labial
Authorization: Bearer {token}
```

### Productos con Stock
```http
GET http://localhost:3000/api/productos?con_stock=true
Authorization: Bearer {token}
```

### Obtener Producto con Ubicaciones
```http
GET http://localhost:3000/api/productos/1/ubicaciones
Authorization: Bearer {token}
```

### Actualizar Producto
```http
PUT http://localhost:3000/api/productos/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "codigo": "LAB-001",
  "nombre": "Labial Mate Rojo Clásico Premium",
  "descripcion": "Labial de larga duración color rojo intenso con vitamina E",
  "categoria": "Labiales",
  "precio_base": 38000,
  "imagen_url": "https://storage.firebase.com/labial-rojo-v2.jpg",
  "activo": true
}
```

### Actualizar Stock
```http
PATCH http://localhost:3000/api/productos/1/stock
Authorization: Bearer {token}
Content-Type: application/json

{
  "cantidad": 50
}
```

### Actualizar Imagen
```http
PATCH http://localhost:3000/api/productos/1/imagen
Authorization: Bearer {token}
Content-Type: application/json

{
  "imagen_url": "https://storage.firebase.com/nueva-imagen.jpg"
}
```

### Obtener Categorías
```http
GET http://localhost:3000/api/productos/categorias
Authorization: Bearer {token}
```

---

## 📋 Órdenes de Venta

### Crear Orden
```http
POST http://localhost:3000/api/ordenes
Authorization: Bearer {token}
Content-Type: application/json

{
  "cliente_id": 1,
  "estado": "Borrador",
  "comentarios": "Cliente solicita entrega urgente",
  "detalles": [
    {
      "producto_id": 1,
      "cantidad_pedida": 20,
      "precio_unitario": 35000,
      "descuento_porcentaje": 5,
      "comentarios_item": "Verificar fecha de vencimiento"
    },
    {
      "producto_id": 6,
      "cantidad_pedida": 5,
      "precio_unitario": 65000,
      "descuento_porcentaje": 0,
      "comentarios_item": null
    }
  ]
}
```

### Listar Órdenes
```http
GET http://localhost:3000/api/ordenes
Authorization: Bearer {token}
```

### Filtrar Órdenes por Estado
```http
GET http://localhost:3000/api/ordenes?estado=Aprobada
Authorization: Bearer {token}
```

### Órdenes de un Vendedor
```http
GET http://localhost:3000/api/ordenes?vendedor_id=2
Authorization: Bearer {token}
```

### Órdenes Asignadas a un Alistador
```http
GET http://localhost:3000/api/ordenes?alistador_id=4
Authorization: Bearer {token}
```

### Obtener Orden Completa
```http
GET http://localhost:3000/api/ordenes/1
Authorization: Bearer {token}
```

### Obtener Picking List Optimizado
```http
GET http://localhost:3000/api/ordenes/1/picking-list
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "orden_id": 1,
    "numero_orden": "ORD-2024001",
    "cliente_nombre": "Distribuidora Belleza Total",
    "picking_list": [
      {
        "detalle_id": 1,
        "producto_id": 1,
        "producto_codigo": "LAB-001",
        "producto_nombre": "Labial Mate Rojo",
        "producto_imagen": "https://...",
        "cantidad_pedida": 20,
        "ubicaciones": [
          {
            "ubicacion_id": 1,
            "codigo": "A01-N1",
            "descripcion": "Estantería A - Fila 01 - Nivel 1",
            "orden_ruta": 1,
            "cantidad_en_ubicacion": 80,
            "es_primaria": true
          }
        ]
      }
    ],
    "estadisticas": {
      "total_items": 2,
      "total_unidades": 25,
      "ubicaciones_a_visitar": 3
    }
  }
}
```

### Aprobar Orden
```http
PATCH http://localhost:3000/api/ordenes/1/estado
Authorization: Bearer {token}
Content-Type: application/json

{
  "estado": "Aprobada"
}
```

### Rechazar Orden
```http
PATCH http://localhost:3000/api/ordenes/1/estado
Authorization: Bearer {token}
Content-Type: application/json

{
  "estado": "Rechazada",
  "motivo": "Cliente no tiene cupo disponible"
}
```

### Asignar Personal
```http
PATCH http://localhost:3000/api/ordenes/1/asignar
Authorization: Bearer {token}
Content-Type: application/json

{
  "alistador_id": 4,
  "empacador_id": 5
}
```

### Registrar Alistamiento
```http
PATCH http://localhost:3000/api/ordenes/1/alistamiento
Authorization: Bearer {token}
Content-Type: application/json

{
  "detalles": [
    {
      "detalle_id": 1,
      "cantidad_alistada": 20
    },
    {
      "detalle_id": 2,
      "cantidad_alistada": 5
    }
  ],
  "observacion": "Todo se encontró sin problemas"
}
```

### Registrar Empaque
```http
PATCH http://localhost:3000/api/ordenes/1/empaque
Authorization: Bearer {token}
Content-Type: application/json

{
  "detalles": [
    {
      "detalle_id": 1,
      "cantidad_empacada": 20
    },
    {
      "detalle_id": 2,
      "cantidad_empacada": 5
    }
  ],
  "observacion": "Empacado en 2 cajas"
}
```

### Agregar Observación
```http
POST http://localhost:3000/api/ordenes/1/observaciones
Authorization: Bearer {token}
Content-Type: application/json

{
  "tipo_proceso": "Alistamiento",
  "observacion": "Producto ubicado en zona temporal por falta de espacio",
  "detalle_id": 1,
  "foto_url": "https://storage.firebase.com/observacion.jpg"
}
```

---

## 📍 Ubicaciones

### Crear Ubicación
```http
POST http://localhost:3000/api/ubicaciones
Authorization: Bearer {token}
Content-Type: application/json

{
  "codigo": "D01-N1",
  "descripcion": "Estantería D - Fila 01 - Nivel 1",
  "estanteria": "D",
  "fila": "01",
  "nivel": "1",
  "orden_ruta": 11
}
```

### Listar Ubicaciones
```http
GET http://localhost:3000/api/ubicaciones
Authorization: Bearer {token}
```

### Filtrar Ubicaciones por Estantería
```http
GET http://localhost:3000/api/ubicaciones?estanteria=A
Authorization: Bearer {token}
```

### Obtener Inventario de Ubicación
```http
GET http://localhost:3000/api/ubicaciones/1/inventario
Authorization: Bearer {token}
```

### Asignar Producto a Ubicación
```http
POST http://localhost:3000/api/ubicaciones/1/asignar-producto
Authorization: Bearer {token}
Content-Type: application/json

{
  "producto_id": 15,
  "cantidad": 100,
  "es_primaria": true
}
```

### Actualizar Cantidad en Ubicación
```http
PATCH http://localhost:3000/api/ubicaciones/1/cantidad
Authorization: Bearer {token}
Content-Type: application/json

{
  "producto_id": 1,
  "cantidad": 20
}
```

---

## 📥 Recepciones

### Registrar Recepción
```http
POST http://localhost:3000/api/recepciones
Authorization: Bearer {token}
Content-Type: application/json

{
  "numero_documento": "REC-2024-005",
  "proveedor": "Distribuidora Internacional de Cosméticos",
  "fecha_recepcion": "2024-01-20",
  "observaciones": "Mercancía en perfecto estado",
  "foto_soporte": "https://storage.firebase.com/recepcion-foto.jpg",
  "detalles": [
    {
      "producto_id": 1,
      "cantidad_recibida": 100,
      "ubicacion_id": 1
    },
    {
      "producto_id": 6,
      "cantidad_recibida": 50,
      "ubicacion_id": 5
    }
  ]
}
```

### Listar Recepciones
```http
GET http://localhost:3000/api/recepciones
Authorization: Bearer {token}
```

### Filtrar Recepciones por Fecha
```http
GET http://localhost:3000/api/recepciones?fecha_desde=2024-01-01&fecha_hasta=2024-01-31
Authorization: Bearer {token}
```

### Buscar por Proveedor
```http
GET http://localhost:3000/api/recepciones?proveedor=Internacional
Authorization: Bearer {token}
```

### Obtener Recepción Completa
```http
GET http://localhost:3000/api/recepciones/1
Authorization: Bearer {token}
```

---

## ⚠️ Averías

### Reportar Avería
```http
POST http://localhost:3000/api/averias
Authorization: Bearer {token}
Content-Type: application/json

{
  "producto_id": 1,
  "cantidad": 5,
  "tipo_averia": "Daño",
  "descripcion": "Productos con empaque roto durante transporte",
  "ubicacion_id": 1,
  "foto_url": "https://storage.firebase.com/averia-foto.jpg"
}
```

### Listar Averías
```http
GET http://localhost:3000/api/averias
Authorization: Bearer {token}
```

### Filtrar Averías Abiertas
```http
GET http://localhost:3000/api/averias?estado=Abierta
Authorization: Bearer {token}
```

### Filtrar por Tipo
```http
GET http://localhost:3000/api/averias?tipo_averia=Daño
Authorization: Bearer {token}
```

### Obtener Avería por ID
```http
GET http://localhost:3000/api/averias/1
Authorization: Bearer {token}
```

### Actualizar Estado de Avería
```http
PATCH http://localhost:3000/api/averias/1/estado
Authorization: Bearer {token}
Content-Type: application/json

{
  "estado": "En_Revision"
}
```

### Cerrar Avería
```http
PATCH http://localhost:3000/api/averias/1/estado
Authorization: Bearer {token}
Content-Type: application/json

{
  "estado": "Cerrada"
}
```

---

## 📊 Flujo Completo de Ejemplo

### 1. Login como Vendedor
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "vendedor@wms.com",
  "password": "password123"
}
```

### 2. Crear Orden
```http
POST http://localhost:3000/api/ordenes
Authorization: Bearer {token_vendedor}
Content-Type: application/json

{
  "cliente_id": 1,
  "estado": "Pendiente_Aprobacion",
  "detalles": [...]
}
```

### 3. Login como Jefe de Bodega
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "jefe@wms.com",
  "password": "password123"
}
```

### 4. Aprobar y Asignar
```http
PATCH http://localhost:3000/api/ordenes/1/estado
Authorization: Bearer {token_jefe}
Content-Type: application/json

{
  "estado": "Aprobada"
}
```

```http
PATCH http://localhost:3000/api/ordenes/1/asignar
Authorization: Bearer {token_jefe}
Content-Type: application/json

{
  "alistador_id": 4,
  "empacador_id": 5
}
```

### 5. Login como Alistador
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "alistador@wms.com",
  "password": "password123"
}
```

### 6. Ver Picking List y Alistar
```http
GET http://localhost:3000/api/ordenes/1/picking-list
Authorization: Bearer {token_alistador}
```

```http
PATCH http://localhost:3000/api/ordenes/1/alistamiento
Authorization: Bearer {token_alistador}
Content-Type: application/json

{
  "detalles": [...],
  "observacion": "Completado"
}
```

---

## 🔍 Health Check

```http
GET http://localhost:3000/health
```

```http
GET http://localhost:3000/
```

---

**Nota:** Reemplaza `{token}` con el token JWT real obtenido del login.

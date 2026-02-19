# Módulo de Órdenes de Venta - Sistema WMS

## ✅ Funcionalidad Implementada

Se ha implementado un sistema completo de creación y gestión de órdenes de venta para el sistema WMS, permitiendo a los vendedores crear órdenes detalladas con todas las especificaciones requeridas.

## 🎨 Características del Frontend

### Páginas Creadas

1. **Ordenes.jsx** - Componente principal que maneja el estado
2. **OrdenForm.jsx** - Formulario completo para crear órdenes
3. **OrdenesList.jsx** - Lista de órdenes con filtros

## 🎯 Funcionalidades de Creación de Órdenes

### 1. Selección de Cliente ✅

- **Dropdown con todos los clientes activos**
- Muestra: Razón Social - NIT/CC
- Campo requerido
- Solo clientes activos disponibles

### 2. Agregar Productos ✅

- **Buscador inteligente de productos**
  - Búsqueda por nombre o código
  - Resultados en tiempo real
  - Vista de tarjetas con precio
- **Lista dinámica de productos**
  - Agregar múltiples productos
  - No permite duplicados
  - Fácil de eliminar

### 3. Configuración por Producto ✅

Para cada producto agregado, se puede configurar:

#### a) **Cantidad** ⭐ (Requerido)
- Campo numérico
- Mínimo: 1 unidad
- Validación en tiempo real

#### b) **Precio Unitario** ⭐ (Requerido, Editable)
- Precio base del producto pre-cargado
- Puede modificarse según negociación
- Formato: Pesos colombianos
- Mínimo: $0.01

#### c) **Descuento Porcentual** (Opcional)
- Aplicable por ítem
- Rango: 0% - 100%
- Descuento en porcentaje
- Se resta del subtotal del ítem

#### d) **Especificaciones/Comentarios** (Opcional)
- Campo de texto libre
- Para capturar requerimientos específicos:
  - Tono/Color
  - Talla
  - Acabado
  - Instrucciones especiales
  - etc.

### 4. Cálculos Automáticos ✅

El sistema calcula automáticamente:

- **Subtotal por ítem**: `(Cantidad × Precio) - Descuento`
- **Subtotal general**: Suma de todos los ítems
- **Descuento total**: Suma de todos los descuentos
- **IVA (19%)**: Aplicado al subtotal
- **Total final**: Subtotal + IVA

### 5. Comentarios Generales ✅

- Campo de texto para comentarios de la orden completa
- Útil para instrucciones generales o notas

### 6. Resumen Visual ✅

Panel de resumen con:
- Subtotal
- Descuento total (si aplica)
- IVA
- **Total final** (destacado)
- Cantidad de ítems
- Cantidad total de unidades

## 📋 Estructura de una Orden

```json
{
  "cliente_id": 1,
  "comentarios": "Entrega urgente",
  "estado": "Borrador",
  "detalles": [
    {
      "producto_id": 5,
      "cantidad_pedida": 10,
      "precio_unitario": 25000,
      "descuento_porcentaje": 5,
      "comentarios_item": "Color rojo mate, tono oscuro"
    },
    {
      "producto_id": 8,
      "cantidad_pedida": 5,
      "precio_unitario": 35000,
      "descuento_porcentaje": 0,
      "comentarios_item": "Talla M, acabado brillante"
    }
  ]
}
```

## 🔧 Backend (Ya Funcional)

El backend está **completamente implementado** con:

### Endpoint Principal

**POST** `/api/ordenes`

**Permisos**: Vendedor, Jefe_Bodega, Administrador

**Cálculos Automáticos del Backend:**
- Subtotal por ítem
- Descuentos aplicados
- IVA (19%)
- Total de la orden
- Número de orden único (ORD-timestamp)

### Validaciones Backend

✅ Cliente requerido
✅ Al menos un producto en detalles
✅ Cantidades > 0
✅ Precios > 0
✅ Descuentos entre 0-100%
✅ Transacción atómica (todo o nada)

### Estados de Orden

1. **Borrador** - Estado inicial
2. **Pendiente_Aprobacion** - Enviada para revisión
3. **Aprobada** - Aprobada por jefe de bodega
4. **En_Alistamiento** - Siendo preparada
5. **En_Empaque** - Siendo empacada
6. **Lista_Facturar** - Lista para facturar
7. **Facturada** - Proceso completo
8. **Rechazada** - Rechazada

## 🎨 Diseño del Formulario

### Sección 1: Cliente
- Selector de cliente
- Comentarios generales
- Card blanco con borde

### Sección 2: Productos
- Botón "Agregar Producto"
- Buscador expandible (fondo azul claro)
- Lista de productos agregados (cards con borde)
- Cada producto muestra:
  - Nombre y código
  - 4 campos en grid: Cantidad, Precio, Descuento, Subtotal
  - Campo de especificaciones
  - Botón eliminar (rojo)

### Sección 3: Resumen
- Card con gradiente (primary-50 to blue-50)
- Desglose de totales
- Total destacado en grande
- Contador de ítems y unidades

### Sección 4: Acciones
- Botón Cancelar (gris)
- Botón Crear Orden (primary, con animación)
- Estados de carga

## 🚀 Cómo Usar

### 1. Iniciar Sesión como Vendedor

```bash
# Backend
cd back
npm run dev

# Frontend
cd front
npm run dev
```

**Credenciales de prueba:**
- Email: admin@wms.com
- Password: admin123

### 2. Crear Nueva Orden

1. **Ir a Órdenes**
   - Click en "Órdenes" en el menú lateral
   - Click en "Nueva Orden"

2. **Seleccionar Cliente**
   - Despliega el selector
   - Elige un cliente
   - (Opcional) Agrega comentarios generales

3. **Agregar Productos**
   - Click en "Agregar Producto"
   - Busca por nombre o código
   - Click en el producto deseado

4. **Configurar Cada Producto**
   - **Cantidad**: Ingresa unidades
   - **Precio**: Modifica si es necesario
   - **Descuento**: Aplica % si corresponde
   - **Especificaciones**: Añade detalles como:
     - "Color azul oscuro"
     - "Talla L"
     - "Acabado mate"
     - "Con empaque especial"

5. **Revisar Totales**
   - Verifica el resumen
   - Confirma subtotales e IVA

6. **Crear Orden**
   - Click en "Crear Orden"
   - Espera confirmación
   - Serás redirigido a la lista

## 📱 Ejemplo de Uso Real

### Caso: Orden de Cosméticos

**Cliente:** Beauty Store S.A.S

**Productos:**

1. **Labial Rojo Mate**
   - Cantidad: 20 unidades
   - Precio: $25,000
   - Descuento: 10%
   - Especificaciones: "Tono #45 Rojo Cereza, acabado mate"

2. **Base Líquida**
   - Cantidad: 15 unidades
   - Precio: $45,000
   - Descuento: 0%
   - Especificaciones: "Tono Natural, cobertura media"

3. **Máscara de Pestañas**
   - Cantidad: 30 unidades
   - Precio: $18,000
   - Descuento: 5%
   - Especificaciones: "Negro intenso, efecto volumen"

**Comentarios Generales:** "Entrega urgente para lanzamiento de campaña. Requiere empaque especial con logo de la campaña."

**Resultado:**
- Subtotal: $1,911,500
- Descuento Total: $78,000
- IVA (19%): $363,185
- **Total: $2,274,685**

## 🎯 Validaciones del Formulario

### Frontend (Inmediatas)

❌ **Bloquea envío si:**
- No hay cliente seleccionado
- No hay productos agregados
- Alguna cantidad es ≤ 0
- Algún precio es ≤ 0

✅ **Permite:**
- Descuento en 0%
- Comentarios vacíos
- Modificar precios

### Backend (Servidor)

❌ **Rechaza si:**
- Cliente no existe
- Producto no existe
- Datos numéricos inválidos
- Transacción falla

## 📊 Lista de Órdenes

### Características

✅ **Vista de Tarjetas**
- Grid responsivo (1-2 columnas)
- Información resumida
- Estado con badge de color

✅ **Filtros**
- Por estado
- Contador de resultados

✅ **Información Mostrada**
- Número de orden
- Cliente
- Vendedor
- Fecha de creación
- Total
- Estado actual

✅ **Acciones**
- Ver detalles (próximamente)

## 🎨 Estados y Colores

| Estado | Color | Descripción |
|--------|-------|-------------|
| Borrador | Gris | Recién creada |
| Pendiente Aprobación | Amarillo | Esperando revisión |
| Aprobada | Verde | Lista para procesar |
| En Alistamiento | Azul | Siendo preparada |
| En Empaque | Morado | Siendo empacada |
| Lista Facturar | Índigo | Lista para facturar |
| Facturada | Verde Esmeralda | Completada |
| Rechazada | Rojo | Rechazada |

## 🔐 Permisos por Rol

| Acción | Vendedor | Jefe_Bodega | Alistador | Empacador | Facturación | Admin |
|--------|----------|-------------|-----------|-----------|-------------|-------|
| Ver órdenes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear orden | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Editar orden (Borrador) | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Aprobar orden | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Alistamiento | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Empaque | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Facturar | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

## 🧪 Casos de Prueba

### Caso 1: Orden Simple
```
Cliente: Cliente Test
Productos: 1 producto
Cantidad: 5 unidades
Precio: $10,000
Descuento: 0%
Especificaciones: -
```
**Resultado:** Total = $59,500 (incluye IVA)

### Caso 2: Orden con Descuentos
```
Cliente: Cliente VIP
Productos: 2 productos
- Producto A: 10 unidades × $50,000, 15% descuento
- Producto B: 5 unidades × $30,000, 5% descuento
Especificaciones: Colores específicos para ambos
```
**Resultado:** Total calculado con descuentos + IVA

### Caso 3: Orden con Especificaciones Detalladas
```
Cliente: Boutique Fashion
Productos: 3 productos diferentes
Cada uno con especificaciones de:
- Color
- Talla
- Acabado
```
**Resultado:** Orden creada con todas las especificaciones guardadas

## 🐛 Troubleshooting

### No aparece el botón "Nueva Orden"
- Verifica tu rol (debe ser Vendedor, Jefe_Bodega o Admin)
- Cierra sesión y vuelve a iniciar

### Error al crear orden
- Verifica que el backend esté corriendo
- Revisa la consola del navegador
- Confirma que la base de datos esté conectada

### No se pueden modificar los precios
- Los precios son editables, verifica que el campo no esté deshabilitado
- Intenta hacer clic en el campo

### Los totales no se actualizan
- Verifica que los valores sean numéricos válidos
- Refresca la página si es necesario

## 🎉 ¡Listo!

El módulo de órdenes está completamente funcional. Los vendedores pueden:

✅ Seleccionar clientes
✅ Agregar múltiples productos
✅ Configurar cantidades
✅ Modificar precios por ítem
✅ Aplicar descuentos porcentuales
✅ Agregar especificaciones detalladas (color, tono, talla, etc.)
✅ Ver cálculos automáticos en tiempo real
✅ Crear órdenes con estado "Borrador"
✅ Ver listado de todas las órdenes
✅ Filtrar órdenes por estado

## 📸 Flujo Visual

```
┌─────────────────────────────────────┐
│   1. Seleccionar Cliente            │
│   [Dropdown de clientes]            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   2. Agregar Productos              │
│   [Buscador] → [Click en producto]  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   3. Configurar Cada Producto       │
│   • Cantidad                        │
│   • Precio (editable)               │
│   • Descuento %                     │
│   • Especificaciones                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   4. Revisar Resumen                │
│   Subtotal, Descuentos, IVA, Total  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   5. Crear Orden                    │
│   [Botón "Crear Orden"]             │
└─────────────────────────────────────┘
```

¡El sistema está listo para gestionar órdenes de venta con todas las especificaciones requeridas! 🚀

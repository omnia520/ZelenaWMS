# Datos de Prueba para Módulo de Actividades

## Cómo ejecutar el script

Desde la terminal, ejecuta:

```bash
# Opción 1: Desde psql
psql -U postgres -d wms_db -f database/seed_actividades.sql

# Opción 2: Conectarse primero y luego ejecutar
psql -U postgres -d wms_db
\i database/seed_actividades.sql
```

## Usuarios creados

Todos los usuarios tienen la contraseña: **password123**

| Email | Nombre | Rol | Para qué usar |
|-------|--------|-----|---------------|
| `alistador1@wms.com` | Juan Pérez | Alistador | Ver y procesar órdenes de alistamiento |
| `alistador2@wms.com` | María García | Alistador | Ver y procesar órdenes de alistamiento |
| `empacador1@wms.com` | Carlos Rodríguez | Empacador | Ver y procesar órdenes de empaque |
| `empacador2@wms.com` | Ana Martínez | Empacador | Ver y procesar órdenes de empaque |
| `vendedor1@wms.com` | Luis Sánchez | Vendedor | Crear órdenes de venta |
| `jefe@wms.com` | Sofia López | Jefe_Bodega | Aprobar órdenes y asignar personal |

## Órdenes creadas

### ORD-2024-001 - Estado: **Aprobada**
- **Asignada a:** alistador1@wms.com (Juan Pérez)
- **Cliente:** Distribuidora El Éxito S.A.S
- **Productos:** 4 items (Aceite, Arroz, Papel Higiénico, Café)
- **Total:** $595,000
- **Qué hacer:** Inicia sesión como `alistador1@wms.com` → Ve a Actividades → Alistamiento → Click en "Comenzar"

### ORD-2024-002 - Estado: **Aprobada**
- **Asignada a:** alistador2@wms.com (María García)
- **Cliente:** Supermercados La Canasta
- **Productos:** 3 items (Azúcar, Detergente, Jabón)
- **Total:** $416,500
- **Qué hacer:** Inicia sesión como `alistador2@wms.com` → Ve a Actividades → Alistamiento → Click en "Comenzar"

### ORD-2024-003 - Estado: **En_Alistamiento**
- **Asignada a:** alistador1@wms.com (Juan Pérez)
- **Cliente:** Comercial Los Andes Ltda
- **Productos:** 3 items (2 ya alistados, 1 pendiente)
- **Total:** $333,200
- **Qué hacer:** Inicia sesión como `alistador1@wms.com` → Ve a Actividades → Alistamiento → Click en "Reanudar"
- **Nota:** Esta orden ya tiene alistamiento parcialmente completado

### ORD-2024-004 - Estado: **Listo_Para_Empacar**
- **Asignada a:** empacador1@wms.com (Carlos Rodríguez)
- **Cliente:** Mayorista Costa Azul
- **Productos:** 4 items (todos alistados)
- **Total:** $535,500
- **Qué hacer:** Inicia sesión como `empacador1@wms.com` → Ve a Actividades → Empaque → Click en "Comenzar"

### ORD-2024-005 - Estado: **En_Empaque**
- **Asignada a:** empacador2@wms.com (Ana Martínez)
- **Cliente:** Tiendas El Ahorro
- **Productos:** 3 items (2 empacados, 1 pendiente)
- **Total:** $380,800
- **Qué hacer:** Inicia sesión como `empacador2@wms.com` → Ve a Actividades → Empaque → Click en "Reanudar"
- **Nota:** Esta orden ya tiene empaque parcialmente completado

## Datos adicionales creados

- **5 Clientes** de diferentes ciudades
- **12 Productos** en diversas categorías (Alimentos, Aseo, Cuidado Personal)
- **10 Ubicaciones** en diferentes estanterías (A1, A2, B1, B2)
- **Inventario asignado** a cada ubicación para poder hacer picking

## Flujo de prueba completo

### 1. Probar Alistamiento

**Login:** `alistador1@wms.com` / `password123`

1. Ve a "Actividades" en el menú lateral
2. Click en "Alistamiento"
3. Verás 2 órdenes:
   - **ORD-2024-001** con botón "Comenzar" (estado Aprobada)
   - **ORD-2024-003** con botón "Reanudar" (estado En_Alistamiento)

4. Click en "Comenzar" en ORD-2024-001:
   - Verás 4 productos
   - Ingresa cantidades en cada input
   - Click en "Guardar" para cada producto
   - Verás un ✓ verde al guardar
   - Agrega observaciones (opcional)
   - Click en "Finalizar Alistamiento"
   - La orden pasará a estado "Listo_Para_Empacar"

5. Click en "Reanudar" en ORD-2024-003:
   - Verás que 2 productos ya tienen ✓ verde (guardados)
   - Solo necesitas completar el producto pendiente
   - Finaliza el alistamiento

### 2. Probar Empaque

**Login:** `empacador1@wms.com` / `password123`

1. Ve a "Actividades" → "Empaque"
2. Verás ORD-2024-004 lista para empacar
3. Click en "Comenzar":
   - Verás las cantidades alistadas de referencia
   - Ingresa las cantidades empacadas
   - Guarda cada producto
   - Verás los ✓ verdes
   - Agrega observaciones del empacador
   - Click en "Finalizar Empaque"
   - La orden pasará a estado "Listo_Para_Despachar"

### 3. Verificar persistencia

1. Cierra sesión y vuelve a iniciar
2. Ve a una orden que estabas procesando
3. Verifica que los ✓ verdes siguen ahí
4. Las cantidades guardadas se mantienen
5. Las observaciones están guardadas

## Limpiar datos de prueba

Si necesitas eliminar los datos de prueba:

```sql
-- Eliminar órdenes de prueba
DELETE FROM orden_detalles WHERE orden_id IN (SELECT orden_id FROM ordenes_venta WHERE numero_orden LIKE 'ORD-2024-%');
DELETE FROM ordenes_venta WHERE numero_orden LIKE 'ORD-2024-%';

-- Eliminar usuarios de prueba (opcional)
DELETE FROM usuarios WHERE email LIKE '%@wms.com' AND email != 'admin@wms.com';

-- Eliminar productos de prueba (opcional)
DELETE FROM inventario_ubicaciones WHERE producto_id IN (SELECT producto_id FROM productos WHERE codigo LIKE 'PROD-%');
DELETE FROM productos WHERE codigo LIKE 'PROD-%';

-- Eliminar clientes de prueba (opcional)
DELETE FROM clientes WHERE nit_cc IN ('900123456-1', '800234567-2', '700345678-3', '600456789-4', '500567890-5');
```

## Notas importantes

- Las contraseñas están hasheadas con bcrypt (la misma que usa el admin)
- Las fechas se generan relativamente al momento de ejecución del script
- El inventario está configurado para soportar todos los pedidos
- Las ubicaciones están optimizadas para rutas de picking eficientes

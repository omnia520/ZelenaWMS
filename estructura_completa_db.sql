-- ============================================
-- Sistema de Gestión de Almacenes (WMS)
-- Estructura Completa de Base de Datos
-- PostgreSQL 17.6
-- ============================================

-- ============================================
-- FUNCIONES
-- ============================================

-- Función para actualizar fecha_actualizacion en inventario_ubicaciones
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- ============================================
-- TABLAS
-- ============================================

-- Tabla de Usuarios y Roles
CREATE TABLE usuarios (
    usuario_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(20) NOT NULL CHECK (rol IN (
        'Vendedor',
        'Jefe_Bodega',
        'Alistador',
        'Empacador',
        'Facturacion',
        'Administrador'
    )),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    password_hash VARCHAR(255)
);

-- Tabla de Clientes
CREATE TABLE clientes (
    cliente_id SERIAL PRIMARY KEY,
    nit_cc VARCHAR(20) UNIQUE NOT NULL,
    razon_social VARCHAR(200) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    ciudad VARCHAR(50),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por INTEGER,
    FOREIGN KEY (creado_por) REFERENCES usuarios(usuario_id)
);

-- Tabla de Productos
CREATE TABLE productos (
    producto_id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    precio_base DECIMAL(10,2) NOT NULL,
    stock_actual INTEGER DEFAULT 0,
    imagen_url VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de Ubicaciones de Almacén
CREATE TABLE ubicaciones (
    ubicacion_id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descripcion VARCHAR(100),
    estanteria VARCHAR(10),
    fila VARCHAR(10),
    nivel VARCHAR(10),
    orden_ruta INTEGER DEFAULT 0,
    activa BOOLEAN DEFAULT TRUE
);

-- Tabla de Órdenes de Venta
CREATE TABLE ordenes_venta (
    orden_id SERIAL PRIMARY KEY,
    numero_orden VARCHAR(50) UNIQUE NOT NULL,
    cliente_id INTEGER NOT NULL,
    vendedor_id INTEGER NOT NULL,
    estado VARCHAR(30) DEFAULT 'Borrador' CHECK (estado IN (
        'Borrador',
        'Pendiente_Aprobacion',
        'Aprobada',
        'En_Alistamiento',
        'Listo_Para_Empacar',
        'En_Empaque',
        'Listo_Para_Despachar',
        'Lista_Facturar',
        'Facturada',
        'Rechazada'
    )),
    subtotal DECIMAL(12,2) DEFAULT 0,
    descuento_total DECIMAL(12,2) DEFAULT 0,
    impuestos_total DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    comentarios TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP,
    aprobado_por INTEGER,
    alistador_asignado INTEGER,
    empacador_asignado INTEGER,
    fecha_inicio_alistamiento TIMESTAMP,
    fecha_fin_alistamiento TIMESTAMP,
    fecha_inicio_empaque TIMESTAMP,
    fecha_fin_empaque TIMESTAMP,
    observacion_alistador TEXT,
    observacion_empacador TEXT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(cliente_id),
    FOREIGN KEY (vendedor_id) REFERENCES usuarios(usuario_id),
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(usuario_id),
    FOREIGN KEY (alistador_asignado) REFERENCES usuarios(usuario_id),
    FOREIGN KEY (empacador_asignado) REFERENCES usuarios(usuario_id)
);

-- Tabla de Detalles de Orden
CREATE TABLE orden_detalles (
    detalle_id SERIAL PRIMARY KEY,
    orden_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad_pedida INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    comentarios_item TEXT,
    cantidad_alistada INTEGER DEFAULT 0,
    cantidad_empacada INTEGER DEFAULT 0,
    alistamiento_completado BOOLEAN DEFAULT FALSE,
    empaque_completado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (orden_id) REFERENCES ordenes_venta(orden_id),
    FOREIGN KEY (producto_id) REFERENCES productos(producto_id)
);

-- Tabla de Recepciones de Mercancía
CREATE TABLE recepciones (
    recepcion_id SERIAL PRIMARY KEY,
    numero_documento VARCHAR(50) NOT NULL,
    proveedor VARCHAR(200) NOT NULL,
    fecha_recepcion DATE NOT NULL,
    usuario_recibe INTEGER NOT NULL,
    observaciones TEXT,
    foto_soporte VARCHAR(500),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_recibe) REFERENCES usuarios(usuario_id)
);

-- Tabla de Detalles de Recepción
CREATE TABLE recepcion_detalles (
    detalle_recepcion_id SERIAL PRIMARY KEY,
    recepcion_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad_recibida INTEGER NOT NULL,
    ubicacion_id INTEGER NOT NULL,
    FOREIGN KEY (recepcion_id) REFERENCES recepciones(recepcion_id),
    FOREIGN KEY (producto_id) REFERENCES productos(producto_id),
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(ubicacion_id)
);

-- Tabla de Averías
CREATE TABLE averias (
    averia_id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    tipo_averia VARCHAR(20) NOT NULL CHECK (tipo_averia IN (
        'Daño',
        'Faltante',
        'Rotura',
        'Vencimiento'
    )),
    descripcion TEXT,
    ubicacion_id INTEGER,
    foto_url VARCHAR(500),
    estado VARCHAR(20) DEFAULT 'Abierta' CHECK (estado IN (
        'Abierta',
        'En_Revision',
        'Cerrada'
    )),
    reportado_por INTEGER NOT NULL,
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cerrado_por INTEGER,
    fecha_cierre TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(producto_id),
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(ubicacion_id),
    FOREIGN KEY (reportado_por) REFERENCES usuarios(usuario_id),
    FOREIGN KEY (cerrado_por) REFERENCES usuarios(usuario_id)
);

-- Tabla de Inventario por Ubicación
CREATE TABLE inventario_ubicaciones (
    inventario_id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL,
    ubicacion_id INTEGER NOT NULL,
    cantidad INTEGER DEFAULT 0,
    es_ubicacion_primaria BOOLEAN DEFAULT FALSE,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(producto_id),
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(ubicacion_id),
    UNIQUE (producto_id, ubicacion_id)
);

-- Tabla de Observaciones de Proceso
CREATE TABLE observaciones_proceso (
    observacion_id SERIAL PRIMARY KEY,
    orden_id INTEGER NOT NULL,
    detalle_id INTEGER,
    tipo_proceso VARCHAR(20) NOT NULL CHECK (tipo_proceso IN (
        'Alistamiento',
        'Empaque',
        'Revision'
    )),
    usuario_id INTEGER NOT NULL,
    observacion TEXT NOT NULL,
    foto_url VARCHAR(500),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orden_id) REFERENCES ordenes_venta(orden_id),
    FOREIGN KEY (detalle_id) REFERENCES orden_detalles(detalle_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id)
);

-- Tabla de Facturas
CREATE TABLE facturas (
    factura_id SERIAL PRIMARY KEY,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    orden_id INTEGER NOT NULL,
    fecha_factura DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    descuentos DECIMAL(12,2) DEFAULT 0,
    impuestos DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    usuario_factura INTEGER NOT NULL,
    archivo_pdf VARCHAR(500),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orden_id) REFERENCES ordenes_venta(orden_id),
    FOREIGN KEY (usuario_factura) REFERENCES usuarios(usuario_id)
);

-- ============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

CREATE INDEX idx_clientes_nit ON clientes(nit_cc);
CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_ordenes_estado ON ordenes_venta(estado);
CREATE INDEX idx_ordenes_fecha ON ordenes_venta(fecha_creacion);
CREATE INDEX idx_inventario_producto ON inventario_ubicaciones(producto_id);
CREATE INDEX idx_inventario_ubicacion ON inventario_ubicaciones(ubicacion_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para actualizar automáticamente la fecha de actualización del inventario
CREATE TRIGGER trigger_update_inventario_fecha
    BEFORE UPDATE ON inventario_ubicaciones
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

-- ============================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE usuarios IS 'Usuarios del sistema con diferentes roles';
COMMENT ON TABLE clientes IS 'Clientes que realizan órdenes de compra';
COMMENT ON TABLE productos IS 'Catálogo de productos disponibles';
COMMENT ON TABLE ubicaciones IS 'Ubicaciones físicas del almacén';
COMMENT ON TABLE ordenes_venta IS 'Órdenes de venta con flujo de trabajo completo';
COMMENT ON TABLE orden_detalles IS 'Líneas de detalle de cada orden de venta';
COMMENT ON TABLE recepciones IS 'Recepciones de mercancía entrante';
COMMENT ON TABLE recepcion_detalles IS 'Detalles de productos recibidos';
COMMENT ON TABLE averias IS 'Registro de averías y problemas con productos';
COMMENT ON TABLE inventario_ubicaciones IS 'Inventario actual por ubicación';
COMMENT ON TABLE observaciones_proceso IS 'Observaciones durante alistamiento y empaque';
COMMENT ON TABLE facturas IS 'Facturas generadas para órdenes completadas';

-- ============================================
-- NOTAS DE IMPLEMENTACIÓN
-- ============================================

/*
FLUJO DE ÓRDENES DE VENTA:
1. Borrador - Orden en creación
2. Pendiente_Aprobacion - Enviada para aprobación
3. Aprobada - Aprobada por jefe de bodega
4. En_Alistamiento - Productos siendo recolectados
5. Listo_Para_Empacar - Alistamiento completado
6. En_Empaque - Productos siendo empacados
7. Listo_Para_Despachar - Empaque completado
8. Lista_Facturar - Lista para facturación
9. Facturada - Factura generada
10. Rechazada - Orden rechazada

ROLES DE USUARIOS:
- Vendedor: Crea y gestiona órdenes de venta
- Jefe_Bodega: Aprueba órdenes y supervisa operaciones
- Alistador: Realiza el picking de productos
- Empacador: Empaca los productos alistados
- Facturacion: Genera facturas
- Administrador: Control total del sistema

OPTIMIZACIÓN DE RUTAS DE PICKING:
Las ubicaciones tienen un campo orden_ruta que permite
optimizar las rutas de alistamiento en el almacén.
*/

-- ============================================
-- INSTRUCCIONES DE USO
-- ============================================

/*
Para crear la base de datos desde cero:

1. Crear la base de datos:
   psql -U postgres -c "CREATE DATABASE wms_db;"

2. Ejecutar este script:
   psql -U postgres -d wms_db -f estructura_completa_db.sql

3. (Opcional) Cargar datos de prueba:
   psql -U postgres -d wms_db -f seed.sql

4. Crear usuario administrador inicial mediante la API:
   POST /api/auth/register
   {
     "nombre": "Administrador",
     "email": "admin@wms.com",
     "password": "admin123",
     "rol": "Administrador"
   }
*/

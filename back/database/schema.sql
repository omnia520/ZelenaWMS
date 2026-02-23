-- =====================================================
-- CONFIGURACIÓN DE ZONA HORARIA: COLOMBIA (UTC-5)
-- Todas las fechas y horas se registran en hora de Colombia
-- =====================================================

-- Función helper para obtener la hora actual de Colombia
CREATE OR REPLACE FUNCTION now_colombia()
RETURNS TIMESTAMP AS $$
BEGIN
  RETURN NOW() AT TIME ZONE 'America/Bogota';
END;
$$ LANGUAGE plpgsql;

-- Tabla de Usuarios y Roles
CREATE TABLE usuarios (
    usuario_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('Vendedor', 'Jefe_Bodega', 'Operario', 'Facturacion', 'Administrador')),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Clientes
CREATE TABLE clientes (
    cliente_id SERIAL PRIMARY KEY,
    nit_cc VARCHAR(20) UNIQUE NOT NULL,
    razon_social VARCHAR(200) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    ciudad VARCHAR(50),
    departamento VARCHAR(50),
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

-- Tabla de Ubicaciones
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
    estado VARCHAR(30) DEFAULT 'Pendiente_Aprobacion' CHECK (estado IN ('Pendiente_Aprobacion', 'Aprobada', 'En_Alistamiento', 'En_Empaque', 'Lista_Facturar', 'Facturada', 'Rechazada')),
    subtotal DECIMAL(12,2) DEFAULT 0,
    descuento_total DECIMAL(12,2) DEFAULT 0,
    impuestos_total DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    comentarios TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP NULL,
    aprobado_por INTEGER NULL,
    fecha_inicio_alistamiento TIMESTAMP NULL,
    fecha_fin_alistamiento TIMESTAMP NULL,
    fecha_inicio_empaque TIMESTAMP NULL,
    fecha_fin_empaque TIMESTAMP NULL,
    observacion_alistador TEXT,
    observacion_empacador TEXT,
    alistador_asignado INTEGER NULL,
    empacador_asignado INTEGER NULL,
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
    tipo_averia VARCHAR(20) NOT NULL CHECK (tipo_averia IN ('Daño', 'Faltante', 'Rotura', 'Vencimiento')),
    descripcion TEXT,
    ubicacion_id INTEGER,
    foto_url VARCHAR(500),
    estado VARCHAR(20) DEFAULT 'Abierta' CHECK (estado IN ('Abierta', 'En_Revision', 'Cerrada')),
    reportado_por INTEGER NOT NULL,
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cerrado_por INTEGER NULL,
    fecha_cierre TIMESTAMP NULL,
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
    tipo_proceso VARCHAR(20) NOT NULL CHECK (tipo_proceso IN ('Alistamiento', 'Empaque', 'Revision')),
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

-- Crear índices adicionales para mejorar rendimiento
CREATE INDEX idx_clientes_nit ON clientes(nit_cc);
CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_ordenes_estado ON ordenes_venta(estado);
CREATE INDEX idx_ordenes_fecha ON ordenes_venta(fecha_creacion);
CREATE INDEX idx_inventario_producto ON inventario_ubicaciones(producto_id);
CREATE INDEX idx_inventario_ubicacion ON inventario_ubicaciones(ubicacion_id);

-- Trigger para actualizar fecha_actualizacion en inventario_ubicaciones
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_inventario_fecha
    BEFORE UPDATE ON inventario_ubicaciones
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

-- Datos de ejemplo (Usuario administrador inicial)
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO usuarios (nombre, email, password_hash, rol)
VALUES ('Administrador', 'admin@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', 'Administrador');

-- Comentario: Para crear nuevos usuarios, usa el endpoint POST /api/auth/register

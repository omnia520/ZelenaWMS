-- Datos de ejemplo para testing y desarrollo
-- Este archivo es opcional y solo para pruebas

-- ========================================
-- USUARIOS DE EJEMPLO
-- ========================================
-- Contraseña para todos: password123

INSERT INTO usuarios (nombre, email, password_hash, telefono, rol) VALUES
('Juan Pérez', 'vendedor@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', '3001234567', 'Vendedor'),
('María García', 'jefe@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', '3007654321', 'Jefe_Bodega'),
('Carlos López', 'operario1@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', '3009876543', 'Operario'),
('Ana Martínez', 'operario2@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', '3005432109', 'Operario'),
('Luis Rodríguez', 'facturacion@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', '3002345678', 'Facturacion');

-- ========================================
-- CLIENTES DE EJEMPLO
-- ========================================

INSERT INTO clientes (nit_cc, razon_social, telefono, email, ciudad, direccion, creado_por) VALUES
('900123456-1', 'Distribuidora Belleza Total S.A.S', '6012345678', 'ventas@bellezatotal.com', 'Bogotá', 'Calle 100 #15-20', 1),
('900234567-2', 'Cosméticos del Norte Ltda', '6043216789', 'compras@cosmeticosnorte.com', 'Medellín', 'Carrera 70 #45-30', 1),
('900345678-3', 'Beauty Shop Center', '6025551234', 'info@beautyshop.com', 'Cali', 'Avenida 6N #28-15', 1),
('900456789-4', 'Maquillaje Express S.A', '6075678901', 'pedidos@maquillajeexpress.com', 'Barranquilla', 'Calle 85 #52-10', 1),
('79456123-5', 'María Fernanda Gómez', '3156789012', 'mafe.gomez@gmail.com', 'Cartagena', 'Barrio Manga, Calle 30 #8-45', 1);

-- ========================================
-- PRODUCTOS DE EJEMPLO (Maquillaje)
-- ========================================

INSERT INTO productos (codigo, nombre, descripcion, categoria, precio_base, stock_actual, imagen_url) VALUES
('LAB-001', 'Labial Mate Rojo Clásico', 'Labial de larga duración color rojo intenso', 'Labiales', 35000, 150, 'https://example.com/labial-rojo.jpg'),
('LAB-002', 'Labial Brillo Rosa Suave', 'Brillo labial hidratante tono rosa claro', 'Labiales', 28000, 200, 'https://example.com/labial-rosa.jpg'),
('LAB-003', 'Labial Nude Natural', 'Labial mate tono nude perfecto para el día', 'Labiales', 32000, 180, 'https://example.com/labial-nude.jpg'),
('RIM-001', 'Rímel Negro Volumen Extremo', 'Rímel para pestañas largas y voluminosas', 'Ojos', 42000, 120, 'https://example.com/rimel-negro.jpg'),
('RIM-002', 'Rímel Marrón Natural', 'Rímel efecto natural color marrón', 'Ojos', 38000, 95, 'https://example.com/rimel-marron.jpg'),
('SOM-001', 'Paleta de Sombras Naturales', 'Paleta 12 tonos nude y marrones', 'Ojos', 65000, 80, 'https://example.com/sombras-naturales.jpg'),
('SOM-002', 'Paleta de Sombras Coloridas', 'Paleta 16 tonos vibrantes', 'Ojos', 75000, 65, 'https://example.com/sombras-color.jpg'),
('BASE-001', 'Base Líquida Tono Claro', 'Base de cobertura media acabado mate', 'Rostro', 58000, 110, 'https://example.com/base-clara.jpg'),
('BASE-002', 'Base Líquida Tono Medio', 'Base de cobertura media acabado mate', 'Rostro', 58000, 105, 'https://example.com/base-media.jpg'),
('BASE-003', 'Base Líquida Tono Oscuro', 'Base de cobertura media acabado mate', 'Rostro', 58000, 90, 'https://example.com/base-oscura.jpg'),
('POL-001', 'Polvo Compacto Translúcido', 'Polvo fijador matificante', 'Rostro', 45000, 130, 'https://example.com/polvo-translucido.jpg'),
('RUB-001', 'Rubor en Crema Rosa', 'Rubor cremoso tono rosa durazno', 'Rostro', 38000, 85, 'https://example.com/rubor-rosa.jpg'),
('DES-001', 'Desmaquillante Bifásico', 'Desmaquillante para todo tipo de maquillaje', 'Cuidado', 32000, 160, 'https://example.com/desmaquillante.jpg'),
('PRI-001', 'Primer Facial Matificante', 'Pre-base para control de brillo', 'Rostro', 48000, 75, 'https://example.com/primer.jpg'),
('FIJ-001', 'Fijador de Maquillaje Spray', 'Spray fijador de larga duración', 'Rostro', 42000, 100, 'https://example.com/fijador.jpg');

-- ========================================
-- UBICACIONES DE EJEMPLO
-- ========================================

INSERT INTO ubicaciones (codigo, descripcion, estanteria, fila, nivel, orden_ruta) VALUES
('A01-N1', 'Estantería A - Fila 01 - Nivel 1', 'A', '01', '1', 1),
('A01-N2', 'Estantería A - Fila 01 - Nivel 2', 'A', '01', '2', 2),
('A02-N1', 'Estantería A - Fila 02 - Nivel 1', 'A', '02', '1', 3),
('A02-N2', 'Estantería A - Fila 02 - Nivel 2', 'A', '02', '2', 4),
('B01-N1', 'Estantería B - Fila 01 - Nivel 1', 'B', '01', '1', 5),
('B01-N2', 'Estantería B - Fila 01 - Nivel 2', 'B', '01', '2', 6),
('B02-N1', 'Estantería B - Fila 02 - Nivel 1', 'B', '02', '1', 7),
('B02-N2', 'Estantería B - Fila 02 - Nivel 2', 'B', '02', '2', 8),
('C01-N1', 'Estantería C - Fila 01 - Nivel 1', 'C', '01', '1', 9),
('C01-N2', 'Estantería C - Fila 01 - Nivel 2', 'C', '01', '2', 10);

-- ========================================
-- ASIGNAR PRODUCTOS A UBICACIONES
-- ========================================

INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad, es_ubicacion_primaria) VALUES
-- Labiales en estantería A
(1, 1, 80, TRUE),
(1, 2, 70, FALSE),
(2, 1, 120, TRUE),
(2, 2, 80, FALSE),
(3, 3, 100, TRUE),
(3, 4, 80, FALSE),
-- Rímeles en estantería A
(4, 3, 70, TRUE),
(4, 4, 50, FALSE),
(5, 5, 55, TRUE),
(5, 6, 40, FALSE),
-- Sombras en estantería B
(6, 5, 50, TRUE),
(6, 6, 30, FALSE),
(7, 7, 40, TRUE),
(7, 8, 25, FALSE),
-- Bases en estantería B
(8, 7, 65, TRUE),
(8, 8, 45, FALSE),
(9, 9, 60, TRUE),
(9, 10, 45, FALSE),
(10, 9, 55, TRUE),
(10, 10, 35, FALSE),
-- Polvo y Rubor en estantería C
(11, 1, 80, TRUE),
(11, 2, 50, FALSE),
(12, 1, 50, TRUE),
(12, 2, 35, FALSE),
-- Cuidado en estantería C
(13, 3, 100, TRUE),
(13, 4, 60, FALSE),
(14, 5, 45, TRUE),
(14, 6, 30, FALSE),
(15, 5, 60, TRUE),
(15, 6, 40, FALSE);

-- ========================================
-- ORDENES DE VENTA DE EJEMPLO
-- ========================================

-- Orden 1: Aprobada (para probar alistamiento)
INSERT INTO ordenes_venta (numero_orden, cliente_id, vendedor_id, estado, subtotal, descuento_total, impuestos_total, total, comentarios)
VALUES ('ORD-2024001', 1, 2, 'Aprobada', 485000, 0, 92150, 577150, 'Pedido urgente para evento');

INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal)
VALUES
(1, 1, 10, 35000, 0, 350000),  -- 10 Labiales rojos
(1, 6, 2, 65000, 0, 130000),   -- 2 Paletas de sombras
(1, 15, 1, 42000, 0, 42000);   -- 1 Fijador de maquillaje

UPDATE ordenes_venta SET alistador_asignado = 4, empacador_asignado = 5 WHERE orden_id = 1;

-- Orden 2: Pendiente de Aprobación (pedido pequeño)
INSERT INTO ordenes_venta (numero_orden, cliente_id, vendedor_id, estado, subtotal, descuento_total, impuestos_total, total, comentarios)
VALUES ('ORD-2024002', 2, 2, 'Pendiente_Aprobacion', 245000, 0, 46550, 291550, 'Cliente frecuente - prioridad media');

INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal)
VALUES
(2, 2, 5, 28000, 0, 140000),   -- 5 Labiales rosa
(2, 4, 2, 42000, 0, 84000),    -- 2 Rímeles negro
(2, 13, 1, 32000, 0, 32000);   -- 1 Desmaquillante

-- Orden 3: Pendiente de Aprobación (pedido grande)
INSERT INTO ordenes_venta (numero_orden, cliente_id, vendedor_id, estado, subtotal, descuento_total, impuestos_total, total, comentarios)
VALUES ('ORD-2024003', 3, 2, 'Pendiente_Aprobacion', 1285000, 64250, 231942.5, 1452692.5, 'Pedido mayorista - 5% descuento aplicado');

INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal)
VALUES
(3, 1, 20, 35000, 5, 665000),   -- 20 Labiales rojos con descuento
(3, 3, 15, 32000, 5, 456000),   -- 15 Labiales nude con descuento
(3, 6, 5, 65000, 5, 308750),    -- 5 Paletas sombras naturales
(3, 8, 8, 58000, 5, 441600);    -- 8 Bases tono claro

-- Orden 4: Pendiente de Aprobación (productos variados)
INSERT INTO ordenes_venta (numero_orden, cliente_id, vendedor_id, estado, subtotal, descuento_total, impuestos_total, total, comentarios)
VALUES ('ORD-2024004', 4, 2, 'Pendiente_Aprobacion', 589000, 0, 111910, 700910, 'Reposición de inventario');

INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal)
VALUES
(4, 7, 3, 75000, 0, 225000),    -- 3 Paletas coloridas
(4, 9, 4, 58000, 0, 232000),    -- 4 Bases tono medio
(4, 11, 2, 45000, 0, 90000),    -- 2 Polvos compactos
(4, 14, 1, 48000, 0, 48000);    -- 1 Primer facial

-- Orden 5: Pendiente de Aprobación (cliente nuevo)
INSERT INTO ordenes_venta (numero_orden, cliente_id, vendedor_id, estado, subtotal, descuento_total, impuestos_total, total, comentarios)
VALUES ('ORD-2024005', 5, 2, 'Pendiente_Aprobacion', 167000, 0, 31730, 198730, 'Primera compra - verificar datos de cliente');

INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal)
VALUES
(5, 2, 3, 28000, 0, 84000),     -- 3 Labiales rosa
(5, 5, 1, 38000, 0, 38000),     -- 1 Rímel marrón
(5, 12, 1, 38000, 0, 38000);    -- 1 Rubor en crema

-- Orden 6: Pendiente de Aprobación (pedido express)
INSERT INTO ordenes_venta (numero_orden, cliente_id, vendedor_id, estado, subtotal, descuento_total, impuestos_total, total, comentarios)
VALUES ('ORD-2024006', 1, 2, 'Pendiente_Aprobacion', 395000, 0, 75050, 470050, 'URGENTE: Necesita para mañana');

INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal)
VALUES
(6, 1, 5, 35000, 0, 175000),    -- 5 Labiales rojos
(6, 4, 3, 42000, 0, 126000),    -- 3 Rímeles negro
(6, 10, 2, 58000, 0, 116000);   -- 2 Bases tono oscuro

-- ========================================
-- RECEPCIÓN DE MERCANCÍA DE EJEMPLO
-- ========================================

INSERT INTO recepciones (numero_documento, proveedor, fecha_recepcion, usuario_recibe, observaciones)
VALUES ('REC-2024-001', 'Importadora Belleza Internacional', '2024-01-15', 3, 'Llegó en perfectas condiciones');

INSERT INTO recepcion_detalles (recepcion_id, producto_id, cantidad_recibida, ubicacion_id)
VALUES
(1, 1, 50, 1),  -- 50 Labiales rojos en A01-N1
(1, 4, 30, 3),  -- 30 Rímeles en A02-N1
(1, 8, 40, 7);  -- 40 Bases en B02-N1

-- Nota: El trigger ya actualizó el inventario automáticamente

-- ========================================
-- CONSULTAS ÚTILES PARA TESTING
-- ========================================

-- Ver todos los productos con sus ubicaciones
-- SELECT p.codigo, p.nombre, u.codigo as ubicacion, iu.cantidad, iu.es_ubicacion_primaria
-- FROM productos p
-- LEFT JOIN inventario_ubicaciones iu ON p.producto_id = iu.producto_id
-- LEFT JOIN ubicaciones u ON iu.ubicacion_id = u.ubicacion_id
-- ORDER BY p.codigo, u.orden_ruta;

-- Ver órdenes con detalles
-- SELECT o.numero_orden, o.estado, c.razon_social as cliente,
--        v.nombre as vendedor, o.total
-- FROM ordenes_venta o
-- JOIN clientes c ON o.cliente_id = c.cliente_id
-- JOIN usuarios v ON o.vendedor_id = v.usuario_id
-- ORDER BY o.fecha_creacion DESC;

-- Ver picking list de una orden
-- SELECT od.cantidad_pedida, p.codigo, p.nombre,
--        u.codigo as ubicacion, u.orden_ruta,
--        iu.cantidad as stock_ubicacion
-- FROM orden_detalles od
-- JOIN productos p ON od.producto_id = p.producto_id
-- LEFT JOIN inventario_ubicaciones iu ON p.producto_id = iu.producto_id
-- LEFT JOIN ubicaciones u ON iu.ubicacion_id = u.ubicacion_id
-- WHERE od.orden_id = 1
-- ORDER BY u.orden_ruta;

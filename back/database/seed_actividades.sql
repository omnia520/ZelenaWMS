-- Datos de prueba para el módulo de Actividades
-- Este script crea usuarios, clientes, productos, ubicaciones y órdenes de prueba

-- ============================================
-- 1. CREAR USUARIOS DE PRUEBA
-- ============================================
-- Contraseña para todos: "password123"
INSERT INTO usuarios (nombre, email, password_hash, telefono, rol, activo) VALUES
('Juan Pérez', 'operario1@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', '3001234567', 'Operario', TRUE),
('María García', 'operario2@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', '3001234568', 'Operario', TRUE),
('Carlos Rodríguez', 'operario3@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', '3001234569', 'Operario', TRUE),
('Ana Martínez', 'operario4@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', '3001234570', 'Operario', TRUE),
('Luis Sánchez', 'vendedor1@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', '3001234571', 'Vendedor', TRUE),
('Sofia López', 'jefe@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', '3001234572', 'Jefe_Bodega', TRUE)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. CREAR CLIENTES DE PRUEBA
-- ============================================
INSERT INTO clientes (nit_cc, razon_social, telefono, email, ciudad, direccion, activo, creado_por) VALUES
('900123456-1', 'Distribuidora El Éxito S.A.S', '6012345678', 'contacto@exito.com', 'Bogotá', 'Calle 100 #15-20', TRUE, 1),
('800234567-2', 'Supermercados La Canasta', '6013456789', 'ventas@canasta.com', 'Medellín', 'Carrera 50 #30-40', TRUE, 1),
('700345678-3', 'Comercial Los Andes Ltda', '6014567890', 'info@losandes.com', 'Cali', 'Avenida 6N #25-50', TRUE, 1),
('600456789-4', 'Mayorista Costa Azul', '6015678901', 'compras@costaazul.com', 'Barranquilla', 'Calle 80 #45-30', TRUE, 1),
('500567890-5', 'Tiendas El Ahorro', '6016789012', 'gerencia@elahorro.com', 'Cartagena', 'Centro #20-15', TRUE, 1)
ON CONFLICT (nit_cc) DO NOTHING;

-- ============================================
-- 3. CREAR PRODUCTOS DE PRUEBA
-- ============================================
INSERT INTO productos (codigo, nombre, descripcion, categoria, precio_base, stock_actual, activo) VALUES
('PROD-001', 'Aceite de Cocina 1L', 'Aceite vegetal premium para cocina', 'Alimentos', 8500, 500, TRUE),
('PROD-002', 'Arroz Blanco 1kg', 'Arroz de primera calidad', 'Alimentos', 3200, 800, TRUE),
('PROD-003', 'Azúcar Refinada 1kg', 'Azúcar blanca refinada', 'Alimentos', 2800, 600, TRUE),
('PROD-004', 'Papel Higiénico x12', 'Papel higiénico suave triple hoja', 'Aseo', 15000, 300, TRUE),
('PROD-005', 'Detergente en Polvo 1kg', 'Detergente para ropa multiusos', 'Aseo', 12000, 400, TRUE),
('PROD-006', 'Jabón de Tocador x3', 'Jabón antibacterial pack x3', 'Aseo', 6500, 450, TRUE),
('PROD-007', 'Café Molido 500g', 'Café premium colombiano', 'Alimentos', 18000, 200, TRUE),
('PROD-008', 'Sal de Mesa 1kg', 'Sal yodada de mesa', 'Alimentos', 1500, 700, TRUE),
('PROD-009', 'Atún en Lata x3', 'Atún en aceite pack x3', 'Alimentos', 9500, 350, TRUE),
('PROD-010', 'Shampoo 400ml', 'Shampoo para todo tipo de cabello', 'Cuidado Personal', 16500, 250, TRUE),
('PROD-011', 'Pasta Dental 100g', 'Pasta dental con flúor', 'Cuidado Personal', 5500, 400, TRUE),
('PROD-012', 'Leche en Polvo 900g', 'Leche entera en polvo', 'Alimentos', 22000, 180, TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- 4. CREAR UBICACIONES DE PRUEBA
-- ============================================
INSERT INTO ubicaciones (codigo, descripcion, estanteria, fila, nivel, orden_ruta, activa) VALUES
('A1-01-1', 'Estantería A1, Fila 1, Nivel 1', 'A1', '01', '1', 1, TRUE),
('A1-01-2', 'Estantería A1, Fila 1, Nivel 2', 'A1', '01', '2', 2, TRUE),
('A1-02-1', 'Estantería A1, Fila 2, Nivel 1', 'A1', '02', '1', 3, TRUE),
('A1-02-2', 'Estantería A1, Fila 2, Nivel 2', 'A1', '02', '2', 4, TRUE),
('A2-01-1', 'Estantería A2, Fila 1, Nivel 1', 'A2', '01', '1', 5, TRUE),
('A2-01-2', 'Estantería A2, Fila 1, Nivel 2', 'A2', '01', '2', 6, TRUE),
('B1-01-1', 'Estantería B1, Fila 1, Nivel 1', 'B1', '01', '1', 7, TRUE),
('B1-01-2', 'Estantería B1, Fila 1, Nivel 2', 'B1', '01', '2', 8, TRUE),
('B1-02-1', 'Estantería B1, Fila 2, Nivel 1', 'B1', '02', '1', 9, TRUE),
('B2-01-1', 'Estantería B2, Fila 1, Nivel 1', 'B2', '01', '1', 10, TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- 5. ASIGNAR INVENTARIO A UBICACIONES
-- ============================================
INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad, es_ubicacion_primaria) VALUES
-- Aceite
((SELECT producto_id FROM productos WHERE codigo = 'PROD-001'), (SELECT ubicacion_id FROM ubicaciones WHERE codigo = 'A1-01-1'), 150, TRUE),
((SELECT producto_id FROM productos WHERE codigo = 'PROD-001'), (SELECT ubicacion_id FROM ubicaciones WHERE codigo = 'A1-01-2'), 100, FALSE),
-- Arroz
((SELECT producto_id FROM productos WHERE codigo = 'PROD-002'), (SELECT ubicacion_id FROM ubicaciones WHERE codigo = 'A1-02-1'), 300, TRUE),
-- Azúcar
((SELECT producto_id FROM productos WHERE codigo = 'PROD-003'), (SELECT ubicacion_id FROM ubicaciones WHERE codigo = 'A1-02-2'), 200, TRUE),
-- Papel Higiénico
((SELECT producto_id FROM productos WHERE codigo = 'PROD-004'), (SELECT ubicacion_id FROM ubicaciones WHERE codigo = 'A2-01-1'), 150, TRUE),
-- Detergente
((SELECT producto_id FROM productos WHERE codigo = 'PROD-005'), (SELECT ubicacion_id FROM ubicaciones WHERE codigo = 'A2-01-2'), 200, TRUE),
-- Jabón
((SELECT producto_id FROM productos WHERE codigo = 'PROD-006'), (SELECT ubicacion_id FROM ubicaciones WHERE codigo = 'B1-01-1'), 180, TRUE),
-- Café
((SELECT producto_id FROM productos WHERE codigo = 'PROD-007'), (SELECT ubicacion_id FROM ubicaciones WHERE codigo = 'B1-01-2'), 100, TRUE),
-- Sal
((SELECT producto_id FROM productos WHERE codigo = 'PROD-008'), (SELECT ubicacion_id FROM ubicaciones WHERE codigo = 'B1-02-1'), 250, TRUE),
-- Atún
((SELECT producto_id FROM productos WHERE codigo = 'PROD-009'), (SELECT ubicacion_id FROM ubicaciones WHERE codigo = 'B2-01-1'), 150, TRUE),
-- Shampoo
((SELECT producto_id FROM productos WHERE codigo = 'PROD-010'), (SELECT ubicacion_id FROM ubicaciones WHERE codigo = 'A2-01-1'), 120, TRUE),
-- Pasta Dental
((SELECT producto_id FROM productos WHERE codigo = 'PROD-011'), (SELECT ubicacion_id FROM ubicaciones WHERE codigo = 'A2-01-2'), 180, TRUE)
ON CONFLICT (producto_id, ubicacion_id) DO NOTHING;

-- ============================================
-- 6. CREAR ÓRDENES DE VENTA DE PRUEBA
-- ============================================

-- ORDEN 1: Estado "Aprobada" (lista para alistamiento)
INSERT INTO ordenes_venta (
  numero_orden, cliente_id, vendedor_id, estado,
  subtotal, descuento_total, impuestos_total, total,
  fecha_aprobacion, aprobado_por,
  alistador_asignado, empacador_asignado,
  comentarios
) VALUES (
  'ORD-2024-001',
  (SELECT cliente_id FROM clientes WHERE nit_cc = '900123456-1'),
  (SELECT usuario_id FROM usuarios WHERE email = 'vendedor1@wms.com'),
  'Aprobada',
  500000, 0, 95000, 595000,
  NOW() - INTERVAL '1 day',
  (SELECT usuario_id FROM usuarios WHERE email = 'jefe@wms.com'),
  (SELECT usuario_id FROM usuarios WHERE email = 'alistador1@wms.com'),
  (SELECT usuario_id FROM usuarios WHERE email = 'empacador1@wms.com'),
  'Pedido urgente - Entregar antes del viernes'
);

-- Detalles de la orden 1
INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal) VALUES
((SELECT orden_id FROM ordenes_venta WHERE numero_orden = 'ORD-2024-001'), (SELECT producto_id FROM productos WHERE codigo = 'PROD-001'), 20, 8500, 0, 170000),
((SELECT orden_id FROM ordenes_venta WHERE numero_orden = 'ORD-2024-001'), (SELECT producto_id FROM productos WHERE codigo = 'PROD-002'), 50, 3200, 0, 160000),
((SELECT orden_id FROM ordenes_venta WHERE numero_orden = 'ORD-2024-001'), (SELECT producto_id FROM productos WHERE codigo = 'PROD-004'), 10, 15000, 0, 150000),
((SELECT orden_id FROM ordenes_venta WHERE numero_orden = 'ORD-2024-001'), (SELECT producto_id FROM productos WHERE codigo = 'PROD-007'), 2, 18000, 0, 36000);

-- ORDEN 2: Estado "Aprobada" (para alistador 2)
INSERT INTO ordenes_venta (
  numero_orden, cliente_id, vendedor_id, estado,
  subtotal, descuento_total, impuestos_total, total,
  fecha_aprobacion, aprobado_por,
  alistador_asignado, empacador_asignado,
  comentarios
) VALUES (
  'ORD-2024-002',
  (SELECT cliente_id FROM clientes WHERE nit_cc = '800234567-2'),
  (SELECT usuario_id FROM usuarios WHERE email = 'vendedor1@wms.com'),
  'Aprobada',
  350000, 0, 66500, 416500,
  NOW() - INTERVAL '2 hours',
  (SELECT usuario_id FROM usuarios WHERE email = 'jefe@wms.com'),
  (SELECT usuario_id FROM usuarios WHERE email = 'alistador2@wms.com'),
  (SELECT usuario_id FROM usuarios WHERE email = 'empacador2@wms.com'),
  'Cliente preferencial'
);

-- Detalles de la orden 2
INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal) VALUES
((SELECT orden_id FROM ordenes_venta WHERE numero_orden = 'ORD-2024-002'), (SELECT producto_id FROM productos WHERE codigo = 'PROD-003'), 30, 2800, 0, 84000),
((SELECT orden_id FROM ordenes_venta WHERE numero_orden = 'ORD-2024-002'), (SELECT producto_id FROM productos WHERE codigo = 'PROD-005'), 15, 12000, 0, 180000),
((SELECT orden_id FROM ordenes_venta WHERE numero_orden = 'ORD-2024-002'), (SELECT producto_id FROM productos WHERE codigo = 'PROD-006'), 10, 6500, 0, 65000);

-- ORDEN 3: Estado "En_Alistamiento" (alistamiento ya iniciado)
INSERT INTO ordenes_venta (
  numero_orden, cliente_id, vendedor_id, estado,
  subtotal, descuento_total, impuestos_total, total,
  fecha_aprobacion, aprobado_por,
  fecha_inicio_alistamiento,
  alistador_asignado, empacador_asignado,
  comentarios
) VALUES (
  'ORD-2024-003',
  (SELECT cliente_id FROM clientes WHERE nit_cc = '700345678-3'),
  (SELECT usuario_id FROM usuarios WHERE email = 'vendedor1@wms.com'),
  'En_Alistamiento',
  280000, 0, 53200, 333200,
  NOW() - INTERVAL '1 day',
  (SELECT usuario_id FROM usuarios WHERE email = 'jefe@wms.com'),
  NOW() - INTERVAL '2 hours',
  (SELECT usuario_id FROM usuarios WHERE email = 'alistador1@wms.com'),
  (SELECT usuario_id FROM usuarios WHERE email = 'empacador1@wms.com'),
  'Pedido regular'
);

-- Detalles de la orden 3 (algunos ya alistados)
INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal, cantidad_alistada, alistamiento_completado) VALUES
((SELECT orden_id FROM ordenes_venta WHERE numero_orden = 'ORD-2024-003'), (SELECT producto_id FROM productos WHERE codigo = 'PROD-008'), 100, 1500, 0, 150000, 100, TRUE),
((SELECT orden_id FROM ordenes_venta WHERE numero_orden = 'ORD-2024-003'), (SELECT producto_id FROM productos WHERE codigo = 'PROD-009'), 10, 9500, 0, 95000, 10, TRUE),
((SELECT orden_id FROM ordenes_venta WHERE numero_orden = 'ORD-2024-003'), (SELECT producto_id FROM productos WHERE codigo = 'PROD-010'), 2, 16500, 0, 33000, 0, FALSE);

-- ORDEN 4: Estado "Listo_Para_Empacar"
INSERT INTO ordenes_venta (
  numero_orden, cliente_id, vendedor_id, estado,
  subtotal, descuento_total, impuestos_total, total,
  fecha_aprobacion, aprobado_por,
  fecha_inicio_alistamiento, fecha_fin_alistamiento,
  observacion_alistador,
  alistador_asignado, empacador_asignado,
  comentarios
) VALUES (
  'ORD-2024-004',
  (SELECT cliente_id FROM clientes WHERE nit_cc = '600456789-4'),
  (SELECT usuario_id FROM usuarios WHERE email = 'vendedor1@wms.com'),
  'Listo_Para_Empacar',
  450000, 0, 85500, 535500,
  NOW() - INTERVAL '2 days',
  (SELECT usuario_id FROM usuarios WHERE email = 'jefe@wms.com'),
  NOW() - INTERVAL '4 hours',
  NOW() - INTERVAL '1 hour',
  'Todos los productos alistados correctamente. Sin novedad.',
  (SELECT usuario_id FROM usuarios WHERE email = 'alistador2@wms.com'),
  (SELECT usuario_id FROM usuarios WHERE email = 'empacador1@wms.com'),
  'Despachar a Barranquilla'
);

-- Detalles de la orden 4 (todo alistado)
INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal, cantidad_alistada, alistamiento_completado) VALUES
((SELECT orden_id FROM ordenes_venta WHERE numero_orden = 'ORD-2024-004'), (SELECT producto_id FROM productos WHERE codigo = 'PROD-001'), 15, 8500, 0, 127500, 15, TRUE),
((SELECT orden_id FROM ordenes_venta WHERE numero_orden = 'ORD-2024-004'), (SELECT producto_id FROM productos WHERE codigo = 'PROD-002'), 40, 3200, 0, 128000, 40, TRUE),
((SELECT orden_id FROM ordenes_venta WHERE numero_orden = 'ORD-2024-004'), (SELECT producto_id FROM productos WHERE codigo = 'PROD-005'), 12, 12000, 0, 144000, 12, TRUE),
((SELECT orden_id FROM ordenes_venta WHERE numero_orden = 'ORD-2024-004'), (SELECT producto_id FROM productos WHERE codigo = 'PROD-011'), 10, 5500, 0, 55000, 10, TRUE);

-- ORDEN 5: Estado "En_Empaque"
INSERT INTO ordenes_venta (
  numero_orden, cliente_id, vendedor_id, estado,
  subtotal, descuento_total, impuestos_total, total,
  fecha_aprobacion, aprobado_por,
  fecha_inicio_alistamiento, fecha_fin_alistamiento,
  fecha_inicio_empaque,
  observacion_alistador,
  alistador_asignado, empacador_asignado,
  comentarios
) VALUES (
  'ORD-2024-005',
  (SELECT cliente_id FROM clientes WHERE nit_cc = '500567890-5'),
  (SELECT usuario_id FROM usuarios WHERE email = 'vendedor1@wms.com'),
  'En_Empaque',
  320000, 0, 60800, 380800,
  NOW() - INTERVAL '3 days',
  (SELECT usuario_id FROM usuarios WHERE email = 'jefe@wms.com'),
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '1 hour',
  'Productos en buen estado.',
  (SELECT usuario_id FROM usuarios WHERE email = 'alistador1@wms.com'),
  (SELECT usuario_id FROM usuarios WHERE email = 'empacador2@wms.com'),
  'Despacho a Cartagena'
);

-- Detalles de la orden 5 (algunos empacados)
INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal, cantidad_alistada, alistamiento_completado, cantidad_empacada, empaque_completado) VALUES
((SELECT orden_id FROM ordenes_venta WHERE numero_orden = 'ORD-2024-005'), (SELECT producto_id FROM productos WHERE codigo = 'PROD-003'), 40, 2800, 0, 112000, 40, TRUE, 40, TRUE),
((SELECT orden_id FROM ordenes_venta WHERE numero_orden = 'ORD-2024-005'), (SELECT producto_id FROM productos WHERE codigo = 'PROD-004'), 8, 15000, 0, 120000, 8, TRUE, 8, TRUE),
((SELECT orden_id FROM ordenes_venta WHERE numero_orden = 'ORD-2024-005'), (SELECT producto_id FROM productos WHERE codigo = 'PROD-006'), 12, 6500, 0, 78000, 12, TRUE, 0, FALSE);

-- ============================================
-- RESUMEN DE DATOS CREADOS
-- ============================================
-- Usuarios:
--   - alistador1@wms.com / password123 (Juan Pérez)
--   - alistador2@wms.com / password123 (María García)
--   - empacador1@wms.com / password123 (Carlos Rodríguez)
--   - empacador2@wms.com / password123 (Ana Martínez)
--   - vendedor1@wms.com / password123 (Luis Sánchez)
--   - jefe@wms.com / password123 (Sofia López)
--
-- Órdenes:
--   - ORD-2024-001: Aprobada (asignada a alistador1)
--   - ORD-2024-002: Aprobada (asignada a alistador2)
--   - ORD-2024-003: En_Alistamiento (asignada a alistador1)
--   - ORD-2024-004: Listo_Para_Empacar (asignada a empacador1)
--   - ORD-2024-005: En_Empaque (asignada a empacador2)

SELECT 'Datos de prueba insertados correctamente!' as mensaje;

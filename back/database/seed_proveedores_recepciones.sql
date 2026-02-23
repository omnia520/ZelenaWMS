-- ============================================
-- SEED DATA: Proveedores y Recepciones
-- ============================================

-- Limpiar datos de prueba anteriores (opcional)
-- DELETE FROM recepcion_detalles;
-- DELETE FROM recepciones;
-- DELETE FROM proveedores WHERE proveedor_id > 2;

-- ============================================
-- PROVEEDORES
-- ============================================

INSERT INTO proveedores (nombre, nit, contacto, telefono, email, direccion, tolerancia_porcentaje, activo)
VALUES
  -- Proveedores de productos alimenticios
  ('Distribuidora Nacional de Alimentos S.A.S', '900123456-7', 'Juan Carlos Ramírez', '3101234567', 'contacto@dnalimentos.com', 'Calle 45 #23-12, Bogotá D.C.', 2.50, TRUE),

  ('Comercializadora La Económica Ltda', '900234567-8', 'Sandra Martínez', '3209876543', 'ventas@laeconomica.com', 'Carrera 15 #78-34, Medellín', 3.00, TRUE),

  ('Abarrotes y Víveres El Dorado', '900345678-9', 'Pedro González', '3158765432', 'pedidos@eldorado.com', 'Avenida 68 #45-67, Bogotá D.C.', 1.50, TRUE),

  -- Proveedores de ferretería
  ('Ferretería Total S.A.', '900456789-0', 'Luis Fernando Torres', '3187654321', 'compras@ferreteriatotal.com', 'Calle 12 #34-56, Cali', 5.00, TRUE),

  ('Suministros Industriales del Norte', '900567890-1', 'María Alejandra Díaz', '3176543210', 'contacto@sindnorte.com', 'Carrera 80 #23-45, Barranquilla', 2.00, TRUE),

  ('Herramientas y Equipos ProWork', '900678901-2', 'Carlos Eduardo Sánchez', '3165432109', 'ventas@prowork.com', 'Avenida 30 #12-34, Bucaramanga', 4.00, TRUE),

  -- Proveedores de limpieza
  ('Productos de Aseo Integral Ltda', '900789012-3', 'Ana Patricia Rojas', '3154321098', 'info@aseointegral.com', 'Calle 100 #15-20, Bogotá D.C.', 2.50, TRUE),

  ('Distribuidora Higiene Total', '900890123-4', 'Jorge Mario Vargas', '3143210987', 'pedidos@higienetotal.com', 'Carrera 50 #67-89, Medellín', 3.50, TRUE),

  -- Proveedores internacionales
  ('Importadora Global Trading S.A.S', '900901234-5', 'Roberto Chen', '3132109876', 'import@globaltrading.com', 'Zona Franca Bogotá, Calle 13 #98-34', 1.00, TRUE),

  ('Productos del Pacífico Ltda', '901012345-6', 'Diana Marcela López', '3121098765', 'contacto@pacifico.com', 'Avenida del Río #45-67, Cali', 2.00, TRUE),

  -- Proveedor inactivo para pruebas
  ('Suministros Viejos SAC (INACTIVO)', '901123456-7', 'Antiguo Contacto', '3110987654', 'old@suministros.com', 'Antigua dirección', 0.00, FALSE);

-- ============================================
-- RECEPCIONES
-- ============================================

-- Obtener IDs de proveedores para las recepciones
DO $$
DECLARE
  prov_alimentos_id BIGINT;
  prov_economica_id BIGINT;
  prov_eldorado_id BIGINT;
  prov_ferreteria_id BIGINT;
  prov_industrial_id BIGINT;
  prov_prowork_id BIGINT;
  prov_aseo_id BIGINT;
  prov_higiene_id BIGINT;
  prov_global_id BIGINT;
  prov_pacifico_id BIGINT;

  rec1_id BIGINT;
  rec2_id BIGINT;
  rec3_id BIGINT;
  rec4_id BIGINT;
  rec5_id BIGINT;
  rec6_id BIGINT;
  rec7_id BIGINT;
  rec8_id BIGINT;
  rec9_id BIGINT;
  rec10_id BIGINT;
BEGIN
  -- Obtener IDs de proveedores
  SELECT proveedor_id INTO prov_alimentos_id FROM proveedores WHERE nombre = 'Distribuidora Nacional de Alimentos S.A.S';
  SELECT proveedor_id INTO prov_economica_id FROM proveedores WHERE nombre = 'Comercializadora La Económica Ltda';
  SELECT proveedor_id INTO prov_eldorado_id FROM proveedores WHERE nombre = 'Abarrotes y Víveres El Dorado';
  SELECT proveedor_id INTO prov_ferreteria_id FROM proveedores WHERE nombre = 'Ferretería Total S.A.';
  SELECT proveedor_id INTO prov_industrial_id FROM proveedores WHERE nombre = 'Suministros Industriales del Norte';
  SELECT proveedor_id INTO prov_prowork_id FROM proveedores WHERE nombre = 'Herramientas y Equipos ProWork';
  SELECT proveedor_id INTO prov_aseo_id FROM proveedores WHERE nombre = 'Productos de Aseo Integral Ltda';
  SELECT proveedor_id INTO prov_higiene_id FROM proveedores WHERE nombre = 'Distribuidora Higiene Total';
  SELECT proveedor_id INTO prov_global_id FROM proveedores WHERE nombre = 'Importadora Global Trading S.A.S';
  SELECT proveedor_id INTO prov_pacifico_id FROM proveedores WHERE nombre = 'Productos del Pacífico Ltda';

  -- Recepción 1: Alimentos
  INSERT INTO recepciones (numero_documento, proveedor_id, fecha_recepcion, usuario_recibe, observaciones)
  VALUES ('FAC-2024-001', prov_alimentos_id, '2024-01-15', 1, 'Primera entrega del mes, productos en buen estado')
  RETURNING recepcion_id INTO rec1_id;

  INSERT INTO recepcion_detalles (recepcion_id, producto_id, cantidad_recibida, ubicacion_id)
  VALUES
    (rec1_id, 5, 100, 1),  -- Aceite 100 unidades
    (rec1_id, 6, 200, 1),  -- Arroz 200 unidades
    (rec1_id, 7, 150, 1);  -- Azúcar 150 unidades

  -- Actualizar inventario
  UPDATE productos SET stock_actual = stock_actual + 100 WHERE producto_id = 5;
  UPDATE productos SET stock_actual = stock_actual + 200 WHERE producto_id = 6;
  UPDATE productos SET stock_actual = stock_actual + 150 WHERE producto_id = 7;

  INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad)
  VALUES (5, 1, 100), (6, 1, 200), (7, 1, 150)
  ON CONFLICT (producto_id, ubicacion_id) DO UPDATE
  SET cantidad = inventario_ubicaciones.cantidad + EXCLUDED.cantidad;

  -- Recepción 2: La Económica
  INSERT INTO recepciones (numero_documento, proveedor_id, fecha_recepcion, usuario_recibe, observaciones)
  VALUES ('REM-2024-045', prov_economica_id, '2024-01-20', 1, 'Envío urgente solicitado')
  RETURNING recepcion_id INTO rec2_id;

  INSERT INTO recepcion_detalles (recepcion_id, producto_id, cantidad_recibida, ubicacion_id)
  VALUES
    (rec2_id, 8, 180, 2),  -- Papel higiénico
    (rec2_id, 9, 120, 2);  -- Detergente

  UPDATE productos SET stock_actual = stock_actual + 180 WHERE producto_id = 8;
  UPDATE productos SET stock_actual = stock_actual + 120 WHERE producto_id = 9;

  INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad)
  VALUES (8, 2, 180), (9, 2, 120)
  ON CONFLICT (producto_id, ubicacion_id) DO UPDATE
  SET cantidad = inventario_ubicaciones.cantidad + EXCLUDED.cantidad;

  -- Recepción 3: El Dorado
  INSERT INTO recepciones (numero_documento, proveedor_id, fecha_recepcion, usuario_recibe, observaciones)
  VALUES ('GU-2024-789', prov_eldorado_id, '2024-02-05', 1, 'Entrega completa según orden de compra')
  RETURNING recepcion_id INTO rec3_id;

  INSERT INTO recepcion_detalles (recepcion_id, producto_id, cantidad_recibida, ubicacion_id)
  VALUES
    (rec3_id, 5, 75, 1),
    (rec3_id, 6, 90, 1),
    (rec3_id, 7, 60, 1);

  UPDATE productos SET stock_actual = stock_actual + 75 WHERE producto_id = 5;
  UPDATE productos SET stock_actual = stock_actual + 90 WHERE producto_id = 6;
  UPDATE productos SET stock_actual = stock_actual + 60 WHERE producto_id = 7;

  INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad)
  VALUES (5, 1, 75), (6, 1, 90), (7, 1, 60)
  ON CONFLICT (producto_id, ubicacion_id) DO UPDATE
  SET cantidad = inventario_ubicaciones.cantidad + EXCLUDED.cantidad;

  -- Recepción 4: Ferretería Total
  INSERT INTO recepciones (numero_documento, proveedor_id, fecha_recepcion, usuario_recibe, observaciones)
  VALUES ('FR-2024-1234', prov_ferreteria_id, '2024-02-10', 1, 'Herramientas importadas de alta calidad')
  RETURNING recepcion_id INTO rec4_id;

  INSERT INTO recepcion_detalles (recepcion_id, producto_id, cantidad_recibida, ubicacion_id)
  VALUES
    (rec4_id, 1, 500, 3),  -- Tornillos
    (rec4_id, 2, 50, 3),   -- Martillos
    (rec4_id, 3, 80, 3);   -- Destornilladores

  UPDATE productos SET stock_actual = stock_actual + 500 WHERE producto_id = 1;
  UPDATE productos SET stock_actual = stock_actual + 50 WHERE producto_id = 2;
  UPDATE productos SET stock_actual = stock_actual + 80 WHERE producto_id = 3;

  INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad)
  VALUES (1, 3, 500), (2, 3, 50), (3, 3, 80)
  ON CONFLICT (producto_id, ubicacion_id) DO UPDATE
  SET cantidad = inventario_ubicaciones.cantidad + EXCLUDED.cantidad;

  -- Recepción 5: Suministros Industriales
  INSERT INTO recepciones (numero_documento, proveedor_id, fecha_recepcion, usuario_recibe, observaciones)
  VALUES ('SIN-2024-567', prov_industrial_id, '2024-02-15', 1, 'Equipos de protección personal')
  RETURNING recepcion_id INTO rec5_id;

  INSERT INTO recepcion_detalles (recepcion_id, producto_id, cantidad_recibida, ubicacion_id)
  VALUES
    (rec5_id, 4, 200, 2);  -- Guantes

  UPDATE productos SET stock_actual = stock_actual + 200 WHERE producto_id = 4;

  INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad)
  VALUES (4, 2, 200)
  ON CONFLICT (producto_id, ubicacion_id) DO UPDATE
  SET cantidad = inventario_ubicaciones.cantidad + EXCLUDED.cantidad;

  -- Recepción 6: ProWork (más reciente)
  INSERT INTO recepciones (numero_documento, proveedor_id, fecha_recepcion, usuario_recibe, observaciones)
  VALUES ('PW-2024-890', prov_prowork_id, '2024-03-01', 1, 'Herramientas profesionales - Nueva línea')
  RETURNING recepcion_id INTO rec6_id;

  INSERT INTO recepcion_detalles (recepcion_id, producto_id, cantidad_recibida, ubicacion_id)
  VALUES
    (rec6_id, 1, 300, 3),
    (rec6_id, 2, 35, 3),
    (rec6_id, 3, 45, 3),
    (rec6_id, 4, 100, 2);

  UPDATE productos SET stock_actual = stock_actual + 300 WHERE producto_id = 1;
  UPDATE productos SET stock_actual = stock_actual + 35 WHERE producto_id = 2;
  UPDATE productos SET stock_actual = stock_actual + 45 WHERE producto_id = 3;
  UPDATE productos SET stock_actual = stock_actual + 100 WHERE producto_id = 4;

  INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad)
  VALUES (1, 3, 300), (2, 3, 35), (3, 3, 45), (4, 2, 100)
  ON CONFLICT (producto_id, ubicacion_id) DO UPDATE
  SET cantidad = inventario_ubicaciones.cantidad + EXCLUDED.cantidad;

  -- Recepción 7: Aseo Integral
  INSERT INTO recepciones (numero_documento, proveedor_id, fecha_recepcion, usuario_recibe, observaciones)
  VALUES ('AI-2024-321', prov_aseo_id, '2024-03-05', 1, 'Productos biodegradables')
  RETURNING recepcion_id INTO rec7_id;

  INSERT INTO recepcion_detalles (recepcion_id, producto_id, cantidad_recibida, ubicacion_id)
  VALUES
    (rec7_id, 8, 150, 2),
    (rec7_id, 9, 100, 2);

  UPDATE productos SET stock_actual = stock_actual + 150 WHERE producto_id = 8;
  UPDATE productos SET stock_actual = stock_actual + 100 WHERE producto_id = 9;

  INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad)
  VALUES (8, 2, 150), (9, 2, 100)
  ON CONFLICT (producto_id, ubicacion_id) DO UPDATE
  SET cantidad = inventario_ubicaciones.cantidad + EXCLUDED.cantidad;

  -- Recepción 8: Higiene Total
  INSERT INTO recepciones (numero_documento, proveedor_id, fecha_recepcion, usuario_recibe, observaciones)
  VALUES ('HT-2024-654', prov_higiene_id, '2024-03-10', 1, 'Promoción especial - descuento aplicado')
  RETURNING recepcion_id INTO rec8_id;

  INSERT INTO recepcion_detalles (recepcion_id, producto_id, cantidad_recibida, ubicacion_id)
  VALUES
    (rec8_id, 8, 250, 2),
    (rec8_id, 9, 180, 2);

  UPDATE productos SET stock_actual = stock_actual + 250 WHERE producto_id = 8;
  UPDATE productos SET stock_actual = stock_actual + 180 WHERE producto_id = 9;

  INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad)
  VALUES (8, 2, 250), (9, 2, 180)
  ON CONFLICT (producto_id, ubicacion_id) DO UPDATE
  SET cantidad = inventario_ubicaciones.cantidad + EXCLUDED.cantidad;

  -- Recepción 9: Global Trading
  INSERT INTO recepciones (numero_documento, proveedor_id, fecha_recepcion, usuario_recibe, observaciones)
  VALUES ('GT-INT-2024-999', prov_global_id, '2024-03-15', 1, 'Importación directa desde Asia - Verificar calidad')
  RETURNING recepcion_id INTO rec9_id;

  INSERT INTO recepcion_detalles (recepcion_id, producto_id, cantidad_recibida, ubicacion_id)
  VALUES
    (rec9_id, 5, 300, 1),
    (rec9_id, 6, 400, 1),
    (rec9_id, 7, 250, 1);

  UPDATE productos SET stock_actual = stock_actual + 300 WHERE producto_id = 5;
  UPDATE productos SET stock_actual = stock_actual + 400 WHERE producto_id = 6;
  UPDATE productos SET stock_actual = stock_actual + 250 WHERE producto_id = 7;

  INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad)
  VALUES (5, 1, 300), (6, 1, 400), (7, 1, 250)
  ON CONFLICT (producto_id, ubicacion_id) DO UPDATE
  SET cantidad = inventario_ubicaciones.cantidad + EXCLUDED.cantidad;

  -- Recepción 10: Pacífico (más reciente)
  INSERT INTO recepciones (numero_documento, proveedor_id, fecha_recepcion, usuario_recibe, observaciones)
  VALUES ('PAC-2024-777', prov_pacifico_id, NOW() - INTERVAL '2 days', 1, 'Última entrega - Todo conforme')
  RETURNING recepcion_id INTO rec10_id;

  INSERT INTO recepcion_detalles (recepcion_id, producto_id, cantidad_recibida, ubicacion_id)
  VALUES
    (rec10_id, 1, 400, 3),
    (rec10_id, 4, 150, 2),
    (rec10_id, 5, 120, 1);

  UPDATE productos SET stock_actual = stock_actual + 400 WHERE producto_id = 1;
  UPDATE productos SET stock_actual = stock_actual + 150 WHERE producto_id = 4;
  UPDATE productos SET stock_actual = stock_actual + 120 WHERE producto_id = 5;

  INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad)
  VALUES (1, 3, 400), (4, 2, 150), (5, 1, 120)
  ON CONFLICT (producto_id, ubicacion_id) DO UPDATE
  SET cantidad = inventario_ubicaciones.cantidad + EXCLUDED.cantidad;

  -- Mensaje de confirmación
  RAISE NOTICE 'Se crearon 10 recepciones con sus detalles e inventario actualizado';
END $$;

-- Verificar resultados
SELECT
  COUNT(*) as total_proveedores,
  COUNT(*) FILTER (WHERE activo = TRUE) as activos,
  COUNT(*) FILTER (WHERE activo = FALSE) as inactivos
FROM proveedores;

SELECT COUNT(*) as total_recepciones FROM recepciones;

SELECT
  p.nombre as proveedor,
  COUNT(r.recepcion_id) as num_recepciones
FROM proveedores p
LEFT JOIN recepciones r ON p.proveedor_id = r.proveedor_id
GROUP BY p.proveedor_id, p.nombre
ORDER BY num_recepciones DESC;

-- ============================================
-- SEED DATA: Productos, Ubicaciones e Inventario
-- ============================================

-- ============================================
-- PRODUCTOS ADICIONALES
-- ============================================

INSERT INTO productos (codigo, nombre, descripcion, categoria, precio_base, stock_actual, activo) VALUES
  -- Categoría: Ferretería
  ('FERR-001', 'Taladro eléctrico 500W', 'Taladro percutor con velocidad variable', 'Ferretería', 185000, 0, TRUE),
  ('FERR-002', 'Sierra circular 7"', 'Sierra circular con guía láser', 'Ferretería', 245000, 0, TRUE),
  ('FERR-003', 'Llave inglesa 12"', 'Llave ajustable cromada', 'Ferretería', 28000, 0, TRUE),
  ('FERR-004', 'Alicate universal 8"', 'Alicate con empuñadura ergonómica', 'Ferretería', 22000, 0, TRUE),
  ('FERR-005', 'Cinta métrica 5m', 'Flexómetro con freno automático', 'Ferretería', 15000, 0, TRUE),
  ('FERR-006', 'Nivel de burbuja 24"', 'Nivel de aluminio profesional', 'Ferretería', 35000, 0, TRUE),
  ('FERR-007', 'Juego de llaves hexagonales', 'Set de 9 piezas métricas', 'Ferretería', 18000, 0, TRUE),
  ('FERR-008', 'Cinta aislante eléctrica', 'Rollo 18m x 19mm negro', 'Ferretería', 3500, 0, TRUE),

  -- Categoría: Alimentos
  ('ALIM-001', 'Pasta Espagueti 500g', 'Pasta de sémola de trigo', 'Alimentos', 4500, 0, TRUE),
  ('ALIM-002', 'Salsa de Tomate 400g', 'Salsa de tomate natural', 'Alimentos', 3800, 0, TRUE),
  ('ALIM-003', 'Atún en Lata 170g', 'Atún en agua, bajo en sodio', 'Alimentos', 6500, 0, TRUE),
  ('ALIM-004', 'Sal de Mesa 500g', 'Sal refinada yodada', 'Alimentos', 2200, 0, TRUE),
  ('ALIM-005', 'Café Molido 250g', 'Café 100% colombiano', 'Alimentos', 12000, 0, TRUE),
  ('ALIM-006', 'Leche en Polvo 900g', 'Leche entera en polvo fortificada', 'Alimentos', 18500, 0, TRUE),
  ('ALIM-007', 'Galletas Saladas 300g', 'Galletas soda integrales', 'Alimentos', 5200, 0, TRUE),
  ('ALIM-008', 'Chocolate en Barra 100g', 'Chocolate oscuro 70% cacao', 'Alimentos', 8500, 0, TRUE),

  -- Categoría: Limpieza
  ('LIMP-001', 'Jabón Líquido para Manos 500ml', 'Antibacterial con aloe vera', 'Limpieza', 8900, 0, TRUE),
  ('LIMP-002', 'Limpiador Multiusos 1L', 'Desengrasante concentrado', 'Limpieza', 12500, 0, TRUE),
  ('LIMP-003', 'Cloro Desinfectante 1L', 'Hipoclorito de sodio 5%', 'Limpieza', 5800, 0, TRUE),
  ('LIMP-004', 'Escoba de Cerda Suave', 'Con mango de madera 1.2m', 'Limpieza', 18000, 0, TRUE),
  ('LIMP-005', 'Trapero de Microfibra', 'Sistema giratorio 360°', 'Limpieza', 35000, 0, TRUE),
  ('LIMP-006', 'Esponja Multiusos x6', 'Doble cara abrasiva y suave', 'Limpieza', 6500, 0, TRUE),
  ('LIMP-007', 'Bolsas de Basura 30L x50', 'Extra resistentes color negro', 'Limpieza', 15000, 0, TRUE),
  ('LIMP-008', 'Guantes de Látex Talla M', 'Caja x100 unidades', 'Limpieza', 22000, 0, TRUE),

  -- Categoría: Oficina
  ('OFIC-001', 'Resma Papel Carta 500h', 'Papel bond blanco 75g', 'Oficina', 15000, 0, TRUE),
  ('OFIC-002', 'Bolígrafos Azul x12', 'Punta fina 0.7mm', 'Oficina', 8000, 0, TRUE),
  ('OFIC-003', 'Marcadores Permanente x4', 'Negro, azul, rojo, verde', 'Oficina', 12000, 0, TRUE),
  ('OFIC-004', 'Carpeta Archivadora A-Z', 'Con índice alfabético', 'Oficina', 18500, 0, TRUE),
  ('OFIC-005', 'Calculadora Científica', 'Con funciones trigonométricas', 'Oficina', 45000, 0, TRUE),
  ('OFIC-006', 'Grapadora Metálica', 'Capacidad 25 hojas', 'Oficina', 22000, 0, TRUE),
  ('OFIC-007', 'Caja de Grapas x5000', 'Estándar 26/6', 'Oficina', 3500, 0, TRUE),
  ('OFIC-008', 'Tijeras 8" Acero', 'Mango ergonómico', 'Oficina', 12000, 0, TRUE),

  -- Categoría: Electrónica
  ('ELEC-001', 'Cable USB-C 2m', 'Carga rápida 3A', 'Electrónica', 18000, 0, TRUE),
  ('ELEC-002', 'Cargador de Pared 2 Puertos', 'USB dual 2.4A', 'Electrónica', 25000, 0, TRUE),
  ('ELEC-003', 'Auriculares In-Ear', 'Con micrófono integrado', 'Electrónica', 35000, 0, TRUE),
  ('ELEC-004', 'Mouse Inalámbrico', 'USB nano receptor', 'Electrónica', 42000, 0, TRUE),
  ('ELEC-005', 'Teclado USB Español', 'Resistente a salpicaduras', 'Electrónica', 55000, 0, TRUE),
  ('ELEC-006', 'Memoria USB 32GB', 'USB 3.0 alta velocidad', 'Electrónica', 28000, 0, TRUE),
  ('ELEC-007', 'Protector de Voltaje 6 Tomas', 'Con cable 2m', 'Electrónica', 48000, 0, TRUE),
  ('ELEC-008', 'Linterna LED Recargable', 'Con zoom ajustable', 'Electrónica', 32000, 0, TRUE),

  -- Categoría: Hogar
  ('HOGAR-001', 'Toalla de Baño 70x140cm', 'Algodón 100%', 'Hogar', 35000, 0, TRUE),
  ('HOGAR-002', 'Juego de Sábanas Doble', 'Microfibra suave', 'Hogar', 65000, 0, TRUE),
  ('HOGAR-003', 'Almohada Viscoelástica', 'Con funda lavable', 'Hogar', 45000, 0, TRUE),
  ('HOGAR-004', 'Tapete Antideslizante 60x90', 'Para baño o cocina', 'Hogar', 28000, 0, TRUE),
  ('HOGAR-005', 'Cortina de Baño 180x180', 'Resistente al moho', 'Hogar', 38000, 0, TRUE),
  ('HOGAR-006', 'Set de Toallas de Cocina x3', 'Microfibra absorbente', 'Hogar', 18000, 0, TRUE),
  ('HOGAR-007', 'Organizador de Closet 6 Niveles', 'Colgante plegable', 'Hogar', 42000, 0, TRUE),
  ('HOGAR-008', 'Perchero de Pie Giratorio', 'Metal cromado resistente', 'Hogar', 95000, 0, TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- UBICACIONES ADICIONALES (Estructura de Bodega Real)
-- ============================================

INSERT INTO ubicaciones (codigo, descripcion, estanteria, fila, nivel, orden_ruta, activa) VALUES
  -- Estantería A (Ferretería)
  ('A-01-01', 'Estantería A - Fila 1 - Nivel 1', 'A', '01', '01', 10, TRUE),
  ('A-01-02', 'Estantería A - Fila 1 - Nivel 2', 'A', '01', '02', 11, TRUE),
  ('A-01-03', 'Estantería A - Fila 1 - Nivel 3', 'A', '01', '03', 12, TRUE),
  ('A-02-01', 'Estantería A - Fila 2 - Nivel 1', 'A', '02', '01', 13, TRUE),
  ('A-02-02', 'Estantería A - Fila 2 - Nivel 2', 'A', '02', '02', 14, TRUE),
  ('A-02-03', 'Estantería A - Fila 2 - Nivel 3', 'A', '02', '03', 15, TRUE),

  -- Estantería B (Alimentos)
  ('B-01-01', 'Estantería B - Fila 1 - Nivel 1', 'B', '01', '01', 20, TRUE),
  ('B-01-02', 'Estantería B - Fila 1 - Nivel 2', 'B', '01', '02', 21, TRUE),
  ('B-01-03', 'Estantería B - Fila 1 - Nivel 3', 'B', '01', '03', 22, TRUE),
  ('B-02-01', 'Estantería B - Fila 2 - Nivel 1', 'B', '02', '01', 23, TRUE),
  ('B-02-02', 'Estantería B - Fila 2 - Nivel 2', 'B', '02', '02', 24, TRUE),
  ('B-02-03', 'Estantería B - Fila 2 - Nivel 3', 'B', '02', '03', 25, TRUE),

  -- Estantería C (Limpieza)
  ('C-01-01', 'Estantería C - Fila 1 - Nivel 1', 'C', '01', '01', 30, TRUE),
  ('C-01-02', 'Estantería C - Fila 1 - Nivel 2', 'C', '01', '02', 31, TRUE),
  ('C-01-03', 'Estantería C - Fila 1 - Nivel 3', 'C', '01', '03', 32, TRUE),
  ('C-02-01', 'Estantería C - Fila 2 - Nivel 1', 'C', '02', '01', 33, TRUE),
  ('C-02-02', 'Estantería C - Fila 2 - Nivel 2', 'C', '02', '02', 34, TRUE),

  -- Estantería D (Oficina)
  ('D-01-01', 'Estantería D - Fila 1 - Nivel 1', 'D', '01', '01', 40, TRUE),
  ('D-01-02', 'Estantería D - Fila 1 - Nivel 2', 'D', '01', '02', 41, TRUE),
  ('D-01-03', 'Estantería D - Fila 1 - Nivel 3', 'D', '01', '03', 42, TRUE),
  ('D-02-01', 'Estantería D - Fila 2 - Nivel 1', 'D', '02', '01', 43, TRUE),

  -- Estantería E (Electrónica)
  ('E-01-01', 'Estantería E - Fila 1 - Nivel 1', 'E', '01', '01', 50, TRUE),
  ('E-01-02', 'Estantería E - Fila 1 - Nivel 2', 'E', '01', '02', 51, TRUE),
  ('E-01-03', 'Estantería E - Fila 1 - Nivel 3', 'E', '01', '03', 52, TRUE),
  ('E-02-01', 'Estantería E - Fila 2 - Nivel 1', 'E', '02', '01', 53, TRUE),

  -- Estantería F (Hogar)
  ('F-01-01', 'Estantería F - Fila 1 - Nivel 1', 'F', '01', '01', 60, TRUE),
  ('F-01-02', 'Estantería F - Fila 1 - Nivel 2', 'F', '01', '02', 61, TRUE),
  ('F-02-01', 'Estantería F - Fila 2 - Nivel 1', 'F', '02', '01', 62, TRUE),
  ('F-02-02', 'Estantería F - Fila 2 - Nivel 2', 'F', '02', '02', 63, TRUE),

  -- Zonas especiales
  ('RECIBO', 'Zona de Recibo de Mercancía', NULL, NULL, NULL, 1, TRUE),
  ('DESPACHO', 'Zona de Despacho', NULL, NULL, NULL, 99, TRUE),
  ('ALTA-ROT', 'Productos de Alta Rotación', NULL, NULL, NULL, 5, TRUE),
  ('OVERFLOW', 'Área de Overflow', NULL, NULL, NULL, 95, TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- ASIGNAR PRODUCTOS A UBICACIONES CON INVENTARIO
-- ============================================

-- Primero vamos a obtener los IDs y luego asignar
DO $$
DECLARE
  -- Variables para productos
  p_ferr1 INT; p_ferr2 INT; p_ferr3 INT; p_ferr4 INT; p_ferr5 INT; p_ferr6 INT; p_ferr7 INT; p_ferr8 INT;
  p_alim1 INT; p_alim2 INT; p_alim3 INT; p_alim4 INT; p_alim5 INT; p_alim6 INT; p_alim7 INT; p_alim8 INT;
  p_limp1 INT; p_limp2 INT; p_limp3 INT; p_limp4 INT; p_limp5 INT; p_limp6 INT; p_limp7 INT; p_limp8 INT;
  p_ofic1 INT; p_ofic2 INT; p_ofic3 INT; p_ofic4 INT; p_ofic5 INT; p_ofic6 INT; p_ofic7 INT; p_ofic8 INT;
  p_elec1 INT; p_elec2 INT; p_elec3 INT; p_elec4 INT; p_elec5 INT; p_elec6 INT; p_elec7 INT; p_elec8 INT;
  p_hogar1 INT; p_hogar2 INT; p_hogar3 INT; p_hogar4 INT; p_hogar5 INT; p_hogar6 INT; p_hogar7 INT; p_hogar8 INT;

  -- Variables para ubicaciones
  u_a0101 INT; u_a0102 INT; u_a0103 INT; u_a0201 INT; u_a0202 INT; u_a0203 INT;
  u_b0101 INT; u_b0102 INT; u_b0103 INT; u_b0201 INT; u_b0202 INT; u_b0203 INT;
  u_c0101 INT; u_c0102 INT; u_c0103 INT; u_c0201 INT; u_c0202 INT;
  u_d0101 INT; u_d0102 INT; u_d0103 INT; u_d0201 INT;
  u_e0101 INT; u_e0102 INT; u_e0103 INT; u_e0201 INT;
  u_f0101 INT; u_f0102 INT; u_f0201 INT; u_f0202 INT;
  u_recibo INT; u_despacho INT; u_altarot INT;

BEGIN
  -- Obtener IDs de productos
  SELECT producto_id INTO p_ferr1 FROM productos WHERE codigo = 'FERR-001';
  SELECT producto_id INTO p_ferr2 FROM productos WHERE codigo = 'FERR-002';
  SELECT producto_id INTO p_ferr3 FROM productos WHERE codigo = 'FERR-003';
  SELECT producto_id INTO p_ferr4 FROM productos WHERE codigo = 'FERR-004';
  SELECT producto_id INTO p_ferr5 FROM productos WHERE codigo = 'FERR-005';
  SELECT producto_id INTO p_ferr6 FROM productos WHERE codigo = 'FERR-006';
  SELECT producto_id INTO p_ferr7 FROM productos WHERE codigo = 'FERR-007';
  SELECT producto_id INTO p_ferr8 FROM productos WHERE codigo = 'FERR-008';

  SELECT producto_id INTO p_alim1 FROM productos WHERE codigo = 'ALIM-001';
  SELECT producto_id INTO p_alim2 FROM productos WHERE codigo = 'ALIM-002';
  SELECT producto_id INTO p_alim3 FROM productos WHERE codigo = 'ALIM-003';
  SELECT producto_id INTO p_alim4 FROM productos WHERE codigo = 'ALIM-004';
  SELECT producto_id INTO p_alim5 FROM productos WHERE codigo = 'ALIM-005';
  SELECT producto_id INTO p_alim6 FROM productos WHERE codigo = 'ALIM-006';
  SELECT producto_id INTO p_alim7 FROM productos WHERE codigo = 'ALIM-007';
  SELECT producto_id INTO p_alim8 FROM productos WHERE codigo = 'ALIM-008';

  SELECT producto_id INTO p_limp1 FROM productos WHERE codigo = 'LIMP-001';
  SELECT producto_id INTO p_limp2 FROM productos WHERE codigo = 'LIMP-002';
  SELECT producto_id INTO p_limp3 FROM productos WHERE codigo = 'LIMP-003';
  SELECT producto_id INTO p_limp4 FROM productos WHERE codigo = 'LIMP-004';
  SELECT producto_id INTO p_limp5 FROM productos WHERE codigo = 'LIMP-005';
  SELECT producto_id INTO p_limp6 FROM productos WHERE codigo = 'LIMP-006';
  SELECT producto_id INTO p_limp7 FROM productos WHERE codigo = 'LIMP-007';
  SELECT producto_id INTO p_limp8 FROM productos WHERE codigo = 'LIMP-008';

  SELECT producto_id INTO p_ofic1 FROM productos WHERE codigo = 'OFIC-001';
  SELECT producto_id INTO p_ofic2 FROM productos WHERE codigo = 'OFIC-002';
  SELECT producto_id INTO p_ofic3 FROM productos WHERE codigo = 'OFIC-003';
  SELECT producto_id INTO p_ofic4 FROM productos WHERE codigo = 'OFIC-004';
  SELECT producto_id INTO p_ofic5 FROM productos WHERE codigo = 'OFIC-005';
  SELECT producto_id INTO p_ofic6 FROM productos WHERE codigo = 'OFIC-006';
  SELECT producto_id INTO p_ofic7 FROM productos WHERE codigo = 'OFIC-007';
  SELECT producto_id INTO p_ofic8 FROM productos WHERE codigo = 'OFIC-008';

  SELECT producto_id INTO p_elec1 FROM productos WHERE codigo = 'ELEC-001';
  SELECT producto_id INTO p_elec2 FROM productos WHERE codigo = 'ELEC-002';
  SELECT producto_id INTO p_elec3 FROM productos WHERE codigo = 'ELEC-003';
  SELECT producto_id INTO p_elec4 FROM productos WHERE codigo = 'ELEC-004';
  SELECT producto_id INTO p_elec5 FROM productos WHERE codigo = 'ELEC-005';
  SELECT producto_id INTO p_elec6 FROM productos WHERE codigo = 'ELEC-006';
  SELECT producto_id INTO p_elec7 FROM productos WHERE codigo = 'ELEC-007';
  SELECT producto_id INTO p_elec8 FROM productos WHERE codigo = 'ELEC-008';

  SELECT producto_id INTO p_hogar1 FROM productos WHERE codigo = 'HOGAR-001';
  SELECT producto_id INTO p_hogar2 FROM productos WHERE codigo = 'HOGAR-002';
  SELECT producto_id INTO p_hogar3 FROM productos WHERE codigo = 'HOGAR-003';
  SELECT producto_id INTO p_hogar4 FROM productos WHERE codigo = 'HOGAR-004';
  SELECT producto_id INTO p_hogar5 FROM productos WHERE codigo = 'HOGAR-005';
  SELECT producto_id INTO p_hogar6 FROM productos WHERE codigo = 'HOGAR-006';
  SELECT producto_id INTO p_hogar7 FROM productos WHERE codigo = 'HOGAR-007';
  SELECT producto_id INTO p_hogar8 FROM productos WHERE codigo = 'HOGAR-008';

  -- Obtener IDs de ubicaciones
  SELECT ubicacion_id INTO u_a0101 FROM ubicaciones WHERE codigo = 'A-01-01';
  SELECT ubicacion_id INTO u_a0102 FROM ubicaciones WHERE codigo = 'A-01-02';
  SELECT ubicacion_id INTO u_a0103 FROM ubicaciones WHERE codigo = 'A-01-03';
  SELECT ubicacion_id INTO u_a0201 FROM ubicaciones WHERE codigo = 'A-02-01';
  SELECT ubicacion_id INTO u_a0202 FROM ubicaciones WHERE codigo = 'A-02-02';
  SELECT ubicacion_id INTO u_a0203 FROM ubicaciones WHERE codigo = 'A-02-03';

  SELECT ubicacion_id INTO u_b0101 FROM ubicaciones WHERE codigo = 'B-01-01';
  SELECT ubicacion_id INTO u_b0102 FROM ubicaciones WHERE codigo = 'B-01-02';
  SELECT ubicacion_id INTO u_b0103 FROM ubicaciones WHERE codigo = 'B-01-03';
  SELECT ubicacion_id INTO u_b0201 FROM ubicaciones WHERE codigo = 'B-02-01';
  SELECT ubicacion_id INTO u_b0202 FROM ubicaciones WHERE codigo = 'B-02-02';
  SELECT ubicacion_id INTO u_b0203 FROM ubicaciones WHERE codigo = 'B-02-03';

  SELECT ubicacion_id INTO u_c0101 FROM ubicaciones WHERE codigo = 'C-01-01';
  SELECT ubicacion_id INTO u_c0102 FROM ubicaciones WHERE codigo = 'C-01-02';
  SELECT ubicacion_id INTO u_c0103 FROM ubicaciones WHERE codigo = 'C-01-03';
  SELECT ubicacion_id INTO u_c0201 FROM ubicaciones WHERE codigo = 'C-02-01';
  SELECT ubicacion_id INTO u_c0202 FROM ubicaciones WHERE codigo = 'C-02-02';

  SELECT ubicacion_id INTO u_d0101 FROM ubicaciones WHERE codigo = 'D-01-01';
  SELECT ubicacion_id INTO u_d0102 FROM ubicaciones WHERE codigo = 'D-01-02';
  SELECT ubicacion_id INTO u_d0103 FROM ubicaciones WHERE codigo = 'D-01-03';
  SELECT ubicacion_id INTO u_d0201 FROM ubicaciones WHERE codigo = 'D-02-01';

  SELECT ubicacion_id INTO u_e0101 FROM ubicaciones WHERE codigo = 'E-01-01';
  SELECT ubicacion_id INTO u_e0102 FROM ubicaciones WHERE codigo = 'E-01-02';
  SELECT ubicacion_id INTO u_e0103 FROM ubicaciones WHERE codigo = 'E-01-03';
  SELECT ubicacion_id INTO u_e0201 FROM ubicaciones WHERE codigo = 'E-02-01';

  SELECT ubicacion_id INTO u_f0101 FROM ubicaciones WHERE codigo = 'F-01-01';
  SELECT ubicacion_id INTO u_f0102 FROM ubicaciones WHERE codigo = 'F-01-02';
  SELECT ubicacion_id INTO u_f0201 FROM ubicaciones WHERE codigo = 'F-02-01';
  SELECT ubicacion_id INTO u_f0202 FROM ubicaciones WHERE codigo = 'F-02-02';

  SELECT ubicacion_id INTO u_recibo FROM ubicaciones WHERE codigo = 'RECIBO';
  SELECT ubicacion_id INTO u_despacho FROM ubicaciones WHERE codigo = 'DESPACHO';
  SELECT ubicacion_id INTO u_altarot FROM ubicaciones WHERE codigo = 'ALTA-ROT';

  -- Asignar productos de FERRETERÍA a ubicaciones Estantería A
  INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad, es_ubicacion_primaria) VALUES
    (p_ferr1, u_a0101, 25, TRUE),
    (p_ferr2, u_a0102, 18, TRUE),
    (p_ferr3, u_a0103, 45, TRUE),
    (p_ferr3, u_altarot, 15, FALSE), -- Alta rotación
    (p_ferr4, u_a0201, 60, TRUE),
    (p_ferr5, u_a0202, 80, TRUE),
    (p_ferr5, u_altarot, 20, FALSE),
    (p_ferr6, u_a0203, 30, TRUE),
    (p_ferr7, u_a0101, 40, FALSE), -- Ubicación secundaria
    (p_ferr8, u_a0102, 120, TRUE)
  ON CONFLICT (producto_id, ubicacion_id) DO NOTHING;

  -- Asignar productos de ALIMENTOS a ubicaciones Estantería B
  INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad, es_ubicacion_primaria) VALUES
    (p_alim1, u_b0101, 150, TRUE),
    (p_alim1, u_altarot, 50, FALSE),
    (p_alim2, u_b0102, 200, TRUE),
    (p_alim3, u_b0103, 180, TRUE),
    (p_alim4, u_b0201, 250, TRUE),
    (p_alim4, u_altarot, 100, FALSE),
    (p_alim5, u_b0202, 90, TRUE),
    (p_alim6, u_b0203, 75, TRUE),
    (p_alim7, u_b0101, 120, FALSE),
    (p_alim8, u_b0102, 100, FALSE)
  ON CONFLICT (producto_id, ubicacion_id) DO NOTHING;

  -- Asignar productos de LIMPIEZA a ubicaciones Estantería C
  INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad, es_ubicacion_primaria) VALUES
    (p_limp1, u_c0101, 85, TRUE),
    (p_limp2, u_c0102, 65, TRUE),
    (p_limp3, u_c0103, 110, TRUE),
    (p_limp3, u_altarot, 40, FALSE),
    (p_limp4, u_c0201, 45, TRUE),
    (p_limp5, u_c0202, 35, TRUE),
    (p_limp6, u_c0101, 150, FALSE),
    (p_limp7, u_c0102, 200, FALSE),
    (p_limp8, u_c0103, 90, FALSE)
  ON CONFLICT (producto_id, ubicacion_id) DO NOTHING;

  -- Asignar productos de OFICINA a ubicaciones Estantería D
  INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad, es_ubicacion_primaria) VALUES
    (p_ofic1, u_d0101, 100, TRUE),
    (p_ofic2, u_d0102, 180, TRUE),
    (p_ofic2, u_altarot, 50, FALSE),
    (p_ofic3, u_d0103, 95, TRUE),
    (p_ofic4, u_d0201, 60, TRUE),
    (p_ofic5, u_d0101, 25, FALSE),
    (p_ofic6, u_d0102, 70, FALSE),
    (p_ofic7, u_d0103, 200, FALSE),
    (p_ofic8, u_d0201, 55, FALSE)
  ON CONFLICT (producto_id, ubicacion_id) DO NOTHING;

  -- Asignar productos de ELECTRÓNICA a ubicaciones Estantería E
  INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad, es_ubicacion_primaria) VALUES
    (p_elec1, u_e0101, 120, TRUE),
    (p_elec1, u_altarot, 30, FALSE),
    (p_elec2, u_e0102, 80, TRUE),
    (p_elec3, u_e0103, 95, TRUE),
    (p_elec4, u_e0201, 65, TRUE),
    (p_elec5, u_e0101, 50, FALSE),
    (p_elec6, u_e0102, 140, FALSE),
    (p_elec7, u_e0103, 45, FALSE),
    (p_elec8, u_e0201, 70, FALSE)
  ON CONFLICT (producto_id, ubicacion_id) DO NOTHING;

  -- Asignar productos de HOGAR a ubicaciones Estantería F
  INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad, es_ubicacion_primaria) VALUES
    (p_hogar1, u_f0101, 60, TRUE),
    (p_hogar2, u_f0102, 40, TRUE),
    (p_hogar3, u_f0201, 55, TRUE),
    (p_hogar4, u_f0202, 75, TRUE),
    (p_hogar5, u_f0101, 50, FALSE),
    (p_hogar6, u_f0102, 90, FALSE),
    (p_hogar7, u_f0201, 35, FALSE),
    (p_hogar8, u_f0202, 18, FALSE)
  ON CONFLICT (producto_id, ubicacion_id) DO NOTHING;

  -- Actualizar stock_actual en tabla productos basado en inventario total
  UPDATE productos p
  SET stock_actual = COALESCE((
    SELECT SUM(cantidad)
    FROM inventario_ubicaciones iu
    WHERE iu.producto_id = p.producto_id
  ), 0)
  WHERE p.producto_id IN (
    p_ferr1, p_ferr2, p_ferr3, p_ferr4, p_ferr5, p_ferr6, p_ferr7, p_ferr8,
    p_alim1, p_alim2, p_alim3, p_alim4, p_alim5, p_alim6, p_alim7, p_alim8,
    p_limp1, p_limp2, p_limp3, p_limp4, p_limp5, p_limp6, p_limp7, p_limp8,
    p_ofic1, p_ofic2, p_ofic3, p_ofic4, p_ofic5, p_ofic6, p_ofic7, p_ofic8,
    p_elec1, p_elec2, p_elec3, p_elec4, p_elec5, p_elec6, p_elec7, p_elec8,
    p_hogar1, p_hogar2, p_hogar3, p_hogar4, p_hogar5, p_hogar6, p_hogar7, p_hogar8
  );

  RAISE NOTICE 'Se agregaron productos, ubicaciones e inventario exitosamente';
END $$;

-- Verificar resultados
SELECT
  'Productos' as tabla,
  COUNT(*) as total
FROM productos
UNION ALL
SELECT
  'Ubicaciones' as tabla,
  COUNT(*) as total
FROM ubicaciones
UNION ALL
SELECT
  'Inventario Ubicaciones' as tabla,
  COUNT(*) as total
FROM inventario_ubicaciones;

-- Verificar datos insertados por seed_productos_ubicaciones.sql

-- Total de productos
SELECT 'Total Productos' as metric, COUNT(*) as count FROM productos;

-- Total de ubicaciones
SELECT 'Total Ubicaciones' as metric, COUNT(*) as count FROM ubicaciones;

-- Total de asociaciones inventario_ubicaciones
SELECT 'Total Inventario-Ubicaciones' as metric, COUNT(*) as count FROM inventario_ubicaciones;

-- Resumen por categoría
SELECT
  categoria,
  COUNT(*) as total_productos,
  SUM(stock_actual) as stock_total
FROM productos
WHERE categoria IS NOT NULL
GROUP BY categoria
ORDER BY categoria;

-- Resumen por estantería
SELECT
  estanteria,
  COUNT(*) as total_ubicaciones,
  zona
FROM ubicaciones
GROUP BY estanteria, zona
ORDER BY estanteria;

-- Muestra de productos con sus ubicaciones e inventario
SELECT
  p.codigo,
  p.nombre,
  p.categoria,
  p.stock_actual as stock_producto,
  u.codigo_ubicacion,
  u.estanteria,
  iu.cantidad as cantidad_en_ubicacion,
  iu.es_ubicacion_primaria
FROM productos p
JOIN inventario_ubicaciones iu ON p.producto_id = iu.producto_id
JOIN ubicaciones u ON iu.ubicacion_id = u.ubicacion_id
WHERE p.categoria IN ('Ferretería', 'Alimentos', 'Electrónica')
ORDER BY p.codigo, iu.es_ubicacion_primaria DESC, u.codigo_ubicacion
LIMIT 20;

-- Verificar consistencia de stock (stock_actual debe = suma de cantidades en ubicaciones)
SELECT
  p.codigo,
  p.nombre,
  p.stock_actual as stock_declarado,
  COALESCE(SUM(iu.cantidad), 0) as stock_en_ubicaciones,
  CASE
    WHEN p.stock_actual = COALESCE(SUM(iu.cantidad), 0) THEN 'OK'
    ELSE 'ERROR'
  END as consistencia
FROM productos p
LEFT JOIN inventario_ubicaciones iu ON p.producto_id = iu.producto_id
GROUP BY p.producto_id, p.codigo, p.nombre, p.stock_actual
HAVING p.stock_actual != COALESCE(SUM(iu.cantidad), 0)
ORDER BY p.codigo;

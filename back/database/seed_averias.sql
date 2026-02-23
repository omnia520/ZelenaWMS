-- Seed de Averías de Ejemplo
-- Ejecutar después de la migración 011_update_averias_system.sql
-- Requiere que existan productos y usuarios en la base de datos

-- Insertar averías de ejemplo (asumiendo que existen productos con IDs 1-5 y usuarios)
-- Ajusta los IDs según tu base de datos

-- Obtener el ID del usuario admin o el primer usuario disponible
DO $$
DECLARE
    v_usuario_id INTEGER;
    v_producto1_id INTEGER;
    v_producto2_id INTEGER;
    v_producto3_id INTEGER;
    v_producto4_id INTEGER;
    v_producto5_id INTEGER;
    v_ubicacion_id INTEGER;
    v_averia1_id INTEGER;
    v_averia2_id INTEGER;
    v_averia3_id INTEGER;
    v_averia4_id INTEGER;
    v_averia5_id INTEGER;
    v_averia6_id INTEGER;
BEGIN
    -- Obtener usuario para reportar (preferir operario o admin)
    SELECT usuario_id INTO v_usuario_id
    FROM usuarios
    WHERE rol IN ('Operario', 'Administrador')
    LIMIT 1;

    IF v_usuario_id IS NULL THEN
        SELECT usuario_id INTO v_usuario_id FROM usuarios LIMIT 1;
    END IF;

    -- Obtener algunos productos existentes
    SELECT producto_id INTO v_producto1_id FROM productos WHERE activo = true LIMIT 1 OFFSET 0;
    SELECT producto_id INTO v_producto2_id FROM productos WHERE activo = true LIMIT 1 OFFSET 1;
    SELECT producto_id INTO v_producto3_id FROM productos WHERE activo = true LIMIT 1 OFFSET 2;
    SELECT producto_id INTO v_producto4_id FROM productos WHERE activo = true LIMIT 1 OFFSET 3;
    SELECT producto_id INTO v_producto5_id FROM productos WHERE activo = true LIMIT 1 OFFSET 4;

    -- Obtener una ubicación (opcional)
    SELECT ubicacion_id INTO v_ubicacion_id FROM ubicaciones LIMIT 1;

    -- Solo insertar si tenemos al menos un producto y un usuario
    IF v_usuario_id IS NOT NULL AND v_producto1_id IS NOT NULL THEN

        -- Avería 1: Pendiente - Daño
        INSERT INTO averias (producto_id, cantidad, tipo_averia, descripcion, ubicacion_id, estado, reportado_por, fecha_reporte)
        VALUES (
            v_producto1_id,
            3,
            'Daño',
            'Producto con embalaje dañado durante el transporte. Se observan abolladuras en la caja exterior.',
            v_ubicacion_id,
            'Pendiente',
            v_usuario_id,
            CURRENT_TIMESTAMP - INTERVAL '2 days'
        ) RETURNING averia_id INTO v_averia1_id;

        -- Agregar evidencias para avería 1
        INSERT INTO averia_evidencias (averia_id, foto_url, descripcion, orden) VALUES
        (v_averia1_id, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400', 'Vista frontal del daño', 0),
        (v_averia1_id, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'Detalle de la abolladura', 1);

        -- Avería 2: Pendiente - Rotura
        IF v_producto2_id IS NOT NULL THEN
            INSERT INTO averias (producto_id, cantidad, tipo_averia, descripcion, estado, reportado_por, fecha_reporte)
            VALUES (
                v_producto2_id,
                5,
                'Rotura',
                'Productos rotos encontrados durante inventario. Posible caída de estante.',
                'Pendiente',
                v_usuario_id,
                CURRENT_TIMESTAMP - INTERVAL '1 day'
            ) RETURNING averia_id INTO v_averia2_id;

            INSERT INTO averia_evidencias (averia_id, foto_url, descripcion, orden) VALUES
            (v_averia2_id, 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400', 'Productos rotos', 0);
        END IF;

        -- Avería 3: Pendiente - Faltante
        IF v_producto3_id IS NOT NULL THEN
            INSERT INTO averias (producto_id, cantidad, tipo_averia, descripcion, estado, reportado_por, fecha_reporte)
            VALUES (
                v_producto3_id,
                10,
                'Faltante',
                'Diferencia encontrada en conteo de inventario. Faltan 10 unidades según el sistema.',
                'Pendiente',
                v_usuario_id,
                CURRENT_TIMESTAMP - INTERVAL '3 hours'
            ) RETURNING averia_id INTO v_averia3_id;
        END IF;

        -- Avería 4: Repuesta (resuelta)
        IF v_producto4_id IS NOT NULL THEN
            INSERT INTO averias (producto_id, cantidad, tipo_averia, descripcion, estado, reportado_por, fecha_reporte, resuelto_por, fecha_resolucion, inventario_ajustado, cantidad_ajustada)
            VALUES (
                v_producto4_id,
                2,
                'Daño',
                'Productos con etiquetas dañadas. Se reemplazaron las etiquetas y el producto está en condiciones de venta.',
                'Repuesta',
                v_usuario_id,
                CURRENT_TIMESTAMP - INTERVAL '5 days',
                v_usuario_id,
                CURRENT_TIMESTAMP - INTERVAL '3 days',
                true,
                2
            ) RETURNING averia_id INTO v_averia4_id;

            INSERT INTO averia_evidencias (averia_id, foto_url, descripcion, orden) VALUES
            (v_averia4_id, 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400', 'Etiqueta dañada', 0),
            (v_averia4_id, 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=400', 'Producto reparado', 1);
        END IF;

        -- Avería 5: Descartada
        IF v_producto5_id IS NOT NULL THEN
            INSERT INTO averias (producto_id, cantidad, tipo_averia, descripcion, estado, reportado_por, fecha_reporte, resuelto_por, fecha_resolucion, inventario_ajustado, cantidad_ajustada)
            VALUES (
                v_producto5_id,
                8,
                'Vencimiento',
                'Productos vencidos encontrados en almacén. Se procede a dar de baja del inventario.',
                'Descartada',
                v_usuario_id,
                CURRENT_TIMESTAMP - INTERVAL '7 days',
                v_usuario_id,
                CURRENT_TIMESTAMP - INTERVAL '6 days',
                true,
                8
            ) RETURNING averia_id INTO v_averia5_id;

            INSERT INTO averia_evidencias (averia_id, foto_url, descripcion, orden) VALUES
            (v_averia5_id, 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400', 'Fecha de vencimiento visible', 0);
        END IF;

        -- Avería 6: Pendiente - Vencimiento (reciente)
        IF v_producto1_id IS NOT NULL THEN
            INSERT INTO averias (producto_id, cantidad, tipo_averia, descripcion, estado, reportado_por, fecha_reporte)
            VALUES (
                v_producto1_id,
                15,
                'Vencimiento',
                'Lote próximo a vencer. Requiere revisión para determinar si se puede vender con descuento o dar de baja.',
                'Pendiente',
                v_usuario_id,
                CURRENT_TIMESTAMP - INTERVAL '30 minutes'
            ) RETURNING averia_id INTO v_averia6_id;
        END IF;

        RAISE NOTICE 'Averías de ejemplo insertadas correctamente';
        RAISE NOTICE 'Usuario reportador ID: %', v_usuario_id;
        RAISE NOTICE 'Averías creadas: 6 (3 Pendientes, 1 Repuesta, 1 Descartada, 1 Pendiente reciente)';

    ELSE
        RAISE NOTICE 'No se encontraron productos o usuarios. Por favor, asegúrate de tener datos en las tablas productos y usuarios.';
    END IF;

END $$;

-- Verificar las averías insertadas
SELECT
    a.averia_id,
    p.codigo as producto_codigo,
    p.nombre as producto_nombre,
    a.cantidad,
    a.tipo_averia,
    a.estado,
    u.nombre as reportado_por,
    a.fecha_reporte,
    (SELECT COUNT(*) FROM averia_evidencias e WHERE e.averia_id = a.averia_id) as num_evidencias
FROM averias a
JOIN productos p ON a.producto_id = p.producto_id
JOIN usuarios u ON a.reportado_por = u.usuario_id
ORDER BY a.fecha_reporte DESC;

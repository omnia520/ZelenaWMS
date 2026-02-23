const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

async function poblarDatos() {
  console.log('🚀 Poblando base de datos con datos de prueba...\n');

  const client = await pool.connect();

  try {
    console.log('✓ Conexión exitosa\n');

    // USUARIOS (con ON CONFLICT para evitar duplicados)
    console.log('  → Insertando usuarios...');
    await client.query(`
      INSERT INTO usuarios (nombre, nombre_usuario, email, password_hash, telefono, rol) VALUES
      ('Administrador', 'admin', 'admin@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', '3000000000', 'Administrador'),
      ('Juan Pérez', 'vendedor1', 'vendedor@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', '3001234567', 'Vendedor'),
      ('María García', 'jefe_bodega', 'jefe@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', '3007654321', 'Jefe_Bodega'),
      ('Carlos López', 'operario1', 'operario1@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', '3009876543', 'Operario'),
      ('Ana Martínez', 'operario2', 'operario2@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', '3005432109', 'Operario'),
      ('Luis Rodríguez', 'facturacion', 'facturacion@wms.com', '$2b$10$rGvM6W5V5qKmH3xhD.fJUeF.rJhGqJm7dGN5eKxN8FQGDmPvLdYqG', '3002345678', 'Facturacion')
      ON CONFLICT (email) DO NOTHING;
    `);

    // CLIENTES
    console.log('  → Insertando clientes...');
    const adminUser = await client.query(`SELECT usuario_id FROM usuarios WHERE email = 'admin@wms.com' LIMIT 1`);
    const adminId = adminUser.rows[0]?.usuario_id || 1;

    await client.query(`
      INSERT INTO clientes (nit_cc, razon_social, telefono, email, ciudad, departamento, direccion, creado_por) VALUES
      ('900123456-1', 'Distribuidora Belleza Total S.A.S', '6012345678', 'ventas@bellezatotal.com', 'Bogotá', 'Cundinamarca', 'Calle 100 #15-20', ${adminId}),
      ('900234567-2', 'Cosméticos del Norte Ltda', '6043216789', 'compras@cosmeticosnorte.com', 'Medellín', 'Antioquia', 'Carrera 70 #45-30', ${adminId}),
      ('900345678-3', 'Beauty Shop Center', '6025551234', 'info@beautyshop.com', 'Cali', 'Valle del Cauca', 'Avenida 6N #28-15', ${adminId}),
      ('900456789-4', 'Maquillaje Express S.A', '6075678901', 'pedidos@maquillajeexpress.com', 'Barranquilla', 'Atlántico', 'Calle 85 #52-10', ${adminId}),
      ('79456123-5', 'María Fernanda Gómez', '3156789012', 'mafe.gomez@gmail.com', 'Cartagena', 'Bolívar', 'Barrio Manga, Calle 30 #8-45', ${adminId})
      ON CONFLICT (nit_cc) DO NOTHING;
    `);

    // PRODUCTOS
    console.log('  → Insertando productos...');
    await client.query(`
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
      ('FIJ-001', 'Fijador de Maquillaje Spray', 'Spray fijador de larga duración', 'Rostro', 42000, 100, 'https://example.com/fijador.jpg')
      ON CONFLICT (codigo) DO NOTHING;
    `);

    // UBICACIONES
    console.log('  → Insertando ubicaciones...');
    await client.query(`
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
      ('C01-N2', 'Estantería C - Fila 01 - Nivel 2', 'C', '01', '2', 10)
      ON CONFLICT (codigo) DO NOTHING;
    `);

    // INVENTARIO EN UBICACIONES
    console.log('  → Asignando inventario a ubicaciones...');
    await client.query(`
      INSERT INTO inventario_ubicaciones (producto_id, ubicacion_id, cantidad, es_ubicacion_primaria) VALUES
      (1, 1, 80, TRUE), (1, 2, 70, FALSE),
      (2, 1, 120, TRUE), (2, 2, 80, FALSE),
      (3, 3, 100, TRUE), (3, 4, 80, FALSE),
      (4, 3, 70, TRUE), (4, 4, 50, FALSE),
      (5, 5, 55, TRUE), (5, 6, 40, FALSE),
      (6, 5, 50, TRUE), (6, 6, 30, FALSE),
      (7, 7, 40, TRUE), (7, 8, 25, FALSE),
      (8, 7, 65, TRUE), (8, 8, 45, FALSE),
      (9, 9, 60, TRUE), (9, 10, 45, FALSE),
      (10, 9, 55, TRUE), (10, 10, 35, FALSE),
      (11, 1, 80, TRUE), (11, 2, 50, FALSE),
      (12, 1, 50, TRUE), (12, 2, 35, FALSE),
      (13, 3, 100, TRUE), (13, 4, 60, FALSE),
      (14, 5, 45, TRUE), (14, 6, 30, FALSE),
      (15, 5, 60, TRUE), (15, 6, 40, FALSE)
      ON CONFLICT (producto_id, ubicacion_id) DO NOTHING;
    `);

    // ÓRDENES DE VENTA
    console.log('  → Creando órdenes de venta...');

    // Obtener IDs necesarios
    const vendedor = await client.query(`SELECT usuario_id FROM usuarios WHERE email = 'vendedor@wms.com' LIMIT 1`);
    const operario1 = await client.query(`SELECT usuario_id FROM usuarios WHERE email = 'operario1@wms.com' LIMIT 1`);
    const operario2 = await client.query(`SELECT usuario_id FROM usuarios WHERE email = 'operario2@wms.com' LIMIT 1`);
    const cliente1 = await client.query(`SELECT cliente_id FROM clientes WHERE nit_cc = '900123456-1' LIMIT 1`);
    const cliente2 = await client.query(`SELECT cliente_id FROM clientes WHERE nit_cc = '900234567-2' LIMIT 1`);
    const cliente3 = await client.query(`SELECT cliente_id FROM clientes WHERE nit_cc = '900345678-3' LIMIT 1`);
    const cliente4 = await client.query(`SELECT cliente_id FROM clientes WHERE nit_cc = '900456789-4' LIMIT 1`);
    const cliente5 = await client.query(`SELECT cliente_id FROM clientes WHERE nit_cc = '79456123-5' LIMIT 1`);

    const vendedorId = vendedor.rows[0]?.usuario_id;
    const op1Id = operario1.rows[0]?.usuario_id;
    const op2Id = operario2.rows[0]?.usuario_id;
    const c1Id = cliente1.rows[0]?.cliente_id;
    const c2Id = cliente2.rows[0]?.cliente_id;
    const c3Id = cliente3.rows[0]?.cliente_id;
    const c4Id = cliente4.rows[0]?.cliente_id;
    const c5Id = cliente5.rows[0]?.cliente_id;

    if (vendedorId && c1Id && op1Id && op2Id) {
      const orden1 = await client.query(`
        INSERT INTO ordenes_venta (numero_orden, cliente_id, vendedor_id, estado, subtotal, descuento_total, impuestos_total, total, comentarios, alistador_asignado, empacador_asignado)
        VALUES ('ORD-2024001', ${c1Id}, ${vendedorId}, 'Aprobada', 485000, 0, 92150, 577150, 'Pedido urgente para evento', ${op1Id}, ${op2Id})
        ON CONFLICT (numero_orden) DO NOTHING
        RETURNING orden_id;
      `);

      if (orden1.rows.length > 0) {
        await client.query(`
          INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal) VALUES
          (${orden1.rows[0].orden_id}, 1, 10, 35000, 0, 350000),
          (${orden1.rows[0].orden_id}, 6, 2, 65000, 0, 130000),
          (${orden1.rows[0].orden_id}, 15, 1, 42000, 0, 42000);
        `);
      }

      if (c2Id && c3Id && c4Id && c5Id) {
        await client.query(`
          INSERT INTO ordenes_venta (numero_orden, cliente_id, vendedor_id, estado, subtotal, descuento_total, impuestos_total, total, comentarios)
          VALUES
          ('ORD-2024002', ${c2Id}, ${vendedorId}, 'Pendiente_Aprobacion', 245000, 0, 46550, 291550, 'Cliente frecuente'),
          ('ORD-2024003', ${c3Id}, ${vendedorId}, 'Pendiente_Aprobacion', 1221750, 64250, 220132.5, 1377632.5, 'Pedido mayorista - 5% descuento'),
          ('ORD-2024004', ${c4Id}, ${vendedorId}, 'Pendiente_Aprobacion', 589000, 0, 111910, 700910, 'Reposición de inventario'),
          ('ORD-2024005', ${c5Id}, ${vendedorId}, 'Pendiente_Aprobacion', 167000, 0, 31730, 198730, 'Primera compra'),
          ('ORD-2024006', ${c1Id}, ${vendedorId}, 'Pendiente_Aprobacion', 395000, 0, 75050, 470050, 'URGENTE: Para mañana')
          ON CONFLICT (numero_orden) DO NOTHING;
        `);
      }
    }

    // RECEPCIONES
    console.log('  → Creando recepciones...');
    if (op1Id) {
      const recepcion = await client.query(`
        INSERT INTO recepciones (numero_documento, proveedor, fecha_recepcion, usuario_recibe, observaciones)
        VALUES ('REC-2024-001', 'Importadora Belleza Internacional', '2024-01-15', ${op1Id}, 'Llegó en perfectas condiciones')
        RETURNING recepcion_id;
      `);

      if (recepcion.rows.length > 0) {
        await client.query(`
          INSERT INTO recepcion_detalles (recepcion_id, producto_id, cantidad_recibida, ubicacion_id) VALUES
          (${recepcion.rows[0].recepcion_id}, 1, 50, 1),
          (${recepcion.rows[0].recepcion_id}, 4, 30, 3),
          (${recepcion.rows[0].recepcion_id}, 8, 40, 7);
        `);
      }
    }

    console.log('\n✅ ¡Datos insertados exitosamente!\n');
    console.log('📊 Datos creados:');
    console.log('   ✓ 6 Usuarios');
    console.log('   ✓ 5 Clientes');
    console.log('   ✓ 15 Productos');
    console.log('   ✓ 10 Ubicaciones');
    console.log('   ✓ 6 Órdenes');
    console.log('   ✓ 1 Recepción\n');
    console.log('🔑 Login: admin@wms.com / admin123');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

poblarDatos();

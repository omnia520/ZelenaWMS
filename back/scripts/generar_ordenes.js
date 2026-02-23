const { query, getClient } = require('../src/config/db');

async function crearDatosPrueba() {
  console.log('📦 Generando datos de prueba...\n');

  try {
    // 1. Crear clientes
    console.log('👥 Creando clientes...');
    const clientes = [
      { nit_cc: '900123456-1', razon_social: 'Distribuidora El Éxito S.A.S', telefono: '6012345678', email: 'contacto@exito.com', ciudad: 'Bogotá', direccion: 'Calle 100 #15-20' },
      { nit_cc: '800234567-2', razon_social: 'Supermercados La Canasta', telefono: '6013456789', email: 'ventas@canasta.com', ciudad: 'Medellín', direccion: 'Carrera 50 #30-40' },
      { nit_cc: '700345678-3', razon_social: 'Comercial Los Andes Ltda', telefono: '6014567890', email: 'info@losandes.com', ciudad: 'Cali', direccion: 'Avenida 6N #25-50' }
    ];

    for (const cliente of clientes) {
      const existente = await query('SELECT cliente_id FROM clientes WHERE nit_cc = $1', [cliente.nit_cc]);
      if (existente.rows.length === 0) {
        await query(
          `INSERT INTO clientes (nit_cc, razon_social, telefono, email, ciudad, direccion, activo, creado_por)
           VALUES ($1, $2, $3, $4, $5, $6, TRUE, 1)`,
          [cliente.nit_cc, cliente.razon_social, cliente.telefono, cliente.email, cliente.ciudad, cliente.direccion]
        );
        console.log(`  ✅ Cliente creado: ${cliente.razon_social}`);
      } else {
        console.log(`  ⚠️  Cliente ya existe: ${cliente.razon_social}`);
      }
    }

    // 2. Crear productos
    console.log('\n📦 Creando productos...');
    const productos = [
      { codigo: 'PROD-001', nombre: 'Aceite de Cocina 1L', categoria: 'Alimentos', precio: 8500 },
      { codigo: 'PROD-002', nombre: 'Arroz Blanco 1kg', categoria: 'Alimentos', precio: 3200 },
      { codigo: 'PROD-003', nombre: 'Azúcar Refinada 1kg', categoria: 'Alimentos', precio: 2800 },
      { codigo: 'PROD-004', nombre: 'Papel Higiénico x12', categoria: 'Aseo', precio: 15000 },
      { codigo: 'PROD-005', nombre: 'Detergente en Polvo 1kg', categoria: 'Aseo', precio: 12000 }
    ];

    for (const producto of productos) {
      const existente = await query('SELECT producto_id FROM productos WHERE codigo = $1', [producto.codigo]);
      if (existente.rows.length === 0) {
        await query(
          `INSERT INTO productos (codigo, nombre, categoria, precio_base, stock_actual, activo)
           VALUES ($1, $2, $3, $4, 500, TRUE)`,
          [producto.codigo, producto.nombre, producto.categoria, producto.precio]
        );
        console.log(`  ✅ Producto creado: ${producto.nombre}`);
      } else {
        console.log(`  ⚠️  Producto ya existe: ${producto.nombre}`);
      }
    }

    // 3. Obtener IDs de usuarios
    const alistador1 = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['alistador1@wms.com']);
    const alistador2 = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['alistador2@wms.com']);
    const empacador1 = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['empacador1@wms.com']);
    const empacador2 = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['empacador2@wms.com']);
    const vendedor = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['vendedor1@wms.com']);
    const jefe = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['jefe@wms.com']);

    if (!alistador1.rows[0] || !empacador1.rows[0] || !vendedor.rows[0] || !jefe.rows[0]) {
      console.error('\n❌ Error: Primero debes ejecutar generar_usuarios.js');
      process.exit(1);
    }

    const alistador1Id = alistador1.rows[0].usuario_id;
    const alistador2Id = alistador2.rows[0].usuario_id;
    const empacador1Id = empacador1.rows[0].usuario_id;
    const empacador2Id = empacador2.rows[0].usuario_id;
    const vendedorId = vendedor.rows[0].usuario_id;
    const jefeId = jefe.rows[0].usuario_id;

    // 4. Crear órdenes
    console.log('\n📋 Creando órdenes de prueba...');

    // ORDEN 1: Aprobada para alistador1
    const orden1Existe = await query('SELECT orden_id FROM ordenes_venta WHERE numero_orden = $1', ['ORD-2024-001']);
    if (orden1Existe.rows.length === 0) {
      const cliente1 = await query('SELECT cliente_id FROM clientes WHERE nit_cc = $1', ['900123456-1']);
      const clienteId1 = cliente1.rows[0].cliente_id;

      const orden1 = await query(
        `INSERT INTO ordenes_venta (numero_orden, cliente_id, vendedor_id, estado, subtotal, descuento_total, impuestos_total, total, fecha_aprobacion, aprobado_por, alistador_asignado, empacador_asignado, comentarios)
         VALUES ($1, $2, $3, 'Aprobada', 500000, 0, 95000, 595000, NOW() - INTERVAL '1 day', $4, $5, $6, 'Pedido urgente')
         RETURNING orden_id`,
        ['ORD-2024-001', clienteId1, vendedorId, jefeId, alistador1Id, empacador1Id]
      );

      const ordenId1 = orden1.rows[0].orden_id;

      // Detalles
      const prod1 = await query('SELECT producto_id FROM productos WHERE codigo = $1', ['PROD-001']);
      const prod2 = await query('SELECT producto_id FROM productos WHERE codigo = $1', ['PROD-002']);
      const prod4 = await query('SELECT producto_id FROM productos WHERE codigo = $1', ['PROD-004']);

      await query('INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal) VALUES ($1, $2, 20, 8500, 0, 170000)', [ordenId1, prod1.rows[0].producto_id]);
      await query('INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal) VALUES ($1, $2, 50, 3200, 0, 160000)', [ordenId1, prod2.rows[0].producto_id]);
      await query('INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal) VALUES ($1, $2, 10, 15000, 0, 150000)', [ordenId1, prod4.rows[0].producto_id]);

      console.log('  ✅ Orden ORD-2024-001 creada (Aprobada - alistador1)');
    } else {
      console.log('  ⚠️  Orden ORD-2024-001 ya existe');
    }

    // ORDEN 2: Aprobada para alistador2
    const orden2Existe = await query('SELECT orden_id FROM ordenes_venta WHERE numero_orden = $1', ['ORD-2024-002']);
    if (orden2Existe.rows.length === 0) {
      const cliente2 = await query('SELECT cliente_id FROM clientes WHERE nit_cc = $1', ['800234567-2']);
      const clienteId2 = cliente2.rows[0].cliente_id;

      const orden2 = await query(
        `INSERT INTO ordenes_venta (numero_orden, cliente_id, vendedor_id, estado, subtotal, descuento_total, impuestos_total, total, fecha_aprobacion, aprobado_por, alistador_asignado, empacador_asignado, comentarios)
         VALUES ($1, $2, $3, 'Aprobada', 350000, 0, 66500, 416500, NOW() - INTERVAL '2 hours', $4, $5, $6, 'Cliente preferencial')
         RETURNING orden_id`,
        ['ORD-2024-002', clienteId2, vendedorId, jefeId, alistador2Id, empacador2Id]
      );

      const ordenId2 = orden2.rows[0].orden_id;

      const prod3 = await query('SELECT producto_id FROM productos WHERE codigo = $1', ['PROD-003']);
      const prod5 = await query('SELECT producto_id FROM productos WHERE codigo = $1', ['PROD-005']);

      await query('INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal) VALUES ($1, $2, 30, 2800, 0, 84000)', [ordenId2, prod3.rows[0].producto_id]);
      await query('INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal) VALUES ($1, $2, 15, 12000, 0, 180000)', [ordenId2, prod5.rows[0].producto_id]);

      console.log('  ✅ Orden ORD-2024-002 creada (Aprobada - alistador2)');
    } else {
      console.log('  ⚠️  Orden ORD-2024-002 ya existe');
    }

    // ORDEN 3: En_Alistamiento para alistador1
    const orden3Existe = await query('SELECT orden_id FROM ordenes_venta WHERE numero_orden = $1', ['ORD-2024-003']);
    if (orden3Existe.rows.length === 0) {
      const cliente3 = await query('SELECT cliente_id FROM clientes WHERE nit_cc = $1', ['700345678-3']);
      const clienteId3 = cliente3.rows[0].cliente_id;

      const orden3 = await query(
        `INSERT INTO ordenes_venta (numero_orden, cliente_id, vendedor_id, estado, subtotal, descuento_total, impuestos_total, total, fecha_aprobacion, aprobado_por, fecha_inicio_alistamiento, alistador_asignado, empacador_asignado, comentarios)
         VALUES ($1, $2, $3, 'En_Alistamiento', 280000, 0, 53200, 333200, NOW() - INTERVAL '1 day', $4, NOW() - INTERVAL '2 hours', $5, $6, 'Pedido regular')
         RETURNING orden_id`,
        ['ORD-2024-003', clienteId3, vendedorId, jefeId, alistador1Id, empacador1Id]
      );

      const ordenId3 = orden3.rows[0].orden_id;

      const prod1 = await query('SELECT producto_id FROM productos WHERE codigo = $1', ['PROD-001']);
      const prod2 = await query('SELECT producto_id FROM productos WHERE codigo = $1', ['PROD-002']);
      const prod3 = await query('SELECT producto_id FROM productos WHERE codigo = $1', ['PROD-003']);

      await query('INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal, cantidad_alistada, alistamiento_completado) VALUES ($1, $2, 30, 2800, 0, 84000, 30, TRUE)', [ordenId3, prod3.rows[0].producto_id]);
      await query('INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal, cantidad_alistada, alistamiento_completado) VALUES ($1, $2, 10, 8500, 0, 85000, 10, TRUE)', [ordenId3, prod1.rows[0].producto_id]);
      await query('INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal, cantidad_alistada, alistamiento_completado) VALUES ($1, $2, 40, 3200, 0, 128000, 0, FALSE)', [ordenId3, prod2.rows[0].producto_id]);

      console.log('  ✅ Orden ORD-2024-003 creada (En_Alistamiento - alistador1, parcialmente completada)');
    } else {
      console.log('  ⚠️  Orden ORD-2024-003 ya existe');
    }

    // ORDEN 4: Listo_Para_Empacar para empacador1
    const orden4Existe = await query('SELECT orden_id FROM ordenes_venta WHERE numero_orden = $1', ['ORD-2024-004']);
    if (orden4Existe.rows.length === 0) {
      const cliente1 = await query('SELECT cliente_id FROM clientes WHERE nit_cc = $1', ['900123456-1']);
      const clienteId1 = cliente1.rows[0].cliente_id;

      const orden4 = await query(
        `INSERT INTO ordenes_venta (numero_orden, cliente_id, vendedor_id, estado, subtotal, descuento_total, impuestos_total, total, fecha_aprobacion, aprobado_por, fecha_inicio_alistamiento, fecha_fin_alistamiento, observacion_alistador, alistador_asignado, empacador_asignado, comentarios)
         VALUES ($1, $2, $3, 'Listo_Para_Empacar', 450000, 0, 85500, 535500, NOW() - INTERVAL '2 days', $4, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '1 hour', 'Todo OK', $5, $6, 'Despachar pronto')
         RETURNING orden_id`,
        ['ORD-2024-004', clienteId1, vendedorId, jefeId, alistador2Id, empacador1Id]
      );

      const ordenId4 = orden4.rows[0].orden_id;

      const prod1 = await query('SELECT producto_id FROM productos WHERE codigo = $1', ['PROD-001']);
      const prod2 = await query('SELECT producto_id FROM productos WHERE codigo = $1', ['PROD-002']);
      const prod5 = await query('SELECT producto_id FROM productos WHERE codigo = $1', ['PROD-005']);

      await query('INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal, cantidad_alistada, alistamiento_completado) VALUES ($1, $2, 15, 8500, 0, 127500, 15, TRUE)', [ordenId4, prod1.rows[0].producto_id]);
      await query('INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal, cantidad_alistada, alistamiento_completado) VALUES ($1, $2, 40, 3200, 0, 128000, 40, TRUE)', [ordenId4, prod2.rows[0].producto_id]);
      await query('INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal, cantidad_alistada, alistamiento_completado) VALUES ($1, $2, 12, 12000, 0, 144000, 12, TRUE)', [ordenId4, prod5.rows[0].producto_id]);

      console.log('  ✅ Orden ORD-2024-004 creada (Listo_Para_Empacar - empacador1)');
    } else {
      console.log('  ⚠️  Orden ORD-2024-004 ya existe');
    }

    // ORDEN 5: En_Empaque para empacador2
    const orden5Existe = await query('SELECT orden_id FROM ordenes_venta WHERE numero_orden = $1', ['ORD-2024-005']);
    if (orden5Existe.rows.length === 0) {
      const cliente2 = await query('SELECT cliente_id FROM clientes WHERE nit_cc = $1', ['800234567-2']);
      const clienteId2 = cliente2.rows[0].cliente_id;

      const orden5 = await query(
        `INSERT INTO ordenes_venta (numero_orden, cliente_id, vendedor_id, estado, subtotal, descuento_total, impuestos_total, total, fecha_aprobacion, aprobado_por, fecha_inicio_alistamiento, fecha_fin_alistamiento, fecha_inicio_empaque, observacion_alistador, alistador_asignado, empacador_asignado, comentarios)
         VALUES ($1, $2, $3, 'En_Empaque', 320000, 0, 60800, 380800, NOW() - INTERVAL '3 days', $4, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', 'Productos OK', $5, $6, 'Cliente especial')
         RETURNING orden_id`,
        ['ORD-2024-005', clienteId2, vendedorId, jefeId, alistador1Id, empacador2Id]
      );

      const ordenId5 = orden5.rows[0].orden_id;

      const prod3 = await query('SELECT producto_id FROM productos WHERE codigo = $1', ['PROD-003']);
      const prod4 = await query('SELECT producto_id FROM productos WHERE codigo = $1', ['PROD-004']);

      await query('INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal, cantidad_alistada, alistamiento_completado, cantidad_empacada, empaque_completado) VALUES ($1, $2, 40, 2800, 0, 112000, 40, TRUE, 40, TRUE)', [ordenId5, prod3.rows[0].producto_id]);
      await query('INSERT INTO orden_detalles (orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal, cantidad_alistada, alistamiento_completado, cantidad_empacada, empaque_completado) VALUES ($1, $2, 8, 15000, 0, 120000, 8, TRUE, 0, FALSE)', [ordenId5, prod4.rows[0].producto_id]);

      console.log('  ✅ Orden ORD-2024-005 creada (En_Empaque - empacador2, parcialmente empacada)');
    } else {
      console.log('  ⚠️  Orden ORD-2024-005 ya existe');
    }

    console.log('\n✨ ¡Datos de prueba creados exitosamente!\n');
    console.log('📋 Resumen de órdenes:');
    console.log('  - ORD-2024-001: Aprobada (alistador1@wms.com)');
    console.log('  - ORD-2024-002: Aprobada (alistador2@wms.com)');
    console.log('  - ORD-2024-003: En_Alistamiento (alistador1@wms.com)');
    console.log('  - ORD-2024-004: Listo_Para_Empacar (empacador1@wms.com)');
    console.log('  - ORD-2024-005: En_Empaque (empacador2@wms.com)');
    console.log('\n🔑 Usa password: password123 para todos los usuarios\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }

  process.exit(0);
}

crearDatosPrueba().catch(error => {
  console.error('❌ Error general:', error);
  process.exit(1);
});

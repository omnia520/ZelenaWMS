const { query } = require('../src/config/db');

async function agregar10MasOrdenesLimpias() {
  console.log('🆕 Agregando 10+ órdenes LIMPIAS adicionales para demostración...\n');

  try {
    // Obtener IDs de usuarios
    const alistador1 = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['alistador1@wms.com']);
    const alistador2 = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['alistador2@wms.com']);
    const empacador1 = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['empacador1@wms.com']);
    const empacador2 = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['empacador2@wms.com']);
    const vendedor = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['vendedor1@wms.com']);
    const jefe = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['jefe@wms.com']);

    const alistador1Id = alistador1.rows[0].usuario_id;
    const alistador2Id = alistador2.rows[0].usuario_id;
    const empacador1Id = empacador1.rows[0].usuario_id;
    const empacador2Id = empacador2.rows[0].usuario_id;
    const vendedorId = vendedor.rows[0].usuario_id;
    const jefeId = jefe.rows[0].usuario_id;

    // Obtener clientes
    const clientes = await query('SELECT cliente_id FROM clientes ORDER BY cliente_id LIMIT 5');
    const cliente1Id = clientes.rows[0].cliente_id;
    const cliente2Id = clientes.rows[1].cliente_id;
    const cliente3Id = clientes.rows[2].cliente_id;
    const cliente4Id = clientes.rows.length > 3 ? clientes.rows[3].cliente_id : cliente1Id;
    const cliente5Id = clientes.rows.length > 4 ? clientes.rows[4].cliente_id : cliente2Id;

    // Obtener productos
    const productos = await query('SELECT producto_id, precio_base FROM productos ORDER BY producto_id LIMIT 10');

    // Fechas
    const ahora = new Date();
    const hace2Dias = new Date(ahora - 2 * 24 * 60 * 60 * 1000);
    const hace1Dia = new Date(ahora - 24 * 60 * 60 * 1000);
    const hace12Horas = new Date(ahora - 12 * 60 * 60 * 1000);
    const hace6Horas = new Date(ahora - 6 * 60 * 60 * 1000);
    const hace3Horas = new Date(ahora - 3 * 60 * 60 * 1000);

    console.log('📋 Creando órdenes APROBADAS para ALISTAMIENTO (sin cantidades)...\n');

    // ========================================
    // ÓRDENES APROBADAS PARA ALISTAMIENTO
    // ========================================

    // ORDEN 25: Aprobada - alistador1
    await crearOrdenLimpia(
      'ORD-2024-025',
      cliente1Id, vendedorId, jefeId,
      alistador1Id, empacador1Id,
      'Aprobada',
      'Pedido urgente cliente VIP',
      hace2Dias,
      [
        { producto: productos.rows[0], cantidad: 30 },
        { producto: productos.rows[1], cantidad: 25 },
        { producto: productos.rows[2], cantidad: 15 }
      ]
    );
    console.log('  ✅ ORD-2024-025 creada (Aprobada - alistador1)');

    // ORDEN 26: Aprobada - alistador2
    await crearOrdenLimpia(
      'ORD-2024-026',
      cliente2Id, vendedorId, jefeId,
      alistador2Id, empacador2Id,
      'Aprobada',
      'Pedido estándar',
      hace2Dias,
      [
        { producto: productos.rows[3], cantidad: 40 },
        { producto: productos.rows[4], cantidad: 35 }
      ]
    );
    console.log('  ✅ ORD-2024-026 creada (Aprobada - alistador2)');

    // ORDEN 27: Aprobada - alistador1
    await crearOrdenLimpia(
      'ORD-2024-027',
      cliente3Id, vendedorId, jefeId,
      alistador1Id, empacador1Id,
      'Aprobada',
      'Reposición de stock',
      hace1Dia,
      [
        { producto: productos.rows[5], cantidad: 50 },
        { producto: productos.rows[6], cantidad: 45 },
        { producto: productos.rows[7], cantidad: 20 }
      ]
    );
    console.log('  ✅ ORD-2024-027 creada (Aprobada - alistador1)');

    // ORDEN 28: Aprobada - alistador2
    await crearOrdenLimpia(
      'ORD-2024-028',
      cliente4Id, vendedorId, jefeId,
      alistador2Id, empacador2Id,
      'Aprobada',
      'Orden prioridad media',
      hace1Dia,
      [
        { producto: productos.rows[8], cantidad: 22 },
        { producto: productos.rows[9], cantidad: 18 },
        { producto: productos.rows[0], cantidad: 12 }
      ]
    );
    console.log('  ✅ ORD-2024-028 creada (Aprobada - alistador2)');

    // ORDEN 29: Aprobada - alistador1
    await crearOrdenLimpia(
      'ORD-2024-029',
      cliente5Id, vendedorId, jefeId,
      alistador1Id, empacador2Id,
      'Aprobada',
      'Pedido especial',
      hace12Horas,
      [
        { producto: productos.rows[1], cantidad: 28 },
        { producto: productos.rows[3], cantidad: 33 }
      ]
    );
    console.log('  ✅ ORD-2024-029 creada (Aprobada - alistador1)');

    // ORDEN 30: Aprobada - alistador2
    await crearOrdenLimpia(
      'ORD-2024-030',
      cliente1Id, vendedorId, jefeId,
      alistador2Id, empacador1Id,
      'Aprobada',
      'Orden corporativa',
      hace12Horas,
      [
        { producto: productos.rows[2], cantidad: 60 },
        { producto: productos.rows[4], cantidad: 45 },
        { producto: productos.rows[6], cantidad: 30 },
        { producto: productos.rows[8], cantidad: 25 }
      ]
    );
    console.log('  ✅ ORD-2024-030 creada (Aprobada - alistador2)');

    console.log('\n📋 Creando órdenes LISTO_PARA_EMPACAR (sin cantidades empacadas)...\n');

    // ========================================
    // ÓRDENES LISTO_PARA_EMPACAR (sin cantidades empacadas)
    // ========================================

    // ORDEN 31: Listo_Para_Empacar - empacador1
    await crearOrdenParaEmpacar(
      'ORD-2024-031',
      cliente2Id, vendedorId, jefeId,
      alistador1Id, empacador1Id,
      'Alistamiento completo, listo para empacar',
      hace2Dias, hace1Dia, hace6Horas,
      'Todos los productos verificados y en buen estado',
      [
        { producto: productos.rows[0], cantidad: 35, alistada: 35 },
        { producto: productos.rows[2], cantidad: 28, alistada: 28 },
        { producto: productos.rows[5], cantidad: 42, alistada: 42 }
      ]
    );
    console.log('  ✅ ORD-2024-031 creada (Listo_Para_Empacar - empacador1)');

    // ORDEN 32: Listo_Para_Empacar - empacador2
    await crearOrdenParaEmpacar(
      'ORD-2024-032',
      cliente3Id, vendedorId, jefeId,
      alistador2Id, empacador2Id,
      'Orden lista para proceso de empaque',
      hace2Dias, hace1Dia, hace6Horas,
      'Sin novedades',
      [
        { producto: productos.rows[1], cantidad: 50, alistada: 50 },
        { producto: productos.rows[3], cantidad: 40, alistada: 40 }
      ]
    );
    console.log('  ✅ ORD-2024-032 creada (Listo_Para_Empacar - empacador2)');

    // ORDEN 33: Listo_Para_Empacar - empacador1
    await crearOrdenParaEmpacar(
      'ORD-2024-033',
      cliente4Id, vendedorId, jefeId,
      alistador1Id, empacador1Id,
      'Preparado correctamente',
      hace1Dia, hace12Horas, hace3Horas,
      'Alistamiento sin observaciones',
      [
        { producto: productos.rows[4], cantidad: 25, alistada: 25 },
        { producto: productos.rows[6], cantidad: 30, alistada: 30 },
        { producto: productos.rows[8], cantidad: 20, alistada: 20 }
      ]
    );
    console.log('  ✅ ORD-2024-033 creada (Listo_Para_Empacar - empacador1)');

    // ORDEN 34: Listo_Para_Empacar - empacador2
    await crearOrdenParaEmpacar(
      'ORD-2024-034',
      cliente5Id, vendedorId, jefeId,
      alistador2Id, empacador2Id,
      'Todo verificado y listo',
      hace1Dia, hace12Horas, hace3Horas,
      'Productos OK',
      [
        { producto: productos.rows[7], cantidad: 15, alistada: 15 },
        { producto: productos.rows[9], cantidad: 22, alistada: 22 }
      ]
    );
    console.log('  ✅ ORD-2024-034 creada (Listo_Para_Empacar - empacador2)');

    // ORDEN 35: Listo_Para_Empacar - empacador1
    await crearOrdenParaEmpacar(
      'ORD-2024-035',
      cliente1Id, vendedorId, jefeId,
      alistador1Id, empacador1Id,
      'Pedido urgente alistado',
      hace12Horas, hace6Horas, hace3Horas,
      'Cliente VIP - prioridad alta',
      [
        { producto: productos.rows[0], cantidad: 55, alistada: 55 },
        { producto: productos.rows[1], cantidad: 48, alistada: 48 },
        { producto: productos.rows[2], cantidad: 36, alistada: 36 }
      ]
    );
    console.log('  ✅ ORD-2024-035 creada (Listo_Para_Empacar - empacador1)');

    console.log('\n✨ ¡10+ órdenes limpias adicionales creadas exitosamente!\n');
    console.log('📊 RESUMEN DE ÓRDENES AGREGADAS:');
    console.log('  🔵 6 órdenes Aprobadas (SIN cantidades alistadas)');
    console.log('     - alistador1@wms.com: 3 órdenes (025, 027, 029)');
    console.log('     - alistador2@wms.com: 3 órdenes (026, 028, 030)');
    console.log('');
    console.log('  🟢 5 órdenes Listo_Para_Empacar (SIN cantidades empacadas)');
    console.log('     - empacador1@wms.com: 3 órdenes (031, 033, 035)');
    console.log('     - empacador2@wms.com: 2 órdenes (032, 034)');
    console.log('');
    console.log('📊 TOTAL EN SISTEMA (incluyendo órdenes anteriores):');
    console.log('   - Órdenes para Alistamiento: 9 órdenes nuevas');
    console.log('   - Órdenes para Empaque: 7 órdenes nuevas');
    console.log('');
    console.log('🎯 Todas son ideales para demostración del flujo completo!');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }

  process.exit(0);
}

async function crearOrdenLimpia(
  numero_orden, cliente_id, vendedor_id, aprobado_por,
  alistador_asignado, empacador_asignado,
  estado, comentarios, fecha_aprobacion,
  productos
) {
  const existe = await query('SELECT orden_id FROM ordenes_venta WHERE numero_orden = $1', [numero_orden]);
  if (existe.rows.length > 0) {
    console.log(`  ⚠️  ${numero_orden} ya existe - saltando`);
    return null;
  }

  // Calcular totales
  let subtotal = 0;
  productos.forEach(p => {
    subtotal += p.cantidad * p.producto.precio_base;
  });
  const impuestos = subtotal * 0.19;
  const total = subtotal + impuestos;

  // Crear orden
  const ordenResult = await query(
    `INSERT INTO ordenes_venta (
      numero_orden, cliente_id, vendedor_id, estado,
      subtotal, descuento_total, impuestos_total, total,
      fecha_aprobacion, aprobado_por,
      alistador_asignado, empacador_asignado, comentarios
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING orden_id`,
    [
      numero_orden, cliente_id, vendedor_id, estado,
      subtotal, 0, impuestos, total,
      fecha_aprobacion, aprobado_por,
      alistador_asignado, empacador_asignado, comentarios
    ]
  );

  const ordenId = ordenResult.rows[0].orden_id;

  // Agregar detalles SIN cantidades guardadas
  for (const p of productos) {
    await query(
      `INSERT INTO orden_detalles (
        orden_id, producto_id, cantidad_pedida, precio_unitario,
        descuento_porcentaje, subtotal,
        cantidad_alistada, alistamiento_completado,
        cantidad_empacada, empaque_completado
      ) VALUES ($1, $2, $3, $4, 0, $5, 0, FALSE, 0, FALSE)`,
      [
        ordenId,
        p.producto.producto_id,
        p.cantidad,
        p.producto.precio_base,
        p.cantidad * p.producto.precio_base
      ]
    );
  }

  return ordenId;
}

async function crearOrdenParaEmpacar(
  numero_orden, cliente_id, vendedor_id, aprobado_por,
  alistador_asignado, empacador_asignado,
  comentarios, fecha_aprobacion, fecha_inicio_alist, fecha_fin_alist,
  observacion_alistador,
  productos
) {
  const existe = await query('SELECT orden_id FROM ordenes_venta WHERE numero_orden = $1', [numero_orden]);
  if (existe.rows.length > 0) {
    console.log(`  ⚠️  ${numero_orden} ya existe - saltando`);
    return null;
  }

  // Calcular totales
  let subtotal = 0;
  productos.forEach(p => {
    subtotal += p.cantidad * p.producto.precio_base;
  });
  const impuestos = subtotal * 0.19;
  const total = subtotal + impuestos;

  // Crear orden
  const ordenResult = await query(
    `INSERT INTO ordenes_venta (
      numero_orden, cliente_id, vendedor_id, estado,
      subtotal, descuento_total, impuestos_total, total,
      fecha_aprobacion, aprobado_por,
      fecha_inicio_alistamiento, fecha_fin_alistamiento,
      observacion_alistador,
      alistador_asignado, empacador_asignado, comentarios
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING orden_id`,
    [
      numero_orden, cliente_id, vendedor_id, 'Listo_Para_Empacar',
      subtotal, 0, impuestos, total,
      fecha_aprobacion, aprobado_por,
      fecha_inicio_alist, fecha_fin_alist,
      observacion_alistador,
      alistador_asignado, empacador_asignado, comentarios
    ]
  );

  const ordenId = ordenResult.rows[0].orden_id;

  // Agregar detalles CON cantidades alistadas pero SIN empacar
  for (const p of productos) {
    await query(
      `INSERT INTO orden_detalles (
        orden_id, producto_id, cantidad_pedida, precio_unitario,
        descuento_porcentaje, subtotal,
        cantidad_alistada, alistamiento_completado,
        cantidad_empacada, empaque_completado
      ) VALUES ($1, $2, $3, $4, 0, $5, $6, TRUE, 0, FALSE)`,
      [
        ordenId,
        p.producto.producto_id,
        p.cantidad,
        p.producto.precio_base,
        p.cantidad * p.producto.precio_base,
        p.alistada
      ]
    );
  }

  return ordenId;
}

agregar10MasOrdenesLimpias().catch(error => {
  console.error('❌ Error general:', error);
  process.exit(1);
});

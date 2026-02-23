const { query } = require('../src/config/db');

async function agregarOrdenesLimpias() {
  console.log('🆕 Agregando órdenes NUEVAS sin cantidades guardadas...\n');

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
    const clientes = await query('SELECT cliente_id FROM clientes ORDER BY cliente_id LIMIT 3');
    const cliente1Id = clientes.rows[0].cliente_id;
    const cliente2Id = clientes.rows[1].cliente_id;
    const cliente3Id = clientes.rows[2].cliente_id;

    // Obtener productos
    const productos = await query('SELECT producto_id, precio_base FROM productos ORDER BY producto_id LIMIT 5');

    // Fechas
    const ahora = new Date();
    const hace1Dia = new Date(ahora - 24 * 60 * 60 * 1000);

    console.log('📋 Creando órdenes LIMPIAS (sin cantidades guardadas)...\n');

    // ========================================
    // ÓRDENES APROBADAS PARA ALISTAMIENTO (sin cantidades)
    // ========================================

    console.log('🔵 Órdenes Aprobadas (SIN cantidades - para probar "Comenzar"):');

    // ORDEN 20: Aprobada - alistador1 (LIMPIA)
    await crearOrdenLimpia(
      'ORD-2024-020',
      cliente1Id, vendedorId, jefeId,
      alistador1Id, empacador1Id,
      'Aprobada',
      'Orden nueva para comenzar alistamiento',
      hace1Dia,
      [
        { producto: productos.rows[0], cantidad: 10 },
        { producto: productos.rows[1], cantidad: 15 },
        { producto: productos.rows[2], cantidad: 20 }
      ]
    );
    console.log('  ✅ ORD-2024-020 creada (Aprobada - alistador1 - SIN cantidades)');

    // ORDEN 21: Aprobada - alistador2 (LIMPIA)
    await crearOrdenLimpia(
      'ORD-2024-021',
      cliente2Id, vendedorId, jefeId,
      alistador2Id, empacador2Id,
      'Aprobada',
      'Orden lista para iniciar',
      hace1Dia,
      [
        { producto: productos.rows[3], cantidad: 8 },
        { producto: productos.rows[4], cantidad: 12 }
      ]
    );
    console.log('  ✅ ORD-2024-021 creada (Aprobada - alistador2 - SIN cantidades)');

    // ORDEN 22: Aprobada - alistador1 (LIMPIA)
    await crearOrdenLimpia(
      'ORD-2024-022',
      cliente3Id, vendedorId, jefeId,
      alistador1Id, empacador1Id,
      'Aprobada',
      'Pedido urgente sin procesar',
      hace1Dia,
      [
        { producto: productos.rows[0], cantidad: 25 },
        { producto: productos.rows[2], cantidad: 30 }
      ]
    );
    console.log('  ✅ ORD-2024-022 creada (Aprobada - alistador1 - SIN cantidades)');

    // ========================================
    // ÓRDENES LISTO PARA EMPACAR (sin cantidades empacadas)
    // ========================================

    console.log('\n🟢 Órdenes Listo_Para_Empacar (SIN cantidades empacadas - para probar "Comenzar"):');

    const hace3Horas = new Date(ahora - 3 * 60 * 60 * 1000);
    const hace1Hora = new Date(ahora - 60 * 60 * 1000);

    // ORDEN 23: Listo_Para_Empacar - empacador1 (LIMPIA - ya alistada pero sin empacar)
    await crearOrdenParaEmpacar(
      'ORD-2024-023',
      cliente1Id, vendedorId, jefeId,
      alistador1Id, empacador1Id,
      'Pedido listo para empacar',
      hace1Dia, hace3Horas, hace1Hora,
      'Alistamiento completado sin problemas',
      [
        { producto: productos.rows[1], cantidad: 20, alistada: 20 },
        { producto: productos.rows[3], cantidad: 15, alistada: 15 }
      ]
    );
    console.log('  ✅ ORD-2024-023 creada (Listo_Para_Empacar - empacador1 - SIN cantidades empacadas)');

    // ORDEN 24: Listo_Para_Empacar - empacador2 (LIMPIA)
    await crearOrdenParaEmpacar(
      'ORD-2024-024',
      cliente2Id, vendedorId, jefeId,
      alistador2Id, empacador2Id,
      'Orden lista para empaque',
      hace1Dia, hace3Horas, hace1Hora,
      'Todo OK',
      [
        { producto: productos.rows[0], cantidad: 12, alistada: 12 },
        { producto: productos.rows[2], cantidad: 18, alistada: 18 },
        { producto: productos.rows[4], cantidad: 10, alistada: 10 }
      ]
    );
    console.log('  ✅ ORD-2024-024 creada (Listo_Para_Empacar - empacador2 - SIN cantidades empacadas)');

    console.log('\n✨ ¡Órdenes limpias creadas exitosamente!\n');
    console.log('📊 RESUMEN:');
    console.log('  🔵 3 órdenes Aprobadas (SIN cantidades alistadas)');
    console.log('     - alistador1@wms.com: 2 órdenes nuevas');
    console.log('     - alistador2@wms.com: 1 orden nueva');
    console.log('');
    console.log('  🟢 2 órdenes Listo_Para_Empacar (SIN cantidades empacadas)');
    console.log('     - empacador1@wms.com: 1 orden nueva');
    console.log('     - empacador2@wms.com: 1 orden nueva');
    console.log('');
    console.log('🎯 Estas órdenes son ideales para probar:');
    console.log('   ✓ Botón "Comenzar" (sin cantidades guardadas)');
    console.log('   ✓ Que NO se guarden cantidades automáticamente');
    console.log('   ✓ Flujo completo de inicio a fin');
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
    console.log(`  ⚠️  ${numero_orden} ya existe`);
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
    console.log(`  ⚠️  ${numero_orden} ya existe`);
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

agregarOrdenesLimpias().catch(error => {
  console.error('❌ Error general:', error);
  process.exit(1);
});

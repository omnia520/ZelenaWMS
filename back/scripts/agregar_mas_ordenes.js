const { query } = require('../src/config/db');

async function agregarMasOrdenes() {
  console.log('📦 Agregando más órdenes de prueba...\n');

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

    console.log('📋 Creando nuevas órdenes...\n');

    // ========================================
    // ÓRDENES PARA ALISTAMIENTO (7 órdenes)
    // ========================================

    console.log('🔵 Órdenes para Alistamiento:');

    // Calcular fechas
    const ahora = new Date();
    const hace1Dia = new Date(ahora - 24 * 60 * 60 * 1000);
    const hace30Min = new Date(ahora - 30 * 60 * 1000);
    const hace1Hora = new Date(ahora - 60 * 60 * 1000);
    const hace2Horas = new Date(ahora - 2 * 60 * 60 * 1000);
    const hace3Horas = new Date(ahora - 3 * 60 * 60 * 1000);
    const hace4Horas = new Date(ahora - 4 * 60 * 60 * 1000);
    const hace5Horas = new Date(ahora - 5 * 60 * 60 * 1000);
    const hace6Horas = new Date(ahora - 6 * 60 * 60 * 1000);

    // ORDEN 6: Aprobada - alistador1
    const orden6 = await crearOrden(
      'ORD-2024-006',
      cliente1Id,
      vendedorId,
      'Aprobada',
      250000, 0, 47500, 297500,
      jefeId, alistador1Id, empacador1Id,
      'Pedido urgente para entrega inmediata',
      hace1Dia,
      null, null, null, null, null, null
    );
    if (orden6) {
      await agregarDetalles(orden6, [
        { producto: productos.rows[0], cantidad: 15 },
        { producto: productos.rows[1], cantidad: 25 }
      ]);
      console.log('  ✅ ORD-2024-006 creada (Aprobada - alistador1)');
    }

    // ORDEN 7: Aprobada - alistador2
    const orden7 = await crearOrden(
      'ORD-2024-007',
      cliente2Id,
      vendedorId,
      'Aprobada',
      180000, 0, 34200, 214200,
      jefeId, alistador2Id, empacador2Id,
      'Cliente nuevo - primera orden',
      hace1Dia,
      null, null, null, null, null, null
    );
    if (orden7) {
      await agregarDetalles(orden7, [
        { producto: productos.rows[2], cantidad: 20 },
        { producto: productos.rows[3], cantidad: 5 }
      ]);
      console.log('  ✅ ORD-2024-007 creada (Aprobada - alistador2)');
    }

    // ORDEN 8: Aprobada - alistador1
    const orden8 = await crearOrden(
      'ORD-2024-008',
      cliente3Id,
      vendedorId,
      'Aprobada',
      420000, 0, 79800, 499800,
      jefeId, alistador1Id, empacador1Id,
      'Pedido grande - verificar stock',
      hace1Dia,
      null, null, null, null, null, null
    );
    if (orden8) {
      await agregarDetalles(orden8, [
        { producto: productos.rows[0], cantidad: 25 },
        { producto: productos.rows[1], cantidad: 40 },
        { producto: productos.rows[4], cantidad: 10 }
      ]);
      console.log('  ✅ ORD-2024-008 creada (Aprobada - alistador1)');
    }

    // ORDEN 9: Aprobada - alistador2
    const orden9 = await crearOrden(
      'ORD-2024-009',
      cliente1Id,
      vendedorId,
      'Aprobada',
      310000, 0, 58900, 368900,
      jefeId, alistador2Id, empacador2Id,
      'Reposición de inventario',
      hace1Dia,
      null, null, null, null, null, null
    );
    if (orden9) {
      await agregarDetalles(orden9, [
        { producto: productos.rows[1], cantidad: 30 },
        { producto: productos.rows[2], cantidad: 35 },
        { producto: productos.rows[3], cantidad: 8 }
      ]);
      console.log('  ✅ ORD-2024-009 creada (Aprobada - alistador2)');
    }

    // ORDEN 10: En_Alistamiento - alistador1 (sin progreso)
    const orden10 = await crearOrden(
      'ORD-2024-010',
      cliente2Id,
      vendedorId,
      'En_Alistamiento',
      275000, 0, 52250, 327250,
      jefeId, alistador1Id, empacador1Id,
      'Despacho prioritario',
      hace1Dia,
      hace30Min, null, null, null, null, null
    );
    if (orden10) {
      await agregarDetalles(orden10, [
        { producto: productos.rows[0], cantidad: 18, alistada: 0, completado: false },
        { producto: productos.rows[4], cantidad: 12, alistada: 0, completado: false }
      ]);
      console.log('  ✅ ORD-2024-010 creada (En_Alistamiento - alistador1, recién iniciada)');
    }

    // ORDEN 11: En_Alistamiento - alistador2 (parcialmente completada)
    const orden11 = await crearOrden(
      'ORD-2024-011',
      cliente3Id,
      vendedorId,
      'En_Alistamiento',
      195000, 0, 37050, 232050,
      jefeId, alistador2Id, empacador2Id,
      'Cliente VIP',
      hace1Dia,
      hace1Hora, null, null, null, null, null
    );
    if (orden11) {
      await agregarDetalles(orden11, [
        { producto: productos.rows[1], cantidad: 20, alistada: 20, completado: true },
        { producto: productos.rows[2], cantidad: 25, alistada: 25, completado: true },
        { producto: productos.rows[3], cantidad: 6, alistada: 0, completado: false }
      ]);
      console.log('  ✅ ORD-2024-011 creada (En_Alistamiento - alistador2, 2 de 3 productos listos)');
    }

    // ORDEN 12: Aprobada - alistador1
    const orden12 = await crearOrden(
      'ORD-2024-012',
      cliente1Id,
      vendedorId,
      'Aprobada',
      155000, 0, 29450, 184450,
      jefeId, alistador1Id, empacador1Id,
      'Pedido estándar',
      hace1Dia,
      null, null, null, null, null, null
    );
    if (orden12) {
      await agregarDetalles(orden12, [
        { producto: productos.rows[3], cantidad: 8 },
        { producto: productos.rows[4], cantidad: 5 }
      ]);
      console.log('  ✅ ORD-2024-012 creada (Aprobada - alistador1)');
    }

    // ========================================
    // ÓRDENES PARA EMPAQUE (7 órdenes)
    // ========================================

    console.log('\n🟢 Órdenes para Empaque:');

    // ORDEN 13: Listo_Para_Empacar - empacador1
    const orden13 = await crearOrden(
      'ORD-2024-013',
      cliente2Id,
      vendedorId,
      'Listo_Para_Empacar',
      290000, 0, 55100, 345100,
      jefeId, alistador1Id, empacador1Id,
      'Empaque especial requerido',
      hace1Dia,
      hace3Horas,
      hace1Hora,
      null, null,
      'Productos listos para empacar', null
    );
    if (orden13) {
      await agregarDetalles(orden13, [
        { producto: productos.rows[0], cantidad: 20, alistada: 20, completado: true },
        { producto: productos.rows[1], cantidad: 30, alistada: 30, completado: true }
      ]);
      console.log('  ✅ ORD-2024-013 creada (Listo_Para_Empacar - empacador1)');
    }

    // ORDEN 14: Listo_Para_Empacar - empacador2
    const orden14 = await crearOrden(
      'ORD-2024-014',
      cliente3Id,
      vendedorId,
      'Listo_Para_Empacar',
      385000, 0, 73150, 458150,
      jefeId, alistador2Id, empacador2Id,
      'Orden grande - múltiples cajas',
      hace1Dia,
      hace4Horas,
      hace2Horas,
      null, null,
      'Todo OK, sin faltantes', null
    );
    if (orden14) {
      await agregarDetalles(orden14, [
        { producto: productos.rows[2], cantidad: 45, alistada: 45, completado: true },
        { producto: productos.rows[3], cantidad: 12, alistada: 12, completado: true },
        { producto: productos.rows[4], cantidad: 8, alistada: 8, completado: true }
      ]);
      console.log('  ✅ ORD-2024-014 creada (Listo_Para_Empacar - empacador2)');
    }

    // ORDEN 15: Listo_Para_Empacar - empacador1
    const orden15 = await crearOrden(
      'ORD-2024-015',
      cliente1Id,
      vendedorId,
      'Listo_Para_Empacar',
      215000, 0, 40850, 255850,
      jefeId, alistador1Id, empacador1Id,
      'Envío urgente',
      hace1Dia,
      hace2Horas,
      hace30Min,
      null, null,
      'Alistamiento completo', null
    );
    if (orden15) {
      await agregarDetalles(orden15, [
        { producto: productos.rows[1], cantidad: 22, alistada: 22, completado: true },
        { producto: productos.rows[4], cantidad: 10, alistada: 10, completado: true }
      ]);
      console.log('  ✅ ORD-2024-015 creada (Listo_Para_Empacar - empacador1)');
    }

    // ORDEN 16: En_Empaque - empacador2 (sin progreso)
    const hace20Min = new Date(ahora - 20 * 60 * 1000);
    const orden16 = await crearOrden(
      'ORD-2024-016',
      cliente2Id,
      vendedorId,
      'En_Empaque',
      340000, 0, 64600, 404600,
      jefeId, alistador2Id, empacador2Id,
      'Cliente corporativo',
      hace1Dia,
      hace5Horas,
      hace3Horas,
      hace20Min,
      null,
      'Sin novedad', null
    );
    if (orden16) {
      await agregarDetalles(orden16, [
        { producto: productos.rows[0], cantidad: 25, alistada: 25, completado: true, empacada: 0, empaque_completado: false },
        { producto: productos.rows[2], cantidad: 30, alistada: 30, completado: true, empacada: 0, empaque_completado: false }
      ]);
      console.log('  ✅ ORD-2024-016 creada (En_Empaque - empacador2, recién iniciada)');
    }

    // ORDEN 17: En_Empaque - empacador1 (parcialmente empacada)
    const orden17 = await crearOrden(
      'ORD-2024-017',
      cliente3Id,
      vendedorId,
      'En_Empaque',
      268000, 0, 50920, 318920,
      jefeId, alistador1Id, empacador1Id,
      'Despacho normal',
      hace1Dia,
      hace6Horas,
      hace4Horas,
      hace1Hora,
      null,
      'Productos en buen estado', null
    );
    if (orden17) {
      await agregarDetalles(orden17, [
        { producto: productos.rows[1], cantidad: 28, alistada: 28, completado: true, empacada: 28, empaque_completado: true },
        { producto: productos.rows[3], cantidad: 10, alistada: 10, completado: true, empacada: 10, empaque_completado: true },
        { producto: productos.rows[4], cantidad: 7, alistada: 7, completado: true, empacada: 0, empaque_completado: false }
      ]);
      console.log('  ✅ ORD-2024-017 creada (En_Empaque - empacador1, 2 de 3 productos empacados)');
    }

    // ORDEN 18: Listo_Para_Empacar - empacador2
    const hace45Min = new Date(ahora - 45 * 60 * 1000);
    const orden18 = await crearOrden(
      'ORD-2024-018',
      cliente1Id,
      vendedorId,
      'Listo_Para_Empacar',
      175000, 0, 33250, 208250,
      jefeId, alistador2Id, empacador2Id,
      'Pedido sencillo',
      hace1Dia,
      hace2Horas,
      hace45Min,
      null, null,
      'OK', null
    );
    if (orden18) {
      await agregarDetalles(orden18, [
        { producto: productos.rows[0], cantidad: 12, alistada: 12, completado: true },
        { producto: productos.rows[2], cantidad: 18, alistada: 18, completado: true }
      ]);
      console.log('  ✅ ORD-2024-018 creada (Listo_Para_Empacar - empacador2)');
    }

    // ORDEN 19: Listo_Para_Empacar - empacador1
    const orden19 = await crearOrden(
      'ORD-2024-019',
      cliente2Id,
      vendedorId,
      'Listo_Para_Empacar',
      425000, 0, 80750, 505750,
      jefeId, alistador1Id, empacador1Id,
      'Pedido prioritario',
      hace1Dia,
      hace5Horas,
      hace2Horas,
      null, null,
      'Alistamiento verificado', null
    );
    if (orden19) {
      await agregarDetalles(orden19, [
        { producto: productos.rows[1], cantidad: 50, alistada: 50, completado: true },
        { producto: productos.rows[3], cantidad: 15, alistada: 15, completado: true },
        { producto: productos.rows[4], cantidad: 12, alistada: 12, completado: true }
      ]);
      console.log('  ✅ ORD-2024-019 creada (Listo_Para_Empacar - empacador1)');
    }

    console.log('\n✨ ¡Órdenes adicionales creadas exitosamente!\n');
    console.log('📊 RESUMEN:');
    console.log('  🔵 Alistamiento: 7 órdenes nuevas');
    console.log('     - alistador1@wms.com: 4 órdenes (3 Aprobadas, 1 En_Alistamiento)');
    console.log('     - alistador2@wms.com: 3 órdenes (2 Aprobadas, 1 En_Alistamiento)');
    console.log('');
    console.log('  🟢 Empaque: 7 órdenes nuevas');
    console.log('     - empacador1@wms.com: 4 órdenes (3 Listo_Para_Empacar, 1 En_Empaque)');
    console.log('     - empacador2@wms.com: 3 órdenes (2 Listo_Para_Empacar, 1 En_Empaque)');
    console.log('');
    console.log('🎯 Total de órdenes nuevas: 14');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }

  process.exit(0);
}

async function crearOrden(
  numero_orden, cliente_id, vendedor_id, estado,
  subtotal, descuento_total, impuestos_total, total,
  aprobado_por, alistador_asignado, empacador_asignado, comentarios,
  fecha_aprobacion, fecha_inicio_alistamiento, fecha_fin_alistamiento,
  fecha_inicio_empaque, fecha_fin_empaque,
  observacion_alistador, observacion_empacador
) {
  const existe = await query('SELECT orden_id FROM ordenes_venta WHERE numero_orden = $1', [numero_orden]);
  if (existe.rows.length > 0) {
    console.log(`  ⚠️  ${numero_orden} ya existe`);
    return null;
  }

  let sql = `
    INSERT INTO ordenes_venta (
      numero_orden, cliente_id, vendedor_id, estado,
      subtotal, descuento_total, impuestos_total, total,
      fecha_aprobacion, aprobado_por,
      alistador_asignado, empacador_asignado, comentarios
  `;

  const values = [
    numero_orden, cliente_id, vendedor_id, estado,
    subtotal, descuento_total, impuestos_total, total,
    fecha_aprobacion, aprobado_por,
    alistador_asignado, empacador_asignado, comentarios
  ];

  let paramCount = 14;

  if (fecha_inicio_alistamiento) {
    sql += `, fecha_inicio_alistamiento`;
    values.push(fecha_inicio_alistamiento);
    paramCount++;
  }

  if (fecha_fin_alistamiento) {
    sql += `, fecha_fin_alistamiento`;
    values.push(fecha_fin_alistamiento);
    paramCount++;
  }

  if (fecha_inicio_empaque) {
    sql += `, fecha_inicio_empaque`;
    values.push(fecha_inicio_empaque);
    paramCount++;
  }

  if (fecha_fin_empaque) {
    sql += `, fecha_fin_empaque`;
    values.push(fecha_fin_empaque);
    paramCount++;
  }

  if (observacion_alistador) {
    sql += `, observacion_alistador`;
    values.push(observacion_alistador);
    paramCount++;
  }

  if (observacion_empacador) {
    sql += `, observacion_empacador`;
    values.push(observacion_empacador);
    paramCount++;
  }

  sql += `) VALUES (`;

  for (let i = 1; i <= values.length; i++) {
    sql += `$${i}${i < values.length ? ', ' : ''}`;
  }

  sql += `) RETURNING orden_id`;

  const result = await query(sql, values);
  return result.rows[0].orden_id;
}

async function agregarDetalles(orden_id, detalles) {
  for (const det of detalles) {
    const cantidad_alistada = det.alistada !== undefined ? det.alistada : det.cantidad;
    const alistamiento_completado = det.completado !== undefined ? det.completado : true;
    const cantidad_empacada = det.empacada || 0;
    const empaque_completado = det.empaque_completado || false;

    await query(
      `INSERT INTO orden_detalles (
        orden_id, producto_id, cantidad_pedida, precio_unitario,
        descuento_porcentaje, subtotal,
        cantidad_alistada, alistamiento_completado,
        cantidad_empacada, empaque_completado
      ) VALUES ($1, $2, $3, $4, 0, $5, $6, $7, $8, $9)`,
      [
        orden_id,
        det.producto.producto_id,
        det.cantidad,
        det.producto.precio_base,
        det.cantidad * det.producto.precio_base,
        cantidad_alistada,
        alistamiento_completado,
        cantidad_empacada,
        empaque_completado
      ]
    );
  }
}

agregarMasOrdenes().catch(error => {
  console.error('❌ Error general:', error);
  process.exit(1);
});

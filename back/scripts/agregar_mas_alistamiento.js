const { query } = require('../src/config/db');

async function agregarMasAlistamiento() {
  console.log('🆕 Agregando más órdenes APROBADAS para ALISTAMIENTO...\n');

  try {
    // Obtener IDs de usuarios (ahora todos son Operarios)
    const operario1 = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['operario1@wms.com']);
    const operario2 = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['operario2@wms.com']);
    const operario3 = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['operario3@wms.com']);
    const operario4 = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['operario4@wms.com']);
    const vendedor = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['vendedor1@wms.com']);
    const jefe = await query('SELECT usuario_id FROM usuarios WHERE email = $1', ['jefe@wms.com']);

    const operario1Id = operario1.rows[0].usuario_id;
    const operario2Id = operario2.rows[0].usuario_id;
    const operario3Id = operario3.rows[0].usuario_id;
    const operario4Id = operario4.rows[0].usuario_id;
    const vendedorId = vendedor.rows[0].usuario_id;
    const jefeId = jefe.rows[0].usuario_id;

    // Obtener clientes
    const clientes = await query('SELECT cliente_id FROM clientes ORDER BY cliente_id LIMIT 6');
    const cliente1Id = clientes.rows[0].cliente_id;
    const cliente2Id = clientes.rows[1].cliente_id;
    const cliente3Id = clientes.rows[2].cliente_id;
    const cliente4Id = clientes.rows.length > 3 ? clientes.rows[3].cliente_id : cliente1Id;
    const cliente5Id = clientes.rows.length > 4 ? clientes.rows[4].cliente_id : cliente2Id;
    const cliente6Id = clientes.rows.length > 5 ? clientes.rows[5].cliente_id : cliente3Id;

    // Obtener productos
    const productos = await query('SELECT producto_id, precio_base FROM productos ORDER BY producto_id LIMIT 10');

    // Fechas variadas
    const ahora = new Date();
    const hace3Dias = new Date(ahora - 3 * 24 * 60 * 60 * 1000);
    const hace2Dias = new Date(ahora - 2 * 24 * 60 * 60 * 1000);
    const hace1Dia = new Date(ahora - 24 * 60 * 60 * 1000);
    const hace18Horas = new Date(ahora - 18 * 60 * 60 * 1000);
    const hace12Horas = new Date(ahora - 12 * 60 * 60 * 1000);
    const hace8Horas = new Date(ahora - 8 * 60 * 60 * 1000);
    const hace4Horas = new Date(ahora - 4 * 60 * 60 * 1000);
    const hace2Horas = new Date(ahora - 2 * 60 * 60 * 1000);

    console.log('📋 Creando órdenes APROBADAS para ALISTADOR 1...\n');

    // ========================================
    // ÓRDENES PARA ALISTADOR 1
    // ========================================

    // ORDEN 36: Alistador1
    await crearOrdenLimpia(
      'ORD-2024-036',
      cliente1Id, vendedorId, jefeId,
      operario1Id, operario3Id,
      'Aprobada',
      'Pedido express - cliente premium',
      hace3Dias,
      [
        { producto: productos.rows[0], cantidad: 45 },
        { producto: productos.rows[2], cantidad: 38 },
        { producto: productos.rows[5], cantidad: 22 }
      ]
    );
    console.log('  ✅ ORD-2024-036 creada (alistador1)');

    // ORDEN 37: Alistador1
    await crearOrdenLimpia(
      'ORD-2024-037',
      cliente2Id, vendedorId, jefeId,
      operario1Id, operario4Id,
      'Aprobada',
      'Reposición mensual',
      hace3Dias,
      [
        { producto: productos.rows[1], cantidad: 60 },
        { producto: productos.rows[3], cantidad: 55 }
      ]
    );
    console.log('  ✅ ORD-2024-037 creada (alistador1)');

    // ORDEN 38: Alistador1
    await crearOrdenLimpia(
      'ORD-2024-038',
      cliente3Id, vendedorId, jefeId,
      operario1Id, operario3Id,
      'Aprobada',
      'Orden corporativa grande',
      hace2Dias,
      [
        { producto: productos.rows[4], cantidad: 70 },
        { producto: productos.rows[6], cantidad: 50 },
        { producto: productos.rows[8], cantidad: 35 },
        { producto: productos.rows[9], cantidad: 28 }
      ]
    );
    console.log('  ✅ ORD-2024-038 creada (alistador1)');

    // ORDEN 39: Alistador1
    await crearOrdenLimpia(
      'ORD-2024-039',
      cliente4Id, vendedorId, jefeId,
      operario1Id, operario4Id,
      'Aprobada',
      'Pedido estándar',
      hace2Dias,
      [
        { producto: productos.rows[0], cantidad: 33 },
        { producto: productos.rows[7], cantidad: 29 }
      ]
    );
    console.log('  ✅ ORD-2024-039 creada (alistador1)');

    // ORDEN 40: Alistador1
    await crearOrdenLimpia(
      'ORD-2024-040',
      cliente5Id, vendedorId, jefeId,
      operario1Id, operario3Id,
      'Aprobada',
      'Pedido urgente',
      hace1Dia,
      [
        { producto: productos.rows[2], cantidad: 42 },
        { producto: productos.rows[5], cantidad: 36 },
        { producto: productos.rows[8], cantidad: 24 }
      ]
    );
    console.log('  ✅ ORD-2024-040 creada (alistador1)');

    // ORDEN 41: Alistador1
    await crearOrdenLimpia(
      'ORD-2024-041',
      cliente6Id, vendedorId, jefeId,
      operario1Id, operario4Id,
      'Aprobada',
      'Cliente nuevo - primera orden',
      hace1Dia,
      [
        { producto: productos.rows[1], cantidad: 25 },
        { producto: productos.rows[4], cantidad: 30 }
      ]
    );
    console.log('  ✅ ORD-2024-041 creada (alistador1)');

    // ORDEN 42: Alistador1
    await crearOrdenLimpia(
      'ORD-2024-042',
      cliente1Id, vendedorId, jefeId,
      operario1Id, operario3Id,
      'Aprobada',
      'Orden VIP prioritaria',
      hace18Horas,
      [
        { producto: productos.rows[0], cantidad: 80 },
        { producto: productos.rows[3], cantidad: 65 },
        { producto: productos.rows[6], cantidad: 48 }
      ]
    );
    console.log('  ✅ ORD-2024-042 creada (alistador1)');

    // ORDEN 43: Alistador1
    await crearOrdenLimpia(
      'ORD-2024-043',
      cliente2Id, vendedorId, jefeId,
      operario1Id, operario4Id,
      'Aprobada',
      'Pedido especial',
      hace12Horas,
      [
        { producto: productos.rows[7], cantidad: 40 },
        { producto: productos.rows[9], cantidad: 35 }
      ]
    );
    console.log('  ✅ ORD-2024-043 creada (alistador1)');

    console.log('\n📋 Creando órdenes APROBADAS para ALISTADOR 2...\n');

    // ========================================
    // ÓRDENES PARA ALISTADOR 2
    // ========================================

    // ORDEN 44: Alistador2
    await crearOrdenLimpia(
      'ORD-2024-044',
      cliente3Id, vendedorId, jefeId,
      operario2Id, operario3Id,
      'Aprobada',
      'Pedido regular',
      hace3Dias,
      [
        { producto: productos.rows[1], cantidad: 52 },
        { producto: productos.rows[4], cantidad: 44 },
        { producto: productos.rows[7], cantidad: 31 }
      ]
    );
    console.log('  ✅ ORD-2024-044 creada (alistador2)');

    // ORDEN 45: Alistador2
    await crearOrdenLimpia(
      'ORD-2024-045',
      cliente4Id, vendedorId, jefeId,
      operario2Id, operario4Id,
      'Aprobada',
      'Reabastecimiento',
      hace2Dias,
      [
        { producto: productos.rows[0], cantidad: 48 },
        { producto: productos.rows[2], cantidad: 41 }
      ]
    );
    console.log('  ✅ ORD-2024-045 creada (alistador2)');

    // ORDEN 46: Alistador2
    await crearOrdenLimpia(
      'ORD-2024-046',
      cliente5Id, vendedorId, jefeId,
      operario2Id, operario3Id,
      'Aprobada',
      'Orden estándar',
      hace1Dia,
      [
        { producto: productos.rows[3], cantidad: 38 },
        { producto: productos.rows[5], cantidad: 32 },
        { producto: productos.rows[8], cantidad: 27 }
      ]
    );
    console.log('  ✅ ORD-2024-046 creada (alistador2)');

    // ORDEN 47: Alistador2
    await crearOrdenLimpia(
      'ORD-2024-047',
      cliente6Id, vendedorId, jefeId,
      operario2Id, operario4Id,
      'Aprobada',
      'Pedido promocional',
      hace18Horas,
      [
        { producto: productos.rows[6], cantidad: 55 },
        { producto: productos.rows[9], cantidad: 47 }
      ]
    );
    console.log('  ✅ ORD-2024-047 creada (alistador2)');

    // ORDEN 48: Alistador2
    await crearOrdenLimpia(
      'ORD-2024-048',
      cliente1Id, vendedorId, jefeId,
      operario2Id, operario3Id,
      'Aprobada',
      'Pedido corporativo',
      hace12Horas,
      [
        { producto: productos.rows[0], cantidad: 62 },
        { producto: productos.rows[1], cantidad: 58 },
        { producto: productos.rows[4], cantidad: 43 }
      ]
    );
    console.log('  ✅ ORD-2024-048 creada (alistador2)');

    // ORDEN 49: Alistador2
    await crearOrdenLimpia(
      'ORD-2024-049',
      cliente2Id, vendedorId, jefeId,
      operario2Id, operario4Id,
      'Aprobada',
      'Orden urgente tarde',
      hace8Horas,
      [
        { producto: productos.rows[2], cantidad: 34 },
        { producto: productos.rows[7], cantidad: 29 }
      ]
    );
    console.log('  ✅ ORD-2024-049 creada (alistador2)');

    // ORDEN 50: Alistador2
    await crearOrdenLimpia(
      'ORD-2024-050',
      cliente3Id, vendedorId, jefeId,
      operario2Id, operario3Id,
      'Aprobada',
      'Pedido reciente',
      hace4Horas,
      [
        { producto: productos.rows[3], cantidad: 50 },
        { producto: productos.rows[6], cantidad: 45 },
        { producto: productos.rows[9], cantidad: 38 }
      ]
    );
    console.log('  ✅ ORD-2024-050 creada (alistador2)');

    console.log('\n✨ ¡15 órdenes adicionales para alistamiento creadas exitosamente!\n');
    console.log('📊 RESUMEN DE ÓRDENES AGREGADAS:');
    console.log('  🔵 15 órdenes Aprobadas (SIN cantidades alistadas)');
    console.log('     - alistador1@wms.com: 8 órdenes (036-043)');
    console.log('     - alistador2@wms.com: 7 órdenes (044-050)');
    console.log('');
    console.log('📊 CARACTERÍSTICAS:');
    console.log('   ✓ Fechas variadas (de 3 días atrás hasta 4 horas atrás)');
    console.log('   ✓ Diferentes cantidades de productos (2-4 productos por orden)');
    console.log('   ✓ Cantidades realistas y variadas');
    console.log('   ✓ Comentarios descriptivos para contexto');
    console.log('   ✓ Distribuidas entre ambos empacadores');
    console.log('');
    console.log('🎯 ¡Ahora hay muchas más órdenes para demostrar el proceso de alistamiento!');
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

  // Agregar detalles SIN cantidades guardadas (LIMPIO para probar)
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

agregarMasAlistamiento().catch(error => {
  console.error('❌ Error general:', error);
  process.exit(1);
});

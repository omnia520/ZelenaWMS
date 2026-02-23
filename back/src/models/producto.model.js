const { query } = require('../config/db');

class ProductoModel {
  // Crear producto
  static async create(productoData) {
    const sql = `
      INSERT INTO productos (codigo, nombre, descripcion, categoria, subcategoria, marca, precio_base, precio_compra, precio_venta, stock_actual, imagen_url, activo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [
      productoData.codigo,
      productoData.nombre,
      productoData.descripcion || null,
      productoData.categoria || null,
      productoData.subcategoria || null,
      productoData.marca || null,
      productoData.precio_base || 0,
      productoData.precio_compra || 0,
      productoData.precio_venta || 0,
      productoData.stock_actual || 0,
      productoData.imagen_url || null,
      productoData.activo !== undefined ? productoData.activo : true
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Buscar por ID
  static async findById(producto_id) {
    const sql = `SELECT * FROM productos WHERE producto_id = $1`;
    const result = await query(sql, [producto_id]);
    return result.rows[0];
  }

  // Buscar por código
  static async findByCodigo(codigo) {
    const sql = `SELECT * FROM productos WHERE codigo = $1`;
    const result = await query(sql, [codigo]);
    return result.rows[0];
  }

  // Listar todos con filtros
  static async findAll(filters = {}) {
    let sql = `
      SELECT
        *,
        stock_actual as cantidad_total,
        COALESCE(stock_reservado, 0)::INTEGER as cantidad_reservada,
        (stock_actual - COALESCE(stock_reservado, 0))::INTEGER as cantidad_disponible
      FROM productos
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.activo !== undefined) {
      sql += ` AND activo = $${paramCount}`;
      values.push(filters.activo);
      paramCount++;
    }

    if (filters.categoria) {
      sql += ` AND LOWER(categoria) = LOWER($${paramCount})`;
      values.push(filters.categoria);
      paramCount++;
    }

    if (filters.subcategoria) {
      sql += ` AND LOWER(subcategoria) = LOWER($${paramCount})`;
      values.push(filters.subcategoria);
      paramCount++;
    }

    if (filters.marca) {
      sql += ` AND LOWER(marca) = LOWER($${paramCount})`;
      values.push(filters.marca);
      paramCount++;
    }

    if (filters.search) {
      sql += ` AND (
        LOWER(nombre) LIKE LOWER($${paramCount}) OR
        LOWER(codigo) LIKE LOWER($${paramCount}) OR
        LOWER(descripcion) LIKE LOWER($${paramCount})
      )`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters.con_stock) {
      sql += ` AND stock_actual > 0`;
    }

    sql += ' ORDER BY nombre ASC';

    const result = await query(sql, values);
    return result.rows;
  }

  // Actualizar producto
  static async update(producto_id, productoData) {
    const sql = `
      UPDATE productos
      SET codigo = $1,
          nombre = $2,
          descripcion = $3,
          categoria = $4,
          subcategoria = $5,
          marca = $6,
          precio_base = $7,
          precio_compra = $8,
          precio_venta = $9,
          imagen_url = $10,
          activo = $11
      WHERE producto_id = $12
      RETURNING *
    `;
    const values = [
      productoData.codigo,
      productoData.nombre,
      productoData.descripcion,
      productoData.categoria,
      productoData.subcategoria,
      productoData.marca,
      productoData.precio_base,
      productoData.precio_compra,
      productoData.precio_venta,
      productoData.imagen_url,
      productoData.activo,
      producto_id
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Actualizar stock
  static async updateStock(producto_id, cantidad) {
    const sql = `
      UPDATE productos
      SET stock_actual = stock_actual + $1
      WHERE producto_id = $2
      RETURNING *
    `;
    const result = await query(sql, [cantidad, producto_id]);
    return result.rows[0];
  }

  // Establecer stock
  static async setStock(producto_id, stock_actual) {
    const sql = `
      UPDATE productos
      SET stock_actual = $1
      WHERE producto_id = $2
      RETURNING *
    `;
    const result = await query(sql, [stock_actual, producto_id]);
    return result.rows[0];
  }

  // Actualizar imagen
  static async updateImagen(producto_id, imagen_url) {
    const sql = `
      UPDATE productos
      SET imagen_url = $1
      WHERE producto_id = $2
      RETURNING *
    `;
    const result = await query(sql, [imagen_url, producto_id]);
    return result.rows[0];
  }

  // Obtener productos con ubicaciones
  static async findWithUbicaciones(producto_id) {
    const sql = `
      SELECT p.*,
             json_agg(
               json_build_object(
                 'ubicacion_id', iu.ubicacion_id,
                 'codigo', u.codigo,
                 'descripcion', u.descripcion,
                 'cantidad', iu.cantidad,
                 'es_primaria', iu.es_ubicacion_primaria,
                 'orden_ruta', u.orden_ruta
               )
             ) FILTER (WHERE iu.inventario_id IS NOT NULL) as ubicaciones
      FROM productos p
      LEFT JOIN inventario_ubicaciones iu ON p.producto_id = iu.producto_id
      LEFT JOIN ubicaciones u ON iu.ubicacion_id = u.ubicacion_id
      WHERE p.producto_id = $1
      GROUP BY p.producto_id
    `;
    const result = await query(sql, [producto_id]);
    return result.rows[0];
  }

  // Eliminar
  static async delete(producto_id) {
    const sql = `DELETE FROM productos WHERE producto_id = $1 RETURNING *`;
    const result = await query(sql, [producto_id]);
    return result.rows[0];
  }

  // Obtener categorías únicas
  static async getCategories() {
    const sql = `
      SELECT DISTINCT categoria
      FROM productos
      WHERE categoria IS NOT NULL AND activo = true
      ORDER BY categoria ASC
    `;
    const result = await query(sql);
    return result.rows.map(row => row.categoria);
  }

  // Obtener subcategorías únicas (opcionalmente filtradas por categoría)
  static async getSubcategorias(categoria) {
    const sql = `
      SELECT DISTINCT subcategoria
      FROM productos
      WHERE subcategoria IS NOT NULL
        AND activo = true
        ${categoria ? 'AND LOWER(categoria) = LOWER($1)' : ''}
      ORDER BY subcategoria ASC
    `;
    const values = categoria ? [categoria] : [];
    const result = await query(sql, values);
    return result.rows.map(row => row.subcategoria);
  }

  // Obtener marcas únicas
  static async getMarcas() {
    const sql = `
      SELECT DISTINCT marca
      FROM productos
      WHERE marca IS NOT NULL AND activo = true
      ORDER BY marca ASC
    `;
    const result = await query(sql);
    return result.rows.map(row => row.marca);
  }

  // Obtener historial de órdenes de un producto
  static async getOrdenesHistorial(producto_id) {
    const sql = `
      SELECT
        ov.orden_id,
        ov.numero_orden,
        ov.fecha_creacion,
        ov.estado,
        ov.comentarios as orden_comentarios,
        c.razon_social as cliente_nombre,
        u.nombre as vendedor_nombre,
        od.precio_unitario,
        od.descuento_porcentaje,
        od.subtotal,
        od.cantidad_pedida,
        od.comentarios_item,
        p.codigo as producto_codigo,
        p.nombre as producto_nombre
      FROM orden_detalles od
      JOIN ordenes_venta ov ON od.orden_id = ov.orden_id
      JOIN productos p ON od.producto_id = p.producto_id
      LEFT JOIN clientes c ON ov.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON ov.vendedor_id = u.usuario_id
      WHERE od.producto_id = $1
      ORDER BY ov.fecha_creacion DESC
    `;
    const result = await query(sql, [producto_id]);
    return result.rows;
  }

  // Obtener disponibilidad de producto (considerando reservas)
  static async getDisponibilidad(producto_id) {
    const sql = `
      SELECT
        p.producto_id,
        p.codigo,
        p.nombre,
        p.stock_actual as cantidad_total,
        COALESCE(SUM(iu.cantidad_reservada), 0)::INTEGER as cantidad_reservada,
        (p.stock_actual - COALESCE(SUM(iu.cantidad_reservada), 0))::INTEGER as cantidad_disponible
      FROM productos p
      LEFT JOIN inventario_ubicaciones iu ON p.producto_id = iu.producto_id
      WHERE p.producto_id = $1
      GROUP BY p.producto_id, p.codigo, p.nombre, p.stock_actual
    `;
    const result = await query(sql, [producto_id]);
    return result.rows[0];
  }

  // Verificar disponibilidad para múltiples productos
  static async verificarDisponibilidadMultiple(productos) {
    // productos es un array de objetos: [{producto_id, cantidad_solicitada}]
    if (!productos || productos.length === 0) {
      return [];
    }

    const productosIds = productos.map(p => p.producto_id);
    const sql = `
      SELECT
        p.producto_id,
        p.codigo,
        p.nombre,
        p.stock_actual as cantidad_total,
        COALESCE(SUM(iu.cantidad_reservada), 0)::INTEGER as cantidad_reservada,
        (p.stock_actual - COALESCE(SUM(iu.cantidad_reservada), 0))::INTEGER as cantidad_disponible
      FROM productos p
      LEFT JOIN inventario_ubicaciones iu ON p.producto_id = iu.producto_id
      WHERE p.producto_id = ANY($1)
      GROUP BY p.producto_id, p.codigo, p.nombre, p.stock_actual
    `;
    const result = await query(sql, [productosIds]);

    // Verificar cada producto solicitado
    return productos.map(prod => {
      const disponibilidad = result.rows.find(r => r.producto_id === prod.producto_id);
      if (!disponibilidad) {
        return {
          producto_id: prod.producto_id,
          cantidad_solicitada: prod.cantidad_solicitada,
          disponible: false,
          mensaje: 'Producto no encontrado'
        };
      }

      const suficiente = disponibilidad.cantidad_disponible >= prod.cantidad_solicitada;
      return {
        producto_id: prod.producto_id,
        codigo: disponibilidad.codigo,
        nombre: disponibilidad.nombre,
        cantidad_solicitada: prod.cantidad_solicitada,
        cantidad_total: disponibilidad.cantidad_total,
        cantidad_reservada: disponibilidad.cantidad_reservada,
        cantidad_disponible: disponibilidad.cantidad_disponible,
        disponible: suficiente,
        mensaje: suficiente
          ? 'Stock disponible'
          : `Stock insuficiente. Disponibles: ${disponibilidad.cantidad_disponible}`
      };
    });
  }
}

module.exports = ProductoModel;

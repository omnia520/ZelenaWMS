const ProductoModel = require('../models/producto.model');
const { getClient } = require('../config/db');

class ProductoController {
  // Crear producto
  static async create(req, res, next) {
    const client = await getClient();
    try {
      const { codigo, nombre, descripcion, categoria, subcategoria, marca, precio_base, precio_compra, precio_venta, stock_actual, imagen_url } = req.body;

      if (!codigo || !nombre) {
        return res.status(400).json({
          success: false,
          message: 'Código y nombre son requeridos'
        });
      }

      // Verificar que no exista el código
      const existingProducto = await ProductoModel.findByCodigo(codigo);
      if (existingProducto) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un producto con este código'
        });
      }

      // Iniciar transacción
      await client.query('BEGIN');

      // Crear el producto
      const newProducto = await ProductoModel.create({
        codigo,
        nombre,
        descripcion,
        categoria,
        subcategoria,
        marca,
        precio_base,
        precio_compra,
        precio_venta,
        stock_actual,
        imagen_url
      });

      // Obtener el ID de la Bodega Principal (BOD-001)
      const bodegaPrincipalResult = await client.query(
        'SELECT bodega_id FROM bodegas WHERE codigo = $1',
        ['BOD-001']
      );

      if (!bodegaPrincipalResult.rows[0]) {
        throw new Error('No se encontró la Bodega Principal');
      }

      const bodegaPrincipalId = bodegaPrincipalResult.rows[0].bodega_id;

      // Agregar el producto al inventario de la Bodega Principal con su stock actual
      const cantidadInicial = stock_actual || 0;
      await client.query(
        `INSERT INTO inventario_bodegas (bodega_id, producto_id, cantidad)
         VALUES ($1, $2, $3)
         ON CONFLICT (bodega_id, producto_id) DO NOTHING`,
        [bodegaPrincipalId, newProducto.producto_id, cantidadInicial]
      );

      // Confirmar transacción
      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: newProducto
      });
    } catch (error) {
      // Revertir transacción en caso de error
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  }

  // Obtener todos los productos
  static async getAll(req, res, next) {
    try {
      const filters = {
        activo: req.query.activo === 'false' ? false : req.query.activo === 'true' ? true : undefined,
        categoria: req.query.categoria,
        subcategoria: req.query.subcategoria,
        marca: req.query.marca,
        search: req.query.search,
        con_stock: req.query.con_stock === 'true'
      };

      const productos = await ProductoModel.findAll(filters);

      res.json({
        success: true,
        count: productos.length,
        data: productos
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener producto por ID
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const producto = await ProductoModel.findById(id);

      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      res.json({
        success: true,
        data: producto
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener producto con ubicaciones
  static async getWithUbicaciones(req, res, next) {
    try {
      const { id } = req.params;

      const producto = await ProductoModel.findWithUbicaciones(id);

      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      res.json({
        success: true,
        data: producto
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar producto
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { codigo, nombre, descripcion, categoria, subcategoria, marca, precio_base, precio_compra, precio_venta, imagen_url, activo } = req.body;

      const producto = await ProductoModel.findById(id);
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Si cambió el código, verificar que no exista otro con ese código
      if (codigo && codigo !== producto.codigo) {
        const existingProducto = await ProductoModel.findByCodigo(codigo);
        if (existingProducto) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe un producto con este código'
          });
        }
      }

      const updatedProducto = await ProductoModel.update(id, {
        codigo: codigo || producto.codigo,
        nombre: nombre || producto.nombre,
        descripcion: descripcion !== undefined ? descripcion : producto.descripcion,
        categoria: categoria !== undefined ? categoria : producto.categoria,
        subcategoria: subcategoria !== undefined ? subcategoria : producto.subcategoria,
        marca: marca !== undefined ? marca : producto.marca,
        precio_base: precio_base !== undefined ? precio_base : producto.precio_base,
        precio_compra: precio_compra !== undefined ? precio_compra : producto.precio_compra,
        precio_venta: precio_venta !== undefined ? precio_venta : producto.precio_venta,
        imagen_url: imagen_url !== undefined ? imagen_url : producto.imagen_url,
        activo: activo !== undefined ? activo : producto.activo
      });

      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: updatedProducto
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar stock
  static async updateStock(req, res, next) {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;

      if (cantidad === undefined) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad es requerida'
        });
      }

      const producto = await ProductoModel.updateStock(id, cantidad);

      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Stock actualizado exitosamente',
        data: producto
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar imagen
  static async updateImagen(req, res, next) {
    try {
      const { id } = req.params;
      const { imagen_url } = req.body;

      if (!imagen_url) {
        return res.status(400).json({
          success: false,
          message: 'La URL de la imagen es requerida'
        });
      }

      const producto = await ProductoModel.updateImagen(id, imagen_url);

      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Imagen actualizada exitosamente',
        data: producto
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener categorías
  static async getCategories(req, res, next) {
    try {
      const categorias = await ProductoModel.getCategories();

      res.json({
        success: true,
        count: categorias.length,
        data: categorias
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener subcategorías (opcionalmente filtradas por categoría)
  static async getSubcategorias(req, res, next) {
    try {
      const { categoria } = req.query;
      const subcategorias = await ProductoModel.getSubcategorias(categoria);

      res.json({
        success: true,
        count: subcategorias.length,
        data: subcategorias
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener marcas
  static async getMarcas(req, res, next) {
    try {
      const marcas = await ProductoModel.getMarcas();

      res.json({
        success: true,
        count: marcas.length,
        data: marcas
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar producto
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const producto = await ProductoModel.delete(id);

      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Producto eliminado exitosamente',
        data: producto
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener historial de órdenes de un producto
  static async getOrdenesHistorial(req, res, next) {
    try {
      const { id } = req.params;

      // Verificar que el producto existe
      const producto = await ProductoModel.findById(id);
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      const ordenes = await ProductoModel.getOrdenesHistorial(id);

      res.json({
        success: true,
        count: ordenes.length,
        producto: {
          producto_id: producto.producto_id,
          codigo: producto.codigo,
          nombre: producto.nombre
        },
        data: ordenes
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener disponibilidad de un producto (considerando reservas)
  static async getDisponibilidad(req, res, next) {
    try {
      const { id } = req.params;

      const disponibilidad = await ProductoModel.getDisponibilidad(id);

      if (!disponibilidad) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      res.json({
        success: true,
        data: disponibilidad
      });
    } catch (error) {
      next(error);
    }
  }

  // Verificar disponibilidad para múltiples productos
  static async verificarDisponibilidad(req, res, next) {
    try {
      const { productos } = req.body;

      if (!productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un array de productos con producto_id y cantidad_solicitada'
        });
      }

      // Validar estructura de cada producto
      for (const prod of productos) {
        if (!prod.producto_id || !prod.cantidad_solicitada) {
          return res.status(400).json({
            success: false,
            message: 'Cada producto debe tener producto_id y cantidad_solicitada'
          });
        }
      }

      const verificacion = await ProductoModel.verificarDisponibilidadMultiple(productos);

      // Verificar si hay productos con stock insuficiente
      const productosInsuficientes = verificacion.filter(v => !v.disponible);
      const todoDisponible = productosInsuficientes.length === 0;

      res.json({
        success: true,
        disponible: todoDisponible,
        data: verificacion,
        productos_insuficientes: productosInsuficientes
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductoController;

const UbicacionModel = require('../models/ubicacion.model');

class UbicacionController {
  // Crear ubicación
  static async create(req, res, next) {
    try {
      const { codigo, descripcion, estanteria, fila, nivel, orden_ruta } = req.body;

      if (!codigo) {
        return res.status(400).json({
          success: false,
          message: 'El código es requerido'
        });
      }

      // Verificar que no exista el código
      const existing = await UbicacionModel.findByCodigo(codigo);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una ubicación con este código'
        });
      }

      const nuevaUbicacion = await UbicacionModel.create({
        codigo,
        descripcion,
        estanteria,
        fila,
        nivel,
        orden_ruta
      });

      res.status(201).json({
        success: true,
        message: 'Ubicación creada exitosamente',
        data: nuevaUbicacion
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener todas las ubicaciones
  static async getAll(req, res, next) {
    try {
      const filters = {
        activa: req.query.activa === 'false' ? false : req.query.activa === 'true' ? true : undefined,
        estanteria: req.query.estanteria
      };

      const ubicaciones = await UbicacionModel.findAll(filters);

      res.json({
        success: true,
        count: ubicaciones.length,
        data: ubicaciones
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener ubicación por ID
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const ubicacion = await UbicacionModel.findById(id);

      if (!ubicacion) {
        return res.status(404).json({
          success: false,
          message: 'Ubicación no encontrada'
        });
      }

      res.json({
        success: true,
        data: ubicacion
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener inventario de ubicación
  static async getInventario(req, res, next) {
    try {
      const { id } = req.params;

      const inventario = await UbicacionModel.getInventario(id);

      res.json({
        success: true,
        count: inventario.length,
        data: inventario
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar ubicación
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { codigo, descripcion, estanteria, fila, nivel, orden_ruta, activa } = req.body;

      const ubicacion = await UbicacionModel.findById(id);
      if (!ubicacion) {
        return res.status(404).json({
          success: false,
          message: 'Ubicación no encontrada'
        });
      }

      // Si cambió el código, verificar que no exista otro con ese código
      if (codigo && codigo !== ubicacion.codigo) {
        const existing = await UbicacionModel.findByCodigo(codigo);
        if (existing) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe una ubicación con este código'
          });
        }
      }

      const updatedUbicacion = await UbicacionModel.update(id, {
        codigo: codigo || ubicacion.codigo,
        descripcion: descripcion !== undefined ? descripcion : ubicacion.descripcion,
        estanteria: estanteria !== undefined ? estanteria : ubicacion.estanteria,
        fila: fila !== undefined ? fila : ubicacion.fila,
        nivel: nivel !== undefined ? nivel : ubicacion.nivel,
        orden_ruta: orden_ruta !== undefined ? orden_ruta : ubicacion.orden_ruta,
        activa: activa !== undefined ? activa : ubicacion.activa
      });

      res.json({
        success: true,
        message: 'Ubicación actualizada exitosamente',
        data: updatedUbicacion
      });
    } catch (error) {
      next(error);
    }
  }

  // Asignar producto a ubicación
  static async asignarProducto(req, res, next) {
    try {
      const { id } = req.params;
      const { producto_id, cantidad, es_primaria } = req.body;

      if (!producto_id || cantidad === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Producto y cantidad son requeridos'
        });
      }

      const asignacion = await UbicacionModel.asignarProducto(
        producto_id,
        id,
        cantidad,
        es_primaria || false
      );

      res.status(201).json({
        success: true,
        message: 'Producto asignado exitosamente',
        data: asignacion
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar cantidad en ubicación
  static async updateCantidad(req, res, next) {
    try {
      const { id } = req.params;
      const { producto_id, cantidad } = req.body;

      if (!producto_id || cantidad === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Producto y cantidad son requeridos'
        });
      }

      const updated = await UbicacionModel.updateCantidad(producto_id, id, cantidad);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Asignación no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Cantidad actualizada exitosamente',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  // Remover producto de ubicación
  static async removeProducto(req, res, next) {
    try {
      const { id, producto_id } = req.params;

      const removed = await UbicacionModel.removeProducto(producto_id, id);

      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Asignación no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Producto removido de la ubicación',
        data: removed
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar ubicación
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const ubicacion = await UbicacionModel.delete(id);

      if (!ubicacion) {
        return res.status(404).json({
          success: false,
          message: 'Ubicación no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Ubicación eliminada exitosamente',
        data: ubicacion
      });
    } catch (error) {
      next(error);
    }
  }

  // Buscar ubicaciones de producto por referencia
  static async buscarProducto(req, res, next) {
    try {
      const { referencia } = req.query;

      if (!referencia) {
        return res.status(400).json({
          success: false,
          message: 'La referencia del producto es requerida'
        });
      }

      const productos = await UbicacionModel.findProductoUbicaciones(referencia);

      res.json({
        success: true,
        count: productos.length,
        data: productos
      });
    } catch (error) {
      next(error);
    }
  }

  // Buscar productos por código de ubicación
  static async buscarUbicacion(req, res, next) {
    try {
      const { codigo } = req.query;

      if (!codigo) {
        return res.status(400).json({
          success: false,
          message: 'El código de ubicación es requerido'
        });
      }

      const ubicaciones = await UbicacionModel.findUbicacionProductos(codigo);

      res.json({
        success: true,
        count: ubicaciones.length,
        data: ubicaciones
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener sugerencias de productos para autocomplete
  static async getSugerenciasProductos(req, res, next) {
    try {
      const { termino } = req.query;

      if (!termino || termino.length < 1) {
        return res.json({
          success: true,
          count: 0,
          data: []
        });
      }

      const sugerencias = await UbicacionModel.getSugerenciasProductos(termino);

      res.json({
        success: true,
        count: sugerencias.length,
        data: sugerencias
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener sugerencias de ubicaciones para autocomplete
  static async getSugerenciasUbicaciones(req, res, next) {
    try {
      const { termino } = req.query;

      if (!termino || termino.length < 1) {
        return res.json({
          success: true,
          count: 0,
          data: []
        });
      }

      const sugerencias = await UbicacionModel.getSugerenciasUbicaciones(termino);

      res.json({
        success: true,
        count: sugerencias.length,
        data: sugerencias
      });
    } catch (error) {
      next(error);
    }
  }

  // Mover producto de una ubicación a otra
  static async moverProducto(req, res, next) {
    try {
      const { producto_id, ubicacion_origen_id, ubicacion_destino_id, cantidad } = req.body;

      if (!producto_id || !ubicacion_origen_id || !ubicacion_destino_id || cantidad === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Producto, ubicaciones origen y destino, y cantidad son requeridos'
        });
      }

      if (cantidad <= 0) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad debe ser mayor a 0'
        });
      }

      if (ubicacion_origen_id === ubicacion_destino_id) {
        return res.status(400).json({
          success: false,
          message: 'La ubicación origen y destino no pueden ser la misma'
        });
      }

      const resultado = await UbicacionModel.moverProducto(
        producto_id,
        ubicacion_origen_id,
        ubicacion_destino_id,
        cantidad
      );

      res.json({
        success: true,
        message: 'Producto movido exitosamente',
        data: resultado
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UbicacionController;

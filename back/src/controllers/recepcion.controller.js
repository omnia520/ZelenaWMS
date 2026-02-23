const RecepcionModel = require('../models/recepcion.model');

class RecepcionController {
  // Crear recepción
  static async create(req, res, next) {
    try {
      console.log('🔍 req.body recibido:', JSON.stringify(req.body, null, 2));

      const { numero_documento, proveedor_id, fecha_recepcion, detalles, observaciones, foto_soporte } = req.body;

      console.log('🔍 proveedor_id extraído:', proveedor_id, 'tipo:', typeof proveedor_id);

      if (!numero_documento || !proveedor_id || !detalles || detalles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Número de documento, proveedor y detalles son requeridos'
        });
      }

      // Validar detalles
      for (let i = 0; i < detalles.length; i++) {
        const detalle = detalles[i];

        if (!detalle.codigo_producto && !detalle.producto_id) {
          return res.status(400).json({
            success: false,
            message: `El código del producto es requerido en el detalle ${i + 1}`
          });
        }

        if (detalle.es_nuevo) {
          if (!detalle.nombre_producto) {
            return res.status(400).json({
              success: false,
              message: `El nombre del producto es requerido para productos nuevos en el detalle ${i + 1}`
            });
          }
        }

        if (!detalle.cantidad_recibida || detalle.cantidad_recibida <= 0) {
          return res.status(400).json({
            success: false,
            message: `La cantidad recibida debe ser mayor a 0 en el detalle ${i + 1}`
          });
        }

        if (!detalle.ubicacion_id) {
          return res.status(400).json({
            success: false,
            message: `La ubicación es requerida en el detalle ${i + 1}`
          });
        }
      }

      const recepcion = await RecepcionModel.create(
        {
          numero_documento,
          proveedor_id,
          fecha_recepcion,
          observaciones,
          foto_soporte
        },
        detalles,
        req.user.usuario_id
      );

      res.status(201).json({
        success: true,
        message: 'Recepción registrada exitosamente',
        data: recepcion
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener todas las recepciones
  static async getAll(req, res, next) {
    try {
      const filters = {
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta,
        proveedor_id: req.query.proveedor_id,
        search: req.query.search
      };

      const recepciones = await RecepcionModel.findAll(filters);

      res.json({
        success: true,
        count: recepciones.length,
        data: recepciones
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener recepción por ID con detalles
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const recepcion = await RecepcionModel.findById(id);

      if (!recepcion) {
        return res.status(404).json({
          success: false,
          message: 'Recepción no encontrada'
        });
      }

      const detalles = await RecepcionModel.getDetalles(id);

      res.json({
        success: true,
        data: {
          ...recepcion,
          detalles
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar recepción
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const recepcion = await RecepcionModel.delete(id);

      if (!recepcion) {
        return res.status(404).json({
          success: false,
          message: 'Recepción no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Recepción eliminada exitosamente',
        data: recepcion
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RecepcionController;

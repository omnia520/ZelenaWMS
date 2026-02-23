const TransferenciaModel = require('../models/transferencia.model');

class TransferenciaController {
  // Crear transferencia
  static async create(req, res, next) {
    try {
      const { bodega_origen_id, bodega_destino_id, detalles, observaciones } = req.body;

      if (!bodega_origen_id || !bodega_destino_id) {
        return res.status(400).json({
          success: false,
          message: 'Bodega origen y destino son requeridas'
        });
      }

      if (bodega_origen_id === bodega_destino_id) {
        return res.status(400).json({
          success: false,
          message: 'La bodega origen y destino no pueden ser la misma'
        });
      }

      if (!detalles || detalles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Debe incluir al menos un producto en la transferencia'
        });
      }

      const transferencia = await TransferenciaModel.create(
        {
          bodega_origen_id,
          bodega_destino_id,
          observaciones,
          estado: 'Completada'
        },
        detalles,
        req.user.usuario_id
      );

      res.status(201).json({
        success: true,
        message: 'Transferencia creada exitosamente',
        data: transferencia
      });
    } catch (error) {
      if (error.message.includes('Stock insuficiente')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // Obtener todas las transferencias
  static async getAll(req, res, next) {
    try {
      const filters = {
        bodega_origen_id: req.query.bodega_origen_id,
        bodega_destino_id: req.query.bodega_destino_id,
        estado: req.query.estado,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta
      };

      const transferencias = await TransferenciaModel.findAll(filters);

      res.json({
        success: true,
        count: transferencias.length,
        data: transferencias
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener transferencia por ID
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const transferencia = await TransferenciaModel.findById(id);

      if (!transferencia) {
        return res.status(404).json({
          success: false,
          message: 'Transferencia no encontrada'
        });
      }

      const detalles = await TransferenciaModel.getDetalles(id);

      res.json({
        success: true,
        data: {
          ...transferencia,
          detalles
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Cancelar transferencia
  static async cancel(req, res, next) {
    try {
      const { id } = req.params;

      const transferencia = await TransferenciaModel.cancel(id);

      if (!transferencia) {
        return res.status(404).json({
          success: false,
          message: 'Transferencia no encontrada o no puede ser cancelada'
        });
      }

      res.json({
        success: true,
        message: 'Transferencia cancelada exitosamente',
        data: transferencia
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar transferencia
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const transferencia = await TransferenciaModel.delete(id);

      if (!transferencia) {
        return res.status(404).json({
          success: false,
          message: 'Transferencia no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Transferencia eliminada exitosamente',
        data: transferencia
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TransferenciaController;

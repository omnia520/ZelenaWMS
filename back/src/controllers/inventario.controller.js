const InventarioModel = require('../models/inventario.model');

class InventarioController {
  // Obtener inventario con información de reservas
  static async getInventarioConReservas(req, res, next) {
    try {
      const filters = {
        producto_id: req.query.producto_id ? parseInt(req.query.producto_id) : undefined,
        ubicacion_id: req.query.ubicacion_id ? parseInt(req.query.ubicacion_id) : undefined,
        bodega_id: req.query.bodega_id ? parseInt(req.query.bodega_id) : undefined
      };

      const inventario = await InventarioModel.getInventarioConReservas(filters);

      res.json({
        success: true,
        count: inventario.length,
        data: inventario
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InventarioController;

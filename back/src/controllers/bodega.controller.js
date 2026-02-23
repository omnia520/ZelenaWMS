const BodegaModel = require('../models/bodega.model');

class BodegaController {
  // Crear bodega
  static async create(req, res, next) {
    try {
      const { codigo, nombre, descripcion, direccion, ciudad, responsable_id } = req.body;

      if (!codigo || !nombre) {
        return res.status(400).json({
          success: false,
          message: 'Código y nombre son requeridos'
        });
      }

      // Verificar que no exista el código
      const existingBodega = await BodegaModel.findByCodigo(codigo);
      if (existingBodega) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una bodega con este código'
        });
      }

      const newBodega = await BodegaModel.create({
        codigo,
        nombre,
        descripcion,
        direccion,
        ciudad,
        responsable_id
      });

      res.status(201).json({
        success: true,
        message: 'Bodega creada exitosamente',
        data: newBodega
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener todas las bodegas
  static async getAll(req, res, next) {
    try {
      const filters = {
        activa: req.query.activa === 'false' ? false : req.query.activa === 'true' ? true : undefined,
        search: req.query.search
      };

      const bodegas = await BodegaModel.findAll(filters);

      res.json({
        success: true,
        count: bodegas.length,
        data: bodegas
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener bodega por ID
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const bodega = await BodegaModel.findById(id);

      if (!bodega) {
        return res.status(404).json({
          success: false,
          message: 'Bodega no encontrada'
        });
      }

      res.json({
        success: true,
        data: bodega
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener inventario de una bodega
  static async getInventario(req, res, next) {
    try {
      const { id } = req.params;
      const filters = {
        con_stock: req.query.con_stock === 'true',
        search: req.query.search
      };

      const bodega = await BodegaModel.findById(id);
      if (!bodega) {
        return res.status(404).json({
          success: false,
          message: 'Bodega no encontrada'
        });
      }

      const inventario = await BodegaModel.getInventario(id, filters);

      res.json({
        success: true,
        bodega: {
          bodega_id: bodega.bodega_id,
          nombre: bodega.nombre,
          codigo: bodega.codigo
        },
        count: inventario.length,
        data: inventario
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar bodega
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { codigo, nombre, descripcion, direccion, ciudad, responsable_id, activa } = req.body;

      const bodega = await BodegaModel.findById(id);
      if (!bodega) {
        return res.status(404).json({
          success: false,
          message: 'Bodega no encontrada'
        });
      }

      // Si cambió el código, verificar que no exista otro con ese código
      if (codigo && codigo !== bodega.codigo) {
        const existingBodega = await BodegaModel.findByCodigo(codigo);
        if (existingBodega) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe una bodega con este código'
          });
        }
      }

      const updatedBodega = await BodegaModel.update(id, {
        codigo: codigo || bodega.codigo,
        nombre: nombre || bodega.nombre,
        descripcion: descripcion !== undefined ? descripcion : bodega.descripcion,
        direccion: direccion !== undefined ? direccion : bodega.direccion,
        ciudad: ciudad !== undefined ? ciudad : bodega.ciudad,
        responsable_id: responsable_id !== undefined ? responsable_id : bodega.responsable_id,
        activa: activa !== undefined ? activa : bodega.activa
      });

      res.json({
        success: true,
        message: 'Bodega actualizada exitosamente',
        data: updatedBodega
      });
    } catch (error) {
      next(error);
    }
  }

  // Activar/Desactivar bodega
  static async toggleActive(req, res, next) {
    try {
      const { id } = req.params;
      const { activa } = req.body;

      if (activa === undefined) {
        return res.status(400).json({
          success: false,
          message: 'El campo activa es requerido'
        });
      }

      const bodega = await BodegaModel.toggleActive(id, activa);

      if (!bodega) {
        return res.status(404).json({
          success: false,
          message: 'Bodega no encontrada'
        });
      }

      res.json({
        success: true,
        message: `Bodega ${activa ? 'activada' : 'desactivada'} exitosamente`,
        data: bodega
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar bodega
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Verificar que no tenga inventario
      const inventario = await BodegaModel.getInventario(id, { con_stock: true });
      if (inventario.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar una bodega con inventario. Transfiera los productos primero.'
        });
      }

      const bodega = await BodegaModel.delete(id);

      if (!bodega) {
        return res.status(404).json({
          success: false,
          message: 'Bodega no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Bodega eliminada exitosamente',
        data: bodega
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BodegaController;

const ProveedorModel = require('../models/proveedor.model');

class ProveedorController {
  // Crear proveedor
  static async create(req, res, next) {
    try {
      const { nombre, nit, contacto, telefono, email, direccion, tolerancia_porcentaje } = req.body;

      // Validaciones
      if (!nombre) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del proveedor es requerido'
        });
      }

      // Verificar que no exista el nombre
      const existingProveedor = await ProveedorModel.findByNombre(nombre);
      if (existingProveedor) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un proveedor con este nombre'
        });
      }

      // Si se proporciona NIT, verificar que no exista
      if (nit) {
        const existingNit = await ProveedorModel.findByNit(nit);
        if (existingNit) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe un proveedor con este NIT'
          });
        }
      }

      // Crear proveedor
      const newProveedor = await ProveedorModel.create({
        nombre,
        nit,
        contacto,
        telefono,
        email,
        direccion,
        tolerancia_porcentaje
      });

      res.status(201).json({
        success: true,
        message: 'Proveedor creado exitosamente',
        data: newProveedor
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener todos los proveedores
  static async getAll(req, res, next) {
    try {
      const filters = {
        activo: req.query.activo === 'false' ? false : req.query.activo === 'true' ? true : undefined,
        search: req.query.search
      };

      const proveedores = await ProveedorModel.findAll(filters);

      res.json({
        success: true,
        count: proveedores.length,
        data: proveedores
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener proveedor por ID
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const proveedor = await ProveedorModel.findById(id);

      if (!proveedor) {
        return res.status(404).json({
          success: false,
          message: 'Proveedor no encontrado'
        });
      }

      // Obtener estadísticas de recepciones
      const stats = await ProveedorModel.getRecepcionStats(id);

      res.json({
        success: true,
        data: {
          ...proveedor,
          stats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar proveedor
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre, nit, contacto, telefono, email, direccion, tolerancia_porcentaje } = req.body;

      // Verificar que existe
      const proveedor = await ProveedorModel.findById(id);
      if (!proveedor) {
        return res.status(404).json({
          success: false,
          message: 'Proveedor no encontrado'
        });
      }

      // Si cambió el nombre, verificar que no exista otro con ese nombre
      if (nombre && nombre.toLowerCase() !== proveedor.nombre.toLowerCase()) {
        const existingProveedor = await ProveedorModel.findByNombre(nombre);
        if (existingProveedor) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe un proveedor con este nombre'
          });
        }
      }

      // Si cambió el NIT, verificar que no exista otro con ese NIT
      if (nit && nit !== proveedor.nit) {
        const existingNit = await ProveedorModel.findByNit(nit);
        if (existingNit) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe un proveedor con este NIT'
          });
        }
      }

      // Actualizar
      const updatedProveedor = await ProveedorModel.update(id, {
        nombre: nombre || proveedor.nombre,
        nit,
        contacto,
        telefono,
        email,
        direccion,
        tolerancia_porcentaje: tolerancia_porcentaje !== undefined ? tolerancia_porcentaje : proveedor.tolerancia_porcentaje
      });

      res.json({
        success: true,
        message: 'Proveedor actualizado exitosamente',
        data: updatedProveedor
      });
    } catch (error) {
      next(error);
    }
  }

  // Activar/Desactivar proveedor
  static async toggleActive(req, res, next) {
    try {
      const { id } = req.params;
      const { activo } = req.body;

      if (activo === undefined) {
        return res.status(400).json({
          success: false,
          message: 'El campo activo es requerido'
        });
      }

      const proveedor = await ProveedorModel.toggleActive(id, activo);

      if (!proveedor) {
        return res.status(404).json({
          success: false,
          message: 'Proveedor no encontrado'
        });
      }

      res.json({
        success: true,
        message: `Proveedor ${activo ? 'activado' : 'desactivado'} exitosamente`,
        data: proveedor
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar proveedor
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const proveedor = await ProveedorModel.delete(id);

      if (!proveedor) {
        return res.status(404).json({
          success: false,
          message: 'Proveedor no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Proveedor eliminado exitosamente',
        data: proveedor
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProveedorController;

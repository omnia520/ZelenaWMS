const ClienteModel = require('../models/cliente.model');

class ClienteController {
  // Crear cliente
  static async create(req, res, next) {
    try {
      const { nit_cc, razon_social, telefono, email, ciudad, departamento, direccion } = req.body;

      // Validaciones
      if (!nit_cc || !razon_social) {
        return res.status(400).json({
          success: false,
          message: 'NIT/CC y razón social son requeridos'
        });
      }

      // Verificar que no exista el NIT
      const existingCliente = await ClienteModel.findByNit(nit_cc);
      if (existingCliente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un cliente con este NIT/CC'
        });
      }

      // Crear cliente
      const newCliente = await ClienteModel.create(
        { nit_cc, razon_social, telefono, email, ciudad, departamento, direccion },
        req.user.usuario_id
      );

      res.status(201).json({
        success: true,
        message: 'Cliente creado exitosamente',
        data: newCliente
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener todos los clientes
  static async getAll(req, res, next) {
    try {
      const filters = {
        activo: req.query.activo === 'false' ? false : req.query.activo === 'true' ? true : undefined,
        ciudad: req.query.ciudad,
        search: req.query.search
      };

      const clientes = await ClienteModel.findAll(filters);

      res.json({
        success: true,
        count: clientes.length,
        data: clientes
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener cliente por ID
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const cliente = await ClienteModel.findById(id);

      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        data: cliente
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar cliente
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { nit_cc, razon_social, telefono, email, ciudad, departamento, direccion } = req.body;

      // Verificar que existe
      const cliente = await ClienteModel.findById(id);
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      // Si cambió el NIT, verificar que no exista otro con ese NIT
      if (nit_cc && nit_cc !== cliente.nit_cc) {
        const existingCliente = await ClienteModel.findByNit(nit_cc);
        if (existingCliente) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe un cliente con este NIT/CC'
          });
        }
      }

      // Actualizar
      const updatedCliente = await ClienteModel.update(id, {
        nit_cc: nit_cc || cliente.nit_cc,
        razon_social: razon_social || cliente.razon_social,
        telefono,
        email,
        ciudad,
        departamento,
        direccion
      });

      res.json({
        success: true,
        message: 'Cliente actualizado exitosamente',
        data: updatedCliente
      });
    } catch (error) {
      next(error);
    }
  }

  // Activar/Desactivar cliente
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

      const cliente = await ClienteModel.toggleActive(id, activo);

      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        message: `Cliente ${activo ? 'activado' : 'desactivado'} exitosamente`,
        data: cliente
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar cliente
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const cliente = await ClienteModel.delete(id);

      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Cliente eliminado exitosamente',
        data: cliente
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ClienteController;

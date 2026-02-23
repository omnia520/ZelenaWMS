const AveriaModel = require('../models/averia.model');

class AveriaController {
  // Obtener estadísticas de averías
  static async getStats(req, res, next) {
    try {
      const stats = await AveriaModel.getStats();

      res.json({
        success: true,
        data: {
          total: parseInt(stats.total) || 0,
          pendientes: parseInt(stats.pendientes) || 0,
          repuestas: parseInt(stats.repuestas) || 0,
          descartadas: parseInt(stats.descartadas) || 0
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear avería (con soporte para múltiples evidencias)
  static async create(req, res, next) {
    try {
      const { producto_id, cantidad, tipo_averia, descripcion, ubicacion_id, evidencias, foto_url } = req.body;

      if (!producto_id || !cantidad || !tipo_averia) {
        return res.status(400).json({
          success: false,
          message: 'Producto, cantidad y tipo de avería son requeridos'
        });
      }

      const tiposValidos = ['Daño', 'Faltante', 'Rotura', 'Vencimiento'];
      if (!tiposValidos.includes(tipo_averia)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de avería inválido',
          tiposValidos
        });
      }

      let averia;

      // Si hay evidencias, usar el método con transacción
      if (evidencias && evidencias.length > 0) {
        averia = await AveriaModel.createWithEvidencias(
          {
            producto_id,
            cantidad,
            tipo_averia,
            descripcion,
            ubicacion_id
          },
          evidencias,
          req.user.usuario_id
        );
      } else {
        // Crear avería simple (mantener compatibilidad con foto_url)
        averia = await AveriaModel.create(
          {
            producto_id,
            cantidad,
            tipo_averia,
            descripcion,
            ubicacion_id,
            foto_url
          },
          req.user.usuario_id
        );
      }

      res.status(201).json({
        success: true,
        message: 'Avería reportada exitosamente',
        data: averia
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener todas las averías
  static async getAll(req, res, next) {
    try {
      const filters = {
        estado: req.query.estado,
        tipo_averia: req.query.tipo_averia,
        producto_id: req.query.producto_id,
        reportado_por: req.query.reportado_por,
        search: req.query.search
      };

      let averias = await AveriaModel.findAll(filters);

      // Jefe_Bodega y Administrador pueden ver quién reportó la avería
      const canSeeResponsable = ['Administrador', 'Jefe_Bodega'].includes(req.user.rol);
      if (!canSeeResponsable) {
        averias = averias.map(averia => {
          const { reportado_por_nombre, reportado_por, ...rest } = averia;
          return rest;
        });
      }

      res.json({
        success: true,
        count: averias.length,
        data: averias
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener avería por ID
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      let averia = await AveriaModel.findById(id);

      if (!averia) {
        return res.status(404).json({
          success: false,
          message: 'Avería no encontrada'
        });
      }

      // Jefe_Bodega y Administrador pueden ver quién reportó la avería
      const canSeeResponsable = ['Administrador', 'Jefe_Bodega'].includes(req.user.rol);
      if (!canSeeResponsable) {
        const { reportado_por_nombre, reportado_por, ...rest } = averia;
        averia = rest;
      }

      res.json({
        success: true,
        data: averia
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar estado de avería (con ajuste de inventario automático)
  static async updateEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!estado) {
        return res.status(400).json({
          success: false,
          message: 'El estado es requerido'
        });
      }

      const estadosValidos = ['Pendiente', 'Repuesta', 'Descartada'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido',
          estadosValidos
        });
      }

      const averia = await AveriaModel.updateEstado(id, estado, req.user.usuario_id);

      if (!averia) {
        return res.status(404).json({
          success: false,
          message: 'Avería no encontrada'
        });
      }

      // Mensaje según el estado
      let mensaje = 'Estado actualizado exitosamente';
      if (estado === 'Repuesta') {
        mensaje = 'Avería marcada como repuesta. El inventario ha sido ajustado (+stock)';
      } else if (estado === 'Descartada') {
        mensaje = 'Avería descartada. El inventario ha sido ajustado (-stock)';
      }

      res.json({
        success: true,
        message: mensaje,
        data: averia
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar datos de avería
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { cantidad, tipo_averia, descripcion, ubicacion_id } = req.body;

      const averia = await AveriaModel.findById(id);
      if (!averia) {
        return res.status(404).json({
          success: false,
          message: 'Avería no encontrada'
        });
      }

      // Solo permitir editar si está en estado Pendiente
      if (averia.estado !== 'Pendiente') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden editar averías en estado Pendiente'
        });
      }

      const updatedAveria = await AveriaModel.update(id, {
        cantidad: cantidad || averia.cantidad,
        tipo_averia: tipo_averia || averia.tipo_averia,
        descripcion: descripcion !== undefined ? descripcion : averia.descripcion,
        ubicacion_id: ubicacion_id !== undefined ? ubicacion_id : averia.ubicacion_id
      });

      res.json({
        success: true,
        message: 'Avería actualizada exitosamente',
        data: updatedAveria
      });
    } catch (error) {
      next(error);
    }
  }

  // Agregar evidencia a avería existente
  static async addEvidencia(req, res, next) {
    try {
      const { id } = req.params;
      const { foto_url, descripcion } = req.body;

      if (!foto_url) {
        return res.status(400).json({
          success: false,
          message: 'La URL de la imagen es requerida'
        });
      }

      // Verificar que la avería existe
      const averia = await AveriaModel.findById(id);
      if (!averia) {
        return res.status(404).json({
          success: false,
          message: 'Avería no encontrada'
        });
      }

      // Solo permitir agregar evidencias si está en estado Pendiente
      if (averia.estado !== 'Pendiente') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden agregar evidencias a averías en estado Pendiente'
        });
      }

      const evidencia = await AveriaModel.addEvidencia(id, foto_url, descripcion);

      res.status(201).json({
        success: true,
        message: 'Evidencia agregada exitosamente',
        data: evidencia
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar evidencia
  static async deleteEvidencia(req, res, next) {
    try {
      const { id, evidenciaId } = req.params;

      // Verificar que la avería existe
      const averia = await AveriaModel.findById(id);
      if (!averia) {
        return res.status(404).json({
          success: false,
          message: 'Avería no encontrada'
        });
      }

      // Solo permitir eliminar evidencias si está en estado Pendiente
      if (averia.estado !== 'Pendiente') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden eliminar evidencias de averías en estado Pendiente'
        });
      }

      const evidencia = await AveriaModel.deleteEvidencia(evidenciaId);

      if (!evidencia) {
        return res.status(404).json({
          success: false,
          message: 'Evidencia no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Evidencia eliminada exitosamente',
        data: evidencia
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener evidencias de una avería
  static async getEvidencias(req, res, next) {
    try {
      const { id } = req.params;

      // Verificar que la avería existe
      const averia = await AveriaModel.findById(id);
      if (!averia) {
        return res.status(404).json({
          success: false,
          message: 'Avería no encontrada'
        });
      }

      const evidencias = await AveriaModel.getEvidencias(id);

      res.json({
        success: true,
        count: evidencias.length,
        data: evidencias
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar avería
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const averia = await AveriaModel.delete(id);

      if (!averia) {
        return res.status(404).json({
          success: false,
          message: 'Avería no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Avería eliminada exitosamente',
        data: averia
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AveriaController;

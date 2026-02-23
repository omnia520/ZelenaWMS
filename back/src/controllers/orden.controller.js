const OrdenModel = require('../models/orden.model');
const ProductoModel = require('../models/producto.model');
const { getOptimizedPickingList, calculatePickingStats } = require('../utils/picking-routes');

class OrdenController {
  // Crear orden
  static async create(req, res, next) {
    try {
      const { cliente_id, detalles, comentarios, estado } = req.body;

      if (!cliente_id || !detalles || detalles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cliente y detalles son requeridos'
        });
      }

      // Calcular totales
      let subtotal = 0;
      let descuento_total = 0;
      let impuestos_total = 0; // Sin IVA

      const detallesConSubtotal = detalles.map(det => {
        const subtotalItem = det.cantidad_pedida * det.precio_unitario;
        const descuentoItem = subtotalItem * (det.descuento_porcentaje || 0) / 100;
        const subtotalFinal = subtotalItem - descuentoItem;

        subtotal += subtotalFinal;
        descuento_total += descuentoItem;

        return {
          ...det,
          subtotal: subtotalFinal
        };
      });

      // Total sin IVA
      const total = subtotal;

      const orden = await OrdenModel.create(
        {
          cliente_id,
          subtotal,
          descuento_total,
          impuestos_total,
          total,
          comentarios,
          estado: estado || 'Pendiente_Aprobacion'
        },
        detallesConSubtotal,
        req.user.usuario_id
      );

      res.status(201).json({
        success: true,
        message: 'Orden creada exitosamente',
        data: orden
      });
    } catch (error) {
      // Manejar errores de stock insuficiente
      if (error.productosInsuficientes) {
        return res.status(error.statusCode || 400).json({
          success: false,
          message: error.message,
          productos_insuficientes: error.productosInsuficientes
        });
      }
      next(error);
    }
  }

  // Obtener todas las órdenes
  static async getAll(req, res, next) {
    try {
      const filters = {
        estado: req.query.estado,
        vendedor_id: req.query.vendedor_id,
        alistador_id: req.query.alistador_id,
        empacador_id: req.query.empacador_id,
        cliente_id: req.query.cliente_id
      };

      const ordenes = await OrdenModel.findAll(filters);

      res.json({
        success: true,
        count: ordenes.length,
        data: ordenes
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener órdenes pendientes de aprobación con información completa
  static async getPendientes(req, res, next) {
    try {
      const ordenes = await OrdenModel.findPendientes();

      res.json({
        success: true,
        count: ordenes.length,
        data: ordenes
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener orden por ID con detalles
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      console.log('🔍 Obteniendo orden:', id);

      const orden = await OrdenModel.findById(id);

      if (!orden) {
        console.log('❌ Orden no encontrada:', id);
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      console.log('✅ Orden encontrada:', orden.numero_orden);
      const detalles = await OrdenModel.getDetalles(id);
      console.log('✅ Detalles cargados:', detalles.length);
      const observaciones = await OrdenModel.getObservaciones(id);
      console.log('✅ Observaciones cargadas:', observaciones.length);

      res.json({
        success: true,
        data: {
          ...orden,
          detalles,
          observaciones
        }
      });
    } catch (error) {
      console.error('❌ Error en getById:', error);
      next(error);
    }
  }

  // Aprobar/Rechazar orden
  static async updateEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { estado, motivo } = req.body;

      if (!estado) {
        return res.status(400).json({
          success: false,
          message: 'El estado es requerido'
        });
      }

      const estadosValidos = [
        'Borrador',
        'Pendiente_Aprobacion',
        'Aprobada',
        'En_Alistamiento',
        'Listo_Para_Empacar',
        'En_Empaque',
        'Listo_Para_Despachar',
        'Lista_Facturar',
        'Facturada',
        'Finalizado',
        'Rechazada'
      ];

      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido',
          estadosValidos
        });
      }

      const orden = await OrdenModel.updateEstado(id, estado, req.user.usuario_id);

      if (!orden) {
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      // Si es rechazo, agregar observación con el motivo
      if (estado === 'Rechazada' && motivo) {
        await OrdenModel.addObservacion({
          orden_id: id,
          tipo_proceso: 'Revision',
          usuario_id: req.user.usuario_id,
          observacion: `Rechazado: ${motivo}`
        });
      }

      res.json({
        success: true,
        message: `Orden ${estado.toLowerCase()} exitosamente`,
        data: orden
      });
    } catch (error) {
      next(error);
    }
  }

  // Asignar personal
  static async asignarPersonal(req, res, next) {
    try {
      const { id } = req.params;
      const { alistador_id, empacador_id } = req.body;

      if (!alistador_id && !empacador_id) {
        return res.status(400).json({
          success: false,
          message: 'Debe asignar al menos un alistador o empacador'
        });
      }

      const orden = await OrdenModel.asignarPersonal(id, alistador_id, empacador_id);

      if (!orden) {
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Personal asignado exitosamente',
        data: orden
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar cantidades alistadas
  static async updateAlistamiento(req, res, next) {
    try {
      const { id } = req.params;
      const { detalles, observacion } = req.body;

      if (!detalles || detalles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Los detalles son requeridos'
        });
      }

      // Actualizar cada detalle
      for (const det of detalles) {
        await OrdenModel.updateCantidadAlistada(det.detalle_id, det.cantidad_alistada);
      }

      // Agregar observación si existe
      if (observacion) {
        await OrdenModel.addObservacion({
          orden_id: id,
          tipo_proceso: 'Alistamiento',
          usuario_id: req.user.usuario_id,
          observacion
        });
      }

      // Cambiar estado a "En_Empaque"
      await OrdenModel.updateEstado(id, 'En_Empaque');

      res.json({
        success: true,
        message: 'Alistamiento registrado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar cantidades empacadas
  static async updateEmpaque(req, res, next) {
    try {
      const { id } = req.params;
      const { detalles, observacion } = req.body;

      if (!detalles || detalles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Los detalles son requeridos'
        });
      }

      // Actualizar cada detalle
      for (const det of detalles) {
        await OrdenModel.updateCantidadEmpacada(det.detalle_id, det.cantidad_empacada);
      }

      // Agregar observación si existe
      if (observacion) {
        await OrdenModel.addObservacion({
          orden_id: id,
          tipo_proceso: 'Empaque',
          usuario_id: req.user.usuario_id,
          observacion
        });
      }

      // Cambiar estado a "Lista_Facturar"
      await OrdenModel.updateEstado(id, 'Lista_Facturar');

      res.json({
        success: true,
        message: 'Empaque registrado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Agregar observación
  static async addObservacion(req, res, next) {
    try {
      const { id } = req.params;
      const { tipo_proceso, observacion, detalle_id, foto_url } = req.body;

      if (!tipo_proceso || !observacion) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de proceso y observación son requeridos'
        });
      }

      const nuevaObservacion = await OrdenModel.addObservacion({
        orden_id: id,
        detalle_id,
        tipo_proceso,
        usuario_id: req.user.usuario_id,
        observacion,
        foto_url
      });

      res.status(201).json({
        success: true,
        message: 'Observación agregada exitosamente',
        data: nuevaObservacion
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener picking list optimizado
  static async getPickingList(req, res, next) {
    try {
      const { id } = req.params;

      const orden = await OrdenModel.findById(id);

      if (!orden) {
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      const pickingList = await getOptimizedPickingList(id);
      const stats = calculatePickingStats(pickingList);

      res.json({
        success: true,
        data: {
          orden_id: orden.orden_id,
          numero_orden: orden.numero_orden,
          cliente_nombre: orden.cliente_nombre,
          picking_list: pickingList,
          estadisticas: stats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Iniciar alistamiento
  static async iniciarAlistamiento(req, res, next) {
    try {
      const { id } = req.params;
      const operario_id = req.user.usuario_id; // Auto-asignar al operario que inicia
      console.log('🔍 Iniciando alistamiento para orden:', id, 'por operario:', operario_id);

      const orden = await OrdenModel.iniciarAlistamiento(id, operario_id);

      if (!orden) {
        console.log('❌ Orden no encontrada:', id);
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      console.log('✅ Alistamiento iniciado exitosamente:', orden.numero_orden);
      res.json({
        success: true,
        message: 'Alistamiento iniciado',
        data: orden
      });
    } catch (error) {
      console.error('❌ Error en iniciarAlistamiento:', error);
      next(error);
    }
  }

  // Guardar cantidad alistada y marcar como completado
  static async guardarCantidadAlistada(req, res, next) {
    try {
      const { detalle_id } = req.params;
      const { cantidad_alistada } = req.body;

      if (cantidad_alistada === undefined) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad alistada es requerida'
        });
      }

      const detalle = await OrdenModel.updateCantidadAlistada(detalle_id, cantidad_alistada);
      await OrdenModel.marcarDetalleAlistadoCompletado(detalle_id);

      res.json({
        success: true,
        message: 'Cantidad alistada guardada',
        data: detalle
      });
    } catch (error) {
      next(error);
    }
  }

  // Finalizar alistamiento
  static async finalizarAlistamiento(req, res, next) {
    try {
      const { id } = req.params;
      const { observacion_alistador } = req.body;

      const orden = await OrdenModel.finalizarAlistamiento(id, observacion_alistador || '');

      if (!orden) {
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Alistamiento finalizado',
        data: orden
      });
    } catch (error) {
      next(error);
    }
  }

  // Iniciar empaque
  static async iniciarEmpaque(req, res, next) {
    try {
      const { id } = req.params;
      const operario_id = req.user.usuario_id; // Auto-asignar al operario que inicia
      console.log('🔍 Iniciando empaque para orden:', id, 'por operario:', operario_id);

      const orden = await OrdenModel.iniciarEmpaque(id, operario_id);

      if (!orden) {
        console.log('❌ Orden no encontrada:', id);
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      console.log('✅ Empaque iniciado exitosamente:', orden.numero_orden);
      res.json({
        success: true,
        message: 'Empaque iniciado',
        data: orden
      });
    } catch (error) {
      console.error('❌ Error en iniciarEmpaque:', error);
      next(error);
    }
  }

  // Guardar cantidad empacada y marcar como completado
  static async guardarCantidadEmpacada(req, res, next) {
    try {
      const { detalle_id } = req.params;
      const { cantidad_empacada } = req.body;

      if (cantidad_empacada === undefined) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad empacada es requerida'
        });
      }

      const detalle = await OrdenModel.updateCantidadEmpacada(detalle_id, cantidad_empacada);
      await OrdenModel.marcarDetalleEmpaqueCompletado(detalle_id);

      res.json({
        success: true,
        message: 'Cantidad empacada guardada',
        data: detalle
      });
    } catch (error) {
      next(error);
    }
  }

  // Finalizar empaque
  static async finalizarEmpaque(req, res, next) {
    try {
      const { id } = req.params;
      const { observacion_empacador, numero_cajas } = req.body;

      const orden = await OrdenModel.finalizarEmpaque(
        id,
        observacion_empacador || '',
        numero_cajas || 0
      );

      if (!orden) {
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Empaque finalizado',
        data: orden
      });
    } catch (error) {
      next(error);
    }
  }

  // Finalizar revisión (cambiar estado de Listo_Para_Despachar a Finalizado)
  static async finalizarRevision(req, res, next) {
    try {
      const { id } = req.params;
      console.log('🔍 Finalizando revisión para orden:', id);

      const orden = await OrdenModel.finalizarRevision(id);

      if (!orden) {
        console.log('❌ Orden no encontrada o no está en estado Listo_Para_Despachar:', id);
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada o no está en estado Listo para Despachar'
        });
      }

      console.log('✅ Revisión finalizada exitosamente:', orden.numero_orden);
      res.json({
        success: true,
        message: 'Revisión finalizada. Orden marcada como Finalizado',
        data: orden
      });
    } catch (error) {
      console.error('❌ Error en finalizarRevision:', error);
      next(error);
    }
  }

  // Eliminar orden
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const orden = await OrdenModel.delete(id);

      if (!orden) {
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Orden eliminada exitosamente',
        data: orden
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrdenController;

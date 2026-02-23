const express = require('express');
const router = express.Router();
const OrdenController = require('../controllers/orden.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * @route   POST /api/ordenes
 * @desc    Crear nueva orden
 * @access  Vendedor, Jefe_Bodega, Administrador
 */
router.post('/',
  checkRole('Vendedor', 'Jefe_Bodega', 'Administrador'),
  OrdenController.create
);

/**
 * @route   GET /api/ordenes/pendientes
 * @desc    Obtener órdenes pendientes de aprobación con información completa
 * @access  Jefe_Bodega, Administrador
 */
router.get('/pendientes',
  checkRole('Jefe_Bodega', 'Administrador'),
  OrdenController.getPendientes
);

/**
 * @route   GET /api/ordenes
 * @desc    Obtener todas las órdenes (con filtros)
 * @access  Authenticated
 */
router.get('/', OrdenController.getAll);

/**
 * @route   GET /api/ordenes/:id
 * @desc    Obtener orden por ID con detalles
 * @access  Authenticated
 */
router.get('/:id', OrdenController.getById);

/**
 * @route   GET /api/ordenes/:id/picking-list
 * @desc    Obtener picking list optimizado por rutas
 * @access  Operario, Jefe_Bodega, Administrador
 */
router.get('/:id/picking-list',
  checkRole('Operario', 'Jefe_Bodega', 'Administrador'),
  OrdenController.getPickingList
);

/**
 * @route   PATCH /api/ordenes/:id/estado
 * @desc    Actualizar estado de la orden (aprobar/rechazar)
 * @access  Jefe_Bodega, Administrador
 */
router.patch('/:id/estado',
  checkRole('Jefe_Bodega', 'Administrador'),
  OrdenController.updateEstado
);

/**
 * @route   PATCH /api/ordenes/:id/asignar
 * @desc    Asignar alistador y empacador
 * @access  Jefe_Bodega, Administrador
 */
router.patch('/:id/asignar',
  checkRole('Jefe_Bodega', 'Administrador'),
  OrdenController.asignarPersonal
);

/**
 * @route   PATCH /api/ordenes/:id/alistamiento
 * @desc    Registrar cantidades alistadas
 * @access  Operario, Jefe_Bodega, Administrador
 */
router.patch('/:id/alistamiento',
  checkRole('Operario', 'Jefe_Bodega', 'Administrador'),
  OrdenController.updateAlistamiento
);

/**
 * @route   PATCH /api/ordenes/:id/empaque
 * @desc    Registrar cantidades empacadas
 * @access  Operario, Jefe_Bodega, Administrador
 */
router.patch('/:id/empaque',
  checkRole('Operario', 'Jefe_Bodega', 'Administrador'),
  OrdenController.updateEmpaque
);

/**
 * @route   POST /api/ordenes/:id/observaciones
 * @desc    Agregar observación a la orden
 * @access  Authenticated
 */
router.post('/:id/observaciones', OrdenController.addObservacion);

/**
 * @route   POST /api/ordenes/:id/iniciar-alistamiento
 * @desc    Iniciar alistamiento de una orden
 * @access  Operario, Jefe_Bodega, Administrador
 */
router.post('/:id/iniciar-alistamiento',
  checkRole('Operario', 'Jefe_Bodega', 'Administrador'),
  OrdenController.iniciarAlistamiento
);

/**
 * @route   PATCH /api/ordenes/detalles/:detalle_id/cantidad-alistada
 * @desc    Guardar cantidad alistada de un detalle
 * @access  Operario, Jefe_Bodega, Administrador
 */
router.patch('/detalles/:detalle_id/cantidad-alistada',
  checkRole('Operario', 'Jefe_Bodega', 'Administrador'),
  OrdenController.guardarCantidadAlistada
);

/**
 * @route   POST /api/ordenes/:id/finalizar-alistamiento
 * @desc    Finalizar alistamiento de una orden
 * @access  Operario, Jefe_Bodega, Administrador
 */
router.post('/:id/finalizar-alistamiento',
  checkRole('Operario', 'Jefe_Bodega', 'Administrador'),
  OrdenController.finalizarAlistamiento
);

/**
 * @route   POST /api/ordenes/:id/iniciar-empaque
 * @desc    Iniciar empaque de una orden
 * @access  Operario, Jefe_Bodega, Administrador
 */
router.post('/:id/iniciar-empaque',
  checkRole('Operario', 'Jefe_Bodega', 'Administrador'),
  OrdenController.iniciarEmpaque
);

/**
 * @route   PATCH /api/ordenes/detalles/:detalle_id/cantidad-empacada
 * @desc    Guardar cantidad empacada de un detalle
 * @access  Operario, Jefe_Bodega, Administrador
 */
router.patch('/detalles/:detalle_id/cantidad-empacada',
  checkRole('Operario', 'Jefe_Bodega', 'Administrador'),
  OrdenController.guardarCantidadEmpacada
);

/**
 * @route   POST /api/ordenes/:id/finalizar-empaque
 * @desc    Finalizar empaque de una orden
 * @access  Operario, Jefe_Bodega, Administrador
 */
router.post('/:id/finalizar-empaque',
  checkRole('Operario', 'Jefe_Bodega', 'Administrador'),
  OrdenController.finalizarEmpaque
);

/**
 * @route   POST /api/ordenes/:id/finalizar-revision
 * @desc    Finalizar revisión de una orden (cambiar de Listo_Para_Despachar a Finalizado)
 * @access  Facturacion, Jefe_Bodega, Administrador
 */
router.post('/:id/finalizar-revision',
  checkRole('Facturacion', 'Jefe_Bodega', 'Administrador'),
  OrdenController.finalizarRevision
);

/**
 * @route   DELETE /api/ordenes/:id
 * @desc    Eliminar orden
 * @access  Administrador
 */
router.delete('/:id',
  checkRole('Administrador'),
  OrdenController.delete
);

module.exports = router;

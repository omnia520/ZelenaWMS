const express = require('express');
const router = express.Router();
const AveriaController = require('../controllers/averia.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * @route   GET /api/averias/stats
 * @desc    Obtener estadísticas de averías (totales por estado)
 * @access  Authenticated
 */
router.get('/stats', AveriaController.getStats);

/**
 * @route   POST /api/averias
 * @desc    Reportar nueva avería (con soporte para múltiples evidencias)
 * @access  Authenticated
 */
router.post('/', AveriaController.create);

/**
 * @route   GET /api/averias
 * @desc    Obtener todas las averías (con filtros: estado, tipo_averia, producto_id, search)
 * @access  Authenticated
 */
router.get('/', AveriaController.getAll);

/**
 * @route   GET /api/averias/:id
 * @desc    Obtener avería por ID con sus evidencias
 * @access  Authenticated
 */
router.get('/:id', AveriaController.getById);

/**
 * @route   GET /api/averias/:id/evidencias
 * @desc    Obtener todas las evidencias de una avería
 * @access  Authenticated
 */
router.get('/:id/evidencias', AveriaController.getEvidencias);

/**
 * @route   POST /api/averias/:id/evidencias
 * @desc    Agregar nueva evidencia a una avería
 * @access  Authenticated
 */
router.post('/:id/evidencias', AveriaController.addEvidencia);

/**
 * @route   DELETE /api/averias/:id/evidencias/:evidenciaId
 * @desc    Eliminar evidencia de una avería
 * @access  Jefe_Bodega, Administrador
 */
router.delete('/:id/evidencias/:evidenciaId',
  checkRole('Jefe_Bodega', 'Administrador'),
  AveriaController.deleteEvidencia
);

/**
 * @route   PATCH /api/averias/:id/estado
 * @desc    Actualizar estado de avería (con ajuste automático de inventario)
 *          Estados: Pendiente, Repuesta, Descartada
 *          - Repuesta: +stock (producto vuelve al inventario)
 *          - Descartada: -stock (baja definitiva)
 * @access  Jefe_Bodega, Administrador
 */
router.patch('/:id/estado',
  checkRole('Jefe_Bodega', 'Administrador'),
  AveriaController.updateEstado
);

/**
 * @route   PUT /api/averias/:id
 * @desc    Actualizar datos de avería (solo si está en estado Pendiente)
 * @access  Jefe_Bodega, Administrador
 */
router.put('/:id',
  checkRole('Jefe_Bodega', 'Administrador'),
  AveriaController.update
);

/**
 * @route   DELETE /api/averias/:id
 * @desc    Eliminar avería (las evidencias se eliminan automáticamente)
 * @access  Administrador
 */
router.delete('/:id',
  checkRole('Administrador'),
  AveriaController.delete
);

module.exports = router;

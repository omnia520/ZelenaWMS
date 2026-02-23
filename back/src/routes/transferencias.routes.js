const express = require('express');
const router = express.Router();
const TransferenciaController = require('../controllers/transferencia.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * @route   POST /api/transferencias
 * @desc    Crear nueva transferencia entre bodegas
 * @access  Jefe_Bodega, Administrador
 */
router.post('/',
  checkRole('Jefe_Bodega', 'Administrador'),
  TransferenciaController.create
);

/**
 * @route   GET /api/transferencias
 * @desc    Obtener todas las transferencias
 * @access  Authenticated
 */
router.get('/', TransferenciaController.getAll);

/**
 * @route   GET /api/transferencias/:id
 * @desc    Obtener transferencia por ID con detalles
 * @access  Authenticated
 */
router.get('/:id', TransferenciaController.getById);

/**
 * @route   PATCH /api/transferencias/:id/cancel
 * @desc    Cancelar transferencia
 * @access  Jefe_Bodega, Administrador
 */
router.patch('/:id/cancel',
  checkRole('Jefe_Bodega', 'Administrador'),
  TransferenciaController.cancel
);

/**
 * @route   DELETE /api/transferencias/:id
 * @desc    Eliminar transferencia
 * @access  Administrador
 */
router.delete('/:id',
  checkRole('Administrador'),
  TransferenciaController.delete
);

module.exports = router;

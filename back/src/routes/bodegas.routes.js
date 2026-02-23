const express = require('express');
const router = express.Router();
const BodegaController = require('../controllers/bodega.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * @route   POST /api/bodegas
 * @desc    Crear nueva bodega
 * @access  Jefe_Bodega, Administrador
 */
router.post('/',
  checkRole('Jefe_Bodega', 'Administrador'),
  BodegaController.create
);

/**
 * @route   GET /api/bodegas
 * @desc    Obtener todas las bodegas
 * @access  Authenticated
 */
router.get('/', BodegaController.getAll);

/**
 * @route   GET /api/bodegas/:id
 * @desc    Obtener bodega por ID
 * @access  Authenticated
 */
router.get('/:id', BodegaController.getById);

/**
 * @route   GET /api/bodegas/:id/inventario
 * @desc    Obtener inventario de una bodega
 * @access  Authenticated
 */
router.get('/:id/inventario', BodegaController.getInventario);

/**
 * @route   PUT /api/bodegas/:id
 * @desc    Actualizar bodega
 * @access  Jefe_Bodega, Administrador
 */
router.put('/:id',
  checkRole('Jefe_Bodega', 'Administrador'),
  BodegaController.update
);

/**
 * @route   PATCH /api/bodegas/:id/toggle-active
 * @desc    Activar/Desactivar bodega
 * @access  Jefe_Bodega, Administrador
 */
router.patch('/:id/toggle-active',
  checkRole('Jefe_Bodega', 'Administrador'),
  BodegaController.toggleActive
);

/**
 * @route   DELETE /api/bodegas/:id
 * @desc    Eliminar bodega
 * @access  Administrador
 */
router.delete('/:id',
  checkRole('Administrador'),
  BodegaController.delete
);

module.exports = router;

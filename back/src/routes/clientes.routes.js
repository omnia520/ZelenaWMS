const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/cliente.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * @route   POST /api/clientes
 * @desc    Crear nuevo cliente
 * @access  Vendedor, Jefe_Bodega, Administrador
 */
router.post('/',
  checkRole('Vendedor', 'Jefe_Bodega', 'Administrador'),
  ClienteController.create
);

/**
 * @route   GET /api/clientes
 * @desc    Obtener todos los clientes
 * @access  Authenticated
 */
router.get('/', ClienteController.getAll);

/**
 * @route   GET /api/clientes/:id
 * @desc    Obtener cliente por ID
 * @access  Authenticated
 */
router.get('/:id', ClienteController.getById);

/**
 * @route   PUT /api/clientes/:id
 * @desc    Actualizar cliente
 * @access  Vendedor, Jefe_Bodega, Administrador
 */
router.put('/:id',
  checkRole('Vendedor', 'Jefe_Bodega', 'Administrador'),
  ClienteController.update
);

/**
 * @route   PATCH /api/clientes/:id/toggle-active
 * @desc    Activar/Desactivar cliente
 * @access  Jefe_Bodega, Administrador
 */
router.patch('/:id/toggle-active',
  checkRole('Jefe_Bodega', 'Administrador'),
  ClienteController.toggleActive
);

/**
 * @route   DELETE /api/clientes/:id
 * @desc    Eliminar cliente
 * @access  Administrador
 */
router.delete('/:id',
  checkRole('Administrador'),
  ClienteController.delete
);

module.exports = router;

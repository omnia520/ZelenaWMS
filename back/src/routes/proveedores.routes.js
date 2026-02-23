const express = require('express');
const router = express.Router();
const ProveedorController = require('../controllers/proveedor.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * @route   POST /api/proveedores
 * @desc    Crear nuevo proveedor
 * @access  Jefe_Bodega, Administrador
 */
router.post('/',
  checkRole('Jefe_Bodega', 'Administrador'),
  ProveedorController.create
);

/**
 * @route   GET /api/proveedores
 * @desc    Obtener todos los proveedores
 * @access  Authenticated
 */
router.get('/', ProveedorController.getAll);

/**
 * @route   GET /api/proveedores/:id
 * @desc    Obtener proveedor por ID con estadísticas
 * @access  Authenticated
 */
router.get('/:id', ProveedorController.getById);

/**
 * @route   PUT /api/proveedores/:id
 * @desc    Actualizar proveedor
 * @access  Jefe_Bodega, Administrador
 */
router.put('/:id',
  checkRole('Jefe_Bodega', 'Administrador'),
  ProveedorController.update
);

/**
 * @route   PATCH /api/proveedores/:id/toggle-active
 * @desc    Activar/Desactivar proveedor
 * @access  Jefe_Bodega, Administrador
 */
router.patch('/:id/toggle-active',
  checkRole('Jefe_Bodega', 'Administrador'),
  ProveedorController.toggleActive
);

/**
 * @route   DELETE /api/proveedores/:id
 * @desc    Eliminar proveedor
 * @access  Administrador
 */
router.delete('/:id',
  checkRole('Administrador'),
  ProveedorController.delete
);

module.exports = router;

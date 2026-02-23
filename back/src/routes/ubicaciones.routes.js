const express = require('express');
const router = express.Router();
const UbicacionController = require('../controllers/ubicacion.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * @route   POST /api/ubicaciones
 * @desc    Crear nueva ubicación
 * @access  Jefe_Bodega, Administrador
 */
router.post('/',
  checkRole('Jefe_Bodega', 'Administrador'),
  UbicacionController.create
);

/**
 * @route   GET /api/ubicaciones/sugerencias-productos
 * @desc    Obtener sugerencias de productos para autocomplete
 * @access  Authenticated
 */
router.get('/sugerencias-productos', UbicacionController.getSugerenciasProductos);

/**
 * @route   GET /api/ubicaciones/sugerencias-ubicaciones
 * @desc    Obtener sugerencias de ubicaciones para autocomplete
 * @access  Authenticated
 */
router.get('/sugerencias-ubicaciones', UbicacionController.getSugerenciasUbicaciones);

/**
 * @route   GET /api/ubicaciones/buscar-producto
 * @desc    Buscar ubicaciones de un producto por referencia
 * @access  Authenticated
 */
router.get('/buscar-producto', UbicacionController.buscarProducto);

/**
 * @route   GET /api/ubicaciones/buscar-ubicacion
 * @desc    Buscar productos en una ubicación por código
 * @access  Authenticated
 */
router.get('/buscar-ubicacion', UbicacionController.buscarUbicacion);

/**
 * @route   GET /api/ubicaciones
 * @desc    Obtener todas las ubicaciones
 * @access  Authenticated
 */
router.get('/', UbicacionController.getAll);

/**
 * @route   GET /api/ubicaciones/:id
 * @desc    Obtener ubicación por ID
 * @access  Authenticated
 */
router.get('/:id', UbicacionController.getById);

/**
 * @route   GET /api/ubicaciones/:id/inventario
 * @desc    Obtener inventario de una ubicación
 * @access  Authenticated
 */
router.get('/:id/inventario', UbicacionController.getInventario);

/**
 * @route   PUT /api/ubicaciones/:id
 * @desc    Actualizar ubicación
 * @access  Jefe_Bodega, Administrador
 */
router.put('/:id',
  checkRole('Jefe_Bodega', 'Administrador'),
  UbicacionController.update
);

/**
 * @route   POST /api/ubicaciones/:id/asignar-producto
 * @desc    Asignar producto a ubicación
 * @access  Jefe_Bodega, Administrador
 */
router.post('/:id/asignar-producto',
  checkRole('Jefe_Bodega', 'Administrador'),
  UbicacionController.asignarProducto
);

/**
 * @route   PATCH /api/ubicaciones/:id/cantidad
 * @desc    Actualizar cantidad de producto en ubicación
 * @access  Jefe_Bodega, Administrador
 */
router.patch('/:id/cantidad',
  checkRole('Jefe_Bodega', 'Administrador'),
  UbicacionController.updateCantidad
);

/**
 * @route   POST /api/ubicaciones/mover-producto
 * @desc    Mover producto de una ubicación a otra
 * @access  Jefe_Bodega, Administrador
 */
router.post('/mover-producto',
  checkRole('Jefe_Bodega', 'Administrador'),
  UbicacionController.moverProducto
);

/**
 * @route   DELETE /api/ubicaciones/:id/productos/:producto_id
 * @desc    Remover producto de ubicación
 * @access  Jefe_Bodega, Administrador
 */
router.delete('/:id/productos/:producto_id',
  checkRole('Jefe_Bodega', 'Administrador'),
  UbicacionController.removeProducto
);

/**
 * @route   DELETE /api/ubicaciones/:id
 * @desc    Eliminar ubicación
 * @access  Administrador
 */
router.delete('/:id',
  checkRole('Administrador'),
  UbicacionController.delete
);

module.exports = router;

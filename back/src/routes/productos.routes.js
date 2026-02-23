const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/producto.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * @route   POST /api/productos
 * @desc    Crear nuevo producto
 * @access  Jefe_Bodega, Administrador
 */
router.post('/',
  checkRole('Jefe_Bodega', 'Administrador'),
  ProductoController.create
);

/**
 * @route   GET /api/productos
 * @desc    Obtener todos los productos
 * @access  Authenticated
 */
router.get('/', ProductoController.getAll);

/**
 * @route   GET /api/productos/categorias
 * @desc    Obtener categorías de productos
 * @access  Authenticated
 */
router.get('/categorias', ProductoController.getCategories);

/**
 * @route   GET /api/productos/subcategorias
 * @desc    Obtener subcategorías (opcionalmente filtradas por categoria query param)
 * @access  Authenticated
 */
router.get('/subcategorias', ProductoController.getSubcategorias);

/**
 * @route   GET /api/productos/marcas
 * @desc    Obtener marcas de productos
 * @access  Authenticated
 */
router.get('/marcas', ProductoController.getMarcas);

/**
 * @route   POST /api/productos/verificar-disponibilidad
 * @desc    Verificar disponibilidad de múltiples productos
 * @access  Authenticated
 */
router.post('/verificar-disponibilidad', ProductoController.verificarDisponibilidad);

/**
 * @route   GET /api/productos/:id
 * @desc    Obtener producto por ID
 * @access  Authenticated
 */
router.get('/:id', ProductoController.getById);

/**
 * @route   GET /api/productos/:id/ubicaciones
 * @desc    Obtener producto con sus ubicaciones
 * @access  Authenticated
 */
router.get('/:id/ubicaciones', ProductoController.getWithUbicaciones);

/**
 * @route   GET /api/productos/:id/ordenes
 * @desc    Obtener historial de órdenes de un producto
 * @access  Authenticated
 */
router.get('/:id/ordenes', ProductoController.getOrdenesHistorial);

/**
 * @route   GET /api/productos/:id/disponibilidad
 * @desc    Obtener disponibilidad de un producto (considerando reservas)
 * @access  Authenticated
 */
router.get('/:id/disponibilidad', ProductoController.getDisponibilidad);

/**
 * @route   PUT /api/productos/:id
 * @desc    Actualizar producto
 * @access  Jefe_Bodega, Administrador
 */
router.put('/:id',
  checkRole('Jefe_Bodega', 'Administrador'),
  ProductoController.update
);

/**
 * @route   PATCH /api/productos/:id/stock
 * @desc    Actualizar stock del producto
 * @access  Jefe_Bodega, Administrador
 */
router.patch('/:id/stock',
  checkRole('Jefe_Bodega', 'Administrador'),
  ProductoController.updateStock
);

/**
 * @route   PATCH /api/productos/:id/imagen
 * @desc    Actualizar imagen del producto
 * @access  Jefe_Bodega, Administrador
 */
router.patch('/:id/imagen',
  checkRole('Jefe_Bodega', 'Administrador'),
  ProductoController.updateImagen
);

/**
 * @route   DELETE /api/productos/:id
 * @desc    Eliminar producto
 * @access  Jefe_Bodega, Administrador
 */
router.delete('/:id',
  checkRole('Jefe_Bodega', 'Administrador'),
  ProductoController.delete
);

module.exports = router;

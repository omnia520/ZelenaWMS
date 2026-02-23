const express = require('express');
const router = express.Router();
const InventarioController = require('../controllers/inventario.controller');
const { verifyToken } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * @route   GET /api/inventario
 * @desc    Obtener inventario con información de reservas
 * @access  Authenticated
 * @query   producto_id, ubicacion_id, bodega_id (opcionales)
 */
router.get('/', InventarioController.getInventarioConReservas);

module.exports = router;

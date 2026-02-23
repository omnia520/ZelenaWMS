const express = require('express');
const router = express.Router();
const RecepcionController = require('../controllers/recepcion.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * @route   POST /api/recepciones
 * @desc    Registrar nueva recepción de mercancía
 * @access  Jefe_Bodega, Administrador
 */
router.post('/',
  checkRole('Jefe_Bodega', 'Administrador'),
  RecepcionController.create
);

/**
 * @route   GET /api/recepciones
 * @desc    Obtener todas las recepciones
 * @access  Jefe_Bodega, Administrador
 */
router.get('/',
  checkRole('Jefe_Bodega', 'Administrador'),
  RecepcionController.getAll
);

/**
 * @route   GET /api/recepciones/:id
 * @desc    Obtener recepción por ID con detalles
 * @access  Jefe_Bodega, Administrador
 */
router.get('/:id',
  checkRole('Jefe_Bodega', 'Administrador'),
  RecepcionController.getById
);

/**
 * @route   DELETE /api/recepciones/:id
 * @desc    Eliminar recepción
 * @access  Administrador
 */
router.delete('/:id',
  checkRole('Administrador'),
  RecepcionController.delete
);

module.exports = router;

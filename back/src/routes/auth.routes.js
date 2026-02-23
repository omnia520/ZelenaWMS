const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public (en producción debería ser privado/admin)
 */
router.post('/register', AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', AuthController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get('/profile', verifyToken, AuthController.getProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Cambiar contraseña
 * @access  Private
 */
router.put('/change-password', verifyToken, AuthController.changePassword);

module.exports = router;

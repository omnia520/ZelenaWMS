const jwt = require('jsonwebtoken');

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    // El formato esperado es: "Bearer TOKEN"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar la información del usuario al request
    req.user = {
      usuario_id: decoded.usuario_id,
      email: decoded.email,
      rol: decoded.rol,
      nombre: decoded.nombre
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al verificar token',
      error: error.message
    });
  }
};

// Middleware para verificar roles específicos
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
        required_roles: allowedRoles,
        your_role: req.user.rol
      });
    }

    next();
  };
};

// Función para generar token
const generateToken = (user) => {
  const payload = {
    usuario_id: user.usuario_id,
    email: user.email,
    rol: user.rol,
    nombre: user.nombre
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Función para generar refresh token
const generateRefreshToken = (user) => {
  const payload = {
    usuario_id: user.usuario_id,
    email: user.email
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

module.exports = {
  verifyToken,
  checkRole,
  generateToken,
  generateRefreshToken
};

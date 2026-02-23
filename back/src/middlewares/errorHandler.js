// Middleware global de manejo de errores
const errorHandler = (err, req, res, next) => {
  console.error('Error capturado:', err);

  // Error de base de datos
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          success: false,
          message: 'El registro ya existe',
          detail: err.detail
        });

      case '23503': // Foreign key violation
        return res.status(400).json({
          success: false,
          message: 'Referencia inválida a otro registro',
          detail: err.detail
        });

      case '23502': // Not null violation
        return res.status(400).json({
          success: false,
          message: 'Campo requerido faltante',
          detail: err.detail
        });

      case '22P02': // Invalid text representation
        return res.status(400).json({
          success: false,
          message: 'Formato de dato inválido',
          detail: err.detail
        });
    }
  }

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors
    });
  }

  // Error por defecto
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware para rutas no encontradas
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`
  });
};

module.exports = {
  errorHandler,
  notFound
};

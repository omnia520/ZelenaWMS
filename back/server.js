require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    console.log('🔍 Verificando conexión a la base de datos...');
    const connected = await testConnection();

    if (!connected) {
      console.error('✗ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('');
      console.log('====================================');
      console.log('  🚀 Servidor WMS iniciado');
      console.log('====================================');
      console.log(`  Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Puerto: ${PORT}`);
      console.log(`  URL: http://localhost:${PORT}`);
      console.log(`  Health: http://localhost:${PORT}/health`);
      console.log(`  API: http://localhost:${PORT}/api`);
      console.log('====================================');
      console.log('');
    });
  } catch (error) {
    console.error('✗ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido. Cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();

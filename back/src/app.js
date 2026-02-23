const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const clientesRoutes = require('./routes/clientes.routes');
const productosRoutes = require('./routes/productos.routes');
const ordenesRoutes = require('./routes/ordenes.routes');
const ubicacionesRoutes = require('./routes/ubicaciones.routes');
const recepcionesRoutes = require('./routes/recepciones.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const averiasRoutes = require('./routes/averias.routes');
const bodegasRoutes = require('./routes/bodegas.routes');
const transferenciasRoutes = require('./routes/transferencias.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const desempenoRoutes = require('./routes/desempeno.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

// Middlewares globales
const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map(o => o.trim());
app.use(cors({
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'WMS API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Endpoint de configuración pública del sistema
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    data: {
      inventoryEnabled: process.env.ENABLE_INVENTORY_RESERVATION === 'true'
    }
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/ubicaciones', ubicacionesRoutes);
app.use('/api/recepciones', recepcionesRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/averias', averiasRoutes);
app.use('/api/bodegas', bodegasRoutes);
app.use('/api/transferencias', transferenciasRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/desempeno', desempenoRoutes);
app.use('/api/upload', uploadRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a la API del Sistema WMS',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      clientes: '/api/clientes',
      productos: '/api/productos',
      ordenes: '/api/ordenes',
      ubicaciones: '/api/ubicaciones',
      recepciones: '/api/recepciones',
      proveedores: '/api/proveedores',
      averias: '/api/averias',
      bodegas: '/api/bodegas',
      transferencias: '/api/transferencias',
      inventario: '/api/inventario',
      desempeno: '/api/desempeno',
      upload: '/api/upload'
    }
  });
});

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

module.exports = app;

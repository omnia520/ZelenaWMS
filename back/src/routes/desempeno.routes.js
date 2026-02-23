const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middlewares/auth');
const desempenoController = require('../controllers/desempeno.controller');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// ==========================================
// RUTAS PARA TODOS LOS USUARIOS AUTENTICADOS
// ==========================================

// Obtener mi desempeño (KPIs del usuario logueado)
// GET /api/desempeno/mi-desempeno?fecha_inicio=&fecha_fin=&tipo_actividad=
router.get('/mi-desempeno', desempenoController.getMiDesempeno);

// Obtener mi historial de actividades
// GET /api/desempeno/mi-historial?fecha_inicio=&fecha_fin=&tipo_actividad=&page=&limit=
router.get('/mi-historial', desempenoController.getMiHistorial);

// ==========================================
// RUTAS SOLO PARA MANAGERS (Jefe_Bodega, Administrador)
// ==========================================

// Obtener KPIs globales consolidados
// GET /api/desempeno/global?fecha_inicio=&fecha_fin=&tipo_actividad=
router.get(
  '/global',
  checkRole('Jefe_Bodega', 'Administrador'),
  desempenoController.getGlobal
);

// Obtener desempeño por usuario (tabla comparativa)
// GET /api/desempeno/por-usuario?fecha_inicio=&fecha_fin=&tipo_actividad=
router.get(
  '/por-usuario',
  checkRole('Jefe_Bodega', 'Administrador'),
  desempenoController.getPorUsuario
);

// Obtener lista de operarios
// GET /api/desempeno/operarios
router.get(
  '/operarios',
  checkRole('Jefe_Bodega', 'Administrador'),
  desempenoController.getOperarios
);

// Obtener rankings
// GET /api/desempeno/rankings?fecha_inicio=&fecha_fin=&tipo_actividad=&metrica=&limite=
router.get(
  '/rankings',
  checkRole('Jefe_Bodega', 'Administrador'),
  desempenoController.getRankings
);

// Obtener KPIs de un usuario específico (drill-down)
// GET /api/desempeno/usuario/:id?fecha_inicio=&fecha_fin=&tipo_actividad=
router.get(
  '/usuario/:id',
  checkRole('Jefe_Bodega', 'Administrador'),
  desempenoController.getUsuarioDesempeno
);

// Obtener historial de un usuario específico
// GET /api/desempeno/usuario/:id/historial?fecha_inicio=&fecha_fin=&tipo_actividad=&page=&limit=
router.get(
  '/usuario/:id/historial',
  checkRole('Jefe_Bodega', 'Administrador'),
  desempenoController.getUsuarioHistorial
);

module.exports = router;

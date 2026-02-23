const DesempenoModel = require('../models/desempeno.model');

// Obtener mi desempeño (usuario logueado)
const getMiDesempeno = async (req, res) => {
  try {
    const usuario_id = req.user.usuario_id;
    const { fecha_inicio, fecha_fin, tipo_actividad } = req.query;

    const filtros = {
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
      tipo_actividad: tipo_actividad || null
    };

    const kpis = await DesempenoModel.getKPIsByUsuario(usuario_id, filtros);

    res.json({
      success: true,
      data: {
        usuario: {
          usuario_id: req.user.usuario_id,
          nombre: req.user.nombre
        },
        periodo: {
          fecha_inicio: filtros.fecha_inicio,
          fecha_fin: filtros.fecha_fin,
          tipo_actividad: filtros.tipo_actividad
        },
        kpis
      }
    });
  } catch (error) {
    console.error('Error en getMiDesempeno:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener desempeño',
      error: error.message
    });
  }
};

// Obtener mi historial de actividades
const getMiHistorial = async (req, res) => {
  try {
    const usuario_id = req.user.usuario_id;
    const { fecha_inicio, fecha_fin, tipo_actividad, page, limit } = req.query;

    const filtros = {
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
      tipo_actividad: tipo_actividad || null
    };

    const paginacion = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };

    const resultado = await DesempenoModel.getHistorialByUsuario(usuario_id, filtros, paginacion);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('Error en getMiHistorial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: error.message
    });
  }
};

// Obtener KPIs globales (solo managers)
const getGlobal = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, tipo_actividad } = req.query;

    const filtros = {
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
      tipo_actividad: tipo_actividad || null
    };

    const kpis = await DesempenoModel.getKPIsGlobales(filtros);

    res.json({
      success: true,
      data: {
        periodo: {
          fecha_inicio: filtros.fecha_inicio,
          fecha_fin: filtros.fecha_fin,
          tipo_actividad: filtros.tipo_actividad
        },
        kpis
      }
    });
  } catch (error) {
    console.error('Error en getGlobal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener KPIs globales',
      error: error.message
    });
  }
};

// Obtener desempeño por usuario (tabla comparativa)
const getPorUsuario = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, tipo_actividad } = req.query;

    const filtros = {
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
      tipo_actividad: tipo_actividad || null
    };

    const usuarios = await DesempenoModel.getDesempenoPorUsuario(filtros);

    res.json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    console.error('Error en getPorUsuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener desempeño por usuario',
      error: error.message
    });
  }
};

// Obtener KPIs de un usuario específico (drill-down)
const getUsuarioDesempeno = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin, tipo_actividad } = req.query;

    const filtros = {
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
      tipo_actividad: tipo_actividad || null
    };

    const kpis = await DesempenoModel.getKPIsByUsuario(parseInt(id), filtros);

    res.json({
      success: true,
      data: {
        usuario_id: parseInt(id),
        periodo: {
          fecha_inicio: filtros.fecha_inicio,
          fecha_fin: filtros.fecha_fin,
          tipo_actividad: filtros.tipo_actividad
        },
        kpis
      }
    });
  } catch (error) {
    console.error('Error en getUsuarioDesempeno:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener desempeño del usuario',
      error: error.message
    });
  }
};

// Obtener historial de un usuario específico
const getUsuarioHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin, tipo_actividad, page, limit } = req.query;

    const filtros = {
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
      tipo_actividad: tipo_actividad || null
    };

    const paginacion = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };

    const resultado = await DesempenoModel.getHistorialByUsuario(parseInt(id), filtros, paginacion);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('Error en getUsuarioHistorial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial del usuario',
      error: error.message
    });
  }
};

// Obtener rankings
const getRankings = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, tipo_actividad, metrica, limite } = req.query;

    const filtros = {
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
      tipo_actividad: tipo_actividad || 'Picking'
    };

    const rankings = await DesempenoModel.getRankings(
      filtros,
      metrica || 'unidades',
      parseInt(limite) || 5
    );

    res.json({
      success: true,
      data: {
        metrica: metrica || 'unidades',
        tipo_actividad: filtros.tipo_actividad,
        rankings
      }
    });
  } catch (error) {
    console.error('Error en getRankings:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener rankings',
      error: error.message
    });
  }
};

// Obtener lista de operarios
const getOperarios = async (req, res) => {
  try {
    const operarios = await DesempenoModel.getOperarios();

    res.json({
      success: true,
      data: operarios
    });
  } catch (error) {
    console.error('Error en getOperarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener operarios',
      error: error.message
    });
  }
};

module.exports = {
  getMiDesempeno,
  getMiHistorial,
  getGlobal,
  getPorUsuario,
  getUsuarioDesempeno,
  getUsuarioHistorial,
  getRankings,
  getOperarios
};

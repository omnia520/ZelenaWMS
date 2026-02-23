import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://hogarcenter-api.azurewebsites.net/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo redirigir si hay un token guardado (sesión expirada)
      // No redirigir si es un error de login (no hay token)
      const token = localStorage.getItem('token');
      const isLoginRequest = error.config?.url?.includes('/auth/login');

      if (token && !isLoginRequest) {
        // Token expirado o inválido - limpiar sesión y redirigir
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================
export const configAPI = {
  getConfig: () => api.get('/config'),
};

// ============================================
// AUTH
// ============================================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
};

// ============================================
// CLIENTES
// ============================================
export const clientesAPI = {
  getAll: (params) => api.get('/clientes', { params }),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  toggleActive: (id, activo) => api.patch(`/clientes/${id}/toggle-active`, { activo }),
  delete: (id) => api.delete(`/clientes/${id}`),
};

// ============================================
// PRODUCTOS
// ============================================
export const productosAPI = {
  getAll: (params) => api.get('/productos', { params }),
  getById: (id) => api.get(`/productos/${id}`),
  getWithUbicaciones: (id) => api.get(`/productos/${id}/ubicaciones`),
  getOrdenesHistorial: (id) => api.get(`/productos/${id}/ordenes`),
  getDisponibilidad: (id) => api.get(`/productos/${id}/disponibilidad`),
  verificarDisponibilidadMultiple: (productos) => api.post('/productos/verificar-disponibilidad', { productos }),
  getCategories: () => api.get('/productos/categorias'),
  getSubcategorias: (categoria) => api.get('/productos/subcategorias', {
    params: categoria ? { categoria } : {}
  }),
  getMarcas: () => api.get('/productos/marcas'),
  create: (data) => api.post('/productos', data),
  update: (id, data) => api.put(`/productos/${id}`, data),
  updateStock: (id, cantidad) => api.patch(`/productos/${id}/stock`, { cantidad }),
  updateImagen: (id, imagen_url) => api.patch(`/productos/${id}/imagen`, { imagen_url }),
  delete: (id) => api.delete(`/productos/${id}`),
};

// ============================================
// ÓRDENES
// ============================================
export const ordenesAPI = {
  getAll: (params) => api.get('/ordenes', { params }),
  getPendientes: () => api.get('/ordenes/pendientes'),
  getById: (id) => api.get(`/ordenes/${id}`),
  getPickingList: (id) => api.get(`/ordenes/${id}/picking-list`),
  create: (data) => api.post('/ordenes', data),
  updateEstado: (id, estado, motivo) => api.patch(`/ordenes/${id}/estado`, { estado, motivo }),
  asignarPersonal: (id, data) => api.patch(`/ordenes/${id}/asignar`, data),
  updateAlistamiento: (id, data) => api.patch(`/ordenes/${id}/alistamiento`, data),
  updateEmpaque: (id, data) => api.patch(`/ordenes/${id}/empaque`, data),
  addObservacion: (id, data) => api.post(`/ordenes/${id}/observaciones`, data),
  finalizarRevision: (id) => api.post(`/ordenes/${id}/finalizar-revision`),
  delete: (id) => api.delete(`/ordenes/${id}`),
};

// ============================================
// UBICACIONES
// ============================================
export const ubicacionesAPI = {
  getAll: (params) => api.get('/ubicaciones', { params }),
  getById: (id) => api.get(`/ubicaciones/${id}`),
  getInventario: (id) => api.get(`/ubicaciones/${id}/inventario`),
  buscarProducto: (referencia) => api.get('/ubicaciones/buscar-producto', { params: { referencia } }),
  buscarUbicacion: (codigo) => api.get('/ubicaciones/buscar-ubicacion', { params: { codigo } }),
  getSugerenciasProductos: (termino) => api.get('/ubicaciones/sugerencias-productos', { params: { termino } }),
  getSugerenciasUbicaciones: (termino) => api.get('/ubicaciones/sugerencias-ubicaciones', { params: { termino } }),
  create: (data) => api.post('/ubicaciones', data),
  update: (id, data) => api.put(`/ubicaciones/${id}`, data),
  asignarProducto: (id, data) => api.post(`/ubicaciones/${id}/asignar-producto`, data),
  updateCantidad: (id, data) => api.patch(`/ubicaciones/${id}/cantidad`, data),
  moverProducto: (data) => api.post('/ubicaciones/mover-producto', data),
  removeProducto: (id, producto_id) => api.delete(`/ubicaciones/${id}/productos/${producto_id}`),
  delete: (id) => api.delete(`/ubicaciones/${id}`),
};

// ============================================
// PROVEEDORES
// ============================================
export const proveedoresAPI = {
  getAll: (params) => api.get('/proveedores', { params }),
  getById: (id) => api.get(`/proveedores/${id}`),
  create: (data) => api.post('/proveedores', data),
  update: (id, data) => api.put(`/proveedores/${id}`, data),
  toggleActive: (id, activo) => api.patch(`/proveedores/${id}/toggle-active`, { activo }),
  delete: (id) => api.delete(`/proveedores/${id}`),
};

// ============================================
// RECEPCIONES
// ============================================
export const recepcionesAPI = {
  getAll: (params) => api.get('/recepciones', { params }),
  getById: (id) => api.get(`/recepciones/${id}`),
  create: (data) => api.post('/recepciones', data),
  delete: (id) => api.delete(`/recepciones/${id}`),
};

// ============================================
// AVERÍAS
// ============================================
export const averiasAPI = {
  getAll: (params) => api.get('/averias', { params }),
  getById: (id) => api.get(`/averias/${id}`),
  getStats: () => api.get('/averias/stats'),
  create: (data) => api.post('/averias', data),
  updateEstado: (id, estado) => api.patch(`/averias/${id}/estado`, { estado }),
  update: (id, data) => api.put(`/averias/${id}`, data),
  delete: (id) => api.delete(`/averias/${id}`),
  // Evidencias
  getEvidencias: (id) => api.get(`/averias/${id}/evidencias`),
  addEvidencia: (id, data) => api.post(`/averias/${id}/evidencias`, data),
  deleteEvidencia: (id, evidenciaId) => api.delete(`/averias/${id}/evidencias/${evidenciaId}`),
};

// ============================================
// UPLOAD DE ARCHIVOS
// ============================================
export const uploadAPI = {
  // Subir múltiples imágenes
  uploadImages: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  // Subir una sola imagen
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  // Eliminar imagen
  deleteImage: (filename) => api.delete(`/upload/${filename}`),
};

// ============================================
// BODEGAS
// ============================================
export const bodegasAPI = {
  getAll: (params) => api.get('/bodegas', { params }),
  getById: (id) => api.get(`/bodegas/${id}`),
  getInventario: (id, params) => api.get(`/bodegas/${id}/inventario`, { params }),
  create: (data) => api.post('/bodegas', data),
  update: (id, data) => api.put(`/bodegas/${id}`, data),
  toggleActive: (id, activa) => api.patch(`/bodegas/${id}/toggle-active`, { activa }),
  delete: (id) => api.delete(`/bodegas/${id}`),
};

// ============================================
// TRANSFERENCIAS
// ============================================
export const transferenciasAPI = {
  getAll: (params) => api.get('/transferencias', { params }),
  getById: (id) => api.get(`/transferencias/${id}`),
  create: (data) => api.post('/transferencias', data),
  cancel: (id) => api.patch(`/transferencias/${id}/cancel`),
  delete: (id) => api.delete(`/transferencias/${id}`),
};

// ============================================
// INVENTARIO
// ============================================
export const inventarioAPI = {
  getInventarioConReservas: (params) => api.get('/inventario', { params }),
};

// ============================================
// DESEMPEÑO OPERATIVO
// ============================================
export const desempenoAPI = {
  // Rutas para todos los usuarios autenticados
  getMiDesempeno: (params) => api.get('/desempeno/mi-desempeno', { params }),
  getMiHistorial: (params) => api.get('/desempeno/mi-historial', { params }),

  // Rutas solo para managers (Jefe_Bodega, Administrador)
  getGlobal: (params) => api.get('/desempeno/global', { params }),
  getPorUsuario: (params) => api.get('/desempeno/por-usuario', { params }),
  getUsuarioDesempeno: (id, params) => api.get(`/desempeno/usuario/${id}`, { params }),
  getUsuarioHistorial: (id, params) => api.get(`/desempeno/usuario/${id}/historial`, { params }),
  getRankings: (params) => api.get('/desempeno/rankings', { params }),
  getOperarios: () => api.get('/desempeno/operarios'),
};

export default api;

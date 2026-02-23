import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Truck, FileText, Plus, Trash2, MapPin, Hash, Calendar, Search, X } from 'lucide-react';
import { recepcionesAPI, proveedoresAPI, productosAPI, ubicacionesAPI } from '../../services/api';

export default function RecepcionForm({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [searchProveedor, setSearchProveedor] = useState('');
  const [showProveedorSearch, setShowProveedorSearch] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    numero_documento: '',
    proveedor_id: '',
    fecha_recepcion: new Date().toISOString().split('T')[0],
    observaciones: '',
  });
  const [detalles, setDetalles] = useState([
    {
      codigo_producto: '',
      nombre_producto: '',
      cantidad_recibida: '',
      ubicacion_id: '',
      es_nuevo: false, // Flag para indicar si el producto es nuevo
      precio_base: '', // Solo para productos nuevos
      categoria: '', // Solo para productos nuevos
    }
  ]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [proveedoresRes, productosRes, ubicacionesRes] = await Promise.all([
        proveedoresAPI.getAll({ activo: true }),
        productosAPI.getAll({ activo: true }),
        ubicacionesAPI.getAll({ activo: true }),
      ]);

      setProveedores(proveedoresRes.data.data || []);
      setProductos(productosRes.data.data || []);
      setUbicaciones(ubicacionesRes.data.data || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
      alert('Error al cargar datos iniciales');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectProveedor = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setFormData(prev => ({ ...prev, proveedor_id: proveedor.proveedor_id }));
    setSearchProveedor('');
    setShowProveedorSearch(false);
  };

  const handleRemoveProveedor = () => {
    setProveedorSeleccionado(null);
    setFormData(prev => ({ ...prev, proveedor_id: '' }));
  };

  const handleDetalleChange = (index, field, value) => {
    const newDetalles = [...detalles];
    newDetalles[index][field] = value;

    // Si cambia el código del producto, verificar si existe
    if (field === 'codigo_producto') {
      const productoExistente = productos.find(p => p.codigo.toLowerCase() === value.toLowerCase());
      if (productoExistente) {
        newDetalles[index].nombre_producto = productoExistente.nombre;
        newDetalles[index].es_nuevo = false;
        newDetalles[index].precio_base = '';
        newDetalles[index].categoria = '';
      } else {
        newDetalles[index].es_nuevo = true;
        newDetalles[index].nombre_producto = '';
      }
    }

    setDetalles(newDetalles);
  };

  const addDetalle = () => {
    setDetalles([
      ...detalles,
      {
        codigo_producto: '',
        nombre_producto: '',
        cantidad_recibida: '',
        ubicacion_id: '',
        es_nuevo: false,
        precio_base: '',
        categoria: '',
      }
    ]);
  };

  const removeDetalle = (index) => {
    if (detalles.length > 1) {
      setDetalles(detalles.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.numero_documento.trim()) {
      alert('El número de documento es requerido');
      return;
    }

    if (!formData.proveedor_id) {
      alert('Debes seleccionar un proveedor');
      return;
    }

    if (detalles.length === 0) {
      alert('Debes agregar al menos un producto');
      return;
    }

    // Validar cada detalle
    for (let i = 0; i < detalles.length; i++) {
      const detalle = detalles[i];

      if (!detalle.codigo_producto.trim()) {
        alert(`El código del producto en la línea ${i + 1} es requerido`);
        return;
      }

      if (detalle.es_nuevo && !detalle.nombre_producto.trim()) {
        alert(`El nombre del producto en la línea ${i + 1} es requerido para productos nuevos`);
        return;
      }

      if (detalle.es_nuevo && !detalle.precio_base) {
        alert(`El precio base del producto en la línea ${i + 1} es requerido para productos nuevos`);
        return;
      }

      if (!detalle.cantidad_recibida || detalle.cantidad_recibida <= 0) {
        alert(`La cantidad recibida en la línea ${i + 1} debe ser mayor a 0`);
        return;
      }

      if (!detalle.ubicacion_id) {
        alert(`Debes seleccionar una ubicación para la línea ${i + 1}`);
        return;
      }
    }

    try {
      setLoading(true);

      // Preparar los detalles para enviar al backend
      const detallesParaEnviar = detalles.map(detalle => ({
        codigo_producto: detalle.codigo_producto,
        nombre_producto: detalle.nombre_producto || null,
        precio_base: detalle.precio_base ? parseFloat(detalle.precio_base) : null,
        categoria: detalle.categoria || null,
        cantidad_recibida: parseInt(detalle.cantidad_recibida),
        ubicacion_id: parseInt(detalle.ubicacion_id),
        es_nuevo: detalle.es_nuevo
      }));

      const recepcionData = {
        numero_documento: formData.numero_documento,
        proveedor_id: parseInt(formData.proveedor_id),
        fecha_recepcion: formData.fecha_recepcion,
        observaciones: formData.observaciones || null,
        detalles: detallesParaEnviar
      };

      console.log('📦 Datos a enviar:', JSON.stringify(recepcionData, null, 2));

      await recepcionesAPI.create(recepcionData);
      alert('Recepción registrada exitosamente');
      onSuccess();
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Respuesta del servidor:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error al crear recepción';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredProveedores = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(searchProveedor.toLowerCase()) ||
    (p.nit && p.nit.toLowerCase().includes(searchProveedor.toLowerCase()))
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onClose}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </button>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Package className="h-8 w-8 mr-3 text-primary-600" />
          Nueva Recepción de Mercancía
        </h2>
        <p className="text-gray-600 mt-1">
          Completa el formulario para registrar una nueva recepción
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información General */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Número de Documento */}
            <div>
              <label htmlFor="numero_documento" className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-primary-500" />
                  Número de Documento <span className="text-red-500 ml-1">*</span>
                </div>
              </label>
              <input
                type="text"
                id="numero_documento"
                name="numero_documento"
                required
                value={formData.numero_documento}
                onChange={handleChange}
                placeholder="Ej: REC-001"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
              />
            </div>

            {/* Proveedor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-primary-500" />
                  Proveedor <span className="text-red-500 ml-1">*</span>
                </div>
              </label>

              {/* Proveedor seleccionado */}
              {proveedorSeleccionado ? (
                <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{proveedorSeleccionado.nombre}</h4>
                      <div className="mt-1 space-y-1 text-sm text-gray-700">
                        {proveedorSeleccionado.nit && (
                          <p><span className="font-medium">NIT:</span> {proveedorSeleccionado.nit}</p>
                        )}
                        {proveedorSeleccionado.telefono && (
                          <p><span className="font-medium">Teléfono:</span> {proveedorSeleccionado.telefono}</p>
                        )}
                        {proveedorSeleccionado.email && (
                          <p><span className="font-medium">Email:</span> {proveedorSeleccionado.email}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveProveedor}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Cambiar proveedor"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Botón para mostrar buscador */}
                  <button
                    type="button"
                    onClick={() => setShowProveedorSearch(!showProveedorSearch)}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-gray-600 hover:text-primary-600 font-medium"
                  >
                    <Search className="h-5 w-5 inline-block mr-2" />
                    Seleccionar Proveedor
                  </button>

                  {/* Buscador de proveedores */}
                  {showProveedorSearch && (
                    <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          placeholder="Buscar por nombre o NIT/Documento..."
                          value={searchProveedor}
                          onChange={(e) => setSearchProveedor(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 outline-none"
                          autoFocus
                        />
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {filteredProveedores.length === 0 ? (
                          <p className="text-center text-gray-500 py-4">No se encontraron proveedores</p>
                        ) : (
                          filteredProveedores.map(proveedor => (
                            <button
                              key={proveedor.proveedor_id}
                              type="button"
                              onClick={() => handleSelectProveedor(proveedor)}
                              className="w-full p-3 bg-white hover:bg-blue-50 border border-gray-200 rounded-lg text-left transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{proveedor.nombre}</p>
                                  {proveedor.nit && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      <span className="font-medium">NIT:</span> {proveedor.nit}
                                    </p>
                                  )}
                                  {proveedor.telefono && (
                                    <p className="text-sm text-gray-600">
                                      Tel: {proveedor.telefono}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Fecha de Recepción */}
            <div>
              <label htmlFor="fecha_recepcion" className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                  Fecha de Recepción
                </div>
              </label>
              <input
                type="date"
                id="fecha_recepcion"
                name="fecha_recepcion"
                value={formData.fecha_recepcion}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
              />
            </div>

            {/* Observaciones */}
            <div className="md:col-span-2">
              <label htmlFor="observaciones" className="block text-sm font-semibold text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                id="observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows="3"
                placeholder="Observaciones adicionales..."
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Detalles de Productos */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Productos Recibidos</h3>
            <button
              type="button"
              onClick={addDetalle}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Agregar Producto
            </button>
          </div>

          <div className="space-y-4">
            {detalles.map((detalle, index) => (
              <div key={index} className="p-4 border-2 border-gray-200 rounded-lg relative">
                {detalles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDetalle(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Código del Producto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 mr-2 text-primary-500" />
                        Código/Referencia <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      value={detalle.codigo_producto}
                      onChange={(e) => handleDetalleChange(index, 'codigo_producto', e.target.value)}
                      placeholder="Código del producto"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
                      required
                    />
                    {detalle.es_nuevo && (
                      <p className="mt-1 text-xs text-amber-600 font-medium">
                        ⚠ Producto nuevo - se creará automáticamente
                      </p>
                    )}
                  </div>

                  {/* Nombre del Producto (solo para productos nuevos) */}
                  {detalle.es_nuevo && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Producto <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={detalle.nombre_producto}
                          onChange={(e) => handleDetalleChange(index, 'nombre_producto', e.target.value)}
                          placeholder="Nombre del producto"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Precio Base <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={detalle.precio_base}
                          onChange={(e) => handleDetalleChange(index, 'precio_base', e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Categoría
                        </label>
                        <input
                          type="text"
                          value={detalle.categoria}
                          onChange={(e) => handleDetalleChange(index, 'categoria', e.target.value)}
                          placeholder="Categoría del producto"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
                        />
                      </div>
                    </>
                  )}

                  {/* Cantidad Recibida */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad Recibida <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={detalle.cantidad_recibida}
                      onChange={(e) => handleDetalleChange(index, 'cantidad_recibida', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
                      required
                    />
                  </div>

                  {/* Ubicación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                        Ubicación <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <select
                      value={detalle.ubicacion_id}
                      onChange={(e) => handleDetalleChange(index, 'ubicacion_id', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
                      required
                    >
                      <option value="">Seleccionar ubicación...</option>
                      {ubicaciones.map((ubicacion) => (
                        <option key={ubicacion.ubicacion_id} value={ubicacion.ubicacion_id}>
                          {ubicacion.codigo} - {ubicacion.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Package className="h-5 w-5 mr-2" />
                Crear Recepción
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

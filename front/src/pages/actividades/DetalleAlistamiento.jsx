import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Check, Loader2, Search, ChevronUp, ChevronDown, AlertCircle, X } from 'lucide-react';
import api from '../../services/api';
import { formatDateOnly } from '../../utils/dateUtils';

export default function DetalleAlistamiento() {
  const { ordenId } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [observacion, setObservacion] = useState('');
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [productoActualIndex, setProductoActualIndex] = useState(0);
  const [searchProducto, setSearchProducto] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [showModalPendientes, setShowModalPendientes] = useState(false);
  const [productosPendientes, setProductosPendientes] = useState([]);

  useEffect(() => {
    fetchOrdenDetalles();
  }, [ordenId]);

  const fetchOrdenDetalles = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ordenes/${ordenId}`);
      setOrden(response.data.data);
      setDetalles(response.data.data.detalles || []);
      setObservacion(response.data.data.observacion_alistador || '');
    } catch (err) {
      console.error('Error al cargar detalles:', err);
      alert('Error al cargar los detalles de la orden');
      navigate('/actividades/alistamiento');
    } finally {
      setLoading(false);
    }
  };

  const navegarProducto = (direccion) => {
    if (detalles.length === 0) return;

    let newIndex;
    if (direccion === 'arriba') {
      newIndex = productoActualIndex - 1;
      if (newIndex < 0) newIndex = detalles.length - 1;
    } else {
      newIndex = productoActualIndex + 1;
      if (newIndex >= detalles.length) newIndex = 0;
    }

    setProductoActualIndex(newIndex);
    // Hacer scroll al producto
    const elemento = document.getElementById(`producto-${detalles[newIndex].detalle_id}`);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const buscarProducto = () => {
    if (!searchProducto.trim()) return;

    const indexEncontrado = detalles.findIndex(det =>
      det.producto_nombre.toLowerCase().includes(searchProducto.toLowerCase()) ||
      det.producto_codigo.toLowerCase().includes(searchProducto.toLowerCase())
    );

    if (indexEncontrado !== -1) {
      setProductoActualIndex(indexEncontrado);
      const elemento = document.getElementById(`producto-${detalles[indexEncontrado].detalle_id}`);
      if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setSearchProducto('');
      setSugerencias([]);
    } else {
      alert('No se encontró un producto con ese nombre o código');
    }
  };

  const handleSearchChange = (valor) => {
    setSearchProducto(valor);

    if (valor.trim().length >= 2) {
      const sugerenciasFiltradas = detalles.filter(det =>
        det.producto_nombre.toLowerCase().includes(valor.toLowerCase()) ||
        det.producto_codigo.toLowerCase().includes(valor.toLowerCase())
      ).slice(0, 5); // Mostrar máximo 5 sugerencias

      setSugerencias(sugerenciasFiltradas);
    } else {
      setSugerencias([]);
    }
  };

  const seleccionarSugerencia = (detalle) => {
    const index = detalles.findIndex(det => det.detalle_id === detalle.detalle_id);
    setProductoActualIndex(index);
    const elemento = document.getElementById(`producto-${detalle.detalle_id}`);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setSearchProducto('');
    setSugerencias([]);
  };

  const handleCantidadChange = (detalleId, valor) => {
    // Permitir que el campo esté vacío o sea un número válido >= 0
    const valorNumerico = valor === '' ? '' : parseInt(valor);

    // Solo actualizar si es vacío o un número válido no negativo
    if (valor === '' || (!isNaN(valorNumerico) && valorNumerico >= 0)) {
      setDetalles(detalles.map(det =>
        det.detalle_id === detalleId
          ? { ...det, cantidad_alistada: valorNumerico }
          : det
      ));
    }
  };

  const handleGuardarCantidad = async (detalle) => {
    try {
      await api.patch(`/ordenes/detalles/${detalle.detalle_id}/cantidad-alistada`, {
        cantidad_alistada: detalle.cantidad_alistada || 0
      });

      // Marcar como guardado en la UI
      setDetalles(detalles.map(det =>
        det.detalle_id === detalle.detalle_id
          ? { ...det, alistamiento_completado: true }
          : det
      ));
    } catch (err) {
      console.error('Error al guardar cantidad:', err);
      alert('Error al guardar la cantidad alistada');
    }
  };

  const navegarAProducto = (detalle) => {
    const index = detalles.findIndex(det => det.detalle_id === detalle.detalle_id);
    setProductoActualIndex(index);
    const elemento = document.getElementById(`producto-${detalle.detalle_id}`);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setShowModalPendientes(false);
  };

  const handleFinalizar = async () => {
    // Verificar que todas las cantidades estén guardadas
    const todosProcesados = detalles.every(det => det.alistamiento_completado);

    if (!todosProcesados) {
      // Obtener lista de productos pendientes
      const pendientes = detalles.filter(det => !det.alistamiento_completado);
      setProductosPendientes(pendientes);
      setShowModalPendientes(true);
      return;
    }

    try {
      setGuardando(true);
      await api.post(`/ordenes/${ordenId}/finalizar-alistamiento`, {
        observacion_alistador: observacion
      });

      alert('Alistamiento finalizado exitosamente');
      navigate('/actividades/alistamiento');
    } catch (err) {
      console.error('Error al finalizar alistamiento:', err);
      alert('Error al finalizar el alistamiento');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">Orden no encontrada</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center space-x-3 sm:space-x-4 mb-6">
        <button
          onClick={() => navigate('/actividades/alistamiento')}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Alistamiento de Orden</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">Orden: {orden.numero_orden}</p>
        </div>
      </div>

      {/* Controles de navegación móvil - Barra fija inferior */}
      {detalles.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-primary-200 shadow-2xl p-3">
          <div className="flex items-center justify-between gap-2 max-w-6xl mx-auto">
            <button
              onClick={() => navegarProducto('arriba')}
              disabled={detalles.length <= 1}
              className="flex-1 p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title="Producto anterior"
            >
              <ChevronUp className="h-5 w-5" />
              <span className="text-sm font-medium">Anterior</span>
            </button>

            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchProducto}
                onChange={(e) => setSearchProducto(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && buscarProducto()}
                className="w-full px-3 py-2 border-2 border-primary-300 rounded-lg focus:border-primary-500 outline-none text-sm"
              />
            </div>

            <button
              onClick={() => navegarProducto('abajo')}
              disabled={detalles.length <= 1}
              className="flex-1 p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title="Producto siguiente"
            >
              <span className="text-sm font-medium">Siguiente</span>
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Controles de navegación - Flotantes a la derecha (Solo desktop) */}
      {detalles.length > 0 && (
        <div className="hidden md:flex fixed right-4 top-1/2 transform -translate-y-1/2 z-50 flex-col items-center gap-3">
          {/* Flecha arriba */}
          <button
            onClick={() => navegarProducto('arriba')}
            disabled={detalles.length <= 1}
            className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Producto anterior"
          >
            <ChevronUp className="h-6 w-6" />
          </button>

          {/* Búsqueda desplegable */}
          <div className="relative flex items-center justify-center">
            {/* Input de búsqueda (se despliega hacia la izquierda con posición absoluta) */}
            {showSearchInput && (
              <div className="absolute right-14 animate-slideInRight">
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchProducto}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && buscarProducto()}
                  onBlur={() => {
                    setTimeout(() => {
                      if (!searchProducto) {
                        setShowSearchInput(false);
                      }
                      setSugerencias([]);
                    }, 200);
                  }}
                  autoFocus
                  className="w-48 px-4 py-2 border-2 border-primary-300 rounded-lg focus:border-primary-500 outline-none text-sm shadow-xl bg-white"
                />

                {/* Dropdown de sugerencias */}
                {sugerencias.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-white border-2 border-primary-300 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                    {sugerencias.map((detalle) => (
                      <button
                        key={detalle.detalle_id}
                        onMouseDown={() => seleccionarSugerencia(detalle)}
                        className="w-full px-4 py-2 text-left hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-semibold text-sm text-gray-900 truncate">
                          {detalle.producto_nombre}
                        </div>
                        <div className="text-xs text-gray-500">
                          Código: {detalle.producto_codigo} • Cant: {detalle.cantidad_pedida}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Botón de lupa */}
            <button
              onClick={() => {
                if (showSearchInput && searchProducto) {
                  buscarProducto();
                } else {
                  setShowSearchInput(!showSearchInput);
                }
              }}
              className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-xl transition-all"
              title="Buscar producto"
            >
              <Search className="h-6 w-6" />
            </button>
          </div>

          {/* Flecha abajo */}
          <button
            onClick={() => navegarProducto('abajo')}
            disabled={detalles.length <= 1}
            className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Producto siguiente"
          >
            <ChevronDown className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Información de la orden */}
      <div className="card mb-6">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-4">Información de la Orden</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Cliente</p>
            <p className="font-medium text-sm sm:text-base break-words">{orden.cliente_nombre || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Fecha de Aprobación</p>
            <p className="font-medium text-sm sm:text-base">
              {orden.fecha_aprobacion
                ? formatDateOnly(orden.fecha_aprobacion)
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Total</p>
            <p className="font-medium text-sm sm:text-base">
              ${parseFloat(orden.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Detalles de productos */}
      <div className="card mb-6 pb-24 md:pb-6">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-4">Productos</h2>
        <div className="space-y-4">
          {detalles.map((detalle, index) => (
            <div
              key={detalle.detalle_id}
              id={`producto-${detalle.detalle_id}`}
              className={`border rounded-lg p-3 sm:p-4 transition-all ${
                index === productoActualIndex
                  ? 'border-primary-500 bg-primary-50 shadow-lg ring-2 ring-primary-300'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <p className="text-xs sm:text-sm text-gray-500">Producto</p>
                  <p className="font-medium text-sm sm:text-base break-words">{detalle.producto_nombre}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Código: {detalle.producto_codigo}</p>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Cantidad Pedida</p>
                  <p className="font-semibold text-base sm:text-lg">{detalle.cantidad_pedida}</p>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Cantidad Alistada</p>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={detalle.cantidad_alistada ?? ''}
                    onChange={(e) => handleCantidadChange(detalle.detalle_id, e.target.value)}
                    disabled={detalle.alistamiento_completado}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-sm sm:text-base"
                  />
                </div>

                <div className="flex justify-start sm:justify-end">
                  {detalle.alistamiento_completado ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="font-medium text-sm sm:text-base">Guardado</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGuardarCantidad(detalle)}
                      className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                      <Save className="h-4 w-4" />
                      <span>Guardar</span>
                    </button>
                  )}
                </div>
              </div>

              {detalle.comentarios_item && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-500">Comentarios:</p>
                  <p className="text-xs sm:text-sm break-words">{detalle.comentarios_item}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Observaciones */}
      <div className="card mb-6">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-4">Observaciones del Operario</h2>
        <textarea
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          placeholder="Escribe aquí cualquier observación sobre el alistamiento..."
          rows="4"
          className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
        />
      </div>

      {/* Botón finalizar */}
      <div className="flex justify-stretch sm:justify-end mb-20 md:mb-0">
        <button
          onClick={handleFinalizar}
          disabled={guardando}
          className="flex items-center justify-center space-x-2 px-4 sm:px-8 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {guardando ? (
            <>
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              <span className="text-sm sm:text-base">Finalizando...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Finalizar Alistamiento</span>
            </>
          )}
        </button>
      </div>

      {/* Modal de productos pendientes */}
      {showModalPendientes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header del modal */}
            <div className="bg-red-500 text-white p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">Productos Pendientes</h3>
                  <p className="text-sm text-red-100">Debes guardar las cantidades de estos productos</p>
                </div>
              </div>
              <button
                onClick={() => setShowModalPendientes(false)}
                className="p-1 hover:bg-red-600 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Haz clic en un producto para ir directamente a él:
              </p>
              <div className="space-y-3">
                {productosPendientes.map((detalle, index) => (
                  <button
                    key={detalle.detalle_id}
                    onClick={() => navegarAProducto(detalle)}
                    className="w-full text-left p-3 sm:p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-gray-900 truncate group-hover:text-red-700">
                          {index + 1}. {detalle.producto_nombre}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Código: {detalle.producto_codigo} • Cantidad pedida: {detalle.cantidad_pedida}
                        </p>
                      </div>
                      <ChevronDown className="h-5 w-5 text-red-500 transform -rotate-90 ml-2 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer del modal */}
            <div className="bg-gray-50 p-4 sm:p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModalPendientes(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

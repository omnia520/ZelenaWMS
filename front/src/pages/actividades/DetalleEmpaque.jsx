import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Check, Loader2, Search, ChevronUp, ChevronDown, AlertCircle, X } from 'lucide-react';
import api from '../../services/api';
import { formatDateOnly } from '../../utils/dateUtils';

export default function DetalleEmpaque() {
  const { ordenId } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [observacion, setObservacion] = useState('');
  const [numeroCajas, setNumeroCajas] = useState(0);
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
      setObservacion(response.data.data.observacion_empacador || '');
      setNumeroCajas(response.data.data.numero_cajas || 0);
    } catch (err) {
      console.error('Error al cargar detalles:', err);
      alert('Error al cargar los detalles de la orden');
      navigate('/actividades/empaque');
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
          ? { ...det, cantidad_empacada: valorNumerico }
          : det
      ));
    }
  };

  const handleGuardarCantidad = async (detalle) => {
    try {
      await api.patch(`/ordenes/detalles/${detalle.detalle_id}/cantidad-empacada`, {
        cantidad_empacada: detalle.cantidad_empacada || 0
      });

      // Marcar como guardado en la UI
      setDetalles(detalles.map(det =>
        det.detalle_id === detalle.detalle_id
          ? { ...det, empaque_completado: true }
          : det
      ));
    } catch (err) {
      console.error('Error al guardar cantidad:', err);
      alert('Error al guardar la cantidad empacada');
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
    // Verificar que el alistamiento esté completo
    const alistamientoCompleto = detalles.every(det => det.alistamiento_completado);

    if (!alistamientoCompleto) {
      alert('No se puede finalizar el empaque porque el alistamiento aún no está completo. Por favor, espera a que se termine de alistar la orden.');
      return;
    }

    // Verificar que todas las cantidades estén guardadas
    const todosProcesados = detalles.every(det => det.empaque_completado);

    if (!todosProcesados) {
      // Obtener lista de productos pendientes
      const pendientes = detalles.filter(det => !det.empaque_completado);
      setProductosPendientes(pendientes);
      setShowModalPendientes(true);
      return;
    }

    try {
      setGuardando(true);
      await api.post(`/ordenes/${ordenId}/finalizar-empaque`, {
        observacion_empacador: observacion,
        numero_cajas: numeroCajas
      });

      alert('Empaque finalizado exitosamente');
      navigate('/actividades/empaque');
    } catch (err) {
      console.error('Error al finalizar empaque:', err);
      alert(err.response?.data?.message || 'Error al finalizar el empaque');
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
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/actividades/empaque')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Empaque de Orden</h1>
          <p className="text-gray-600 mt-1">Orden: {orden.numero_orden}</p>
        </div>
      </div>

      {/* Controles de navegación - Flotantes a la derecha */}
      {detalles.length > 0 && (
        <div className="hidden md:flex fixed right-4 top-1/2 transform -translate-y-1/2 z-50 flex-col items-center gap-3">
          {/* Flecha arriba */}
          <button
            onClick={() => navegarProducto('arriba')}
            disabled={detalles.length <= 1}
            className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
                  className="w-48 px-4 py-2 border-2 border-green-300 rounded-lg focus:border-green-500 outline-none text-sm shadow-xl bg-white"
                />

                {/* Dropdown de sugerencias */}
                {sugerencias.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-white border-2 border-green-300 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                    {sugerencias.map((detalle) => (
                      <button
                        key={detalle.detalle_id}
                        onMouseDown={() => seleccionarSugerencia(detalle)}
                        className="w-full px-4 py-2 text-left hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0"
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
              className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl transition-all"
              title="Buscar producto"
            >
              <Search className="h-6 w-6" />
            </button>
          </div>

          {/* Flecha abajo */}
          <button
            onClick={() => navegarProducto('abajo')}
            disabled={detalles.length <= 1}
            className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Producto siguiente"
          >
            <ChevronDown className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Información de la orden */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Información de la Orden</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Cliente</p>
            <p className="font-medium">{orden.cliente_nombre || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha de Alistamiento</p>
            <p className="font-medium">
              {orden.fecha_fin_alistamiento
                ? formatDateOnly(orden.fecha_fin_alistamiento)
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="font-medium">
              ${parseFloat(orden.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        {orden.observacion_alistador && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Observaciones del Operario (Alistamiento):</p>
            <p className="text-sm bg-blue-50 p-3 rounded-lg">{orden.observacion_alistador}</p>
          </div>
        )}
      </div>

      {/* Detalles de productos */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Productos</h2>
        <div className="space-y-4">
          {detalles.map((detalle, index) => (
            <div
              key={detalle.detalle_id}
              id={`producto-${detalle.detalle_id}`}
              className={`border rounded-lg p-4 transition-all ${
                index === productoActualIndex
                  ? 'border-green-500 bg-green-50 shadow-lg ring-2 ring-green-300'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Producto</p>
                  <p className="font-medium">{detalle.producto_nombre}</p>
                  <p className="text-sm text-gray-500">Código: {detalle.producto_codigo}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Cantidad Pedida</p>
                  <p className="font-semibold text-lg text-gray-700">{detalle.cantidad_pedida || 0}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Cantidad Alistada</p>
                  <p className="font-semibold text-lg text-blue-600">{detalle.cantidad_alistada || 0}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Cantidad Empacada</p>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={detalle.cantidad_empacada ?? ''}
                    onChange={(e) => handleCantidadChange(detalle.detalle_id, e.target.value)}
                    disabled={detalle.empaque_completado}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div className="flex justify-end">
                  {detalle.empaque_completado ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Check className="h-6 w-6" />
                      <span className="font-medium">Guardado</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGuardarCantidad(detalle)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>Guardar</span>
                    </button>
                  )}
                </div>
              </div>

              {detalle.comentarios_item && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Comentarios:</p>
                  <p className="text-sm">{detalle.comentarios_item}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Observaciones y Número de Cajas */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Información del Empaque</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Cajas Utilizadas
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={numeroCajas}
            onChange={(e) => {
              const valor = e.target.value;
              const valorNumerico = parseInt(valor);
              // Actualizar directamente, la validación min="0" del input bloqueará negativos
              setNumeroCajas(valor === '' ? 0 : (isNaN(valorNumerico) ? 0 : Math.max(0, valorNumerico)));
            }}
            onKeyDown={(e) => {
              // Bloquear teclas de signo menos y notación científica
              if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                e.preventDefault();
              }
            }}
            placeholder="Ingresa el número total de cajas"
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones del Operario
          </label>
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Escribe aquí cualquier observación sobre el empaque..."
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Indicador de estado de alistamiento */}
      {!detalles.every(det => det.alistamiento_completado) && (
        <div className="card mb-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Alistamiento en proceso</h3>
              <p className="text-sm text-yellow-700 mt-1">
                El alistamiento de esta orden aún no ha finalizado. Puedes empacar los productos que ya están alistados,
                pero no podrás finalizar el empaque hasta que se complete el alistamiento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botón finalizar */}
      <div className="flex justify-end">
        <button
          onClick={handleFinalizar}
          disabled={guardando || !detalles.every(det => det.alistamiento_completado)}
          className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {guardando ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Finalizando...</span>
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              <span>Finalizar Empaque</span>
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
                  <p className="text-sm text-red-100">Debes guardar las cantidades empacadas de estos productos</p>
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
                          Código: {detalle.producto_codigo} • Cantidad alistada: {detalle.cantidad_alistada || 0}
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

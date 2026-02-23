import { useState, useEffect, useRef } from 'react';
import { ubicacionesAPI, productosAPI } from '../../services/api';
import ModalAsignarUbicacion from './ModalAsignarUbicacion';
import ModalMoverProducto from './ModalMoverProducto';

export default function BuscarProducto() {
  const [searchTerm, setSearchTerm] = useState('');
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [ubicacionToEdit, setUbicacionToEdit] = useState(null);
  const [showMoverModal, setShowMoverModal] = useState(false);
  const [ubicacionOrigen, setUbicacionOrigen] = useState(null);

  // Autocomplete states
  const [sugerencias, setSugerencias] = useState([]);
  const [showSugerencias, setShowSugerencias] = useState(false);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const isSelectingRef = useRef(false);

  // Efecto para buscar sugerencias mientras el usuario escribe
  useEffect(() => {
    const fetchSugerencias = async () => {
      if (searchTerm.trim().length < 1 || isSelectingRef.current) {
        setSugerencias([]);
        setShowSugerencias(false);
        return;
      }

      setLoadingSugerencias(true);
      try {
        const response = await ubicacionesAPI.getSugerenciasProductos(searchTerm);
        setSugerencias(response.data.data || []);
        setShowSugerencias(true);
      } catch (err) {
        console.error('Error al obtener sugerencias:', err);
        setSugerencias([]);
      } finally {
        setLoadingSugerencias(false);
      }
    };

    // Debounce: esperar 300ms después de que el usuario deje de escribir
    const timeoutId = setTimeout(fetchSugerencias, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSugerencias(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setShowSugerencias(false);
    setLoading(true);
    setError(null);

    try {
      const response = await ubicacionesAPI.buscarProducto(searchTerm);
      setProductos(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al buscar productos');
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSugerencia = async (sugerencia) => {
    isSelectingRef.current = true;
    setSearchTerm(sugerencia.codigo);
    setShowSugerencias(false);
    setSugerencias([]);
    setLoading(true);
    setError(null);

    try {
      // Buscar directamente con el código de la sugerencia
      const response = await ubicacionesAPI.buscarProducto(sugerencia.codigo);
      setProductos(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al buscar productos');
      setProductos([]);
    } finally {
      setLoading(false);
      // Resetear el flag después de la búsqueda
      setTimeout(() => {
        isSelectingRef.current = false;
      }, 300);
    }
  };

  const handleAddUbicacion = (producto) => {
    setSelectedProducto(producto);
    setUbicacionToEdit(null);
    setShowModal(true);
  };

  const handleEditUbicacion = (producto, ubicacion) => {
    setSelectedProducto(producto);
    setUbicacionToEdit(ubicacion);
    setShowModal(true);
  };

  const handleDeleteUbicacion = async (producto, ubicacion) => {
    if (!confirm(`¿Eliminar la ubicación ${ubicacion.codigo} del producto ${producto.nombre}?`)) {
      return;
    }

    try {
      await ubicacionesAPI.removeProducto(ubicacion.ubicacion_id, producto.producto_id);
      // Refresh search
      handleSearch({ preventDefault: () => {} });
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar ubicación');
    }
  };

  const handleMoverProducto = (producto, ubicacion) => {
    setSelectedProducto(producto);
    setUbicacionOrigen(ubicacion);
    setShowMoverModal(true);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setSelectedProducto(null);
    setUbicacionToEdit(null);
    // Refresh search
    handleSearch({ preventDefault: () => {} });
  };

  const handleMoverModalSuccess = () => {
    setShowMoverModal(false);
    setSelectedProducto(null);
    setUbicacionOrigen(null);
    // Refresh search
    handleSearch({ preventDefault: () => {} });
  };

  return (
    <div>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (sugerencias.length > 0) setShowSugerencias(true);
              }}
              placeholder="Buscar por código o nombre del producto..."
              className="input w-full"
              autoComplete="off"
            />

            {/* Dropdown de sugerencias */}
            {showSugerencias && sugerencias.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {sugerencias.map((sugerencia) => (
                  <div
                    key={sugerencia.producto_id}
                    onClick={() => handleSelectSugerencia(sugerencia)}
                    className="px-4 py-3 hover:bg-primary-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{sugerencia.nombre}</div>
                        <div className="text-sm text-gray-500">Código: {sugerencia.codigo}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Indicador de carga */}
            {loadingSugerencias && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Results */}
      {productos.length > 0 && (
        <div className="space-y-4">
          {productos.map((producto) => (
            <div key={producto.producto_id} className="border border-gray-200 rounded-lg p-4">
              {/* Product Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {producto.nombre}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Código: <span className="font-medium">{producto.codigo}</span>
                  </p>
                  {producto.descripcion && (
                    <p className="text-sm text-gray-500 mt-1">{producto.descripcion}</p>
                  )}
                </div>
                <button
                  onClick={() => handleAddUbicacion(producto)}
                  className="btn btn-sm btn-primary"
                >
                  + Agregar Ubicación
                </button>
              </div>

              {/* Ubicaciones */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Ubicaciones:</h4>
                {producto.ubicaciones && producto.ubicaciones.length > 0 && producto.ubicaciones[0].ubicacion_id ? (
                  <div className="space-y-2">
                    {producto.ubicaciones.map((ubicacion) => (
                      <div
                        key={ubicacion.ubicacion_id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {ubicacion.codigo}
                            </span>
                            {ubicacion.es_ubicacion_primaria && (
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                Primaria
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {ubicacion.descripcion && <span>{ubicacion.descripcion} • </span>}
                            Est: {ubicacion.estanteria || 'N/A'} |
                            Fila: {ubicacion.fila || 'N/A'} |
                            Nivel: {ubicacion.nivel || 'N/A'} |
                            Cantidad: <span className="font-medium">{ubicacion.cantidad}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUbicacion(producto, ubicacion)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleMoverProducto(producto, ubicacion)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Mover
                          </button>
                          <button
                            onClick={() => handleDeleteUbicacion(producto, ubicacion)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Sin ubicaciones asignadas
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && productos.length === 0 && searchTerm && !error && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron productos con la referencia "{searchTerm}"
        </div>
      )}

      {/* Modal Asignar Ubicación */}
      {showModal && (
        <ModalAsignarUbicacion
          producto={selectedProducto}
          ubicacion={ubicacionToEdit}
          onClose={() => {
            setShowModal(false);
            setSelectedProducto(null);
            setUbicacionToEdit(null);
          }}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Modal Mover Producto */}
      {showMoverModal && (
        <ModalMoverProducto
          producto={selectedProducto}
          ubicacionOrigen={ubicacionOrigen}
          onClose={() => {
            setShowMoverModal(false);
            setSelectedProducto(null);
            setUbicacionOrigen(null);
          }}
          onSuccess={handleMoverModalSuccess}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Package, Truck, Plus, Filter, Calendar, User, FileText, Eye, Search, X, PackagePlus } from 'lucide-react';
import { recepcionesAPI, proveedoresAPI } from '../../services/api';
import ProveedorForm from '../proveedores/ProveedorForm';
import RecepcionForm from './RecepcionForm';
import DetalleRecepcion from './DetalleRecepcion';
import useAuthStore from '../../store/authStore';
import { formatDateOnly } from '../../utils/dateUtils';

export default function Recepciones() {
  const [recepciones, setRecepciones] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [selectedProveedorId, setSelectedProveedorId] = useState('');
  const [selectedRecepcionId, setSelectedRecepcionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProveedorForm, setShowProveedorForm] = useState(false);
  const [showRecepcionForm, setShowRecepcionForm] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useAuthStore();

  // Cargar proveedores y recepciones
  useEffect(() => {
    loadData();
  }, [refreshTrigger, selectedProveedorId]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.relative')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar proveedores
      const proveedoresResponse = await proveedoresAPI.getAll({ activo: true });
      setProveedores(proveedoresResponse.data.data || []);

      // Cargar recepciones con filtro de proveedor si está seleccionado
      const params = selectedProveedorId ? { proveedor_id: selectedProveedorId } : {};
      const recepcionesResponse = await recepcionesAPI.getAll(params);
      setRecepciones(recepcionesResponse.data.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleProveedorCreated = () => {
    setShowProveedorForm(false);
    setShowMainMenu(true);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRecepcionCreated = () => {
    setShowRecepcionForm(false);
    setShowMainMenu(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const formatDateLocal = (dateString) => {
    if (!dateString) return '-';
    return formatDateOnly(dateString);
  };

  const canCreateProveedor = ['Jefe_Bodega', 'Administrador'].includes(user?.rol);

  // Filtrar proveedores según término de búsqueda
  const filteredProveedores = proveedores.filter((proveedor) => {
    const searchLower = searchTerm.toLowerCase();
    const nombre = (proveedor.nombre || '').toLowerCase();
    const nit = (proveedor.nit || '').toLowerCase();
    return nombre.includes(searchLower) || nit.includes(searchLower);
  });

  // Manejar selección de proveedor
  const handleSelectProveedor = (proveedor) => {
    setSelectedProveedorId(proveedor.proveedor_id);
    setSearchTerm(proveedor.nombre);
    setShowDropdown(false);
  };

  // Limpiar selección
  const handleClearSelection = () => {
    setSelectedProveedorId('');
    setSearchTerm('');
    setShowDropdown(false);
  };

  // Manejar cambio en input de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
    if (!e.target.value) {
      setSelectedProveedorId('');
    }
  };

  // Si está mostrando el detalle de una recepción
  if (selectedRecepcionId) {
    return (
      <DetalleRecepcion
        recepcionId={selectedRecepcionId}
        onClose={() => {
          setSelectedRecepcionId(null);
          loadData();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando recepciones...</p>
        </div>
      </div>
    );
  }

  // Si está mostrando el formulario de proveedor
  if (showProveedorForm) {
    return (
      <ProveedorForm
        proveedor={null}
        onClose={() => {
          setShowProveedorForm(false);
          setShowMainMenu(true);
        }}
        onSuccess={handleProveedorCreated}
      />
    );
  }

  // Si está mostrando el formulario de recepción
  if (showRecepcionForm) {
    return (
      <RecepcionForm
        onClose={() => {
          setShowRecepcionForm(false);
          setShowMainMenu(true);
        }}
        onSuccess={handleRecepcionCreated}
      />
    );
  }

  // Menú principal con dos botones
  if (showMainMenu && canCreateProveedor) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="h-8 w-8 mr-3 text-primary-600" />
            Recepciones
          </h2>
          <p className="text-gray-600 mt-2">Selecciona una opción para continuar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Botón Crear Recepción */}
          <button
            onClick={() => {
              setShowRecepcionForm(true);
              setShowMainMenu(false);
            }}
            className="group relative overflow-hidden rounded-xl bg-white p-8 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-500"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-blue-100 group-hover:bg-blue-500 transition-colors duration-300">
                <PackagePlus className="h-12 w-12 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                Crear Recepción
              </h2>
              <p className="text-gray-600 text-center">
                Registra una nueva recepción de mercancía
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          {/* Botón Crear Proveedor */}
          <button
            onClick={() => {
              setShowProveedorForm(true);
              setShowMainMenu(false);
            }}
            className="group relative overflow-hidden rounded-xl bg-white p-8 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-green-500"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-green-100 group-hover:bg-green-500 transition-colors duration-300">
                <Truck className="h-12 w-12 text-green-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                Crear Proveedor
              </h2>
              <p className="text-gray-600 text-center">
                Registra un nuevo proveedor en el sistema
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Botón para ver listado */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowMainMenu(false)}
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center mx-auto"
          >
            <Eye className="h-5 w-5 mr-2" />
            Ver listado de recepciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Package className="h-8 w-8 mr-3 text-primary-600" />
              Recepciones de Mercancía
            </h2>
            <p className="text-gray-600 mt-1">Gestiona las recepciones de inventario por proveedor</p>
          </div>
          {canCreateProveedor && (
            <button
              onClick={() => setShowMainMenu(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Recepción/Proveedor
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        {/* Selector de Proveedor con Búsqueda */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-primary-500" />
              Filtrar por Proveedor
            </div>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              placeholder="Buscar por nombre o NIT..."
              className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
            {searchTerm && (
              <button
                onClick={handleClearSelection}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Dropdown de resultados */}
            {showDropdown && searchTerm && (
              <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredProveedores.length > 0 ? (
                  <>
                    <div
                      onClick={handleClearSelection}
                      className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 text-gray-600 font-medium"
                    >
                      Todos los proveedores
                    </div>
                    {filteredProveedores.map((proveedor) => (
                      <div
                        key={proveedor.proveedor_id}
                        onClick={() => handleSelectProveedor(proveedor)}
                        className={`px-4 py-2.5 hover:bg-primary-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                          selectedProveedorId === proveedor.proveedor_id ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">{proveedor.nombre}</div>
                        {proveedor.nit && (
                          <div className="text-xs text-gray-500">NIT: {proveedor.nit}</div>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-sm">
                    No se encontraron proveedores
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 text-sm text-gray-600">
          {selectedProveedorId && proveedores.find(p => p.proveedor_id == selectedProveedorId) && (
            <span className="font-semibold">
              Mostrando recepciones de: {proveedores.find(p => p.proveedor_id == selectedProveedorId)?.nombre}
            </span>
          )}
          {!selectedProveedorId && (
            <span>
              Mostrando <span className="font-semibold">{recepciones.length}</span> recepciones en total
            </span>
          )}
        </div>
      </div>

      {/* Lista de Recepciones */}
      {recepciones.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recepciones</h3>
          <p className="text-gray-600">
            {selectedProveedorId
              ? 'No se encontraron recepciones para este proveedor'
              : 'No hay recepciones registradas'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Recepción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recibido Por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observaciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recepciones.map((recepcion) => (
                  <tr key={recepcion.recepcion_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {recepcion.numero_documento}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 mr-2 text-primary-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {recepcion.proveedor_nombre || '-'}
                          </div>
                          {recepcion.proveedor_nit && (
                            <div className="text-xs text-gray-500">
                              NIT: {recepcion.proveedor_nit}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDateLocal(recepcion.fecha_recepcion)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        {recepcion.usuario_nombre || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {recepcion.observaciones || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedRecepcionId(recepcion.recepcion_id)}
                        className="text-primary-600 hover:text-primary-900 font-medium flex items-center"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

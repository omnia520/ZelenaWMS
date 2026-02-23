import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Eye, Filter, Calendar, DollarSign, User, FileText, Search } from 'lucide-react';
import { ordenesAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { formatDateOnly } from '../../utils/dateUtils';

const estadoColors = {
  'Pendiente_Aprobacion': 'bg-yellow-100 text-yellow-800',
  'Aprobada': 'bg-green-100 text-green-800',
  'En_Alistamiento': 'bg-blue-100 text-blue-800',
  'En_Empaque': 'bg-purple-100 text-purple-800',
  'Lista_Facturar': 'bg-indigo-100 text-indigo-800',
  'Facturada': 'bg-emerald-100 text-emerald-800',
  'Rechazada': 'bg-red-100 text-red-800',
};

const estadoLabels = {
  'Pendiente_Aprobacion': 'Pendiente Aprobación',
  'Aprobada': 'Aprobada',
  'En_Alistamiento': 'En Alistamiento',
  'En_Empaque': 'En Empaque',
  'Lista_Facturar': 'Lista para Facturar',
  'Facturada': 'Facturada',
  'Rechazada': 'Rechazada',
};

export default function OrdenesList({ onCreateClick, onViewClick, refreshTrigger }) {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    loadOrdenes();
  }, [refreshTrigger]);

  const loadOrdenes = async () => {
    try {
      setLoading(true);
      const response = await ordenesAPI.getAll();
      setOrdenes(response.data.data || []);
    } catch (error) {
      console.error('Error loading ordenes:', error);
      alert('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar órdenes
  const filteredOrdenes = ordenes.filter(orden => {
    // Filtro por estado
    if (filterEstado !== 'all' && orden.estado !== filterEstado) {
      return false;
    }

    // Filtro por búsqueda (número de orden, cliente o vendedor)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      const matchNumeroOrden = orden.numero_orden?.toLowerCase().includes(search);
      const matchCliente = orden.cliente_nombre?.toLowerCase().includes(search);
      const matchVendedor = orden.vendedor_nombre?.toLowerCase().includes(search);

      return matchNumeroOrden || matchCliente || matchVendedor;
    }

    return true;
  });

  // Verificar si el usuario puede crear órdenes
  const canCreate = ['Vendedor', 'Jefe_Bodega', 'Administrador'].includes(user?.rol);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
              <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-primary-600" />
              Órdenes de Venta
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Gestiona las órdenes del sistema</p>
          </div>
          {canCreate && (
            <button
              onClick={onCreateClick}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center w-full sm:w-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Orden
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        {/* Búsqueda */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número de orden, cliente o vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
          </div>
        </div>

        {/* Filtro por estado */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Filter className="h-5 w-5 text-gray-500 hidden sm:block" />
          <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="flex-1 sm:flex-initial px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
          >
            <option value="all">Todos</option>
            <option value="Pendiente_Aprobacion">Pendiente Aprobación</option>
            <option value="Aprobada">Aprobada</option>
            <option value="En_Alistamiento">En Alistamiento</option>
            <option value="En_Empaque">En Empaque</option>
            <option value="Lista_Facturar">Lista para Facturar</option>
            <option value="Facturada">Facturada</option>
            <option value="Rechazada">Rechazada</option>
          </select>
        </div>

        <div className="mt-4 text-xs sm:text-sm text-gray-600">
          Mostrando <span className="font-semibold">{filteredOrdenes.length}</span> de{' '}
          <span className="font-semibold">{ordenes.length}</span> órdenes
        </div>
      </div>

      {/* Órdenes Grid */}
      {filteredOrdenes.length === 0 ? (
        <div className="card text-center py-12">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes</h3>
          <p className="text-gray-600 mb-6">
            {filterEstado !== 'all'
              ? 'No se encontraron órdenes con ese estado'
              : 'Comienza creando tu primera orden'}
          </p>
          {canCreate && filterEstado === 'all' && (
            <button
              onClick={onCreateClick}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crear Orden
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrdenes.map((orden) => (
            <div
              key={orden.orden_id}
              className="card hover:shadow-xl transition-shadow duration-200"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary-500" />
                    {orden.numero_orden}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Cliente: <span className="font-medium text-gray-900">{orden.cliente_nombre}</span>
                  </p>
                </div>
                <span className={`badge ${estadoColors[orden.estado]}`}>
                  {estadoLabels[orden.estado]}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  Vendedor: {orden.vendedor_nombre}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {formatDateOnly(orden.fecha_creacion)}
                </div>
                <div className="flex items-center text-sm font-semibold text-primary-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Total: ${parseFloat(orden.total).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </div>
                {orden.comentarios && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Comentarios:</p>
                    <p className="text-sm text-gray-700">{orden.comentarios}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => onViewClick(orden)}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Search, Eye, Trash2, AlertTriangle, Calendar, Package, User, Filter, Loader2 } from 'lucide-react';
import { averiasAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { formatDateShort } from '../../utils/dateUtils';

const ESTADOS = [
  { value: '', label: 'Todos', color: 'gray' },
  { value: 'Pendiente', label: 'Pendientes', color: 'yellow' },
  { value: 'Repuesta', label: 'Repuestas', color: 'green' },
  { value: 'Descartada', label: 'Descartadas', color: 'red' },
];

const TIPOS_AVERIA = {
  'Daño': { color: 'bg-orange-100 text-orange-800', label: 'Daño' },
  'Faltante': { color: 'bg-purple-100 text-purple-800', label: 'Faltante' },
  'Rotura': { color: 'bg-red-100 text-red-800', label: 'Rotura' },
  'Vencimiento': { color: 'bg-gray-100 text-gray-800', label: 'Vencimiento' },
};

const ESTADO_BADGES = {
  'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Repuesta': 'bg-green-100 text-green-800 border-green-300',
  'Descartada': 'bg-red-100 text-red-800 border-red-300',
};

export default function AveriasList({ onViewDetail, refreshTrigger, onRefresh }) {
  const [averias, setAverias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);
  const { user } = useAuthStore();

  const isAdmin = user?.rol === 'Administrador';
  const isJefeBodega = user?.rol === 'Jefe_Bodega';
  const canSeeResponsable = isAdmin || isJefeBodega;
  const canDelete = isAdmin;

  useEffect(() => {
    loadAverias();
  }, [refreshTrigger, filtroEstado]);

  const loadAverias = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroEstado) params.estado = filtroEstado;
      if (searchTerm) params.search = searchTerm;

      const response = await averiasAPI.getAll(params);
      setAverias(response.data.data || []);
    } catch (error) {
      console.error('Error loading averias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadAverias();
  };

  const handleDelete = async (averiaId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta avería? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeleting(averiaId);
      await averiasAPI.delete(averiaId);
      onRefresh();
    } catch (error) {
      console.error('Error deleting averia:', error);
      alert(error.response?.data?.message || 'Error al eliminar la avería');
    } finally {
      setDeleting(null);
    }
  };

  // Filtrar averías en cliente por búsqueda
  const filteredAverias = averias.filter(averia => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (averia.producto_codigo || '').toLowerCase().includes(term) ||
      (averia.producto_nombre || '').toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando averías...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filtros */}
      <div className="card mb-6">
        <div className="flex flex-col gap-4">
          {/* Tabs de estado — scroll horizontal en móvil */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {ESTADOS.map(estado => (
                <button
                  key={estado.value}
                  onClick={() => setFiltroEstado(estado.value)}
                  className="px-3 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap flex-shrink-0"
                  style={{
                    backgroundColor: filtroEstado === estado.value
                      ? (estado.color === 'gray' ? '#6b7280' : estado.color === 'yellow' ? '#eab308' : estado.color === 'green' ? '#22c55e' : '#ef4444')
                      : undefined,
                    color: filtroEstado === estado.value ? 'white' : undefined,
                    background: filtroEstado !== estado.value
                      ? (estado.color === 'gray' ? '#f3f4f6' : estado.color === 'yellow' ? '#fef9c3' : estado.color === 'green' ? '#dcfce7' : '#fee2e2')
                      : undefined,
                  }}
                >
                  {estado.label}
                </button>
              ))}
            </div>
          </div>

          {/* Búsqueda */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código o nombre..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50 transition-all outline-none text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all flex-shrink-0"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          Mostrando <span className="font-semibold">{filteredAverias.length}</span> averías
          {filtroEstado && <span> en estado <span className="font-semibold">{filtroEstado}</span></span>}
        </div>
      </div>

      {/* Lista */}
      {filteredAverias.length === 0 ? (
        <div className="card text-center py-12">
          <AlertTriangle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay averías</h3>
          <p className="text-gray-600">
            {filtroEstado
              ? `No se encontraron averías en estado "${filtroEstado}"`
              : 'No hay averías registradas'}
          </p>
        </div>
      ) : (
        <>
          {/* ── MÓVIL: tarjetas ── */}
          <div className="block md:hidden space-y-3">
            {filteredAverias.map((averia) => (
              <div
                key={averia.averia_id}
                className="card !p-4 border border-gray-200"
              >
                {/* Fila superior: producto + estado */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <Package className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
                        {averia.producto_nombre}
                      </p>
                      <p className="text-xs text-gray-500">{averia.producto_codigo}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border flex-shrink-0 ${ESTADO_BADGES[averia.estado] || 'bg-gray-100 text-gray-800'}`}>
                    {averia.estado}
                  </span>
                </div>

                {/* Fila media: fecha, cantidad, tipo */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    {formatDateShort(averia.fecha_reporte)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{averia.cantidad} uds</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${TIPOS_AVERIA[averia.tipo_averia]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {averia.tipo_averia}
                    </span>
                  </div>
                </div>

                {/* Responsable */}
                {canSeeResponsable && averia.reportado_por_nombre && (
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <User className="h-3.5 w-3.5 mr-1" />
                    {averia.reportado_por_nombre}
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => onViewDetail(averia.averia_id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Ver detalle
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(averia.averia_id)}
                      disabled={deleting === averia.averia_id}
                      className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {deleting === averia.averia_id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />
                      }
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── DESKTOP: tabla ── */}
          <div className="hidden md:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    {canSeeResponsable && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Responsable
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAverias.map((averia) => (
                    <tr key={averia.averia_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-5 w-5 mr-3 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {averia.producto_nombre}
                            </div>
                            <div className="text-xs text-gray-500">
                              {averia.producto_codigo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDateShort(averia.fecha_reporte)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {averia.cantidad}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${TIPOS_AVERIA[averia.tipo_averia]?.color || 'bg-gray-100 text-gray-800'}`}>
                          {averia.tipo_averia}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${ESTADO_BADGES[averia.estado] || 'bg-gray-100 text-gray-800'}`}>
                          {averia.estado}
                        </span>
                      </td>
                      {canSeeResponsable && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            {averia.reportado_por_nombre || '-'}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewDetail(averia.averia_id)}
                            className="text-blue-600 hover:text-blue-900 font-medium flex items-center text-sm"
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(averia.averia_id)}
                              disabled={deleting === averia.averia_id}
                              className="text-red-600 hover:text-red-900 font-medium flex items-center text-sm disabled:opacity-50"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {deleting === averia.averia_id ? '...' : 'Eliminar'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

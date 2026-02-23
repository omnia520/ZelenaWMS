import { useState, useEffect } from 'react';
import { Truck, Plus, Search, Edit2, Trash2, Mail, Phone, User, CreditCard } from 'lucide-react';
import { proveedoresAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function ProveedoresList({ onCreateClick, onEditClick, refreshTrigger }) {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState('all');
  const { user } = useAuthStore();

  useEffect(() => {
    loadProveedores();
  }, [refreshTrigger]);

  const loadProveedores = async () => {
    try {
      setLoading(true);
      const response = await proveedoresAPI.getAll();
      setProveedores(response.data.data || []);
    } catch (error) {
      console.error('Error loading proveedores:', error);
      alert('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar al proveedor "${nombre}"?`)) {
      return;
    }

    try {
      await proveedoresAPI.delete(id);
      alert('Proveedor eliminado exitosamente');
      loadProveedores();
    } catch (error) {
      console.error('Error deleting proveedor:', error);
      alert(error.response?.data?.message || 'Error al eliminar proveedor');
    }
  };

  const handleToggleActive = async (id, currentStatus, nombre) => {
    try {
      await proveedoresAPI.toggleActive(id, !currentStatus);
      alert(`Proveedor "${nombre}" ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      loadProveedores();
    } catch (error) {
      console.error('Error toggling active:', error);
      alert('Error al cambiar estado del proveedor');
    }
  };

  // Filtrar proveedores
  const filteredProveedores = proveedores.filter(proveedor => {
    const matchesSearch =
      proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proveedor.nit && proveedor.nit.includes(searchTerm)) ||
      (proveedor.contacto && proveedor.contacto.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterActivo === 'all' ||
      (filterActivo === 'active' && proveedor.activo) ||
      (filterActivo === 'inactive' && !proveedor.activo);

    return matchesSearch && matchesFilter;
  });

  // Verificar si el usuario puede crear/editar
  const canCreateEdit = ['Jefe_Bodega', 'Administrador'].includes(user?.rol);
  const canDelete = user?.rol === 'Administrador';
  const canToggleActive = ['Jefe_Bodega', 'Administrador'].includes(user?.rol);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando proveedores...</p>
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
              <Truck className="h-8 w-8 mr-3 text-primary-600" />
              Proveedores
            </h2>
            <p className="text-gray-600 mt-1">Gestiona la información de tus proveedores</p>
          </div>
          {canCreateEdit && (
            <button
              onClick={onCreateClick}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Proveedor
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, NIT o contacto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="md:w-48">
            <select
              value={filterActivo}
              onChange={(e) => setFilterActivo(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando <span className="font-semibold">{filteredProveedores.length}</span> de{' '}
          <span className="font-semibold">{proveedores.length}</span> proveedores
        </div>
      </div>

      {/* Proveedores Grid */}
      {filteredProveedores.length === 0 ? (
        <div className="card text-center py-12">
          <Truck className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay proveedores</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'No se encontraron proveedores con ese criterio' : 'Comienza creando tu primer proveedor'}
          </p>
          {canCreateEdit && !searchTerm && (
            <button
              onClick={onCreateClick}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crear Proveedor
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProveedores.map((proveedor) => (
            <div
              key={proveedor.proveedor_id}
              className="card hover:shadow-xl transition-shadow duration-200 relative"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`badge ${
                    proveedor.activo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {proveedor.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Proveedor Info */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2 pr-20">
                  {proveedor.nombre}
                </h3>
                {proveedor.nit && (
                  <p className="text-sm font-medium text-gray-600 mb-3">
                    NIT: <span className="text-gray-900">{proveedor.nit}</span>
                  </p>
                )}

                <div className="space-y-2">
                  {proveedor.contacto && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2 text-primary-500" />
                      <span className="truncate">{proveedor.contacto}</span>
                    </div>
                  )}
                  {proveedor.telefono && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-primary-500" />
                      <span>{proveedor.telefono}</span>
                    </div>
                  )}
                  {proveedor.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-primary-500" />
                      <span className="truncate">{proveedor.email}</span>
                    </div>
                  )}
                  {proveedor.tolerancia_porcentaje > 0 && (
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      Tolerancia: {proveedor.tolerancia_porcentaje}%
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  {canCreateEdit && (
                    <button
                      onClick={() => onEditClick(proveedor)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(proveedor.proveedor_id, proveedor.nombre)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {canToggleActive && (
                  <button
                    onClick={() => handleToggleActive(proveedor.proveedor_id, proveedor.activo, proveedor.nombre)}
                    className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
                      proveedor.activo
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {proveedor.activo ? 'Desactivar' : 'Activar'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

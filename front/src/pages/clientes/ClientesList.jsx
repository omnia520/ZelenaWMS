import { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Trash2, MapPin, Mail, Phone } from 'lucide-react';
import { clientesAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function ClientesList({ onCreateClick, onEditClick, refreshTrigger }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState('all');
  const { user } = useAuthStore();

  useEffect(() => {
    loadClientes();
  }, [refreshTrigger]);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const response = await clientesAPI.getAll();
      setClientes(response.data.data || []);
    } catch (error) {
      console.error('Error loading clientes:', error);
      alert('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, razonSocial) => {
    if (!window.confirm(`¿Estás seguro de eliminar al cliente "${razonSocial}"?`)) {
      return;
    }

    try {
      await clientesAPI.delete(id);
      alert('Cliente eliminado exitosamente');
      loadClientes();
    } catch (error) {
      console.error('Error deleting cliente:', error);
      alert(error.response?.data?.message || 'Error al eliminar cliente');
    }
  };

  const handleToggleActive = async (id, currentStatus, razonSocial) => {
    try {
      await clientesAPI.toggleActive(id, !currentStatus);
      alert(`Cliente "${razonSocial}" ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      loadClientes();
    } catch (error) {
      console.error('Error toggling active:', error);
      alert('Error al cambiar estado del cliente');
    }
  };

  // Filtrar clientes
  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch =
      cliente.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.nit_cc.includes(searchTerm) ||
      (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterActivo === 'all' ||
      (filterActivo === 'active' && cliente.activo) ||
      (filterActivo === 'inactive' && !cliente.activo);

    return matchesSearch && matchesFilter;
  });

  // Verificar si el usuario puede crear/editar
  const canCreateEdit = ['Vendedor', 'Jefe_Bodega', 'Administrador'].includes(user?.rol);
  const canDelete = user?.rol === 'Administrador';
  const canToggleActive = ['Jefe_Bodega', 'Administrador'].includes(user?.rol);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando clientes...</p>
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
              <Users className="h-8 w-8 mr-3 text-primary-600" />
              Clientes
            </h2>
            <p className="text-gray-600 mt-1">Gestiona la información de tus clientes</p>
          </div>
          {canCreateEdit && (
            <button
              onClick={onCreateClick}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Cliente
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
                placeholder="Buscar por nombre, NIT o email..."
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
          Mostrando <span className="font-semibold">{filteredClientes.length}</span> de{' '}
          <span className="font-semibold">{clientes.length}</span> clientes
        </div>
      </div>

      {/* Clientes Grid */}
      {filteredClientes.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'No se encontraron clientes con ese criterio' : 'Comienza creando tu primer cliente'}
          </p>
          {canCreateEdit && !searchTerm && (
            <button
              onClick={onCreateClick}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crear Cliente
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClientes.map((cliente) => (
            <div
              key={cliente.cliente_id}
              className="card hover:shadow-xl transition-shadow duration-200 relative"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`badge ${
                    cliente.activo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {cliente.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Cliente Info */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2 pr-20">
                  {cliente.razon_social}
                </h3>
                <p className="text-sm font-medium text-gray-600 mb-3">
                  NIT/CC: <span className="text-gray-900">{cliente.nit_cc}</span>
                </p>

                <div className="space-y-2">
                  {cliente.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-primary-500" />
                      <span className="truncate">{cliente.email}</span>
                    </div>
                  )}
                  {cliente.telefono && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-primary-500" />
                      {cliente.telefono}
                    </div>
                  )}
                  {(cliente.ciudad || cliente.departamento) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                      {[cliente.ciudad, cliente.departamento].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                {canCreateEdit && (
                  <button
                    onClick={() => onEditClick(cliente)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                )}
                {canToggleActive && (
                  <button
                    onClick={() => handleToggleActive(cliente.cliente_id, cliente.activo, cliente.razon_social)}
                    className={`flex-1 ${
                      cliente.activo
                        ? 'bg-orange-50 hover:bg-orange-100 text-orange-600'
                        : 'bg-green-50 hover:bg-green-100 text-green-600'
                    } font-medium py-2 px-4 rounded-lg transition-colors duration-200`}
                  >
                    {cliente.activo ? 'Desactivar' : 'Activar'}
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(cliente.cliente_id, cliente.razon_social)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
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

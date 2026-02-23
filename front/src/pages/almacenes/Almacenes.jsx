import { useState, useEffect } from 'react';
import { Warehouse, Plus, Package, TrendingUp, ArrowLeftRight, Eye, Edit2, Trash2, Building2 } from 'lucide-react';
import { bodegasAPI } from '../../services/api';
import BodegaForm from './BodegaForm';
import InventarioBodega from './InventarioBodega';
import TransferenciaForm from './TransferenciaForm';
import useAuthStore from '../../store/authStore';

export default function Almacenes() {
  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBodegaForm, setShowBodegaForm] = useState(false);
  const [showTransferenciaForm, setShowTransferenciaForm] = useState(false);
  const [selectedBodega, setSelectedBodega] = useState(null);
  const [selectedBodegaInventario, setSelectedBodegaInventario] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useAuthStore();

  const canManage = ['Jefe_Bodega', 'Administrador'].includes(user?.rol);
  const canDelete = user?.rol === 'Administrador';

  useEffect(() => {
    loadBodegas();
  }, [refreshTrigger]);

  const loadBodegas = async () => {
    try {
      setLoading(true);
      const response = await bodegasAPI.getAll({ activa: true });
      setBodegas(response.data.data || []);
    } catch (error) {
      console.error('Error loading bodegas:', error);
      alert('Error al cargar las bodegas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedBodega(null);
    setShowBodegaForm(true);
  };

  const handleEditClick = (bodega) => {
    setSelectedBodega(bodega);
    setShowBodegaForm(true);
  };

  const handleDeleteClick = async (bodega) => {
    if (!confirm(`¿Estás seguro de eliminar la bodega "${bodega.nombre}"?`)) {
      return;
    }

    try {
      await bodegasAPI.delete(bodega.bodega_id);
      alert('Bodega eliminada exitosamente');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting bodega:', error);
      alert(error.response?.data?.message || 'Error al eliminar bodega');
    }
  };

  const handleViewInventario = (bodega) => {
    setSelectedBodegaInventario(bodega);
  };

  const handleBodegaFormSuccess = () => {
    setShowBodegaForm(false);
    setSelectedBodega(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTransferenciaSuccess = () => {
    setShowTransferenciaForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  if (selectedBodegaInventario) {
    return (
      <InventarioBodega
        bodega={selectedBodegaInventario}
        onClose={() => setSelectedBodegaInventario(null)}
      />
    );
  }

  if (showBodegaForm) {
    return (
      <BodegaForm
        bodega={selectedBodega}
        onClose={() => {
          setShowBodegaForm(false);
          setSelectedBodega(null);
        }}
        onSuccess={handleBodegaFormSuccess}
      />
    );
  }

  if (showTransferenciaForm) {
    return (
      <TransferenciaForm
        bodegas={bodegas}
        onClose={() => setShowTransferenciaForm(false)}
        onSuccess={handleTransferenciaSuccess}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando almacenes...</p>
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
              <Warehouse className="h-8 w-8 mr-3 text-primary-600" />
              Almacenes / Bodegas
            </h2>
            <p className="text-gray-600 mt-1">Gestiona múltiples bodegas y transfiere productos entre ellas</p>
          </div>
          {canManage && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowTransferenciaForm(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center"
              >
                <ArrowLeftRight className="h-5 w-5 mr-2" />
                Transferir Productos
              </button>
              <button
                onClick={handleCreateClick}
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nueva Bodega
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Bodegas</p>
              <p className="text-3xl font-bold mt-1">{bodegas.length}</p>
            </div>
            <Building2 className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Productos</p>
              <p className="text-3xl font-bold mt-1">
                {bodegas.reduce((sum, b) => sum + parseInt(b.total_productos || 0), 0)}
              </p>
            </div>
            <Package className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Unidades</p>
              <p className="text-3xl font-bold mt-1">
                {bodegas.reduce((sum, b) => sum + parseInt(b.total_items || 0), 0)}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Bodegas Activas</p>
              <p className="text-3xl font-bold mt-1">
                {bodegas.filter(b => b.activa).length}
              </p>
            </div>
            <Warehouse className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Bodegas List */}
      {bodegas.length === 0 ? (
        <div className="card text-center py-12">
          <Warehouse className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay bodegas</h3>
          <p className="text-gray-600 mb-6">Comienza creando tu primera bodega</p>
          {canManage && (
            <button
              onClick={handleCreateClick}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crear Bodega
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bodegas.map((bodega) => (
            <div
              key={bodega.bodega_id}
              className="card hover:shadow-xl transition-all duration-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Warehouse className="h-5 w-5 text-primary-500 mr-2" />
                    <h3 className="text-lg font-bold text-gray-900">{bodega.nombre}</h3>
                  </div>
                  <p className="text-sm text-gray-500 font-mono">{bodega.codigo}</p>
                </div>
                <span className={`badge ${bodega.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {bodega.activa ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              {/* Info */}
              {bodega.ciudad && (
                <p className="text-sm text-gray-600 mb-2">
                  📍 {bodega.ciudad}
                </p>
              )}

              {bodega.responsable_nombre && (
                <p className="text-sm text-gray-600 mb-3">
                  👤 {bodega.responsable_nombre}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Productos</p>
                  <p className="text-xl font-bold text-blue-600">{bodega.total_productos || 0}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Unidades</p>
                  <p className="text-xl font-bold text-green-600">{bodega.total_items || 0}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewInventario(bodega)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                >
                  <Eye className="h-4 w-4" />
                  Inventario
                </button>
                {canManage && (
                  <button
                    onClick={() => handleEditClick(bodega)}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDeleteClick(bodega)}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
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

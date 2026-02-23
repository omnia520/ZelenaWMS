import { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import { averiasAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import AveriasList from './AveriasList';
import AveriaForm from './AveriaForm';
import AveriaDetalle from './AveriaDetalle';

export default function Averias() {
  const [view, setView] = useState('list'); // 'list', 'form', 'detail'
  const [selectedAveriaId, setSelectedAveriaId] = useState(null);
  const [stats, setStats] = useState({ total: 0, pendientes: 0, repuestas: 0, descartadas: 0 });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const response = await averiasAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleAveriaCreated = () => {
    setView('list');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewDetail = (averiaId) => {
    setSelectedAveriaId(averiaId);
    setView('detail');
  };

  const handleCloseDetail = () => {
    setSelectedAveriaId(null);
    setView('list');
    setRefreshTrigger(prev => prev + 1);
  };

  // Vista de detalle
  if (view === 'detail' && selectedAveriaId) {
    return (
      <AveriaDetalle
        averiaId={selectedAveriaId}
        onClose={handleCloseDetail}
        onUpdate={() => setRefreshTrigger(prev => prev + 1)}
      />
    );
  }

  // Vista de formulario
  if (view === 'form') {
    return (
      <AveriaForm
        onClose={() => setView('list')}
        onSuccess={handleAveriaCreated}
      />
    );
  }

  // Vista principal (lista)
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8 mr-3 text-yellow-500 flex-shrink-0" />
              Gestión de Averías
            </h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Registra y gestiona productos averiados</p>
          </div>
          <button
            onClick={() => setView('form')}
            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Registrar Avería
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-l-4 border-gray-400 !p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Averías</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {loadingStats ? '-' : stats.total}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-gray-200 rounded-full">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-400 !p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-yellow-700">Pendientes</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-900">
                {loadingStats ? '-' : stats.pendientes}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-yellow-200 rounded-full">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-400 !p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-green-700">Repuestas</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-900">
                {loadingStats ? '-' : stats.repuestas}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-200 rounded-full">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-400 !p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-red-700">Descartadas</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-900">
                {loadingStats ? '-' : stats.descartadas}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-red-200 rounded-full">
              <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Averías */}
      <AveriasList
        onViewDetail={handleViewDetail}
        refreshTrigger={refreshTrigger}
        onRefresh={() => setRefreshTrigger(prev => prev + 1)}
      />
    </div>
  );
}

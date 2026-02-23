import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, RefreshCw, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import { formatDate } from '../../utils/dateUtils';

export default function ListaAlistamiento() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener TODAS las órdenes (sin filtrar por operario asignado)
      // Todos los operarios ven todas las órdenes disponibles
      const response = await api.get('/ordenes');

      // Filtrar las órdenes Aprobadas, En_Alistamiento o En_Empaque
      // Esto permite ver órdenes que se están empacando mientras se alistan
      const ordenesFiltradas = response.data.data.filter(
        orden => orden.estado === 'Aprobada' || orden.estado === 'En_Alistamiento' || orden.estado === 'En_Empaque'
      );

      setOrdenes(ordenesFiltradas);
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
      setError('Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, [user.usuario_id]);

  const handleComenzar = async (ordenId) => {
    try {
      await api.post(`/ordenes/${ordenId}/iniciar-alistamiento`);
      navigate(`/actividades/alistamiento/${ordenId}`);
    } catch (err) {
      console.error('Error al iniciar alistamiento:', err);
      alert('Error al iniciar el alistamiento');
    }
  };

  const handleReanudar = (ordenId) => {
    navigate(`/actividades/alistamiento/${ordenId}`);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return formatDate(fecha);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/actividades')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Alistamiento de Órdenes</h1>
        </div>
        <button
          onClick={fetchOrdenes}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualizar</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {ordenes.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No tienes órdenes asignadas para alistar</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {ordenes.map((orden) => (
            <div
              key={orden.orden_id}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Número de Orden</p>
                    <p className="font-semibold text-lg">{orden.numero_orden}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Cliente</p>
                    <p className="font-medium">{orden.cliente_nombre || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Fecha de Aprobación</p>
                    <p className="font-medium">{formatFecha(orden.fecha_aprobacion)}</p>
                  </div>
                </div>

                <div className="ml-6">
                  {orden.estado === 'Aprobada' && !orden.fecha_inicio_alistamiento ? (
                    <button
                      onClick={() => handleComenzar(orden.orden_id)}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Play className="h-5 w-5" />
                      <span>Comenzar</span>
                    </button>
                  ) : (orden.estado === 'Aprobada' && orden.fecha_inicio_alistamiento) || orden.estado === 'En_Alistamiento' || orden.estado === 'En_Empaque' ? (
                    <button
                      onClick={() => handleReanudar(orden.orden_id)}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <RefreshCw className="h-5 w-5" />
                      <span>Reanudar</span>
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    orden.estado === 'Aprobada'
                      ? 'bg-blue-100 text-blue-700'
                      : orden.estado === 'En_Empaque'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {orden.estado === 'Aprobada' ? 'Aprobada' : orden.estado === 'En_Empaque' ? 'En Empaque' : 'En Alistamiento'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Total: ${parseFloat(orden.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {orden.comentarios && (
                  <div className="mt-3 flex items-start space-x-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">Observaciones:</p>
                      <p className="text-sm text-blue-800">{orden.comentarios}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Package, Box, Clock, Timer, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { desempenoAPI } from '../../services/api';
import KPICard from './components/KPICard';
import FiltrosDesempeno from './components/FiltrosDesempeno';
import TablaActividades from './components/TablaActividades';

// Función para formatear duración
const formatDuration = (segundos) => {
  if (!segundos || segundos === 0) return '0m';
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);

  if (horas > 0) {
    return `${horas}h ${minutos}m`;
  }
  return `${minutos}m`;
};

export default function DesempenoOperario() {
  // Estado para filtros
  const [fechaInicio, setFechaInicio] = useState(() => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 30);
    return fecha.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [tipoActividad, setTipoActividad] = useState('');

  // Estado para datos
  const [kpis, setKpis] = useState(null);
  const [historial, setHistorial] = useState({ actividades: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async (nuevaFechaInicio, nuevaFechaFin) => {
    setLoading(true);
    setError(null);

    // Validar que los parámetros sean strings de fecha válidos, no eventos
    const esStringFecha = (val) => typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val);

    // Usar parámetros si se pasan y son válidos, de lo contrario usar el estado actual
    const fechaInicioParam = esStringFecha(nuevaFechaInicio) ? nuevaFechaInicio : fechaInicio;
    const fechaFinParam = esStringFecha(nuevaFechaFin) ? nuevaFechaFin : fechaFin;

    try {
      const params = {
        fecha_inicio: fechaInicioParam,
        fecha_fin: fechaFinParam,
        tipo_actividad: tipoActividad || undefined
      };

      // Cargar KPIs y historial en paralelo
      const [kpisResponse, historialResponse] = await Promise.all([
        desempenoAPI.getMiDesempeno(params),
        desempenoAPI.getMiHistorial({ ...params, page: 1, limit: 20 })
      ]);

      setKpis(kpisResponse.data.data.kpis);
      setHistorial(historialResponse.data.data);
      setPage(1);
    } catch (err) {
      console.error('Error cargando desempeño:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar los datos de desempeño';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const cargarHistorial = async (nuevaPagina) => {
    setLoadingHistorial(true);

    try {
      const params = {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        tipo_actividad: tipoActividad || undefined,
        page: nuevaPagina,
        limit: 20
      };

      const response = await desempenoAPI.getMiHistorial(params);
      setHistorial(response.data.data);
      setPage(nuevaPagina);
    } catch (err) {
      console.error('Error cargando historial:', err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Calcular KPIs combinados o por tipo
  const getKPIsToShow = () => {
    if (!kpis) return null;

    if (tipoActividad === 'Picking' && kpis.picking) {
      return {
        ...kpis.picking,
        tipo: 'Picking'
      };
    }

    if (tipoActividad === 'Packing' && kpis.packing) {
      return {
        ...kpis.packing,
        tipo: 'Packing'
      };
    }

    // Combinar ambos
    const picking = kpis.picking || {};
    const packing = kpis.packing || {};

    return {
      ordenes_completadas: (picking.ordenes_completadas || 0) + (packing.ordenes_completadas || 0),
      unidades_procesadas: (picking.unidades_procesadas || 0) + (packing.unidades_procesadas || 0),
      tiempo_total_segundos: (picking.tiempo_total_segundos || 0) + (packing.tiempo_total_segundos || 0),
      en_progreso: (picking.en_progreso || 0) + (packing.en_progreso || 0),
      picking: kpis.picking,
      packing: kpis.packing,
      tipo: 'Todos'
    };
  };

  const kpisToShow = getKPIsToShow();

  // Calcular productividad
  const calcularProductividad = (ordenes, tiempo) => {
    if (!tiempo || tiempo === 0) return 0;
    const horas = tiempo / 3600;
    return (ordenes / horas).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-8 sm:py-12">
        <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-red-400 mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Error</h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={cargarDatos}
          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filtros */}
      <FiltrosDesempeno
        fechaInicio={fechaInicio}
        setFechaInicio={setFechaInicio}
        fechaFin={fechaFin}
        setFechaFin={setFechaFin}
        tipoActividad={tipoActividad}
        setTipoActividad={setTipoActividad}
        onBuscar={cargarDatos}
        loading={loading}
      />

      {/* KPIs principales */}
      {kpisToShow && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
          <KPICard
            title="Órdenes Completadas"
            value={kpisToShow.ordenes_completadas?.toLocaleString() || 0}
            icon={Package}
            color="blue"
          />
          <KPICard
            title="Unidades Procesadas"
            value={kpisToShow.unidades_procesadas?.toLocaleString() || 0}
            icon={Box}
            color="green"
          />
          <KPICard
            title="Tiempo Total"
            value={formatDuration(kpisToShow.tiempo_total_segundos)}
            icon={Clock}
            color="purple"
          />
          <KPICard
            title="Tiempo Promedio"
            value={formatDuration(
              kpisToShow.ordenes_completadas > 0
                ? kpisToShow.tiempo_total_segundos / kpisToShow.ordenes_completadas
                : 0
            )}
            subtitle="por orden"
            icon={Timer}
            color="orange"
          />
          <KPICard
            title="Órdenes/Hora"
            value={calcularProductividad(kpisToShow.ordenes_completadas, kpisToShow.tiempo_total_segundos)}
            icon={Zap}
            color="indigo"
          />
          <KPICard
            title="Unidades/Hora"
            value={calcularProductividad(kpisToShow.unidades_procesadas, kpisToShow.tiempo_total_segundos)}
            icon={TrendingUp}
            color="cyan"
          />
        </div>
      )}

      {/* Actividades en progreso */}
      {kpisToShow && kpisToShow.en_progreso > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium text-sm sm:text-base">
              {kpisToShow.en_progreso} {kpisToShow.en_progreso === 1 ? 'actividad' : 'actividades'} en progreso
            </span>
          </div>
        </div>
      )}

      {/* Detalle por tipo (si no hay filtro) */}
      {!tipoActividad && kpis && (kpis.picking || kpis.packing) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Picking */}
          {kpis.picking && (
            <div className="card bg-blue-50 border border-blue-200">
              <div className="flex items-center mb-2 sm:mb-3">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-1.5 sm:mr-2" />
                <h4 className="font-semibold text-blue-900 text-sm sm:text-base">Picking (Alistamiento)</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-blue-600">Órdenes:</span>
                  <span className="ml-1 sm:ml-2 font-semibold text-blue-900">{kpis.picking.ordenes_completadas || 0}</span>
                </div>
                <div>
                  <span className="text-blue-600">Unidades:</span>
                  <span className="ml-1 sm:ml-2 font-semibold text-blue-900">{kpis.picking.unidades_procesadas || 0}</span>
                </div>
                <div>
                  <span className="text-blue-600">Tiempo:</span>
                  <span className="ml-1 sm:ml-2 font-semibold text-blue-900">{formatDuration(kpis.picking.tiempo_total_segundos)}</span>
                </div>
                <div>
                  <span className="text-blue-600">Órd/hora:</span>
                  <span className="ml-1 sm:ml-2 font-semibold text-blue-900">{kpis.picking.ordenes_por_hora || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Packing */}
          {kpis.packing && (
            <div className="card bg-purple-50 border border-purple-200">
              <div className="flex items-center mb-2 sm:mb-3">
                <Box className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mr-1.5 sm:mr-2" />
                <h4 className="font-semibold text-purple-900 text-sm sm:text-base">Packing (Empaque)</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-purple-600">Órdenes:</span>
                  <span className="ml-1 sm:ml-2 font-semibold text-purple-900">{kpis.packing.ordenes_completadas || 0}</span>
                </div>
                <div>
                  <span className="text-purple-600">Unidades:</span>
                  <span className="ml-1 sm:ml-2 font-semibold text-purple-900">{kpis.packing.unidades_procesadas || 0}</span>
                </div>
                <div>
                  <span className="text-purple-600">Tiempo:</span>
                  <span className="ml-1 sm:ml-2 font-semibold text-purple-900">{formatDuration(kpis.packing.tiempo_total_segundos)}</span>
                </div>
                <div>
                  <span className="text-purple-600">Órd/hora:</span>
                  <span className="ml-1 sm:ml-2 font-semibold text-purple-900">{kpis.packing.ordenes_por_hora || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabla de historial */}
      <TablaActividades
        actividades={historial.actividades}
        pagination={historial.pagination}
        onPageChange={cargarHistorial}
        loading={loadingHistorial}
      />
    </div>
  );
}

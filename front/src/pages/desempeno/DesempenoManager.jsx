import { useState, useEffect } from 'react';
import { Package, Box, Clock, Zap, Users, ArrowLeft, AlertCircle } from 'lucide-react';
import { desempenoAPI } from '../../services/api';
import KPICard from './components/KPICard';
import FiltrosDesempeno from './components/FiltrosDesempeno';
import TablaDesempenoUsuarios from './components/TablaDesempenoUsuarios';
import TablaActividades from './components/TablaActividades';
import RankingCard from './components/RankingCard';

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

export default function DesempenoManager() {
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
  const [kpisGlobales, setKpisGlobales] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [rankingUnidades, setRankingUnidades] = useState([]);
  const [rankingOrdenes, setRankingOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para drill-down
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [kpisUsuario, setKpisUsuario] = useState(null);
  const [historialUsuario, setHistorialUsuario] = useState({ actividades: [], pagination: {} });
  const [loadingUsuario, setLoadingUsuario] = useState(false);
  const [pageUsuario, setPageUsuario] = useState(1);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async (nuevaFechaInicio, nuevaFechaFin) => {
    setLoading(true);
    setError(null);
    setUsuarioSeleccionado(null);

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

      // Cargar todo en paralelo
      const [globalResponse, usuariosResponse, rankUnidadesRes, rankOrdenesRes] = await Promise.all([
        desempenoAPI.getGlobal(params),
        desempenoAPI.getPorUsuario(params),
        desempenoAPI.getRankings({ ...params, metrica: 'unidades', limite: 5, tipo_actividad: tipoActividad || 'Picking' }),
        desempenoAPI.getRankings({ ...params, metrica: 'ordenes', limite: 5, tipo_actividad: tipoActividad || 'Picking' })
      ]);

      setKpisGlobales(globalResponse.data.data.kpis);
      setUsuarios(usuariosResponse.data.data);
      setRankingUnidades(rankUnidadesRes.data.data.rankings);
      setRankingOrdenes(rankOrdenesRes.data.data.rankings);
    } catch (err) {
      console.error('Error cargando datos manager:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar los datos de desempeño';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos de usuario seleccionado (drill-down)
  const cargarDatosUsuario = async (usuario) => {
    setUsuarioSeleccionado(usuario);
    setLoadingUsuario(true);

    try {
      const params = {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        tipo_actividad: tipoActividad || undefined
      };

      const [kpisRes, historialRes] = await Promise.all([
        desempenoAPI.getUsuarioDesempeno(usuario.usuario_id, params),
        desempenoAPI.getUsuarioHistorial(usuario.usuario_id, { ...params, page: 1, limit: 20 })
      ]);

      setKpisUsuario(kpisRes.data.data.kpis);
      setHistorialUsuario(historialRes.data.data);
      setPageUsuario(1);
    } catch (err) {
      console.error('Error cargando datos de usuario:', err);
    } finally {
      setLoadingUsuario(false);
    }
  };

  const cargarHistorialUsuario = async (nuevaPagina) => {
    if (!usuarioSeleccionado) return;

    try {
      const params = {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        tipo_actividad: tipoActividad || undefined,
        page: nuevaPagina,
        limit: 20
      };

      const response = await desempenoAPI.getUsuarioHistorial(usuarioSeleccionado.usuario_id, params);
      setHistorialUsuario(response.data.data);
      setPageUsuario(nuevaPagina);
    } catch (err) {
      console.error('Error cargando historial:', err);
    }
  };

  // Calcular KPIs combinados
  const getKPIsGlobalesDisplay = () => {
    if (!kpisGlobales) return null;

    const picking = kpisGlobales.picking || {};
    const packing = kpisGlobales.packing || {};

    if (tipoActividad === 'Picking') return picking;
    if (tipoActividad === 'Packing') return packing;

    // Combinar
    return {
      ordenes_completadas: (picking.ordenes_completadas || 0) + (packing.ordenes_completadas || 0),
      unidades_procesadas: (picking.unidades_procesadas || 0) + (packing.unidades_procesadas || 0),
      tiempo_total_segundos: (picking.tiempo_total_segundos || 0) + (packing.tiempo_total_segundos || 0),
      en_progreso: (picking.en_progreso || 0) + (packing.en_progreso || 0),
      operarios_activos: Math.max(picking.operarios_activos || 0, packing.operarios_activos || 0)
    };
  };

  const calcularProductividad = (valor, tiempo) => {
    if (!tiempo || tiempo === 0) return 0;
    const horas = tiempo / 3600;
    return (valor / horas).toFixed(1);
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

  // Vista de drill-down (usuario seleccionado)
  if (usuarioSeleccionado) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header con botón volver */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setUsuarioSeleccionado(null)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
            Volver al resumen
          </button>
        </div>

        {/* Info del usuario */}
        <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200">
          <div className="flex items-center">
            <div className="bg-primary-500 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">{usuarioSeleccionado.nombre}</h2>
              <p className="text-sm text-gray-600">Detalle de desempeño</p>
            </div>
          </div>
        </div>

        {loadingUsuario ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600">Cargando datos...</span>
          </div>
        ) : (
          <>
            {/* KPIs del usuario */}
            {kpisUsuario && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                <KPICard
                  title="Órdenes Picking"
                  value={kpisUsuario.picking?.ordenes_completadas?.toLocaleString() || 0}
                  icon={Package}
                  color="blue"
                />
                <KPICard
                  title="Unidades Picking"
                  value={kpisUsuario.picking?.unidades_procesadas?.toLocaleString() || 0}
                  icon={Package}
                  color="blue"
                />
                <KPICard
                  title="Órdenes Packing"
                  value={kpisUsuario.packing?.ordenes_completadas?.toLocaleString() || 0}
                  icon={Box}
                  color="purple"
                />
                <KPICard
                  title="Unidades Packing"
                  value={kpisUsuario.packing?.unidades_procesadas?.toLocaleString() || 0}
                  icon={Box}
                  color="purple"
                />
              </div>
            )}

            {/* Historial del usuario */}
            <TablaActividades
              actividades={historialUsuario.actividades}
              pagination={historialUsuario.pagination}
              onPageChange={cargarHistorialUsuario}
            />
          </>
        )}
      </div>
    );
  }

  // Vista principal del manager
  const kpisDisplay = getKPIsGlobalesDisplay();

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

      {/* KPIs globales */}
      {kpisDisplay && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
          <KPICard
            title="Órdenes Completadas"
            value={kpisDisplay.ordenes_completadas?.toLocaleString() || 0}
            icon={Package}
            color="blue"
          />
          <KPICard
            title="Unidades Procesadas"
            value={kpisDisplay.unidades_procesadas?.toLocaleString() || 0}
            icon={Box}
            color="green"
          />
          <KPICard
            title="Tiempo Total"
            value={formatDuration(kpisDisplay.tiempo_total_segundos)}
            icon={Clock}
            color="purple"
          />
          <KPICard
            title="Órdenes/Hora"
            value={calcularProductividad(kpisDisplay.ordenes_completadas, kpisDisplay.tiempo_total_segundos)}
            icon={Zap}
            color="orange"
          />
          <KPICard
            title="Operarios Activos"
            value={kpisDisplay.operarios_activos || 0}
            icon={Users}
            color="indigo"
          />
        </div>
      )}

      {/* En progreso */}
      {kpisDisplay && kpisDisplay.en_progreso > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium text-sm sm:text-base">
              {kpisDisplay.en_progreso} {kpisDisplay.en_progreso === 1 ? 'actividad' : 'actividades'} en progreso actualmente
            </span>
          </div>
        </div>
      )}

      {/* Rankings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <RankingCard
          title={`Top 5 - Más Unidades ${tipoActividad || 'Picking'}`}
          rankings={rankingUnidades}
          metrica="unidades"
        />
        <RankingCard
          title={`Top 5 - Más Órdenes ${tipoActividad || 'Picking'}`}
          rankings={rankingOrdenes}
          metrica="ordenes"
        />
      </div>

      {/* Tabla de desempeño por usuario */}
      <TablaDesempenoUsuarios
        usuarios={usuarios}
        tipoActividad={tipoActividad}
        onSelectUsuario={cargarDatosUsuario}
        loading={loading}
      />
    </div>
  );
}

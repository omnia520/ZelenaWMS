import { Calendar, Filter, RefreshCw } from 'lucide-react';

export default function FiltrosDesempeno({
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  tipoActividad,
  setTipoActividad,
  onBuscar,
  loading = false
}) {
  // Función para obtener fecha de hace 30 días
  const getFechaInicio30Dias = () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 30);
    return fecha.toISOString().split('T')[0];
  };

  // Función para obtener fecha de hoy
  const getFechaHoy = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Presets de fechas
  const aplicarPreset = (preset) => {
    const hoy = new Date();
    let inicio;

    switch (preset) {
      case 'hoy':
        inicio = new Date(hoy);
        break;
      case 'semana':
        inicio = new Date(hoy);
        inicio.setDate(inicio.getDate() - 7);
        break;
      case 'mes':
        inicio = new Date(hoy);
        inicio.setMonth(inicio.getMonth() - 1);
        break;
      case 'trimestre':
        inicio = new Date(hoy);
        inicio.setMonth(inicio.getMonth() - 3);
        break;
      default:
        inicio = new Date(hoy);
        inicio.setDate(inicio.getDate() - 30);
    }

    const nuevaFechaInicio = inicio.toISOString().split('T')[0];
    const nuevaFechaFin = hoy.toISOString().split('T')[0];

    setFechaInicio(nuevaFechaInicio);
    setFechaFin(nuevaFechaFin);

    // Disparar búsqueda con las nuevas fechas directamente
    if (onBuscar) {
      onBuscar(nuevaFechaInicio, nuevaFechaFin);
    }
  };

  return (
    <div className="card mb-4 sm:mb-6">
      {/* Filtros principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Fecha Inicio */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 inline-block mr-1" />
            Fecha Inicio
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        {/* Fecha Fin */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 inline-block mr-1" />
            Fecha Fin
          </label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        {/* Tipo de Actividad */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            <Filter className="h-3 w-3 sm:h-4 sm:w-4 inline-block mr-1" />
            Tipo de Actividad
          </label>
          <select
            value={tipoActividad}
            onChange={(e) => setTipoActividad(e.target.value)}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="">Todas</option>
            <option value="Picking">Picking (Alistamiento)</option>
            <option value="Packing">Packing (Empaque)</option>
          </select>
        </div>

        {/* Botón Buscar */}
        <div className="flex items-end">
          <button
            onClick={() => onBuscar()}
            disabled={loading}
            className="w-full px-4 sm:px-6 py-1.5 sm:py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                <span className="hidden xs:inline">Cargando...</span>
                <span className="xs:hidden">...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Actualizar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Presets de fechas */}
      <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="text-xs sm:text-sm text-gray-500 mr-1 sm:mr-2">Periodo:</span>
        <button
          onClick={() => aplicarPreset('hoy')}
          className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          Hoy
        </button>
        <button
          onClick={() => aplicarPreset('semana')}
          className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          Última semana
        </button>
        <button
          onClick={() => aplicarPreset('mes')}
          className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          Último mes
        </button>
        <button
          onClick={() => aplicarPreset('trimestre')}
          className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          Último trimestre
        </button>
      </div>
    </div>
  );
}

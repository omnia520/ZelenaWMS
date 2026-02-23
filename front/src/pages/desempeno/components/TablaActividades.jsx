import { Package, Box, Clock, CheckCircle, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// Función para formatear duración en segundos a formato legible
const formatDuration = (segundos) => {
  if (!segundos || segundos === 0) return '-';

  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = Math.floor(segundos % 60);

  if (horas > 0) {
    return `${horas}h ${minutos}m`;
  } else if (minutos > 0) {
    return `${minutos}m ${segs}s`;
  } else {
    return `${segs}s`;
  }
};

// Función para formatear fecha y hora
const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Función para formatear solo hora (para mobile)
const formatTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Función para formatear solo fecha corta (para mobile)
const formatDateShort = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit'
  });
};

export default function TablaActividades({
  actividades = [],
  pagination,
  onPageChange,
  loading = false,
  showUsuario = false
}) {
  const { page = 1, total_pages = 1, total = 0 } = pagination || {};

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600">Cargando actividades...</span>
        </div>
      </div>
    );
  }

  if (actividades.length === 0) {
    return (
      <div className="card text-center py-8 sm:py-12">
        <Clock className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">Sin actividades</h3>
        <p className="text-sm text-gray-500">No se encontraron actividades en el período seleccionado</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Historial de Actividades</h3>
        <span className="text-xs sm:text-sm text-gray-500">{total} registros</span>
      </div>

      {/* Vista móvil - Cards */}
      <div className="block md:hidden space-y-3">
        {actividades.map((actividad, index) => (
          <div
            key={`${actividad.orden_id}-${actividad.tipo_actividad}-${index}`}
            className={`border rounded-lg p-3 ${
              actividad.tipo_actividad === 'Picking'
                ? 'border-blue-200 bg-blue-50/50'
                : 'border-purple-200 bg-purple-50/50'
            }`}
          >
            {/* Header de la card */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {actividad.tipo_actividad === 'Picking' ? (
                  <Package className="h-4 w-4 text-blue-500 mr-1.5" />
                ) : (
                  <Box className="h-4 w-4 text-purple-500 mr-1.5" />
                )}
                <span className={`text-sm font-semibold ${
                  actividad.tipo_actividad === 'Picking' ? 'text-blue-700' : 'text-purple-700'
                }`}>
                  {actividad.numero_orden}
                </span>
              </div>
              {actividad.estado_actividad === 'Completada' ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-0.5" />
                  Completada
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800">
                  <PlayCircle className="h-3 w-3 mr-0.5" />
                  En Progreso
                </span>
              )}
            </div>

            {/* Info de la card */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Tipo:</span>
                <span className="ml-1 font-medium text-gray-700">{actividad.tipo_actividad}</span>
              </div>
              <div>
                <span className="text-gray-500">Unidades:</span>
                <span className="ml-1 font-semibold text-gray-900">{actividad.unidades_procesadas?.toLocaleString() || 0}</span>
              </div>
              {showUsuario && (
                <div className="col-span-2">
                  <span className="text-gray-500">Usuario:</span>
                  <span className="ml-1 font-medium text-gray-700">{actividad.usuario_nombre || '-'}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500">Inicio:</span>
                <span className="ml-1 text-gray-700">{formatDateShort(actividad.fecha_inicio)} {formatTime(actividad.fecha_inicio)}</span>
              </div>
              <div>
                <span className="text-gray-500">Duración:</span>
                <span className="ml-1 font-medium text-gray-900">{formatDuration(actividad.duracion_segundos)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden md:block overflow-x-auto -mx-4 sm:-mx-6">
        <div className="inline-block min-w-full align-middle px-4 sm:px-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 lg:px-3 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-2 lg:px-3 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actividad
                </th>
                {showUsuario && (
                  <th className="px-2 lg:px-3 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                )}
                <th className="px-2 lg:px-3 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inicio
                </th>
                <th className="px-2 lg:px-3 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fin
                </th>
                <th className="px-2 lg:px-3 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-2 lg:px-3 py-2 lg:py-3 text-right text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidades
                </th>
                <th className="px-2 lg:px-3 py-2 lg:py-3 text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {actividades.map((actividad, index) => (
                <tr key={`${actividad.orden_id}-${actividad.tipo_actividad}-${index}`} className="hover:bg-gray-50">
                  <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap">
                    <span className="font-medium text-gray-900 text-xs lg:text-sm">{actividad.numero_orden}</span>
                  </td>
                  <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {actividad.tipo_actividad === 'Picking' ? (
                        <Package className="h-3 w-3 lg:h-4 lg:w-4 text-blue-500 mr-1 lg:mr-2" />
                      ) : (
                        <Box className="h-3 w-3 lg:h-4 lg:w-4 text-purple-500 mr-1 lg:mr-2" />
                      )}
                      <span className={`text-xs lg:text-sm font-medium ${
                        actividad.tipo_actividad === 'Picking' ? 'text-blue-700' : 'text-purple-700'
                      }`}>
                        {actividad.tipo_actividad}
                      </span>
                    </div>
                  </td>
                  {showUsuario && (
                    <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-gray-600">
                      {actividad.usuario_nombre || '-'}
                    </td>
                  )}
                  <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap text-[10px] lg:text-sm text-gray-600">
                    {formatDateTime(actividad.fecha_inicio)}
                  </td>
                  <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap text-[10px] lg:text-sm text-gray-600">
                    {formatDateTime(actividad.fecha_fin)}
                  </td>
                  <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap">
                    <span className="text-xs lg:text-sm font-medium text-gray-900">
                      {formatDuration(actividad.duracion_segundos)}
                    </span>
                  </td>
                  <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap text-right">
                    <span className="text-xs lg:text-sm font-semibold text-gray-900">
                      {actividad.unidades_procesadas?.toLocaleString() || 0}
                    </span>
                  </td>
                  <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap text-center">
                    {actividad.estado_actividad === 'Completada' ? (
                      <span className="inline-flex items-center px-1.5 lg:px-2.5 py-0.5 rounded-full text-[10px] lg:text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-2.5 w-2.5 lg:h-3 lg:w-3 mr-0.5 lg:mr-1" />
                        <span className="hidden lg:inline">Completada</span>
                        <span className="lg:hidden">OK</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 lg:px-2.5 py-0.5 rounded-full text-[10px] lg:text-xs font-medium bg-yellow-100 text-yellow-800">
                        <PlayCircle className="h-2.5 w-2.5 lg:h-3 lg:w-3 mr-0.5 lg:mr-1" />
                        <span className="hidden lg:inline">En Progreso</span>
                        <span className="lg:hidden">...</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {total_pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
            Página {page} de {total_pages}
          </div>
          <div className="flex items-center space-x-2 order-1 sm:order-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-2 sm:px-3 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">Anterior</span>
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= total_pages}
              className="px-2 sm:px-3 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-0.5 sm:ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

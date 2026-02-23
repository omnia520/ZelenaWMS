import { useState } from 'react';
import { Users, ChevronUp, ChevronDown, Search, Eye, Package, Box } from 'lucide-react';

// Función para formatear duración en segundos a formato legible
const formatDuration = (segundos) => {
  if (!segundos || segundos === 0) return '-';

  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);

  if (horas > 0) {
    return `${horas}h ${minutos}m`;
  } else {
    return `${minutos}m`;
  }
};

export default function TablaDesempenoUsuarios({
  usuarios = [],
  tipoActividad = '',
  onSelectUsuario,
  loading = false
}) {
  const [sortField, setSortField] = useState('total_ordenes');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar por búsqueda
  const filteredUsuarios = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar
  const sortedUsuarios = [...filteredUsuarios].sort((a, b) => {
    let aValue, bValue;

    switch (sortField) {
      case 'nombre':
        aValue = a.nombre || '';
        bValue = b.nombre || '';
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      case 'picking_ordenes':
        aValue = a.picking?.ordenes || 0;
        bValue = b.picking?.ordenes || 0;
        break;
      case 'picking_unidades':
        aValue = a.picking?.unidades || 0;
        bValue = b.picking?.unidades || 0;
        break;
      case 'packing_ordenes':
        aValue = a.packing?.ordenes || 0;
        bValue = b.packing?.ordenes || 0;
        break;
      case 'packing_unidades':
        aValue = a.packing?.unidades || 0;
        bValue = b.packing?.unidades || 0;
        break;
      case 'total_ordenes':
      default:
        aValue = a.total_ordenes || 0;
        bValue = b.total_ordenes || 0;
        break;
    }

    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc'
      ? <ChevronUp className="h-3 w-3 lg:h-4 lg:w-4 inline-block ml-0.5" />
      : <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4 inline-block ml-0.5" />;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600">Cargando desempeño...</span>
        </div>
      </div>
    );
  }

  // Calcular totales
  const totales = {
    picking_ordenes: sortedUsuarios.reduce((sum, u) => sum + (u.picking?.ordenes || 0), 0),
    picking_unidades: sortedUsuarios.reduce((sum, u) => sum + (u.picking?.unidades || 0), 0),
    packing_ordenes: sortedUsuarios.reduce((sum, u) => sum + (u.packing?.ordenes || 0), 0),
    packing_unidades: sortedUsuarios.reduce((sum, u) => sum + (u.packing?.unidades || 0), 0),
    total_ordenes: sortedUsuarios.reduce((sum, u) => sum + (u.total_ordenes || 0), 0),
    total_unidades: sortedUsuarios.reduce((sum, u) => sum + (u.total_unidades || 0), 0)
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex items-center">
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-1.5 sm:mr-2" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Desempeño por Usuario</h3>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-auto pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      {sortedUsuarios.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
          <p className="text-sm text-gray-500">No se encontraron usuarios con actividad</p>
        </div>
      ) : (
        <>
          {/* Vista móvil - Cards */}
          <div className="block md:hidden space-y-3">
            {sortedUsuarios.map((usuario) => (
              <div
                key={usuario.usuario_id}
                className="border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900">{usuario.nombre}</span>
                  <button
                    onClick={() => onSelectUsuario(usuario)}
                    className="text-primary-600 hover:text-primary-800 font-medium text-xs flex items-center bg-primary-50 px-2 py-1 rounded-lg"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Detalle
                  </button>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 gap-2">
                  {(!tipoActividad || tipoActividad === 'Picking') && (
                    <div className="bg-blue-50 rounded-lg p-2">
                      <div className="flex items-center mb-1">
                        <Package className="h-3 w-3 text-blue-500 mr-1" />
                        <span className="text-[10px] font-medium text-blue-700">Picking</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-blue-600">{usuario.picking?.ordenes || 0} órd</span>
                        <span className="text-blue-800 font-semibold">{usuario.picking?.unidades?.toLocaleString() || 0} uds</span>
                      </div>
                    </div>
                  )}
                  {(!tipoActividad || tipoActividad === 'Packing') && (
                    <div className="bg-purple-50 rounded-lg p-2">
                      <div className="flex items-center mb-1">
                        <Box className="h-3 w-3 text-purple-500 mr-1" />
                        <span className="text-[10px] font-medium text-purple-700">Packing</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-purple-600">{usuario.packing?.ordenes || 0} órd</span>
                        <span className="text-purple-800 font-semibold">{usuario.packing?.unidades?.toLocaleString() || 0} uds</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Total órdenes:</span>
                  <span className="text-sm font-bold text-gray-900">{usuario.total_ordenes?.toLocaleString() || 0}</span>
                </div>
              </div>
            ))}

            {/* Totales móvil */}
            <div className="border-2 border-gray-300 rounded-lg p-3 bg-gray-50">
              <div className="text-sm font-semibold text-gray-900 mb-2">
                TOTALES ({sortedUsuarios.length} usuarios)
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(!tipoActividad || tipoActividad === 'Picking') && (
                  <div>
                    <span className="text-blue-600">Picking:</span>
                    <span className="ml-1 font-semibold">{totales.picking_ordenes} órd / {totales.picking_unidades.toLocaleString()} uds</span>
                  </div>
                )}
                {(!tipoActividad || tipoActividad === 'Packing') && (
                  <div>
                    <span className="text-purple-600">Packing:</span>
                    <span className="ml-1 font-semibold">{totales.packing_ordenes} órd / {totales.packing_unidades.toLocaleString()} uds</span>
                  </div>
                )}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between">
                <span className="text-gray-600 font-medium">Total órdenes:</span>
                <span className="font-bold text-gray-900">{totales.total_ordenes.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden md:block overflow-x-auto -mx-4 sm:-mx-6">
            <div className="inline-block min-w-full align-middle px-4 sm:px-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      onClick={() => handleSort('nombre')}
                      className="px-2 lg:px-3 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Usuario <SortIcon field="nombre" />
                    </th>
                    {(!tipoActividad || tipoActividad === 'Picking') && (
                      <>
                        <th
                          onClick={() => handleSort('picking_ordenes')}
                          className="px-2 lg:px-3 py-2 lg:py-3 text-right text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        >
                          <span className="hidden lg:inline">Picking</span> Órd. <SortIcon field="picking_ordenes" />
                        </th>
                        <th
                          onClick={() => handleSort('picking_unidades')}
                          className="px-2 lg:px-3 py-2 lg:py-3 text-right text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        >
                          <span className="hidden lg:inline">Picking</span> Uds. <SortIcon field="picking_unidades" />
                        </th>
                      </>
                    )}
                    {(!tipoActividad || tipoActividad === 'Packing') && (
                      <>
                        <th
                          onClick={() => handleSort('packing_ordenes')}
                          className="px-2 lg:px-3 py-2 lg:py-3 text-right text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        >
                          <span className="hidden lg:inline">Packing</span> Órd. <SortIcon field="packing_ordenes" />
                        </th>
                        <th
                          onClick={() => handleSort('packing_unidades')}
                          className="px-2 lg:px-3 py-2 lg:py-3 text-right text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        >
                          <span className="hidden lg:inline">Packing</span> Uds. <SortIcon field="packing_unidades" />
                        </th>
                      </>
                    )}
                    <th
                      onClick={() => handleSort('total_ordenes')}
                      className="px-2 lg:px-3 py-2 lg:py-3 text-right text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Total <SortIcon field="total_ordenes" />
                    </th>
                    <th className="px-2 lg:px-3 py-2 lg:py-3 text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedUsuarios.map((usuario) => (
                    <tr key={usuario.usuario_id} className="hover:bg-gray-50">
                      <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap">
                        <span className="font-medium text-gray-900 text-xs lg:text-sm">{usuario.nombre}</span>
                      </td>
                      {(!tipoActividad || tipoActividad === 'Picking') && (
                        <>
                          <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap text-right text-xs lg:text-sm text-gray-600">
                            {usuario.picking?.ordenes?.toLocaleString() || 0}
                          </td>
                          <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap text-right text-xs lg:text-sm text-gray-600">
                            {usuario.picking?.unidades?.toLocaleString() || 0}
                          </td>
                        </>
                      )}
                      {(!tipoActividad || tipoActividad === 'Packing') && (
                        <>
                          <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap text-right text-xs lg:text-sm text-gray-600">
                            {usuario.packing?.ordenes?.toLocaleString() || 0}
                          </td>
                          <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap text-right text-xs lg:text-sm text-gray-600">
                            {usuario.packing?.unidades?.toLocaleString() || 0}
                          </td>
                        </>
                      )}
                      <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap text-right">
                        <span className="font-semibold text-gray-900 text-xs lg:text-sm">
                          {usuario.total_ordenes?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => onSelectUsuario(usuario)}
                          className="text-primary-600 hover:text-primary-800 font-medium text-xs lg:text-sm flex items-center justify-center mx-auto"
                        >
                          <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-0.5 lg:mr-1" />
                          <span className="hidden lg:inline">Ver detalle</span>
                          <span className="lg:hidden">Ver</span>
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Fila de totales */}
                  <tr className="bg-gray-100 font-semibold">
                    <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-gray-900">
                      TOTALES ({sortedUsuarios.length})
                    </td>
                    {(!tipoActividad || tipoActividad === 'Picking') && (
                      <>
                        <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap text-right text-xs lg:text-sm text-gray-900">
                          {totales.picking_ordenes.toLocaleString()}
                        </td>
                        <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap text-right text-xs lg:text-sm text-gray-900">
                          {totales.picking_unidades.toLocaleString()}
                        </td>
                      </>
                    )}
                    {(!tipoActividad || tipoActividad === 'Packing') && (
                      <>
                        <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap text-right text-xs lg:text-sm text-gray-900">
                          {totales.packing_ordenes.toLocaleString()}
                        </td>
                        <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap text-right text-xs lg:text-sm text-gray-900">
                          {totales.packing_unidades.toLocaleString()}
                        </td>
                      </>
                    )}
                    <td className="px-2 lg:px-3 py-2 lg:py-3 whitespace-nowrap text-right text-xs lg:text-sm text-gray-900">
                      {totales.total_ordenes.toLocaleString()}
                    </td>
                    <td className="px-2 lg:px-3 py-2 lg:py-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

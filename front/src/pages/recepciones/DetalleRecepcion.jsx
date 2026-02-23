import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Package, Truck, Calendar, User, FileText, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { recepcionesAPI } from '../../services/api';
import { formatDate, formatDateOnly } from '../../utils/dateUtils';

export default function DetalleRecepcion({ recepcionId, onClose }) {
  const [recepcion, setRecepcion] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [recepcionId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Obtener la recepción con todos sus detalles
      const recepcionResponse = await recepcionesAPI.getById(recepcionId);
      const recepcionData = recepcionResponse.data.data;
      setRecepcion(recepcionData);
      setDetalles(recepcionData.detalles || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar la información de la recepción');
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return formatDate(fecha);
  };

  const formatFechaSolo = (fecha) => {
    if (!fecha) return 'N/A';
    return formatDateOnly(fecha);
  };

  const calcularTotalRecibido = () => {
    return detalles.reduce((sum, detalle) => sum + (detalle.cantidad_recibida || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!recepcion) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">No se encontró la recepción</p>
        <button onClick={onClose} className="mt-4 btn-primary">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onClose}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver a la lista
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalle de Recepción</h1>
            <p className="text-gray-600 mt-1">Documento {recepcion.numero_documento}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Recibido</p>
            <p className="text-3xl font-bold text-primary-600">
              {calcularTotalRecibido()} unidades
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Información General */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary-600" />
            Información General
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">N° Documento</p>
              <p className="font-medium text-lg">{recepcion.numero_documento}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de Recepción</p>
              <p className="font-medium">{formatFechaSolo(recepcion.fecha_recepcion)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de Creación (Registro en Sistema)</p>
              <p className="font-medium">{formatFecha(recepcion.fecha_creacion)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Recibido Por</p>
              <p className="font-medium">{recepcion.usuario_nombre || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Información del Proveedor */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Truck className="h-5 w-5 mr-2 text-green-600" />
            Información del Proveedor
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Proveedor</p>
              <p className="font-medium">{recepcion.proveedor || 'N/A'}</p>
            </div>
            {recepcion.proveedor_nombre && recepcion.proveedor_nombre !== recepcion.proveedor && (
              <div>
                <p className="text-sm text-gray-500">Nombre Registrado</p>
                <p className="font-medium">{recepcion.proveedor_nombre}</p>
              </div>
            )}
            {recepcion.proveedor_nit && (
              <div>
                <p className="text-sm text-gray-500">NIT</p>
                <p className="font-medium">{recepcion.proveedor_nit}</p>
              </div>
            )}
            {recepcion.proveedor_contacto && (
              <div>
                <p className="text-sm text-gray-500">Contacto</p>
                <p className="font-medium">{recepcion.proveedor_contacto}</p>
              </div>
            )}
            {recepcion.proveedor_telefono && (
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium">{recepcion.proveedor_telefono}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Observaciones */}
      {recepcion.observaciones && (
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
            Observaciones
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-gray-700">{recepcion.observaciones}</p>
          </div>
        </div>
      )}

      {/* Foto de Soporte */}
      {recepcion.foto_soporte && (
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <ImageIcon className="h-5 w-5 mr-2 text-purple-600" />
            Foto de Soporte
          </h2>
          <div className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg p-4">
            <a
              href={recepcion.foto_soporte}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
            >
              <ImageIcon className="h-5 w-5 mr-2" />
              Ver imagen de soporte
            </a>
          </div>
        </div>
      )}

      {/* Tabla de Productos Recibidos */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Package className="h-5 w-5 mr-2 text-orange-600" />
          Productos Recibidos
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N°
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad Recibida
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {detalles.map((detalle, index) => (
                <tr key={detalle.detalle_recepcion_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {detalle.producto_codigo || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {detalle.producto_nombre || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {detalle.ubicacion_codigo || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600 text-right">
                    {detalle.cantidad_recibida}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="4" className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                  TOTAL:
                </td>
                <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                  {calcularTotalRecibido()} unidades
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

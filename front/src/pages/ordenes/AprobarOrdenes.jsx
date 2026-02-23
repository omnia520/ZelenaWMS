import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Phone, MapPin, User, FileText, Loader2 } from 'lucide-react';
import { ordenesAPI } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';

export default function AprobarOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(null);

  useEffect(() => {
    cargarOrdenesPendientes();
  }, []);

  const cargarOrdenesPendientes = async () => {
    try {
      setLoading(true);
      const response = await ordenesAPI.getPendientes();
      setOrdenes(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar órdenes pendientes:', error);
      alert('Error al cargar las órdenes pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (ordenId) => {
    if (!confirm('¿Está seguro de que desea aprobar esta orden?')) {
      return;
    }

    try {
      setProcesando(ordenId);
      await ordenesAPI.updateEstado(ordenId, 'Aprobada');
      alert('Orden aprobada exitosamente');
      // Recargar lista
      cargarOrdenesPendientes();
    } catch (error) {
      console.error('Error al aprobar orden:', error);
      alert('Error al aprobar la orden');
    } finally {
      setProcesando(null);
    }
  };

  const handleRechazar = async (ordenId) => {
    const motivo = prompt('Ingrese el motivo del rechazo:');
    if (!motivo) {
      return;
    }

    try {
      setProcesando(ordenId);
      await ordenesAPI.updateEstado(ordenId, 'Rechazada', motivo);
      alert('Orden rechazada exitosamente');
      // Recargar lista
      cargarOrdenesPendientes();
    } catch (error) {
      console.error('Error al rechazar orden:', error);
      alert('Error al rechazar la orden');
    } finally {
      setProcesando(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando órdenes pendientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Aprobar Órdenes</h2>
        <p className="text-gray-600">Órdenes pendientes de aprobación</p>
      </div>

      {ordenes.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No hay órdenes pendientes de aprobación</p>
        </div>
      ) : (
        <div className="space-y-6">
          {ordenes.map((orden) => (
            <div key={orden.orden_id} className="card">
              {/* Header */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Orden: {orden.numero_orden}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Fecha: {formatDate(orden.fecha_creacion)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">
                      ${parseFloat(orden.total).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del Cliente */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Información del Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Nombre</p>
                      <p className="text-sm font-medium text-gray-900">{orden.cliente_nombre || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">NIT</p>
                      <p className="text-sm font-medium text-gray-900">{orden.cliente_nit || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="text-sm font-medium text-gray-900">{orden.cliente_telefono || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="text-sm font-medium text-gray-900">{orden.cliente_direccion || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del Vendedor */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Información del Vendedor</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Nombre</p>
                      <p className="text-sm font-medium text-gray-900">{orden.vendedor_nombre || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Celular</p>
                      <p className="text-sm font-medium text-gray-900">{orden.vendedor_telefono || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observación */}
              {orden.comentarios && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Observación</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{orden.comentarios}</p>
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleRechazar(orden.orden_id)}
                  disabled={procesando === orden.orden_id}
                  className="btn-secondary flex items-center space-x-2"
                >
                  {procesando === orden.orden_id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <span>Rechazar</span>
                </button>
                <button
                  onClick={() => handleAprobar(orden.orden_id)}
                  disabled={procesando === orden.orden_id}
                  className="btn-primary flex items-center space-x-2"
                >
                  {procesando === orden.orden_id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                  <span>Aprobar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, User, Calendar, DollarSign, FileText, Package, Hash, Percent, MessageSquare } from 'lucide-react';
import { ordenesAPI } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';

const estadoColors = {
  'Pendiente_Aprobacion': 'bg-yellow-100 text-yellow-800',
  'Aprobada': 'bg-green-100 text-green-800',
  'En_Alistamiento': 'bg-blue-100 text-blue-800',
  'En_Empaque': 'bg-purple-100 text-purple-800',
  'Lista_Facturar': 'bg-indigo-100 text-indigo-800',
  'Facturada': 'bg-emerald-100 text-emerald-800',
  'Rechazada': 'bg-red-100 text-red-800',
};

const estadoLabels = {
  'Pendiente_Aprobacion': 'Pendiente Aprobación',
  'Aprobada': 'Aprobada',
  'En_Alistamiento': 'En Alistamiento',
  'En_Empaque': 'En Empaque',
  'Lista_Facturar': 'Lista para Facturar',
  'Facturada': 'Facturada',
  'Rechazada': 'Rechazada',
};

export default function OrdenDetalle({ ordenId, onClose }) {
  const [orden, setOrden] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrdenDetalle();
  }, [ordenId]);

  const loadOrdenDetalle = async () => {
    try {
      setLoading(true);
      const response = await ordenesAPI.getById(ordenId);
      setOrden(response.data.data);
      setDetalles(response.data.data.detalles || []);
    } catch (error) {
      console.error('Error loading orden detalle:', error);
      alert('Error al cargar el detalle de la orden');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalle de la orden...</p>
        </div>
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">No se pudo cargar la orden</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onClose}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver a órdenes
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <ShoppingCart className="h-8 w-8 mr-3 text-primary-600" />
              Detalle de Orden: {orden.numero_orden}
            </h2>
            <p className="text-gray-600 mt-1">Información completa de la orden de venta</p>
          </div>
          <span className={`badge text-base px-4 py-2 ${estadoColors[orden.estado]}`}>
            {estadoLabels[orden.estado]}
          </span>
        </div>
      </div>

      {/* Información General de la Orden */}
      <div className="card mb-6 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Información General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Cliente</p>
            <p className="text-base font-semibold text-gray-900">{orden.cliente_nombre}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Vendedor</p>
            <p className="text-base font-semibold text-gray-900 flex items-center">
              <User className="h-4 w-4 mr-1 text-gray-500" />
              {orden.vendedor_nombre}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Fecha de Creación</p>
            <p className="text-base font-semibold text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
              {formatDate(orden.fecha_creacion)}
            </p>
          </div>
          {orden.fecha_aprobacion && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Fecha de Aprobación</p>
              <p className="text-base font-semibold text-gray-900 flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                {formatDate(orden.fecha_aprobacion)}
              </p>
            </div>
          )}
          {orden.aprobado_por_nombre && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Aprobado Por</p>
              <p className="text-base font-semibold text-gray-900">{orden.aprobado_por_nombre}</p>
            </div>
          )}
        </div>

        {/* Comentarios generales de la orden */}
        {orden.comentarios && (
          <div className="mt-4 pt-4 border-t border-primary-200">
            <div className="bg-white rounded-lg p-4 border border-primary-300">
              <div className="flex items-start">
                <MessageSquare className="h-5 w-5 mr-2 text-primary-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary-700 uppercase mb-2">Comentarios de la Orden:</p>
                  <p className="text-base text-gray-900">{orden.comentarios}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Productos de la Orden */}
      <div className="card mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Package className="h-6 w-6 mr-2 text-primary-600" />
          Productos de la Orden ({detalles.length})
        </h3>

        {detalles.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay productos en esta orden</p>
        ) : (
          <div className="space-y-4">
            {detalles.map((detalle, index) => (
              <div
                key={detalle.detalle_id || index}
                className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-primary-300 transition-colors"
              >
                {/* Información del Producto */}
                <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-300">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{detalle.producto_nombre}</h4>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Hash className="h-3 w-3 mr-1" />
                      Código: <span className="font-mono font-semibold ml-1">{detalle.producto_codigo}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Cantidad</p>
                    <p className="text-2xl font-bold text-primary-600">{detalle.cantidad_pedida}</p>
                    <p className="text-xs text-gray-500">unidades</p>
                  </div>
                </div>

                {/* Detalles Financieros */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Precio Unitario</p>
                    <p className="text-base font-semibold text-gray-900 flex items-center">
                      <DollarSign className="h-4 w-4 mr-0.5" />
                      {formatPrice(detalle.precio_unitario)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Descuento</p>
                    <p className="text-base font-semibold text-orange-600 flex items-center">
                      <Percent className="h-4 w-4 mr-0.5" />
                      {detalle.descuento_porcentaje || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Subtotal</p>
                    <p className="text-base font-bold text-green-600 flex items-center">
                      <DollarSign className="h-4 w-4 mr-0.5" />
                      {formatPrice(detalle.subtotal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Progreso</p>
                    <p className="text-sm text-gray-700">
                      Alistado: <span className="font-semibold">{detalle.cantidad_alistada || 0}</span>
                      <br />
                      Empacado: <span className="font-semibold">{detalle.cantidad_empacada || 0}</span>
                    </p>
                  </div>
                </div>

                {/* Comentarios del Item */}
                {detalle.comentarios_item && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-start">
                        <MessageSquare className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Comentarios del Item:</p>
                          <p className="text-sm text-blue-900">{detalle.comentarios_item}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totales */}
      <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de Totales</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Subtotal</p>
            <p className="text-xl font-bold text-gray-900 flex items-center">
              <DollarSign className="h-5 w-5 mr-0.5" />
              {formatPrice(orden.subtotal)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Descuentos</p>
            <p className="text-xl font-bold text-orange-600 flex items-center">
              - <DollarSign className="h-5 w-5 mr-0.5" />
              {formatPrice(orden.descuento_total)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 border-2 border-green-400">
            <p className="text-sm text-gray-600 mb-1">TOTAL</p>
            <p className="text-2xl font-black text-green-600 flex items-center">
              <DollarSign className="h-6 w-6 mr-0.5" />
              {formatPrice(orden.total)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

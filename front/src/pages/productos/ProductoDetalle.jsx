import { useState, useEffect } from 'react';
import { ArrowLeft, Package, ShoppingCart, Calendar, User, DollarSign, FileText, Percent, MessageSquare } from 'lucide-react';
import { productosAPI } from '../../services/api';
import { formatDateOnly } from '../../utils/dateUtils';

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

export default function ProductoDetalle({ producto, onClose }) {
  const [ordenes, setOrdenes] = useState([]);
  const [productoInfo, setProductoInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrdenesHistorial();
  }, [producto.producto_id]);

  const loadOrdenesHistorial = async () => {
    try {
      setLoading(true);
      const response = await productosAPI.getOrdenesHistorial(producto.producto_id);
      setOrdenes(response.data.data || []);
      setProductoInfo(response.data.producto);
    } catch (error) {
      console.error('Error loading ordenes historial:', error);
      alert('Error al cargar el historial de órdenes');
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

  const formatDate = (dateString) => {
    return formatDateOnly(dateString);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historial...</p>
        </div>
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
          Volver a productos
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Package className="h-8 w-8 mr-3 text-primary-600" />
              Historial de Órdenes
            </h2>
            <p className="text-gray-600 mt-1">
              Producto: <span className="font-semibold">{productoInfo?.nombre}</span> - Código: <span className="font-mono font-semibold">{productoInfo?.codigo}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Información del Producto */}
      <div className="card mb-6 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Código</p>
            <p className="text-lg font-mono font-bold text-gray-900">{producto.codigo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Nombre</p>
            <p className="text-lg font-semibold text-gray-900">{producto.nombre}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Categoría</p>
            <p className="text-lg font-semibold text-gray-900">
              {producto.categoria || 'N/A'}
              {producto.subcategoria && (
                <span className="block text-sm text-gray-600 mt-1">
                  {producto.subcategoria}
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Marca</p>
            <p className="text-lg font-semibold text-gray-900">{producto.marca || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total de Órdenes</p>
            <p className="text-lg font-bold text-primary-600">{ordenes.length}</p>
          </div>
        </div>
      </div>

      {/* Lista de Órdenes */}
      {ordenes.length === 0 ? (
        <div className="card text-center py-12">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes</h3>
          <p className="text-gray-600">
            Este producto no ha sido incluido en ninguna orden de venta aún.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ordenes.map((orden, index) => (
            <div key={`${orden.orden_id}-${index}`} className="card hover:shadow-lg transition-shadow duration-200">
              {/* Header de la orden */}
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary-500" />
                    {orden.numero_orden}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Cliente: <span className="font-medium text-gray-900">{orden.cliente_nombre}</span>
                  </p>
                </div>
                <span className={`badge ${estadoColors[orden.estado]}`}>
                  {estadoLabels[orden.estado]}
                </span>
              </div>

              {/* Información general de la orden */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  Vendedor: <span className="ml-1 font-medium">{orden.vendedor_nombre}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {formatDate(orden.fecha_creacion)}
                </div>
              </div>

              {/* Detalles del producto en esta orden */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Detalles del Producto en esta Orden</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cantidad</p>
                    <p className="text-sm font-semibold text-gray-900">{orden.cantidad_pedida} unidades</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Precio Unitario</p>
                    <p className="text-sm font-semibold text-primary-600 flex items-center">
                      <DollarSign className="h-3 w-3 mr-0.5" />
                      {formatPrice(orden.precio_unitario)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Descuento</p>
                    <p className="text-sm font-semibold text-orange-600 flex items-center">
                      <Percent className="h-3 w-3 mr-0.5" />
                      {orden.descuento_porcentaje || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                    <p className="text-sm font-bold text-green-600 flex items-center">
                      <DollarSign className="h-3 w-3 mr-0.5" />
                      {formatPrice(orden.subtotal)}
                    </p>
                  </div>
                </div>

                {/* Comentarios del item */}
                {orden.comentarios_item && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-start">
                      <MessageSquare className="h-4 w-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Comentarios del Item:</p>
                        <p className="text-sm text-gray-700">{orden.comentarios_item}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Comentarios generales de la orden */}
              {orden.orden_comentarios && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <MessageSquare className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Comentarios de la Orden:</p>
                      <p className="text-sm text-blue-900">{orden.orden_comentarios}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

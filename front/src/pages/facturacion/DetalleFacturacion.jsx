import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, User, MapPin, Calendar, Package, MessageSquare, Printer, CheckCircle } from 'lucide-react';
import { ordenesAPI } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';

export default function DetalleFacturacion({
  ordenId,
  onClose,
  showPrintButton = false,
  showFinalizarButton = false,
  onFinalizar
}) {
  const [orden, setOrden] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [ordenId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Obtener la orden con todos sus detalles
      const ordenResponse = await ordenesAPI.getById(ordenId);
      const ordenData = ordenResponse.data.data;
      setOrden(ordenData);
      setDetalles(ordenData.detalles || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar la información de la orden');
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return formatDate(fecha);
  };

  const calcularTotalEmpacado = () => {
    return detalles.reduce((sum, detalle) => sum + (detalle.cantidad_empacada || 0), 0);
  };

  const obtenerNumeroCajas = () => {
    // Retorna el número de cajas guardado en el empaque (a nivel de orden)
    return orden.numero_cajas || 0;
  };

  const calcularSubtotalItem = (detalle) => {
    // Calcular subtotal basado en cantidad_empacada en lugar de cantidad_pedida
    const cantidadEmpacada = detalle.cantidad_empacada || 0;
    const precioUnitario = parseFloat(detalle.precio_unitario || 0);
    const descuento = parseFloat(detalle.descuento_porcentaje || 0);

    const subtotalBruto = cantidadEmpacada * precioUnitario;
    const montoDescuento = subtotalBruto * (descuento / 100);
    return subtotalBruto - montoDescuento;
  };

  const calcularTotalFacturar = () => {
    // Calcular el total sumando todos los subtotales basados en cantidad_empacada
    return detalles.reduce((sum, detalle) => sum + calcularSubtotalItem(detalle), 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFinalizarRevision = async () => {
    if (!confirm('¿Está seguro de finalizar la revisión de esta orden?')) {
      return;
    }

    try {
      setProcessing(true);
      if (onFinalizar) {
        await onFinalizar(ordenId);
      } else {
        await ordenesAPI.finalizarRevision(ordenId);
        alert('Orden finalizada exitosamente');
      }
      onClose();
    } catch (error) {
      console.error('Error al finalizar revisión:', error);
      alert('Error al finalizar la revisión de la orden');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">No se encontró la orden</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Detalle de Facturación</h1>
            <p className="text-gray-600 mt-1">Orden {orden.numero_orden}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right mr-6">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-3xl font-bold text-primary-600">
                ${calcularTotalFacturar().toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
            </div>
            {showPrintButton && (
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Printer className="h-5 w-5" />
                <span>Imprimir PDF</span>
              </button>
            )}
            {showFinalizarButton && (
              <button
                onClick={handleFinalizarRevision}
                disabled={processing}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                <span>Finalizar Revisión</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Información General */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary-600" />
            Información General
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Fecha de Creación</p>
              <p className="font-medium">{formatFecha(orden.fecha_creacion)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vendedor</p>
              <p className="font-medium">{orden.vendedor_nombre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cantidad Empacada</p>
              <p className="font-medium">{calcularTotalEmpacado()} unidades</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cantidad de Cajas</p>
              <p className="font-medium">{obtenerNumeroCajas()} cajas</p>
            </div>
          </div>
        </div>

        {/* Información del Cliente */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-primary-600" />
            Información del Cliente
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Cliente</p>
              <p className="font-medium">{orden.cliente_nombre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cédula / NIT</p>
              <p className="font-medium">{orden.cliente_nit || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ciudad</p>
              <p className="font-medium">{orden.cliente_ciudad || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Departamento</p>
              <p className="font-medium">{orden.cliente_departamento || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dirección</p>
              <p className="font-medium">{orden.cliente_direccion || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Información del Alistador (Sacador) */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Información del Sacador
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Sacador</p>
              <p className="font-medium">{orden.alistador_nombre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Observación Sacador</p>
              <p className="font-medium text-gray-700">{orden.observacion_alistador || '—'}</p>
            </div>
          </div>
        </div>

        {/* Información del Operario de Empaque */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2 text-green-600" />
            Información del Operario de Empaque
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Operario de Empaque</p>
              <p className="font-medium">{orden.empacador_nombre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Observación de Empaque</p>
              <p className="font-medium text-gray-700">{orden.observacion_empacador || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Observación del Cliente */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-yellow-600" />
          Observación del Cliente
        </h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-gray-700">{orden.comentarios || '—'}</p>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Detalle de Productos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N°
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referencia
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad Pedida
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad Empacada
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Cajas
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Unit.
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {detalles.map((detalle, index) => (
                <tr key={detalle.detalle_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {detalle.producto_codigo || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {detalle.producto_nombre || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                    {detalle.cantidad_pedida}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600 text-right">
                    {detalle.cantidad_empacada || 0}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                    —
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${parseFloat(detalle.precio_unitario || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    ${calcularSubtotalItem(detalle).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colspan="3" className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                  TOTALES:
                </td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                  {detalles.reduce((sum, d) => sum + d.cantidad_pedida, 0)}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                  {calcularTotalEmpacado()}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">
                  {obtenerNumeroCajas()}
                </td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-sm font-bold text-primary-600 text-right">
                  ${calcularTotalFacturar().toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Resumen Totales */}
      <div className="card mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-right">
            <p className="text-sm text-gray-500">Subtotal</p>
            <p className="text-lg font-semibold text-gray-900">
              ${calcularTotalFacturar().toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total a Facturar</p>
            <p className="text-2xl font-bold text-primary-600">
              ${calcularTotalFacturar().toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

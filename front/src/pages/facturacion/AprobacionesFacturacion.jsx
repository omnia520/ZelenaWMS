import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Loader2, Eye, Printer, CheckCircle } from 'lucide-react';
import { ordenesAPI } from '../../services/api';
import DetalleFacturacion from './DetalleFacturacion';
import { formatDateShort } from '../../utils/dateUtils';

export default function AprobacionesFacturacion({ onBack }) {
  const [ordenes, setOrdenes] = useState([]);
  const [ordenesFiltradas, setOrdenesFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [processingOrden, setProcessingOrden] = useState(null);

  useEffect(() => {
    fetchOrdenes();
  }, []);

  useEffect(() => {
    filtrarOrdenes();
  }, [searchTerm, ordenes]);

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      // Obtener órdenes en estado Listo_Para_Despachar
      const response = await ordenesAPI.getAll({ estado: 'Listo_Para_Despachar' });
      setOrdenes(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      alert('Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  const filtrarOrdenes = () => {
    if (!searchTerm.trim()) {
      setOrdenesFiltradas(ordenes);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtradas = ordenes.filter((orden) => {
      return (
        orden.numero_orden?.toLowerCase().includes(term) ||
        orden.cliente_nombre?.toLowerCase().includes(term) ||
        orden.cliente_nit?.toLowerCase().includes(term) ||
        orden.vendedor_nombre?.toLowerCase().includes(term)
      );
    });
    setOrdenesFiltradas(filtradas);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return formatDateShort(fecha);
  };

  const handleFinalizarRevision = async (ordenId) => {
    if (!confirm('¿Está seguro de finalizar la revisión de esta orden?')) {
      return;
    }

    try {
      setProcessingOrden(ordenId);
      await ordenesAPI.finalizarRevision(ordenId);
      alert('Orden finalizada exitosamente');
      fetchOrdenes(); // Recargar lista
    } catch (error) {
      console.error('Error al finalizar revisión:', error);
      alert('Error al finalizar la revisión de la orden');
    } finally {
      setProcessingOrden(null);
    }
  };

  const handlePrint = (ordenId) => {
    window.print();
  };

  if (selectedOrden) {
    return (
      <DetalleFacturacion
        ordenId={selectedOrden}
        onClose={() => {
          setSelectedOrden(null);
          fetchOrdenes();
        }}
        showPrintButton={true}
        showFinalizarButton={true}
        onFinalizar={handleFinalizarRevision}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver a Facturación
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Aprobaciones - Listo para Despachar</h1>
        <p className="text-gray-600 mt-1">
          Revisa y finaliza órdenes listas para despachar
        </p>
      </div>

      {/* Barra de búsqueda */}
      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número de orden, cliente, NIT o vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de órdenes */}
      {ordenesFiltradas.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No se encontraron órdenes con ese criterio' : 'No hay órdenes listas para despachar'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {ordenesFiltradas.map((orden) => (
            <div
              key={orden.orden_id}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna Izquierda */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Número de Orden</p>
                    <p className="font-bold text-lg text-primary-600">{orden.numero_orden}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Fecha de Creación</p>
                    <p className="font-medium">{formatFecha(orden.fecha_creacion)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Vendedor</p>
                    <p className="font-medium">{orden.vendedor_nombre || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Cliente</p>
                    <p className="font-medium">{orden.cliente_nombre || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">NIT / Cédula</p>
                    <p className="font-medium">{orden.cliente_nit || 'N/A'}</p>
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Ciudad</p>
                    <p className="font-medium">{orden.cliente_ciudad || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Departamento</p>
                    <p className="font-medium">{orden.cliente_departamento || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Dirección</p>
                    <p className="font-medium">{orden.cliente_direccion || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Total</p>
                    <p className="font-bold text-xl text-green-600">
                      ${parseFloat(orden.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                  Lista para Despachar
                </span>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handlePrint(orden.orden_id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Imprimir PDF</span>
                  </button>
                  <button
                    onClick={() => setSelectedOrden(orden.orden_id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Ver Detalle</span>
                  </button>
                  <button
                    onClick={() => handleFinalizarRevision(orden.orden_id)}
                    disabled={processingOrden === orden.orden_id}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingOrden === orden.orden_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span>Finalizar Revisión</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

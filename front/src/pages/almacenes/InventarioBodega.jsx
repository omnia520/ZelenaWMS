import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Search, DollarSign, Tag, Hash, TrendingUp } from 'lucide-react';
import { bodegasAPI } from '../../services/api';

export default function InventarioBodega({ bodega, onClose }) {
  const [inventario, setInventario] = useState([]);
  const [filteredInventario, setFilteredInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyWithStock, setShowOnlyWithStock] = useState(true);

  useEffect(() => {
    loadInventario();
  }, [bodega.bodega_id, showOnlyWithStock]);

  useEffect(() => {
    filterInventario();
  }, [searchTerm, inventario]);

  const loadInventario = async () => {
    try {
      setLoading(true);
      const response = await bodegasAPI.getInventario(bodega.bodega_id, {
        con_stock: showOnlyWithStock
      });
      setInventario(response.data.data || []);
    } catch (error) {
      console.error('Error loading inventario:', error);
      alert('Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  const filterInventario = () => {
    if (!searchTerm.trim()) {
      setFilteredInventario(inventario);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = inventario.filter((item) => {
      return (
        item.producto_nombre?.toLowerCase().includes(term) ||
        item.producto_codigo?.toLowerCase().includes(term) ||
        item.producto_categoria?.toLowerCase().includes(term)
      );
    });
    setFilteredInventario(filtered);
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;
  };

  const getTotalValue = () => {
    return filteredInventario.reduce((sum, item) => {
      return sum + (item.cantidad * (item.precio_venta || 0));
    }, 0);
  };

  const getTotalItems = () => {
    return filteredInventario.reduce((sum, item) => sum + item.cantidad, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando inventario...</p>
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
          Volver a bodegas
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Package className="h-8 w-8 mr-3 text-primary-600" />
              Inventario - {bodega.nombre}
            </h2>
            <p className="text-gray-600 mt-1">
              Código: <span className="font-mono font-semibold">{bodega.codigo}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Productos Únicos</p>
              <p className="text-3xl font-bold mt-1">{filteredInventario.length}</p>
            </div>
            <Package className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Unidades</p>
              <p className="text-3xl font-bold mt-1">{getTotalItems()}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Valor Total</p>
              <p className="text-2xl font-bold mt-1">{formatPrice(getTotalValue())}</p>
            </div>
            <DollarSign className="h-12 w-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, código o categoría..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
              />
            </div>
          </div>

          {/* Filter con stock */}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyWithStock}
                onChange={(e) => setShowOnlyWithStock(e.target.checked)}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Solo con stock
              </span>
            </label>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Mostrando <span className="font-semibold">{filteredInventario.length}</span> de{' '}
          <span className="font-semibold">{inventario.length}</span> productos
        </div>
      </div>

      {/* Inventario Table */}
      {filteredInventario.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
          <p className="text-gray-600">
            {searchTerm
              ? 'No se encontraron productos con ese criterio'
              : 'Esta bodega no tiene inventario registrado'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidades Reservadas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disponible
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Venta
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventario.map((item) => (
                  <tr key={item.inventario_bodega_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm">
                        <Hash className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="font-mono font-medium text-gray-900">
                          {item.producto_codigo}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-primary-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {item.producto_nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.producto_categoria ? (
                        <div className="flex items-center text-sm text-gray-600">
                          <Tag className="h-4 w-4 mr-1 text-gray-400" />
                          {item.producto_categoria}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-bold ${item.cantidad > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                        {item.cantidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-bold ${(item.cantidad_reservada || 0) > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                        {item.cantidad_reservada || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-bold ${(item.cantidad - (item.cantidad_reservada || 0)) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {item.cantidad - (item.cantidad_reservada || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(item.precio_venta)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-bold text-primary-600">
                        {formatPrice(item.cantidad * (item.precio_venta || 0))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowLeftRight, Plus, Trash2, Package, Search, X } from 'lucide-react';
import { transferenciasAPI, bodegasAPI, productosAPI } from '../../services/api';

export default function TransferenciaForm({ bodegas, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [inventarioOrigen, setInventarioOrigen] = useState([]);
  const [formData, setFormData] = useState({
    bodega_origen_id: '',
    bodega_destino_id: '',
    observaciones: '',
    detalles: []
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    loadProductos();
  }, []);

  useEffect(() => {
    if (formData.bodega_origen_id) {
      loadInventarioOrigen();
    }
  }, [formData.bodega_origen_id]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, productos]);

  const loadProductos = async () => {
    try {
      const response = await productosAPI.getAll({ activo: true });
      setProductos(response.data.data || []);
    } catch (error) {
      console.error('Error loading productos:', error);
    }
  };

  const loadInventarioOrigen = async () => {
    try {
      const response = await bodegasAPI.getInventario(formData.bodega_origen_id, {
        con_stock: true
      });
      setInventarioOrigen(response.data.data || []);
    } catch (error) {
      console.error('Error loading inventario:', error);
    }
  };

  const filterProducts = () => {
    if (!searchTerm.trim()) {
      setFilteredProducts([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    // Filtrar solo productos que estén en el inventario de la bodega origen
    const productsWithStock = productos.filter(p => {
      const inInventory = inventarioOrigen.find(inv => inv.producto_id === p.producto_id);
      return inInventory && inInventory.cantidad > 0 &&
        (p.nombre?.toLowerCase().includes(term) || p.codigo?.toLowerCase().includes(term));
    });
    setFilteredProducts(productsWithStock.slice(0, 10));
  };

  const handleBodegaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ? parseInt(value) : '',
      // Limpiar detalles si cambia bodega origen
      detalles: name === 'bodega_origen_id' ? [] : prev.detalles
    }));
  };

  const handleAddProduct = (producto) => {
    const inventoryItem = inventarioOrigen.find(inv => inv.producto_id === producto.producto_id);
    const stockDisponible = inventoryItem?.cantidad || 0;

    // Verificar si ya está agregado
    const exists = formData.detalles.find(d => d.producto_id === producto.producto_id);
    if (exists) {
      alert('Este producto ya está en la lista');
      return;
    }

    setFormData(prev => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        {
          producto_id: producto.producto_id,
          producto_nombre: producto.nombre,
          producto_codigo: producto.codigo,
          cantidad: 1,
          stock_disponible: stockDisponible
        }
      ]
    }));

    setSearchTerm('');
    setShowProductSearch(false);
  };

  const handleRemoveProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }));
  };

  const handleCantidadChange = (index, cantidad) => {
    const detalle = formData.detalles[index];
    const newCantidad = parseInt(cantidad) || 0;

    if (newCantidad > detalle.stock_disponible) {
      alert(`Stock disponible: ${detalle.stock_disponible} unidades`);
      return;
    }

    if (newCantidad < 0) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.map((d, i) =>
        i === index ? { ...d, cantidad: newCantidad } : d
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bodega_origen_id || !formData.bodega_destino_id) {
      alert('Debes seleccionar bodega origen y destino');
      return;
    }

    if (formData.bodega_origen_id === formData.bodega_destino_id) {
      alert('La bodega origen y destino no pueden ser la misma');
      return;
    }

    if (formData.detalles.length === 0) {
      alert('Debes agregar al menos un producto');
      return;
    }

    // Validar cantidades
    const invalidDetail = formData.detalles.find(d => d.cantidad <= 0);
    if (invalidDetail) {
      alert('Todas las cantidades deben ser mayores a 0');
      return;
    }

    try {
      setLoading(true);

      const dataToSend = {
        bodega_origen_id: formData.bodega_origen_id,
        bodega_destino_id: formData.bodega_destino_id,
        observaciones: formData.observaciones,
        detalles: formData.detalles.map(d => ({
          producto_id: d.producto_id,
          cantidad: d.cantidad
        }))
      };

      await transferenciasAPI.create(dataToSend);
      alert('Transferencia realizada exitosamente');
      onSuccess();
    } catch (error) {
      console.error('Error creating transferencia:', error);
      alert(error.response?.data?.message || 'Error al crear transferencia');
    } finally {
      setLoading(false);
    }
  };

  const bodegaOrigen = bodegas.find(b => b.bodega_id === formData.bodega_origen_id);
  const bodegaDestino = bodegas.find(b => b.bodega_id === formData.bodega_destino_id);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onClose}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </button>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <ArrowLeftRight className="h-8 w-8 mr-3 text-orange-600" />
          Nueva Transferencia Entre Bodegas
        </h2>
        <p className="text-gray-600 mt-1">
          Transfiere productos de una bodega a otra
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selección de Bodegas */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Bodegas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bodega Origen */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bodega Origen <span className="text-red-500">*</span>
              </label>
              <select
                name="bodega_origen_id"
                value={formData.bodega_origen_id}
                onChange={handleBodegaChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
              >
                <option value="">Seleccionar bodega origen...</option>
                {bodegas.map(bodega => (
                  <option key={bodega.bodega_id} value={bodega.bodega_id}>
                    {bodega.nombre} ({bodega.codigo})
                  </option>
                ))}
              </select>
              {bodegaOrigen && (
                <p className="mt-2 text-sm text-gray-600">
                  📦 {bodegaOrigen.total_productos} productos • {bodegaOrigen.total_items} unidades
                </p>
              )}
            </div>

            {/* Bodega Destino */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bodega Destino <span className="text-red-500">*</span>
              </label>
              <select
                name="bodega_destino_id"
                value={formData.bodega_destino_id}
                onChange={handleBodegaChange}
                required
                disabled={!formData.bodega_origen_id}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none disabled:bg-gray-100"
              >
                <option value="">Seleccionar bodega destino...</option>
                {bodegas
                  .filter(b => b.bodega_id !== formData.bodega_origen_id)
                  .map(bodega => (
                    <option key={bodega.bodega_id} value={bodega.bodega_id}>
                      {bodega.nombre} ({bodega.codigo})
                    </option>
                  ))}
              </select>
              {bodegaDestino && (
                <p className="mt-2 text-sm text-gray-600">
                  📦 {bodegaDestino.total_productos} productos • {bodegaDestino.total_items} unidades
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Productos */}
        {formData.bodega_origen_id && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Productos a Transferir
              </h3>
              <button
                type="button"
                onClick={() => setShowProductSearch(!showProductSearch)}
                className="btn-primary flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Agregar Producto
              </button>
            </div>

            {/* Product Search */}
            {showProductSearch && (
              <div className="mb-4 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar producto por nombre o código..."
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-primary-300 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setShowProductSearch(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Search Results */}
                {filteredProducts.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.map((producto) => {
                      const inventoryItem = inventarioOrigen.find(inv => inv.producto_id === producto.producto_id);
                      return (
                        <div
                          key={producto.producto_id}
                          onClick={() => handleAddProduct(producto)}
                          className="px-4 py-3 hover:bg-primary-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{producto.nombre}</p>
                              <p className="text-sm text-gray-500">{producto.codigo}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-600">
                                Stock: {inventoryItem?.cantidad || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Products Table */}
            {formData.detalles.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">No hay productos agregados</p>
                <p className="text-sm text-gray-500 mt-1">Usa el botón de arriba para agregar productos</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Stock Disponible
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.detalles.map((detalle, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{detalle.producto_nombre}</p>
                            <p className="text-sm text-gray-500">{detalle.producto_codigo}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-semibold text-green-600">
                            {detalle.stock_disponible}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            min="1"
                            max={detalle.stock_disponible}
                            value={detalle.cantidad}
                            onChange={(e) => handleCantidadChange(index, e.target.value)}
                            className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg text-right focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Observaciones */}
        {formData.bodega_origen_id && (
          <div className="card">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              rows="3"
              placeholder="Motivo de la transferencia, notas adicionales..."
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none resize-none"
            />
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || formData.detalles.length === 0}
            className="px-6 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Procesando...
              </>
            ) : (
              <>
                <ArrowLeftRight className="h-5 w-5 mr-2" />
                Realizar Transferencia
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

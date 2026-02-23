import { useState, useEffect } from 'react';
import { X, Save, ArrowLeft, ShoppingCart, Plus, Trash2, Search, Percent, DollarSign, MessageSquare, AlertTriangle } from 'lucide-react';
import { ordenesAPI, clientesAPI, productosAPI, configAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function OrdenForm({ orden, onClose, onSuccess }) {
  const { user } = useAuthStore();
  const isViewing = !!orden;
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [searchProducto, setSearchProducto] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [searchCliente, setSearchCliente] = useState('');
  const [showClienteSearch, setShowClienteSearch] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [stockAlerts, setStockAlerts] = useState({}); // Para almacenar alertas de stock por producto
  const [inventoryEnabled, setInventoryEnabled] = useState(false); // Configuración de inventario

  const [formData, setFormData] = useState({
    cliente_id: '',
    comentarios: '',
    detalles: [],
  });

  useEffect(() => {
    loadConfig();
    loadClientes();
    loadProductos();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await configAPI.getConfig();
      setInventoryEnabled(response.data.data?.inventoryEnabled || false);
    } catch (error) {
      console.error('Error loading config:', error);
      setInventoryEnabled(false);
    }
  };

  useEffect(() => {
    if (orden) {
      // Cargar datos de la orden si está en modo vista
      loadOrdenDetails();
    }
  }, [orden]);

  const loadClientes = async () => {
    try {
      const response = await clientesAPI.getAll({ activo: true });
      setClientes(response.data.data || []);
    } catch (error) {
      console.error('Error loading clientes:', error);
    }
  };

  const loadProductos = async () => {
    try {
      const response = await productosAPI.getAll({ activo: true });
      setProductos(response.data.data || []);
    } catch (error) {
      console.error('Error loading productos:', error);
    }
  };

  const loadOrdenDetails = async () => {
    try {
      const response = await ordenesAPI.getById(orden.orden_id);
      const ordenData = response.data.data;

      // Buscar el cliente en la lista
      const cliente = clientes.find(c => c.cliente_id === ordenData.cliente_id);
      if (cliente) {
        setClienteSeleccionado(cliente);
      }

      setFormData({
        cliente_id: ordenData.cliente_id,
        comentarios: ordenData.comentarios || '',
        detalles: ordenData.detalles.map(det => ({
          producto_id: det.producto_id,
          producto_nombre: det.producto_nombre,
          producto_codigo: det.producto_codigo,
          cantidad_pedida: det.cantidad_pedida,
          precio_unitario: det.precio_unitario,
          descuento_porcentaje: det.descuento_porcentaje,
          comentarios_item: det.comentarios_item || '',
        })),
      });
    } catch (error) {
      console.error('Error loading orden details:', error);
    }
  };

  const handleSelectCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormData(prev => ({ ...prev, cliente_id: cliente.cliente_id }));
    setSearchCliente('');
    setShowClienteSearch(false);
  };

  const handleRemoveCliente = () => {
    setClienteSeleccionado(null);
    setFormData(prev => ({ ...prev, cliente_id: '' }));
  };

  const handleAddProducto = (producto) => {
    // Verificar si ya está agregado
    if (formData.detalles.find(d => d.producto_id === producto.producto_id)) {
      alert('Este producto ya está agregado a la orden');
      return;
    }

    // Verificar si hay stock disponible (solo si el inventario está habilitado)
    if (inventoryEnabled && producto.cantidad_disponible <= 0) {
      alert(`El producto "${producto.nombre}" no tiene stock disponible.`);
      return;
    }

    // Agregar el nuevo producto al inicio del array (último agregado aparece primero)
    setFormData(prev => ({
      ...prev,
      detalles: [
        {
          producto_id: producto.producto_id,
          producto_nombre: producto.nombre,
          producto_codigo: producto.codigo,
          cantidad_pedida: 1,
          precio_unitario: producto.precio_base,
          descuento_porcentaje: 0,
          comentarios_item: '',
          cantidad_disponible: producto.cantidad_disponible, // Guardar disponibilidad
          cantidad_reservada: producto.cantidad_reservada || 0,
        },
        ...prev.detalles
      ]
    }));
    setSearchProducto('');
    setShowProductSearch(false);

    // Inicializar la validación de stock para este producto (solo si el inventario está habilitado)
    if (inventoryEnabled && producto.cantidad_disponible < 1) {
      setStockAlerts(prev => ({
        ...prev,
        [producto.producto_id]: {
          mensaje: `Stock insuficiente. Disponibles: ${producto.cantidad_disponible} unidades`,
          cantidadDisponible: producto.cantidad_disponible,
          cantidadReservada: producto.cantidad_reservada || 0,
          cantidadTotal: producto.stock_actual || 0
        }
      }));
    }
  };

  const handleRemoveProducto = (index) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }));
  };

  // Verificar disponibilidad de un producto (solo si el inventario está habilitado)
  const verificarDisponibilidad = (productoId, cantidadSolicitada, cantidadDisponible) => {
    if (!inventoryEnabled) return;

    if (cantidadSolicitada > cantidadDisponible) {
      setStockAlerts(prev => ({
        ...prev,
        [productoId]: {
          mensaje: `Stock insuficiente. Disponibles: ${cantidadDisponible} unidades`,
          cantidadDisponible: cantidadDisponible
        }
      }));
    } else {
      // Limpiar alerta si hay suficiente stock
      setStockAlerts(prev => {
        const newAlerts = { ...prev };
        delete newAlerts[productoId];
        return newAlerts;
      });
    }
  };

  const handleDetalleChange = (index, field, value) => {
    const detalle = formData.detalles[index];

    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.map((det, i) =>
        i === index ? { ...det, [field]: value } : det
      )
    }));

    // Si cambió la cantidad, verificar disponibilidad
    if (field === 'cantidad_pedida' && value > 0) {
      verificarDisponibilidad(
        detalle.producto_id,
        parseInt(value),
        detalle.cantidad_disponible || 0
      );
    }
  };

  const calcularSubtotalItem = (detalle) => {
    const subtotal = detalle.cantidad_pedida * detalle.precio_unitario;
    const descuento = subtotal * (detalle.descuento_porcentaje / 100);
    return subtotal - descuento;
  };

  const calcularTotales = () => {
    let subtotal = 0;
    let descuentoTotal = 0;

    formData.detalles.forEach(det => {
      const subtotalItem = det.cantidad_pedida * det.precio_unitario;
      const descuentoItem = subtotalItem * (det.descuento_porcentaje / 100);
      subtotal += subtotalItem - descuentoItem;
      descuentoTotal += descuentoItem;
    });

    const impuestos = 0; // Sin IVA
    const total = subtotal;

    return { subtotal, descuentoTotal, impuestos, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.cliente_id) {
      alert('Debes seleccionar un cliente');
      return;
    }
    if (formData.detalles.length === 0) {
      alert('Debes agregar al menos un producto');
      return;
    }

    // Validar cantidades y precios
    for (const det of formData.detalles) {
      if (det.cantidad_pedida <= 0) {
        alert('Las cantidades deben ser mayores a 0');
        return;
      }
      if (det.precio_unitario <= 0) {
        alert('Los precios deben ser mayores a 0');
        return;
      }
    }

    try {
      setLoading(true);

      const dataToSend = {
        cliente_id: formData.cliente_id,
        comentarios: formData.comentarios,
        detalles: formData.detalles.map(det => ({
          producto_id: det.producto_id,
          cantidad_pedida: parseInt(det.cantidad_pedida),
          precio_unitario: parseFloat(det.precio_unitario),
          descuento_porcentaje: parseFloat(det.descuento_porcentaje) || 0,
          comentarios_item: det.comentarios_item || null,
        }))
      };

      await ordenesAPI.create(dataToSend);
      alert('Orden creada exitosamente');
      onSuccess();
    } catch (error) {
      console.error('Error creating orden:', error);

      // Manejar error de stock insuficiente
      if (error.response?.data?.productos_insuficientes) {
        const productosInsuf = error.response.data.productos_insuficientes;
        let mensaje = 'Stock insuficiente para los siguientes productos:\n\n';
        productosInsuf.forEach(prod => {
          mensaje += `• ${prod.nombre || prod.codigo}: ${prod.mensaje}\n`;
        });
        alert(mensaje);
      } else {
        alert(error.response?.data?.message || 'Error al crear orden');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchProducto.toLowerCase()) ||
    p.codigo.toLowerCase().includes(searchProducto.toLowerCase())
  );

  const filteredClientes = clientes.filter(c =>
    c.razon_social.toLowerCase().includes(searchCliente.toLowerCase()) ||
    c.nit_cc.toLowerCase().includes(searchCliente.toLowerCase())
  );

  const totales = calcularTotales();

  if (isViewing) {
    // Modo vista - mostrar orden de solo lectura
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={onClose}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver a la lista
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            Orden #{orden.numero_orden}
          </h2>
        </div>

        <div className="card">
          <p className="text-gray-600">Vista detallada de la orden (en desarrollo)</p>
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
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Volver a la lista
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-primary-600" />
          Nueva Orden de Venta
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Crea una nueva orden seleccionando cliente y productos
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selección de Cliente */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cliente <span className="text-red-500">*</span>
            </label>

            {/* Cliente seleccionado */}
            {clienteSeleccionado ? (
              <div className="p-3 sm:p-4 bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200 rounded-lg">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-base sm:text-lg">{clienteSeleccionado.razon_social}</h4>
                    <div className="mt-2 space-y-1 text-xs sm:text-sm text-gray-700">
                      <p className="break-words"><span className="font-medium">NIT/CC:</span> {clienteSeleccionado.nit_cc}</p>
                      {clienteSeleccionado.ciudad && (
                        <p className="break-words"><span className="font-medium">Ciudad:</span> {clienteSeleccionado.ciudad}{clienteSeleccionado.departamento ? `, ${clienteSeleccionado.departamento}` : ''}</p>
                      )}
                      {clienteSeleccionado.direccion && (
                        <p className="break-words"><span className="font-medium">Dirección:</span> {clienteSeleccionado.direccion}</p>
                      )}
                      {clienteSeleccionado.telefono && (
                        <p className="break-words"><span className="font-medium">Teléfono:</span> {clienteSeleccionado.telefono}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCliente}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0"
                    title="Cambiar cliente"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Botón para mostrar buscador */}
                <button
                  type="button"
                  onClick={() => setShowClienteSearch(!showClienteSearch)}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-gray-600 hover:text-primary-600 font-medium"
                >
                  <Search className="h-5 w-5 inline-block mr-2" />
                  Seleccionar Cliente
                </button>

                {/* Buscador de clientes */}
                {showClienteSearch && (
                  <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o NIT/CC..."
                        value={searchCliente}
                        onChange={(e) => setSearchCliente(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 outline-none"
                        autoFocus
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {filteredClientes.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No se encontraron clientes</p>
                      ) : (
                        filteredClientes.map(cliente => (
                          <button
                            key={cliente.cliente_id}
                            type="button"
                            onClick={() => handleSelectCliente(cliente)}
                            className="w-full p-3 bg-white hover:bg-blue-50 border border-gray-200 rounded-lg text-left transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{cliente.razon_social}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  <span className="font-medium">NIT/CC:</span> {cliente.nit_cc}
                                </p>
                                {cliente.ciudad && (
                                  <p className="text-sm text-gray-600">
                                    {cliente.ciudad}{cliente.departamento ? `, ${cliente.departamento}` : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-4">
            <label htmlFor="comentarios" className="block text-sm font-semibold text-gray-700 mb-2">
              Comentarios Generales
            </label>
            <textarea
              id="comentarios"
              value={formData.comentarios}
              onChange={(e) => setFormData(prev => ({ ...prev, comentarios: e.target.value }))}
              placeholder="Comentarios adicionales sobre la orden..."
              rows="3"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none resize-none"
            />
          </div>
        </div>

        {/* Productos */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Productos</h3>
            <button
              type="button"
              onClick={() => setShowProductSearch(!showProductSearch)}
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </button>
          </div>

          {/* Buscador de productos */}
          {showProductSearch && (
            <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o código..."
                  value={searchProducto}
                  onChange={(e) => setSearchProducto(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 outline-none"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredProductos.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No se encontraron productos</p>
                ) : (
                  filteredProductos.map(producto => (
                    <button
                      key={producto.producto_id}
                      type="button"
                      onClick={() => handleAddProducto(producto)}
                      className="w-full p-3 bg-white hover:bg-blue-50 border border-gray-200 rounded-lg text-left transition-colors"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{producto.nombre}</p>
                          <p className="text-sm text-gray-600">Código: {producto.codigo}</p>
                          {inventoryEnabled && (
                            <p className="text-xs text-gray-500 mt-1">
                              Stock disponible: <span className={`font-semibold ${producto.cantidad_disponible > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {producto.cantidad_disponible || 0} unidades
                              </span>
                              {producto.cantidad_reservada > 0 && (
                                <span className="text-amber-600 ml-2">
                                  ({producto.cantidad_reservada} reservadas)
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-primary-600">
                            ${producto.precio_base.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Lista de productos agregados */}
          {formData.detalles.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600">No hay productos agregados</p>
              <p className="text-sm text-gray-500 mt-1">Haz clic en "Agregar Producto" para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.detalles.map((detalle, index) => (
                <div key={index} className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base break-words">{detalle.producto_nombre}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Código: {detalle.producto_codigo}</p>
                      {inventoryEnabled && detalle.cantidad_disponible !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">
                          Disponible: <span className={`font-semibold ${detalle.cantidad_disponible > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {detalle.cantidad_disponible} unidades
                          </span>
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProducto(index)}
                      className="text-red-600 hover:text-red-700 p-1.5 sm:p-2 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {/* Cantidad */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Cantidad *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={detalle.cantidad_pedida}
                        onChange={(e) => handleDetalleChange(index, 'cantidad_pedida', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:border-primary-500 outline-none ${
                          inventoryEnabled && stockAlerts[detalle.producto_id] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {inventoryEnabled && stockAlerts[detalle.producto_id] && (
                        <div className="mt-1 flex items-start text-xs text-red-600">
                          <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                          <span>{stockAlerts[detalle.producto_id].mensaje}</span>
                        </div>
                      )}
                    </div>

                    {/* Precio Unitario */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Precio Unit. *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={detalle.precio_unitario}
                        onChange={(e) => handleDetalleChange(index, 'precio_unitario', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 outline-none"
                      />
                    </div>

                    {/* Descuento */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
                        <Percent className="h-3 w-3 mr-1" />
                        Descuento %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={detalle.descuento_porcentaje}
                        onChange={(e) => handleDetalleChange(index, 'descuento_porcentaje', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 outline-none"
                      />
                    </div>

                    {/* Subtotal */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Subtotal
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-semibold text-gray-900">
                        ${calcularSubtotalItem(detalle).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Comentarios del ítem */}
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Especificaciones (tono, color, etc.)
                    </label>
                    <input
                      type="text"
                      value={detalle.comentarios_item}
                      onChange={(e) => handleDetalleChange(index, 'comentarios_item', e.target.value)}
                      placeholder="Ej: Color rojo mate, talla M, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen de Totales */}
        {formData.detalles.length > 0 && (
          <div className="card bg-gradient-to-br from-primary-50 to-blue-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de la Orden</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-medium">${totales.subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
              </div>

              {totales.descuentoTotal > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento Total:</span>
                  <span className="font-medium">-${totales.descuentoTotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="pt-2 border-t-2 border-primary-200">
                <div className="flex justify-between text-xl font-bold text-primary-600">
                  <span>Total:</span>
                  <span>${totales.total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="text-sm text-gray-600 mt-2">
                <p>Items: {formData.detalles.length}</p>
                <p>Unidades: {formData.detalles.reduce((sum, det) => sum + parseInt(det.cantidad_pedida || 0), 0)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || formData.detalles.length === 0}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:transform-none"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm sm:text-base">Guardando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-sm sm:text-base">Crear Orden</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit2, Trash2, Tag, DollarSign, Hash, Layers } from 'lucide-react';
import { productosAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function ProductosList({ onCreateClick, onEditClick, onViewClick, refreshTrigger }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState('all');
  const [filterCategoria, setFilterCategoria] = useState('all');
  const [filterSubcategoria, setFilterSubcategoria] = useState('all');
  const [filterMarca, setFilterMarca] = useState('all');
  const { user } = useAuthStore();

  useEffect(() => {
    loadProductos();
  }, [refreshTrigger]);

  const loadProductos = async () => {
    try {
      setLoading(true);
      const response = await productosAPI.getAll();
      setProductos(response.data.data || []);
    } catch (error) {
      console.error('Error loading productos:', error);
      alert('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await productosAPI.delete(id);
      alert('Producto eliminado exitosamente');
      loadProductos();
    } catch (error) {
      console.error('Error deleting producto:', error);
      alert(error.response?.data?.message || 'Error al eliminar producto');
    }
  };

  // Filtrar productos
  const filteredProductos = productos.filter(producto => {
    const matchesSearch =
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (producto.categoria && producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (producto.subcategoria && producto.subcategoria.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (producto.marca && producto.marca.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesActivo =
      filterActivo === 'all' ||
      (filterActivo === 'active' && producto.activo) ||
      (filterActivo === 'inactive' && !producto.activo);

    const matchesCategoria =
      filterCategoria === 'all' ||
      (producto.categoria && producto.categoria === filterCategoria);

    const matchesSubcategoria =
      filterSubcategoria === 'all' ||
      (producto.subcategoria && producto.subcategoria === filterSubcategoria);

    const matchesMarca =
      filterMarca === 'all' ||
      (producto.marca && producto.marca === filterMarca);

    return matchesSearch && matchesActivo && matchesCategoria && matchesSubcategoria && matchesMarca;
  });

  // Obtener valores únicos para filtros
  const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))].sort();
  const subcategorias = [...new Set(productos.map(p => p.subcategoria).filter(Boolean))].sort();
  const marcas = [...new Set(productos.map(p => p.marca).filter(Boolean))].sort();

  // Verificar permisos
  const canCreateEdit = ['Jefe_Bodega', 'Administrador'].includes(user?.rol);
  const canDelete = ['Jefe_Bodega', 'Administrador'].includes(user?.rol);

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
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-primary-600" />
              Productos
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Gestiona el catálogo de productos</p>
          </div>
          {canCreateEdit && (
            <button
              onClick={onCreateClick}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center w-full sm:w-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Producto
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <select
                value={filterCategoria}
                onChange={(e) => {
                  setFilterCategoria(e.target.value);
                  setFilterSubcategoria('all'); // Reset subcategoria when categoria changes
                }}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none text-sm"
              >
                <option value="all">Todas las categorías</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterSubcategoria}
                onChange={(e) => setFilterSubcategoria(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none text-sm"
              >
                <option value="all">Todas las subcategorías</option>
                {subcategorias.map((subcategoria) => (
                  <option key={subcategoria} value={subcategoria}>
                    {subcategoria}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterMarca}
                onChange={(e) => setFilterMarca(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none text-sm"
              >
                <option value="all">Todas las marcas</option>
                {marcas.map((marca) => (
                  <option key={marca} value={marca}>
                    {marca}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterActivo}
                onChange={(e) => setFilterActivo(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-xs sm:text-sm text-gray-600">
          Mostrando <span className="font-semibold">{filteredProductos.length}</span> de{' '}
          <span className="font-semibold">{productos.length}</span> productos
        </div>
      </div>

      {/* Productos Grid */}
      {filteredProductos.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'No se encontraron productos con ese criterio' : 'Comienza creando tu primer producto'}
          </p>
          {canCreateEdit && !searchTerm && (
            <button
              onClick={onCreateClick}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crear Producto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProductos.map((producto) => (
            <div
              key={producto.producto_id}
              className="card hover:shadow-xl transition-shadow duration-200 relative"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`badge ${
                    producto.activo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {producto.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Producto Info */}
              <div className="mb-4">
                {/* Código */}
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Hash className="h-4 w-4 mr-1" />
                  <span className="font-mono">{producto.codigo}</span>
                </div>

                {/* Nombre */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 pr-20">
                  {producto.nombre}
                </h3>

                {/* Categoría y Subcategoría */}
                {(producto.categoria || producto.subcategoria) && (
                  <div className="space-y-1 mb-2">
                    {producto.categoria && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Tag className="h-4 w-4 mr-2 text-primary-500" />
                        <span>{producto.categoria}</span>
                      </div>
                    )}
                    {producto.subcategoria && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Layers className="h-3 w-3 mr-2 ml-6 text-primary-400" />
                        <span>{producto.subcategoria}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Marca */}
                {producto.marca && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Tag className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="font-medium">Marca: {producto.marca}</span>
                  </div>
                )}

                {/* Precios */}
                <div className="mb-3 space-y-1">
                  <div className="flex items-center text-sm text-gray-700">
                    <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                    <span className="font-medium">Compra: </span>
                    <span className="ml-1 font-bold text-green-600">{formatPrice(producto.precio_compra)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <DollarSign className="h-4 w-4 mr-1 text-blue-600" />
                    <span className="font-medium">Venta: </span>
                    <span className="ml-1 font-bold text-blue-600">{formatPrice(producto.precio_venta)}</span>
                  </div>
                </div>

                {/* Stock */}
                <div className={`text-sm font-medium ${producto.stock_actual > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  Stock: {producto.stock_actual} unidades
                </div>

                {/* Descripción */}
                {producto.descripcion && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {producto.descripcion}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                {/* Ver Detalle - Siempre visible */}
                {/* <button
                  onClick={() => onViewClick(producto)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                  title="Ver historial de órdenes"
                >
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">Ver Historial de Órdenes</span>
                </button> */}

                {/* Editar y Eliminar - Solo para roles autorizados */}
                {(canCreateEdit || canDelete) && (
                  <div className="flex gap-2">
                    {canCreateEdit && (
                      <button
                        onClick={() => onEditClick(producto)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors font-medium"
                        title="Editar producto"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span className="text-sm">Editar</span>
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(producto.producto_id, producto.nombre)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors font-medium"
                        title="Eliminar producto"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-sm">Eliminar</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

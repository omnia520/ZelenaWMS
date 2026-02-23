import { useState, useEffect } from 'react';
import { ArrowLeft, Package, DollarSign, Hash, FileText, Tag, Image, Layers } from 'lucide-react';
import { productosAPI } from '../../services/api';
import AutocompleteInput from '../../components/common/AutocompleteInput';

export default function ProductoForm({ producto, onClose, onSuccess }) {
  const isEditing = !!producto;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    subcategoria: '',
    marca: '',
    precio_base: '',
    precio_compra: '',
    precio_venta: '',
    imagen_url: '',
  });

  // Autocomplete states
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [loadingSubcategorias, setLoadingSubcategorias] = useState(false);
  const [loadingMarcas, setLoadingMarcas] = useState(false);

  // Load categorias and marcas on mount
  useEffect(() => {
    loadCategorias();
    loadMarcas();
  }, []);

  // Load subcategorias when categoria changes
  useEffect(() => {
    if (formData.categoria) {
      loadSubcategorias(formData.categoria);
    } else {
      setSubcategorias([]);
    }
  }, [formData.categoria]);

  // Load producto data when editing
  useEffect(() => {
    if (producto) {
      setFormData({
        codigo: producto.codigo || '',
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        categoria: producto.categoria || '',
        subcategoria: producto.subcategoria || '',
        marca: producto.marca || '',
        precio_base: producto.precio_base || '',
        precio_compra: producto.precio_compra || '',
        precio_venta: producto.precio_venta || '',
        imagen_url: producto.imagen_url || '',
      });
    }
  }, [producto]);

  const loadCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const response = await productosAPI.getCategories();
      setCategorias(response.data.data || []);
    } catch (error) {
      console.error('Error loading categorias:', error);
    } finally {
      setLoadingCategorias(false);
    }
  };

  const loadSubcategorias = async (categoria) => {
    try {
      setLoadingSubcategorias(true);
      const response = await productosAPI.getSubcategorias(categoria);
      setSubcategorias(response.data.data || []);
    } catch (error) {
      console.error('Error loading subcategorias:', error);
    } finally {
      setLoadingSubcategorias(false);
    }
  };

  const loadMarcas = async () => {
    try {
      setLoadingMarcas(true);
      const response = await productosAPI.getMarcas();
      setMarcas(response.data.data || []);
    } catch (error) {
      console.error('Error loading marcas:', error);
    } finally {
      setLoadingMarcas(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.codigo.trim()) {
      alert('El código del producto es requerido');
      return;
    }
    if (!formData.nombre.trim()) {
      alert('El nombre del producto es requerido');
      return;
    }

    try {
      setLoading(true);

      const dataToSend = {
        ...formData,
        precio_base: parseFloat(formData.precio_base) || 0,
        precio_compra: parseFloat(formData.precio_compra) || 0,
        precio_venta: parseFloat(formData.precio_venta) || 0,
        // Convert empty strings to null for optional fields
        categoria: formData.categoria.trim() || null,
        subcategoria: formData.subcategoria.trim() || null,
        marca: formData.marca.trim() || null,
      };

      if (isEditing) {
        await productosAPI.update(producto.producto_id, dataToSend);
        alert('Producto actualizado exitosamente');
      } else {
        await productosAPI.create(dataToSend);
        alert('Producto creado exitosamente');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving producto:', error);
      alert(error.response?.data?.message || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onClose}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver a la lista
        </button>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Package className="h-8 w-8 mr-3 text-primary-600" />
          {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>
        <p className="text-gray-600 mt-1">
          {isEditing
            ? 'Actualiza la información del producto'
            : 'Completa el formulario para crear un nuevo producto'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Código */}
          <div>
            <label htmlFor="codigo" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <Hash className="h-4 w-4 mr-2 text-primary-500" />
                Código <span className="text-red-500 ml-1">*</span>
              </div>
            </label>
            <input
              type="text"
              id="codigo"
              name="codigo"
              required
              value={formData.codigo}
              onChange={handleChange}
              placeholder="PRD-001"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">Código único del producto</p>
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <Package className="h-4 w-4 mr-2 text-primary-500" />
                Nombre <span className="text-red-500 ml-1">*</span>
              </div>
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Aceite de Cocina 1L"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
          </div>

          {/* Categoría with Autocomplete */}
          <AutocompleteInput
            value={formData.categoria}
            onChange={(value) => {
              setFormData(prev => ({
                ...prev,
                categoria: value,
                subcategoria: '' // Reset subcategoria when categoria changes
              }));
            }}
            onSelect={(value) => {
              setFormData(prev => ({
                ...prev,
                categoria: value,
                subcategoria: '' // Reset subcategoria when categoria changes
              }));
            }}
            suggestions={categorias.filter(cat =>
              cat.toLowerCase().includes(formData.categoria.toLowerCase())
            )}
            loading={loadingCategorias}
            placeholder="Ej: Alimentos, Herramientas, Limpieza"
            label="Categoría"
            icon={Tag}
          />

          {/* Subcategoría with Autocomplete */}
          <AutocompleteInput
            value={formData.subcategoria}
            onChange={(value) => {
              setFormData(prev => ({
                ...prev,
                subcategoria: value
              }));
            }}
            onSelect={(value) => {
              setFormData(prev => ({
                ...prev,
                subcategoria: value
              }));
            }}
            suggestions={subcategorias.filter(sub =>
              sub.toLowerCase().includes(formData.subcategoria.toLowerCase())
            )}
            loading={loadingSubcategorias}
            placeholder={formData.categoria ? "Ej: Lácteos, Carnes, Bebidas" : "Selecciona una categoría primero"}
            label="Subcategoría"
            icon={Layers}
            disabled={!formData.categoria}
          />
          {!formData.categoria && (
            <p className="mt-1 text-xs text-gray-500">
              Primero selecciona una categoría
            </p>
          )}

          {/* Marca with Autocomplete */}
          <AutocompleteInput
            value={formData.marca}
            onChange={(value) => {
              setFormData(prev => ({
                ...prev,
                marca: value
              }));
            }}
            onSelect={(value) => {
              setFormData(prev => ({
                ...prev,
                marca: value
              }));
            }}
            suggestions={marcas.filter(m =>
              m.toLowerCase().includes(formData.marca.toLowerCase())
            )}
            loading={loadingMarcas}
            placeholder="Ej: Nike, Samsung, Coca-Cola"
            label="Marca"
            icon={Tag}
          />

          {/* Precio Compra */}
          <div>
            <label htmlFor="precio_compra" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                Precio Compra
              </div>
            </label>
            <input
              type="number"
              id="precio_compra"
              name="precio_compra"
              min="0"
              step="0.01"
              value={formData.precio_compra}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">Precio de compra del producto</p>
          </div>

          {/* Precio Venta */}
          <div>
            <label htmlFor="precio_venta" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                Precio Venta
              </div>
            </label>
            <input
              type="number"
              id="precio_venta"
              name="precio_venta"
              min="0"
              step="0.01"
              value={formData.precio_venta}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">Precio de venta del producto</p>
          </div>

          {/* Imagen URL */}
          <div className="md:col-span-2">
            <label htmlFor="imagen_url" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <Image className="h-4 w-4 mr-2 text-primary-500" />
                URL de Imagen
              </div>
            </label>
            <input
              type="url"
              id="imagen_url"
              name="imagen_url"
              value={formData.imagen_url}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">URL de la imagen del producto (opcional)</p>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label htmlFor="descripcion" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary-500" />
                Descripción
              </div>
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="4"
              placeholder="Descripción detallada del producto..."
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none resize-none"
            />
          </div>
        </div>

        {/* Info adicional */}
        {!isEditing && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> El producto se creará con estado <strong>Activo</strong> y <strong>Stock inicial en 0</strong>.
              Puedes actualizar el stock posteriormente desde el módulo de recepciones.
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Package className="h-5 w-5 mr-2" />
                {isEditing ? 'Actualizar' : 'Crear'} Producto
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

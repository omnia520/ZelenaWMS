import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, AlertTriangle, Package, Hash, FileText, MapPin, Image, Plus, X, Loader2, Upload, Camera, Trash2, Edit2 } from 'lucide-react';
import { averiasAPI, productosAPI, ubicacionesAPI, uploadAPI } from '../../services/api';

const TIPOS_AVERIA = [
  { value: 'Daño', label: 'Daño' },
  { value: 'Faltante', label: 'Faltante' },
  { value: 'Rotura', label: 'Rotura' },
  { value: 'Vencimiento', label: 'Vencimiento' },
];

export default function AveriaForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    producto_id: '',
    cantidad: '',
    tipo_averia: '',
    descripcion: '',
    ubicacion_id: '',
  });

  // Evidencias: pueden ser archivos locales o URLs ya subidas
  const [evidencias, setEvidencias] = useState([]); // { file?, preview, url?, descripcion, uploaded }
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingDesc, setEditingDesc] = useState('');

  const fileInputRef = useRef(null);

  // Búsqueda de producto
  const [searchProducto, setSearchProducto] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [sugerenciasProductos, setSugerenciasProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [showProductoDropdown, setShowProductoDropdown] = useState(false);

  // Ubicaciones
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Cargar ubicaciones al montar
  useEffect(() => {
    loadUbicaciones();
  }, []);

  // Buscar productos mientras el usuario escribe
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchProducto.length >= 2) {
        searchProductos(searchProducto);
      } else {
        setSugerenciasProductos([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchProducto]);

  // Limpiar URLs de preview al desmontar
  useEffect(() => {
    return () => {
      evidencias.forEach(ev => {
        if (ev.preview && ev.preview.startsWith('blob:')) {
          URL.revokeObjectURL(ev.preview);
        }
      });
    };
  }, []);

  const loadUbicaciones = async () => {
    try {
      setLoadingUbicaciones(true);
      const response = await ubicacionesAPI.getAll();
      setUbicaciones(response.data.data || []);
    } catch (error) {
      console.error('Error loading ubicaciones:', error);
    } finally {
      setLoadingUbicaciones(false);
    }
  };

  const searchProductos = async (term) => {
    try {
      setLoadingProductos(true);
      const response = await productosAPI.getAll({ search: term, activo: true });
      setSugerenciasProductos(response.data.data || []);
    } catch (error) {
      console.error('Error searching productos:', error);
    } finally {
      setLoadingProductos(false);
    }
  };

  const handleSelectProducto = (producto) => {
    setProductoSeleccionado(producto);
    setFormData({ ...formData, producto_id: producto.producto_id });
    setSearchProducto(producto.nombre);
    setShowProductoDropdown(false);
    setSugerenciasProductos([]);
  };

  const handleClearProducto = () => {
    setProductoSeleccionado(null);
    setFormData({ ...formData, producto_id: '' });
    setSearchProducto('');
  };

  // Comprimir imagen antes de subirla
  const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
    return new Promise((resolve) => {
      // Si el archivo es menor a 2MB, no comprimir
      if (file.size < 2 * 1024 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Redimensionar si es muy grande
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  // Manejar selección de archivos
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Comprimir imágenes grandes antes de agregar
    const processedFiles = await Promise.all(
      files.map(file => compressImage(file))
    );

    const newEvidencias = processedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      descripcion: '',
      uploaded: false
    }));

    setEvidencias(prev => [...prev, ...newEvidencias]);

    // Limpiar el input para poder seleccionar el mismo archivo de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Eliminar evidencia
  const handleRemoveEvidencia = (index) => {
    const ev = evidencias[index];

    // Revocar URL de preview si existe
    if (ev.preview && ev.preview.startsWith('blob:')) {
      URL.revokeObjectURL(ev.preview);
    }

    // Si ya fue subida, intentar eliminarla del servidor
    if (ev.uploaded && ev.filename) {
      uploadAPI.deleteImage(ev.filename).catch(console.error);
    }

    setEvidencias(evidencias.filter((_, i) => i !== index));
  };

  // Iniciar edición de descripción
  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditingDesc(evidencias[index].descripcion || '');
  };

  // Guardar edición de descripción
  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const updated = [...evidencias];
      updated[editingIndex] = { ...updated[editingIndex], descripcion: editingDesc };
      setEvidencias(updated);
      setEditingIndex(null);
      setEditingDesc('');
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingDesc('');
  };

  // Subir imágenes al servidor
  const uploadImages = async () => {
    const filesToUpload = evidencias.filter(ev => ev.file && !ev.uploaded);

    if (filesToUpload.length === 0) {
      return evidencias.filter(ev => ev.uploaded).map(ev => ({
        foto_url: ev.url,
        descripcion: ev.descripcion || null
      }));
    }

    setUploadingImages(true);

    try {
      const files = filesToUpload.map(ev => ev.file);
      const response = await uploadAPI.uploadImages(files);
      const uploadedFiles = response.data.data;

      // Actualizar evidencias con las URLs del servidor
      let uploadIndex = 0;
      const updatedEvidencias = evidencias.map(ev => {
        if (ev.file && !ev.uploaded) {
          const uploaded = uploadedFiles[uploadIndex];
          uploadIndex++;
          return {
            ...ev,
            url: uploaded.url,
            filename: uploaded.filename,
            uploaded: true
          };
        }
        return ev;
      });

      setEvidencias(updatedEvidencias);

      return updatedEvidencias.map(ev => ({
        foto_url: ev.url,
        descripcion: ev.descripcion || null
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      throw new Error('Error al subir las imágenes. Intenta de nuevo.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.producto_id) {
      setError('Debes seleccionar un producto');
      return;
    }
    if (!formData.cantidad || formData.cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    if (!formData.tipo_averia) {
      setError('Debes seleccionar un tipo de avería');
      return;
    }

    try {
      setLoading(true);

      // Subir imágenes primero
      let evidenciasData = [];
      if (evidencias.length > 0) {
        evidenciasData = await uploadImages();
      }

      const dataToSend = {
        producto_id: parseInt(formData.producto_id),
        cantidad: parseInt(formData.cantidad),
        tipo_averia: formData.tipo_averia,
        descripcion: formData.descripcion || null,
        ubicacion_id: formData.ubicacion_id ? parseInt(formData.ubicacion_id) : null,
        evidencias: evidenciasData.length > 0 ? evidenciasData : undefined,
      };

      await averiasAPI.create(dataToSend);
      setSuccess(true);
      setTimeout(() => onSuccess(), 1500);
    } catch (error) {
      console.error('Error creating averia:', error);
      setError(error.message || error.response?.data?.message || 'Error al registrar la avería');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onClose}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver al listado
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8 mr-3 text-yellow-500 flex-shrink-0" />
          Registrar Nueva Avería
        </h2>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Completa los datos del producto averiado</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Éxito */}
      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-green-700 font-medium">Avería registrada correctamente. Las evidencias se subieron con éxito.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Búsqueda de Producto */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2 text-yellow-500" />
            Producto Afectado
          </h3>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Producto *
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchProducto}
                onChange={(e) => {
                  setSearchProducto(e.target.value);
                  setShowProductoDropdown(true);
                }}
                onFocus={() => setShowProductoDropdown(true)}
                placeholder="Escribe el código o nombre del producto..."
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50 transition-all outline-none"
                disabled={productoSeleccionado}
              />
              {productoSeleccionado && (
                <button
                  type="button"
                  onClick={handleClearProducto}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              {loadingProductos && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
              )}
            </div>

            {/* Dropdown de sugerencias */}
            {showProductoDropdown && sugerenciasProductos.length > 0 && !productoSeleccionado && (
              <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {sugerenciasProductos.map((producto) => (
                  <div
                    key={producto.producto_id}
                    onClick={() => handleSelectProducto(producto)}
                    className="px-4 py-3 hover:bg-yellow-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{producto.nombre}</div>
                    <div className="text-xs text-gray-500">
                      Código: {producto.codigo} | Stock: {producto.stock_actual}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Producto seleccionado */}
          {productoSeleccionado && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{productoSeleccionado.nombre}</p>
                  <p className="text-sm text-gray-600">
                    Código: {productoSeleccionado.codigo} | Stock actual: {productoSeleccionado.stock_actual}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detalles de la Avería */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-yellow-500" />
            Detalles de la Avería
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="h-4 w-4 inline mr-1" />
                Cantidad Afectada *
              </label>
              <input
                type="number"
                min="1"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                placeholder="Ej: 5"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50 transition-all outline-none"
                required
              />
            </div>

            {/* Tipo de Avería */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Tipo de Avería *
              </label>
              <select
                value={formData.tipo_averia}
                onChange={(e) => setFormData({ ...formData, tipo_averia: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50 transition-all outline-none"
                required
              >
                <option value="">Seleccionar tipo...</option>
                {TIPOS_AVERIA.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>

            {/* Ubicación (opcional) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Ubicación (opcional)
              </label>
              <select
                value={formData.ubicacion_id}
                onChange={(e) => setFormData({ ...formData, ubicacion_id: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50 transition-all outline-none"
                disabled={loadingUbicaciones}
              >
                <option value="">Sin ubicación específica</option>
                {ubicaciones.map(ub => (
                  <option key={ub.ubicacion_id} value={ub.ubicacion_id}>
                    {ub.codigo} - {ub.descripcion || `${ub.estanteria}-${ub.fila}-${ub.nivel}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                Observación / Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe por qué se generó la avería..."
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50 transition-all outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Evidencias (Imágenes) */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Image className="h-5 w-5 mr-2 text-yellow-500" />
            Evidencias Fotográficas (opcional)
          </h3>

          {/* Botones para agregar imágenes */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center px-4 py-3 sm:py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all text-sm sm:text-base"
            >
              <Upload className="h-5 w-5 mr-2 flex-shrink-0" />
              Subir foto
            </button>

            <button
              type="button"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.capture = 'environment';
                input.style.display = 'none';
                document.body.appendChild(input);
                input.onchange = (e) => {
                  handleFileSelect(e);
                  document.body.removeChild(input);
                };
                input.addEventListener('cancel', () => {
                  document.body.removeChild(input);
                });
                input.click();
              }}
              className="flex items-center justify-center px-4 py-3 sm:py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 active:scale-95 transition-all text-sm sm:text-base"
            >
              <Camera className="h-5 w-5 mr-2 flex-shrink-0" />
              Tomar foto
            </button>
          </div>

          {/* Vista previa de imágenes */}
          {evidencias.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {evidencias.map((ev, index) => (
                <div
                  key={index}
                  className="relative group bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200"
                >
                  {/* Imagen */}
                  <div className="aspect-square">
                    <img
                      src={ev.preview || ev.url}
                      alt={`Evidencia ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200?text=Error';
                      }}
                    />
                  </div>

                  {/* Overlay con acciones */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(index)}
                      className="p-2 bg-white rounded-full text-blue-600 hover:bg-blue-100"
                      title="Editar descripción"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveEvidencia(index)}
                      className="p-2 bg-white rounded-full text-red-600 hover:bg-red-100"
                      title="Eliminar"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Descripción */}
                  {ev.descripcion && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">
                      {ev.descripcion}
                    </div>
                  )}

                  {/* Indicador de estado */}
                  <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${ev.uploaded ? 'bg-green-500' : 'bg-yellow-500'}`}
                    title={ev.uploaded ? 'Subida' : 'Pendiente de subir'}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Image className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">
                No hay evidencias agregadas.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Sube fotos desde tu dispositivo o toma una foto directamente.
              </p>
            </div>
          )}

          {/* Modal de edición de descripción */}
          {editingIndex !== null && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Editar descripción
                </h4>
                <div className="mb-4">
                  <img
                    src={evidencias[editingIndex]?.preview || evidencias[editingIndex]?.url}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                  <textarea
                    value={editingDesc}
                    onChange={(e) => setEditingDesc(e.target.value)}
                    placeholder="Describe esta evidencia..."
                    rows={3}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-yellow-500 outline-none resize-none"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}

          {evidencias.length > 0 && (
            <p className="text-xs text-gray-500 mt-3">
              <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span> Pendiente de subir
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full ml-3 mr-1"></span> Subida correctamente
            </p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="w-full sm:w-auto px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading || uploadingImages ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {uploadingImages ? 'Subiendo imágenes...' : 'Guardando...'}
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Registrar Avería
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

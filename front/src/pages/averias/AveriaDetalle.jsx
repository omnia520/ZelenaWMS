import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Package, Calendar, User, MapPin, FileText, AlertTriangle,
  CheckCircle, XCircle, Clock, Edit2, Save, X, ChevronLeft, ChevronRight,
  ZoomIn, Loader2, Image, Plus, Trash2, Upload, Camera
} from 'lucide-react';
import { averiasAPI, uploadAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { formatDateShort } from '../../utils/dateUtils';

const TIPOS_AVERIA = {
  'Daño': { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  'Faltante': { color: 'bg-purple-100 text-purple-800', icon: Package },
  'Rotura': { color: 'bg-red-100 text-red-800', icon: XCircle },
  'Vencimiento': { color: 'bg-gray-100 text-gray-800', icon: Clock },
};

const ESTADO_CONFIG = {
  'Pendiente': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
  'Repuesta': { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
  'Descartada': { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
};

export default function AveriaDetalle({ averiaId, onClose, onUpdate }) {
  const [averia, setAveria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changingEstado, setChangingEstado] = useState(false);
  const [error, setError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingEvidencia, setAddingEvidencia] = useState(false);
  const [newEvidenciaUrl, setNewEvidenciaUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const fileInputRef = useRef(null);
  const { user } = useAuthStore();
  const canChangeEstado = ['Jefe_Bodega', 'Administrador'].includes(user?.rol);
  const canAddEvidencia = averia?.estado === 'Pendiente';

  useEffect(() => {
    loadAveria();
  }, [averiaId]);

  const loadAveria = async () => {
    try {
      setLoading(true);
      const response = await averiasAPI.getById(averiaId);
      setAveria(response.data.data);
    } catch (error) {
      console.error('Error loading averia:', error);
      setError('Error al cargar los datos de la avería');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEstado = async (nuevoEstado) => {
    const mensajes = {
      'Repuesta': '¿Estás seguro de marcar esta avería como REPUESTA?\n\nEsto SUMARÁ la cantidad al inventario (el producto vuelve al stock).',
      'Descartada': '¿Estás seguro de marcar esta avería como DESCARTADA?\n\nEsto RESTARÁ la cantidad del inventario (baja definitiva).',
      'Pendiente': '¿Estás seguro de volver esta avería a estado PENDIENTE?\n\nEsto REVERTIRÁ los cambios de inventario realizados anteriormente.'
    };

    if (!window.confirm(mensajes[nuevoEstado])) {
      return;
    }

    try {
      setChangingEstado(true);
      await averiasAPI.updateEstado(averiaId, nuevoEstado);
      await loadAveria();
      onUpdate();
    } catch (error) {
      console.error('Error changing estado:', error);
      alert(error.response?.data?.message || 'Error al cambiar el estado');
    } finally {
      setChangingEstado(false);
    }
  };

  const handleAddEvidencia = async () => {
    if (!newEvidenciaUrl.trim()) return;

    try {
      setAddingEvidencia(true);
      await averiasAPI.addEvidencia(averiaId, { foto_url: newEvidenciaUrl.trim() });
      setNewEvidenciaUrl('');
      await loadAveria();
    } catch (error) {
      console.error('Error adding evidencia:', error);
      alert(error.response?.data?.message || 'Error al agregar evidencia');
    } finally {
      setAddingEvidencia(false);
    }
  };

  // Comprimir imagen antes de subirla
  const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
    return new Promise((resolve) => {
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

  // Manejar subida de archivos desde el dispositivo
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploadingFile(true);

      // Comprimir imágenes grandes antes de subir
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file))
      );

      // Subir archivos al servidor
      const response = await uploadAPI.uploadImages(compressedFiles);
      const uploadedFiles = response.data.data;

      // Agregar cada archivo como evidencia a la avería
      for (const file of uploadedFiles) {
        await averiasAPI.addEvidencia(averiaId, { foto_url: file.url });
      }

      await loadAveria();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert(error.response?.data?.message || 'Error al subir las imágenes');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteEvidencia = async (evidenciaId) => {
    if (!window.confirm('¿Eliminar esta evidencia?')) return;

    try {
      await averiasAPI.deleteEvidencia(averiaId, evidenciaId);
      await loadAveria();
    } catch (error) {
      console.error('Error deleting evidencia:', error);
      alert(error.response?.data?.message || 'Error al eliminar evidencia');
    }
  };

  const nextImage = () => {
    if (averia?.evidencias?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % averia.evidencias.length);
    }
  };

  const prevImage = () => {
    if (averia?.evidencias?.length) {
      setCurrentImageIndex((prev) => (prev - 1 + averia.evidencias.length) % averia.evidencias.length);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando avería...</p>
        </div>
      </div>
    );
  }

  if (error || !averia) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 mx-auto text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600">{error || 'No se encontró la avería'}</p>
        <button onClick={onClose} className="mt-4 text-blue-600 hover:underline">
          Volver al listado
        </button>
      </div>
    );
  }

  const TipoIcon = TIPOS_AVERIA[averia.tipo_averia]?.icon || AlertTriangle;
  const EstadoIcon = ESTADO_CONFIG[averia.estado]?.icon || Clock;
  const evidencias = averia.evidencias || [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onClose}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver al listado
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8 mr-3 text-yellow-500 flex-shrink-0" />
              Avería #{averia.averia_id}
            </h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Registrada el {formatDateShort(averia.fecha_reporte)}
            </p>
          </div>

          {/* Badge de Estado */}
          <div className={`flex items-center self-start sm:self-auto px-4 py-2 rounded-full border-2 ${ESTADO_CONFIG[averia.estado]?.color}`}>
            <EstadoIcon className="h-5 w-5 mr-2" />
            <span className="font-semibold">{averia.estado}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Producto */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2 text-yellow-500" />
            Producto Afectado
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Código</span>
              <span className="font-medium text-gray-900">{averia.producto_codigo}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Nombre</span>
              <span className="font-medium text-gray-900">{averia.producto_nombre}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Cantidad Afectada</span>
              <span className="font-bold text-red-600 text-lg">{averia.cantidad} unidades</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Tipo de Avería</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${TIPOS_AVERIA[averia.tipo_averia]?.color}`}>
                {averia.tipo_averia}
              </span>
            </div>
            {averia.ubicacion_codigo && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Ubicación
                </span>
                <span className="font-medium text-gray-900">{averia.ubicacion_codigo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Información de Registro */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-yellow-500" />
            Información del Registro
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">
                <Calendar className="h-4 w-4 inline mr-1" />
                Fecha de Reporte
              </span>
              <span className="font-medium text-gray-900">
                {formatDateShort(averia.fecha_reporte)}
              </span>
            </div>
            {averia.reportado_por_nombre && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">
                  <User className="h-4 w-4 inline mr-1" />
                  Reportado por
                </span>
                <span className="font-medium text-gray-900">{averia.reportado_por_nombre}</span>
              </div>
            )}
            {averia.fecha_resolucion && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Fecha Resolución</span>
                <span className="font-medium text-gray-900">
                  {formatDateShort(averia.fecha_resolucion)}
                </span>
              </div>
            )}
            {averia.resuelto_por_nombre && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Resuelto por</span>
                <span className="font-medium text-gray-900">{averia.resuelto_por_nombre}</span>
              </div>
            )}
            {averia.inventario_ajustado && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Ajuste Inventario</span>
                <span className="font-medium text-green-600">
                  {averia.estado === 'Repuesta' ? '+' : '-'}{averia.cantidad_ajustada} unidades
                </span>
              </div>
            )}
          </div>

          {/* Descripción */}
          {averia.descripcion && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Observación:</p>
              <p className="text-gray-600">{averia.descripcion}</p>
            </div>
          )}
        </div>
      </div>

      {/* Carrusel de Evidencias */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Image className="h-5 w-5 mr-2 text-yellow-500" />
          Evidencias ({evidencias.length})
        </h3>

        {evidencias.length > 0 ? (
          <div className="relative">
            {/* Imagen principal */}
            <div
              className="relative w-full h-56 sm:h-72 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setShowImageModal(true)}
            >
              <img
                src={evidencias[currentImageIndex]?.foto_url}
                alt={`Evidencia ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
                }}
              />
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs sm:text-sm">
                <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 inline mr-1" />
                <span className="hidden sm:inline">Click para ampliar</span>
                <span className="inline sm:hidden">Ampliar</span>
              </div>
            </div>

            {/* Controles de navegación — más grandes para touch */}
            {evidencias.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-lg active:scale-95 transition-transform"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-lg active:scale-95 transition-transform"
                >
                  <ChevronRight className="h-6 w-6 text-gray-700" />
                </button>
              </>
            )}

            {/* Indicadores */}
            {evidencias.length > 1 && (
              <div className="flex justify-center mt-3 gap-2">
                {evidencias.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-yellow-500 w-6' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Thumbnails con opción de eliminar */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {evidencias.map((ev, index) => (
                <div key={ev.evidencia_id} className="relative flex-shrink-0">
                  <img
                    src={ev.foto_url}
                    alt={`Thumb ${index + 1}`}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                      index === currentImageIndex ? 'border-yellow-500' : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80?text=Error';
                    }}
                  />
                  {canChangeEstado && canAddEvidencia && (
                    <button
                      onClick={() => handleDeleteEvidencia(ev.evidencia_id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Image className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No hay evidencias registradas</p>
          </div>
        )}

        {/* Agregar evidencia (solo si está pendiente) */}
        {canAddEvidencia && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Agregar nuevas evidencias:</p>

            {/* Botones para subir desde dispositivo */}
            <div className="flex flex-wrap gap-2 mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
              >
                {uploadingFile ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-1" />
                )}
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
                    handleFileUpload(e);
                    document.body.removeChild(input);
                  };
                  input.addEventListener('cancel', () => {
                    document.body.removeChild(input);
                  });
                  input.click();
                }}
                disabled={uploadingFile}
                className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm"
              >
                <Camera className="h-4 w-4 mr-1" />
                Tomar foto
              </button>
            </div>

            {uploadingFile && (
              <p className="text-sm text-blue-600 mb-2">Subiendo imágenes...</p>
            )}
          </div>
        )}
      </div>

      {/* Acciones de Estado */}
      {canChangeEstado && (
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acciones
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {averia.estado !== 'Pendiente' && (
              <button
                onClick={() => handleChangeEstado('Pendiente')}
                disabled={changingEstado}
                className="flex items-center justify-center px-4 py-3 border-2 border-yellow-300 text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 disabled:opacity-50 font-medium transition-all"
              >
                {changingEstado ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Clock className="h-5 w-5 mr-2" />}
                Volver a Pendiente
              </button>
            )}

            {averia.estado === 'Pendiente' && (
              <>
                <button
                  onClick={() => handleChangeEstado('Repuesta')}
                  disabled={changingEstado}
                  className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium transition-all"
                >
                  {changingEstado ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                  Marcar Repuesta (+stock)
                </button>

                <button
                  onClick={() => handleChangeEstado('Descartada')}
                  disabled={changingEstado}
                  className="flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium transition-all"
                >
                  {changingEstado ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <XCircle className="h-5 w-5 mr-2" />}
                  Descartar (-stock)
                </button>
              </>
            )}
          </div>

          {averia.estado === 'Pendiente' && (
            <p className="mt-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <strong>Nota:</strong> Al marcar como "Repuesta", se sumará la cantidad al inventario (el producto vuelve al stock).
              Al "Descartar", se restará la cantidad (baja definitiva).
            </p>
          )}
        </div>
      )}

      {/* Modal de imagen ampliada */}
      {showImageModal && evidencias.length > 0 && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setShowImageModal(false)}
        >
          {/* Cerrar */}
          <button
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
            onClick={() => setShowImageModal(false)}
          >
            <X className="h-6 w-6" />
          </button>

          {/* Prev */}
          {evidencias.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-2 sm:left-4 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-colors active:scale-95"
            >
              <ChevronLeft className="h-7 w-7 sm:h-10 sm:w-10" />
            </button>
          )}

          <img
            src={evidencias[currentImageIndex]?.foto_url}
            alt="Imagen ampliada"
            className="max-w-[90vw] max-h-[85vh] object-contain rounded"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {evidencias.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 sm:right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-colors active:scale-95"
            >
              <ChevronRight className="h-7 w-7 sm:h-10 sm:w-10" />
            </button>
          )}

          <div className="absolute bottom-4 text-white text-sm bg-black/40 px-3 py-1 rounded-full">
            {currentImageIndex + 1} / {evidencias.length}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { ArrowLeft, Warehouse, Hash, Building2, MapPin, User } from 'lucide-react';
import { bodegasAPI } from '../../services/api';

export default function BodegaForm({ bodega, onClose, onSuccess }) {
  const isEditing = !!bodega;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    direccion: '',
    ciudad: '',
    responsable_id: '',
  });

  useEffect(() => {
    if (bodega) {
      setFormData({
        codigo: bodega.codigo || '',
        nombre: bodega.nombre || '',
        descripcion: bodega.descripcion || '',
        direccion: bodega.direccion || '',
        ciudad: bodega.ciudad || '',
        responsable_id: bodega.responsable_id || '',
      });
    }
  }, [bodega]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.codigo.trim()) {
      alert('El código de la bodega es requerido');
      return;
    }
    if (!formData.nombre.trim()) {
      alert('El nombre de la bodega es requerido');
      return;
    }

    try {
      setLoading(true);

      const dataToSend = {
        ...formData,
        responsable_id: formData.responsable_id || null,
      };

      if (isEditing) {
        await bodegasAPI.update(bodega.bodega_id, dataToSend);
        alert('Bodega actualizada exitosamente');
      } else {
        await bodegasAPI.create(dataToSend);
        alert('Bodega creada exitosamente');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving bodega:', error);
      alert(error.response?.data?.message || 'Error al guardar bodega');
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
          <Warehouse className="h-8 w-8 mr-3 text-primary-600" />
          {isEditing ? 'Editar Bodega' : 'Nueva Bodega'}
        </h2>
        <p className="text-gray-600 mt-1">
          {isEditing
            ? 'Actualiza la información de la bodega'
            : 'Completa el formulario para crear una nueva bodega'}
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
              placeholder="BOD-001"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">Código único de la bodega</p>
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <Warehouse className="h-4 w-4 mr-2 text-primary-500" />
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
              placeholder="Ej: Bodega Central"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
          </div>

          {/* Ciudad */}
          <div>
            <label htmlFor="ciudad" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                Ciudad
              </div>
            </label>
            <input
              type="text"
              id="ciudad"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              placeholder="Ej: Bogotá"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
          </div>

          {/* ID Responsable (opcional) */}
          <div>
            <label htmlFor="responsable_id" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-primary-500" />
                ID Responsable
              </div>
            </label>
            <input
              type="number"
              id="responsable_id"
              name="responsable_id"
              value={formData.responsable_id}
              onChange={handleChange}
              placeholder="ID del usuario responsable"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">Opcional: ID del usuario encargado</p>
          </div>

          {/* Dirección */}
          <div className="md:col-span-2">
            <label htmlFor="direccion" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-primary-500" />
                Dirección
              </div>
            </label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Ej: Calle 123 # 45-67"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label htmlFor="descripcion" className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              placeholder="Descripción de la bodega..."
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none resize-none"
            />
          </div>
        </div>

        {/* Info adicional */}
        {!isEditing && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> La bodega se creará con estado <strong>Activa</strong>.
              Podrás agregar productos mediante recepciones o transferencias.
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
                <Warehouse className="h-5 w-5 mr-2" />
                {isEditing ? 'Actualizar' : 'Crear'} Bodega
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

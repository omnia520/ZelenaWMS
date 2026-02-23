import { useState, useEffect } from 'react';
import { ubicacionesAPI } from '../../services/api';

export default function ModalAsignarUbicacion({ producto, ubicacion, onClose, onSuccess }) {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [formData, setFormData] = useState({
    ubicacion_id: ubicacion?.ubicacion_id || '',
    cantidad: ubicacion?.cantidad || 0,
    es_primaria: ubicacion?.es_ubicacion_primaria || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(true);

  useEffect(() => {
    loadUbicaciones();
  }, []);

  const loadUbicaciones = async () => {
    try {
      const response = await ubicacionesAPI.getAll({ activa: true });
      setUbicaciones(response.data.data || []);
    } catch (err) {
      console.error('Error loading ubicaciones:', err);
    } finally {
      setLoadingUbicaciones(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await ubicacionesAPI.asignarProducto(formData.ubicacion_id, {
        producto_id: producto.producto_id,
        cantidad: parseFloat(formData.cantidad),
        es_primaria: formData.es_primaria,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al asignar ubicación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          {ubicacion ? 'Editar Ubicación' : 'Agregar Ubicación'}
        </h3>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Producto:</p>
          <p className="font-medium">{producto.nombre}</p>
          <p className="text-sm text-gray-600">Código: {producto.codigo}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Ubicación */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación *
            </label>
            <select
              value={formData.ubicacion_id}
              onChange={(e) => setFormData({ ...formData, ubicacion_id: e.target.value })}
              disabled={!!ubicacion || loadingUbicaciones}
              className="input w-full"
              required
            >
              <option value="">Seleccionar ubicación</option>
              {ubicaciones.map((ub) => (
                <option key={ub.ubicacion_id} value={ub.ubicacion_id}>
                  {ub.codigo} - {ub.descripcion || 'Sin descripción'}
                </option>
              ))}
            </select>
            {ubicacion && (
              <p className="text-xs text-gray-500 mt-1">
                No se puede cambiar la ubicación. Para moverlo, elimínelo y créelo de nuevo.
              </p>
            )}
          </div>

          {/* Cantidad */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad *
            </label>
            <input
              type="number"
              value={formData.cantidad}
              onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
              min="0"
              step="0.01"
              className="input w-full"
              required
            />
          </div>

          {/* Es Primaria */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.es_primaria}
                onChange={(e) => setFormData({ ...formData, es_primaria: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Ubicación primaria
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Marcar como ubicación principal para picking
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-4">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

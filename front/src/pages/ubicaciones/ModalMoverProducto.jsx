import { useState, useEffect } from 'react';
import { ubicacionesAPI } from '../../services/api';

export default function ModalMoverProducto({ producto, ubicacionOrigen, onClose, onSuccess }) {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [formData, setFormData] = useState({
    ubicacion_destino_id: '',
    cantidad: ubicacionOrigen?.cantidad || 0,
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
      await ubicacionesAPI.moverProducto({
        producto_id: producto.producto_id,
        ubicacion_origen_id: ubicacionOrigen.ubicacion_id,
        ubicacion_destino_id: parseInt(formData.ubicacion_destino_id),
        cantidad: parseFloat(formData.cantidad),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al mover producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          Mover Producto
        </h3>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Producto:</p>
          <p className="font-medium">{producto.nombre}</p>
          <p className="text-sm text-gray-600">Código: {producto.codigo}</p>
          <p className="text-sm text-gray-600 mt-2">Ubicación origen:</p>
          <p className="font-medium">{ubicacionOrigen.codigo}</p>
          <p className="text-sm text-gray-600">Cantidad disponible: {ubicacionOrigen.cantidad}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Ubicación Destino */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación Destino *
            </label>
            <select
              value={formData.ubicacion_destino_id}
              onChange={(e) => setFormData({ ...formData, ubicacion_destino_id: e.target.value })}
              disabled={loadingUbicaciones}
              className="input w-full"
              required
            >
              <option value="">Seleccionar ubicación</option>
              {ubicaciones
                .filter((ub) => ub.ubicacion_id !== ubicacionOrigen.ubicacion_id)
                .map((ub) => (
                  <option key={ub.ubicacion_id} value={ub.ubicacion_id}>
                    {ub.codigo} - {ub.descripcion || 'Sin descripción'}
                  </option>
                ))}
            </select>
          </div>

          {/* Cantidad */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad a mover *
            </label>
            <input
              type="number"
              value={formData.cantidad}
              onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
              min="0.01"
              max={ubicacionOrigen.cantidad}
              step="0.01"
              className="input w-full"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Máximo: {ubicacionOrigen.cantidad}
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
              {loading ? 'Moviendo...' : 'Mover Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

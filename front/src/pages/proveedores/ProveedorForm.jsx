import { useState, useEffect } from 'react';
import { ArrowLeft, Truck, CreditCard, User, Phone, Mail, MapPin } from 'lucide-react';
import { proveedoresAPI } from '../../services/api';

export default function ProveedorForm({ proveedor, onClose, onSuccess }) {
  const isEditing = !!proveedor;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
  });

  useEffect(() => {
    if (proveedor) {
      setFormData({
        nombre: proveedor.nombre || '',
        nit: proveedor.nit || '',
        contacto: proveedor.contacto || '',
        telefono: proveedor.telefono || '',
        email: proveedor.email || '',
        direccion: proveedor.direccion || '',
      });
    }
  }, [proveedor]);

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
    if (!formData.nombre.trim()) {
      alert('El nombre del proveedor es requerido');
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        await proveedoresAPI.update(proveedor.proveedor_id, formData);
        alert('Proveedor actualizado exitosamente');
      } else {
        await proveedoresAPI.create(formData);
        alert('Proveedor creado exitosamente');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving proveedor:', error);
      alert(error.response?.data?.message || 'Error al guardar proveedor');
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
          <Truck className="h-8 w-8 mr-3 text-primary-600" />
          {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </h2>
        <p className="text-gray-600 mt-1">
          {isEditing
            ? 'Actualiza la información del proveedor'
            : 'Completa el formulario para crear un nuevo proveedor'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div className="md:col-span-2">
            <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <Truck className="h-4 w-4 mr-2 text-primary-500" />
                Nombre del Proveedor <span className="text-red-500 ml-1">*</span>
              </div>
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Distribuidora Nacional S.A."
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">Nombre único del proveedor</p>
          </div>

          {/* NIT */}
          <div>
            <label htmlFor="nit" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-primary-500" />
                NIT
              </div>
            </label>
            <input
              type="text"
              id="nit"
              name="nit"
              value={formData.nit}
              onChange={handleChange}
              placeholder="900123456-7"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
          </div>

          {/* Contacto */}
          <div>
            <label htmlFor="contacto" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-primary-500" />
                Persona de Contacto
              </div>
            </label>
            <input
              type="text"
              id="contacto"
              name="contacto"
              value={formData.contacto}
              onChange={handleChange}
              placeholder="Juan Pérez"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-primary-500" />
                Teléfono
              </div>
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="3001234567"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-primary-500" />
                Correo Electrónico
              </div>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contacto@proveedor.com"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
          </div>

          {/* Dirección */}
          <div className="md:col-span-2">
            <label htmlFor="direccion" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                Dirección
              </div>
            </label>
            <textarea
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              rows="3"
              placeholder="Calle 123 #45-67, Bogotá D.C."
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none resize-none"
            />
          </div>
        </div>

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
                <Truck className="h-5 w-5 mr-2" />
                {isEditing ? 'Actualizar' : 'Crear'} Proveedor
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

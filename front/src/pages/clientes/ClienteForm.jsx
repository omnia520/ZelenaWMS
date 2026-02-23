import { useState, useEffect } from 'react';
import { X, Save, ArrowLeft, User, Mail, Phone, MapPin, Building, CreditCard } from 'lucide-react';
import { clientesAPI } from '../../services/api';

export default function ClienteForm({ cliente, onClose, onSuccess }) {
  const isEditing = !!cliente;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nit_cc: '',
    razon_social: '',
    telefono: '',
    email: '',
    ciudad: '',
    departamento: '',
    direccion: '',
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        nit_cc: cliente.nit_cc || '',
        razon_social: cliente.razon_social || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        ciudad: cliente.ciudad || '',
        departamento: cliente.departamento || '',
        direccion: cliente.direccion || '',
      });
    }
  }, [cliente]);

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
    if (!formData.nit_cc.trim()) {
      alert('El NIT/CC es requerido');
      return;
    }
    if (!formData.razon_social.trim()) {
      alert('La razón social/nombre es requerido');
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        await clientesAPI.update(cliente.cliente_id, formData);
        alert('Cliente actualizado exitosamente');
      } else {
        await clientesAPI.create(formData);
        alert('Cliente creado exitosamente');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving cliente:', error);
      alert(error.response?.data?.message || 'Error al guardar cliente');
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
          <User className="h-8 w-8 mr-3 text-primary-600" />
          {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h2>
        <p className="text-gray-600 mt-1">
          {isEditing
            ? 'Actualiza la información del cliente'
            : 'Completa el formulario para crear un nuevo cliente'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NIT/CC */}
          <div>
            <label htmlFor="nit_cc" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-primary-500" />
                NIT / Cédula <span className="text-red-500 ml-1">*</span>
              </div>
            </label>
            <input
              type="text"
              id="nit_cc"
              name="nit_cc"
              required
              value={formData.nit_cc}
              onChange={handleChange}
              placeholder="123456789-0"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">Número único de identificación</p>
          </div>

          {/* Razón Social */}
          <div>
            <label htmlFor="razon_social" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-2 text-primary-500" />
                Razón Social / Nombre <span className="text-red-500 ml-1">*</span>
              </div>
            </label>
            <input
              type="text"
              id="razon_social"
              name="razon_social"
              required
              value={formData.razon_social}
              onChange={handleChange}
              placeholder="Empresa XYZ S.A.S"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">Nombre completo o razón social</p>
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
              placeholder="contacto@empresa.com"
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
              placeholder="Bogotá"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
          </div>

          {/* Departamento */}
          <div>
            <label htmlFor="departamento" className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                Departamento
              </div>
            </label>
            <input
              type="text"
              id="departamento"
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              placeholder="Cundinamarca"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
            />
          </div>

          {/* Dirección - Full width */}
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
              placeholder="Calle 123 #45-67, Barrio Centro"
              rows="3"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none resize-none"
            />
          </div>
        </div>

        {/* Required fields note */}
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Nota:</span> Los campos marcados con{' '}
            <span className="text-red-500">*</span> son obligatorios
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
          >
            <X className="h-5 w-5 mr-2" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:transform-none"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                {isEditing ? 'Actualizar Cliente' : 'Crear Cliente'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

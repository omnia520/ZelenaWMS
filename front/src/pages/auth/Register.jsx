import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, UserCog, ArrowLeft, AtSign } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import logoImage from '../../assets/logo.jpg';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    nombre: '',
    nombre_usuario: '',
    email: '',
    telefono: '',
    rol: '',
    password: '',
    confirmPassword: '',
  });

  // Roles disponibles
  const roles = [
    { value: 'Vendedor', label: 'Vendedor', description: 'Crear y gestionar órdenes de venta' },
    { value: 'Operario', label: 'Operario', description: 'Realizar alistamiento y empaque de órdenes' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Validaciones
    if (!formData.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }
    if (!formData.nombre_usuario.trim()) {
      alert('El nombre de usuario es requerido');
      return;
    }
    if (!formData.rol) {
      alert('Debes seleccionar un rol');
      return;
    }
    if (!formData.password) {
      alert('La contraseña es requerida');
      return;
    }
    if (formData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Preparar datos para enviar (sin confirmPassword y sin email si está vacío)
    const { confirmPassword, ...dataToSend } = formData;
    if (!dataToSend.email.trim()) {
      delete dataToSend.email;
    }

    const result = await register(dataToSend);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4" style={{ backgroundColor: 'rgb(246, 123, 27)' }}>
      {/* Decorative geometric shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="relative max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Header with logo */}
          <div className="bg-white px-8 py-8 text-center border-b-4 border-primary-500">
            <div className="flex justify-center mb-4">
              <img
                src={logoImage}
                alt="Hogar Center Logo"
                className="h-24 w-auto object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold text-primary-500">
              Crear Cuenta
            </h2>
            <p className="mt-2 text-gray-600 font-medium">
              Registra un nuevo usuario en el sistema
            </p>
          </div>

          {/* Form Container */}
          <div className="px-8 py-8">
            {/* Back to Login */}
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio de sesión
            </Link>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg mb-6">
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Nombre completo */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-primary-500" />
                    Nombre Completo <span className="text-red-500 ml-1">*</span>
                  </div>
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
                />
              </div>

              {/* Nombre de usuario */}
              <div>
                <label htmlFor="nombre_usuario" className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center">
                    <AtSign className="h-4 w-4 mr-2 text-primary-500" />
                    Nombre de Usuario <span className="text-red-500 ml-1">*</span>
                  </div>
                </label>
                <input
                  id="nombre_usuario"
                  name="nombre_usuario"
                  type="text"
                  required
                  value={formData.nombre_usuario}
                  onChange={handleChange}
                  placeholder="juanperez"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
                />
              </div>

              {/* Email y Teléfono - En dos columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-primary-500" />
                      Correo Electrónico (opcional)
                    </div>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="usuario@wms.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-primary-500" />
                      Teléfono
                    </div>
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="3001234567"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Rol - Selector con descripciones */}
              <div>
                <label htmlFor="rol" className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center">
                    <UserCog className="h-4 w-4 mr-2 text-primary-500" />
                    Rol en el Sistema <span className="text-red-500 ml-1">*</span>
                  </div>
                </label>
                <select
                  id="rol"
                  name="rol"
                  required
                  value={formData.rol}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map((rol) => (
                    <option key={rol.value} value={rol.value}>
                      {rol.label} - {rol.description}
                    </option>
                  ))}
                </select>
                {formData.rol && (
                  <p className="mt-2 text-xs text-gray-600 bg-blue-50 p-2 rounded-lg">
                    <span className="font-semibold">
                      {roles.find(r => r.value === formData.rol)?.label}:
                    </span>{' '}
                    {roles.find(r => r.value === formData.rol)?.description}
                  </p>
                )}
              </div>

              {/* Contraseñas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-primary-500" />
                      Contraseña <span className="text-red-500 ml-1">*</span>
                    </div>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-primary-500" />
                      Confirmar Contraseña <span className="text-red-500 ml-1">*</span>
                    </div>
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registrando...
                    </span>
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>
              </div>

              {/* Link to Login */}
              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-all"
                >
                  ¿Ya tienes cuenta? Inicia sesión aquí
                </Link>
              </div>
            </form>

            {/* Info Box */}
            <div className="mt-8 p-5 bg-gradient-to-r from-blue-100 to-blue-50 border-l-4 border-blue-500 rounded-r-xl">
              <p className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Información sobre roles
              </p>
              <ul className="text-xs text-gray-700 space-y-1 pl-7">
                <li>• <strong>Vendedor:</strong> Gestiona clientes y órdenes de venta</li>
                <li>• <strong>Operario:</strong> Realiza alistamiento y empaque de órdenes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import logoImage from '../../assets/logo.jpg';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const result = await login(formData);
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4" style={{ backgroundColor: 'rgb(246, 123, 27)' }}>
      {/* Decorative geometric shapes */}
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
        <div className="absolute top-10 right-4 sm:right-20 w-20 h-20 sm:w-32 sm:h-32 border-4 border-accent-500 opacity-20 rounded-lg rotate-12"></div>
        <div className="absolute bottom-10 sm:bottom-20 left-4 sm:left-10 w-16 h-16 sm:w-24 sm:h-24 border-4 border-white opacity-10 rounded-full"></div>
      </div>

      <div className="relative max-w-md w-full">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Header with logo */}
          <div className="bg-white px-4 sm:px-8 py-6 sm:py-10 text-center border-b-4 border-primary-500">
            <div className="flex justify-center mb-4 sm:mb-6">
              <img
                src={logoImage}
                alt="Hogar Center Logo"
                className="h-20 sm:h-32 w-auto object-contain"
              />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-500">
              Sistema WMS
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 font-medium">
              Gestión de Almacén y Ventas
            </p>
          </div>

          {/* Form Container */}
          <div className="px-4 sm:px-8 py-6 sm:py-8">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-r-lg">
                <p className="font-medium text-sm sm:text-base">{error}</p>
              </div>
            )}

            {/* Form */}
            <form className="mt-4 sm:mt-6 space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="nombre_usuario" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre de Usuario
                  </label>
                  <input
                    id="nombre_usuario"
                    name="nombre_usuario"
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
                    placeholder="juanperez"
                    value={formData.nombre_usuario}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

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
                      Iniciando sesión...
                    </span>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/register"
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-all"
                >
                  ¿No tienes cuenta? Regístrate aquí
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { PackageCheck, Package } from 'lucide-react';

export default function Actividades() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Actividades</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Botón Alistamiento */}
        <button
          onClick={() => navigate('/actividades/alistamiento')}
          className="group relative overflow-hidden rounded-xl bg-white p-8 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-500"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-blue-100 group-hover:bg-blue-500 transition-colors duration-300">
              <PackageCheck className="h-12 w-12 text-blue-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
              Alistamiento
            </h2>
            <p className="text-gray-600 text-center">
              Gestiona el proceso de alistamiento de órdenes aprobadas
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        {/* Botón Empaque */}
        <button
          onClick={() => navigate('/actividades/empaque')}
          className="group relative overflow-hidden rounded-xl bg-white p-8 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-green-500"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-green-100 group-hover:bg-green-500 transition-colors duration-300">
              <Package className="h-12 w-12 text-green-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
              Empaque
            </h2>
            <p className="text-gray-600 text-center">
              Gestiona el proceso de empaque de órdenes alistadas
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  );
}

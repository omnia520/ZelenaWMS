import { useState } from 'react';
import { BarChart3, User, Users } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import DesempenoOperario from './DesempenoOperario';
import DesempenoManager from './DesempenoManager';

export default function Desempeno() {
  const { user } = useAuthStore();
  const isManager = ['Jefe_Bodega', 'Administrador'].includes(user?.rol);

  // Si es operario, solo muestra su vista
  // Si es manager, muestra tabs para elegir
  const [activeTab, setActiveTab] = useState('mi-desempeno');

  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center mb-1 sm:mb-2">
          <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mr-2 sm:mr-3" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Desempeño Operativo</h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600">
          {isManager
            ? 'Visualiza y analiza el desempeño de picking y packing del equipo'
            : 'Visualiza tu desempeño en actividades de picking y packing'
          }
        </p>
      </div>

      {/* Tabs (solo para managers) */}
      {isManager && (
        <div className="mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('mi-desempeno')}
                className={`py-2.5 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center whitespace-nowrap ${
                  activeTab === 'mi-desempeno'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                Mi Desempeño
              </button>
              <button
                onClick={() => setActiveTab('equipo')}
                className={`py-2.5 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center whitespace-nowrap ${
                  activeTab === 'equipo'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">Desempeño del </span>Equipo
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Contenido */}
      {isManager ? (
        activeTab === 'mi-desempeno' ? (
          <DesempenoOperario />
        ) : (
          <DesempenoManager />
        )
      ) : (
        <DesempenoOperario />
      )}
    </div>
  );
}

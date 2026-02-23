import { useState } from 'react';
import BuscarProducto from './BuscarProducto';
import BuscarUbicacion from './BuscarUbicacion';

export default function Ubicaciones() {
  const [activeTab, setActiveTab] = useState('producto'); // 'producto' o 'ubicacion'

  return (
    <div>
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Gestión de Ubicaciones</h2>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('producto')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'producto'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Buscar por Producto
          </button>
          <button
            onClick={() => setActiveTab('ubicacion')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'ubicacion'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Buscar por Ubicación
          </button>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'producto' ? (
            <BuscarProducto />
          ) : (
            <BuscarUbicacion />
          )}
        </div>
      </div>
    </div>
  );
}

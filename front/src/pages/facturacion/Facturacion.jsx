import { useState } from 'react';
import { FileText, Archive } from 'lucide-react';
import HistoricoFacturacion from './HistoricoFacturacion';
import AprobacionesFacturacion from './AprobacionesFacturacion';

export default function Facturacion() {
  const [vistaActiva, setVistaActiva] = useState(null);

  if (vistaActiva === 'historico') {
    return <HistoricoFacturacion onBack={() => setVistaActiva(null)} />;
  }

  if (vistaActiva === 'aprobaciones') {
    return <AprobacionesFacturacion onBack={() => setVistaActiva(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facturación</h1>
            <p className="text-gray-600 mt-1">Gestión de órdenes de facturación</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Botón Histórico */}
        <button
          onClick={() => setVistaActiva('historico')}
          className="card hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
        >
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-blue-100 p-6 rounded-full mb-6 group-hover:bg-blue-200 transition-colors">
              <Archive className="h-16 w-16 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Histórico</h2>
            <p className="text-gray-600 text-center px-4">
              Ver todas las órdenes finalizadas y su historial completo
            </p>
          </div>
        </button>

        {/* Botón Aprobaciones */}
        <button
          onClick={() => setVistaActiva('aprobaciones')}
          className="card hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
        >
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-green-100 p-6 rounded-full mb-6 group-hover:bg-green-200 transition-colors">
              <FileText className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aprobaciones</h2>
            <p className="text-gray-600 text-center px-4">
              Revisar y aprobar órdenes listas para despachar
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

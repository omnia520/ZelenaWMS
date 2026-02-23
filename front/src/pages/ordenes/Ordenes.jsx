import { useState } from 'react';
import OrdenesList from './OrdenesList';
import OrdenForm from './OrdenForm';
import OrdenDetalle from './OrdenDetalle';

export default function Ordenes() {
  const [view, setView] = useState('list'); // 'list', 'form', 'detail'
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreate = () => {
    setSelectedOrden(null);
    setView('form');
  };

  const handleView = (orden) => {
    setSelectedOrden(orden);
    setView('detail');
  };

  const handleClose = () => {
    setView('list');
    setSelectedOrden(null);
  };

  const handleSuccess = () => {
    setView('list');
    setSelectedOrden(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div>
      {view === 'form' ? (
        <OrdenForm
          orden={selectedOrden}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      ) : view === 'detail' ? (
        <OrdenDetalle
          ordenId={selectedOrden.orden_id}
          onClose={handleClose}
        />
      ) : (
        <OrdenesList
          onCreateClick={handleCreate}
          onViewClick={handleView}
          refreshTrigger={refreshTrigger}
        />
      )}
    </div>
  );
}

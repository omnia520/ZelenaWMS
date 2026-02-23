import { useState } from 'react';
import ProductosList from './ProductosList';
import ProductoForm from './ProductoForm';
import ProductoDetalle from './ProductoDetalle';

export default function Productos() {
  const [view, setView] = useState('list'); // 'list', 'form', 'detail'
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreate = () => {
    setSelectedProducto(null);
    setView('form');
  };

  const handleEdit = (producto) => {
    setSelectedProducto(producto);
    setView('form');
  };

  const handleView = (producto) => {
    setSelectedProducto(producto);
    setView('detail');
  };

  const handleClose = () => {
    setView('list');
    setSelectedProducto(null);
  };

  const handleSuccess = () => {
    setView('list');
    setSelectedProducto(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div>
      {view === 'form' ? (
        <ProductoForm
          producto={selectedProducto}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      ) : view === 'detail' ? (
        <ProductoDetalle
          producto={selectedProducto}
          onClose={handleClose}
        />
      ) : (
        <ProductosList
          onCreateClick={handleCreate}
          onEditClick={handleEdit}
          onViewClick={handleView}
          refreshTrigger={refreshTrigger}
        />
      )}
    </div>
  );
}

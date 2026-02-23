import { useState } from 'react';
import ProveedoresList from './ProveedoresList';
import ProveedorForm from './ProveedorForm';

export default function Proveedores() {
  const [showForm, setShowForm] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreate = () => {
    setSelectedProveedor(null);
    setShowForm(true);
  };

  const handleEdit = (proveedor) => {
    setSelectedProveedor(proveedor);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedProveedor(null);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedProveedor(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div>
      {showForm ? (
        <ProveedorForm
          proveedor={selectedProveedor}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      ) : (
        <ProveedoresList
          onCreateClick={handleCreate}
          onEditClick={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import ClientesList from './ClientesList';
import ClienteForm from './ClienteForm';

export default function Clientes() {
  const [showForm, setShowForm] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreate = () => {
    setSelectedCliente(null);
    setShowForm(true);
  };

  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedCliente(null);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedCliente(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div>
      {showForm ? (
        <ClienteForm
          cliente={selectedCliente}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      ) : (
        <ClientesList
          onCreateClick={handleCreate}
          onEditClick={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      )}
    </div>
  );
}

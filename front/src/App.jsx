import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Clientes from './pages/clientes/Clientes';
import Ordenes from './pages/ordenes/Ordenes';
import AprobarOrdenes from './pages/ordenes/AprobarOrdenes';
import Ubicaciones from './pages/ubicaciones/Ubicaciones';
import Actividades from './pages/actividades/Actividades';
import ListaAlistamiento from './pages/actividades/ListaAlistamiento';
import DetalleAlistamiento from './pages/actividades/DetalleAlistamiento';
import ListaEmpaque from './pages/actividades/ListaEmpaque';
import DetalleEmpaque from './pages/actividades/DetalleEmpaque';
import Proveedores from './pages/proveedores/Proveedores';
import Recepciones from './pages/recepciones/Recepciones';
import Productos from './pages/productos/Productos';
import Averias from './pages/averias/Averias';
import Facturacion from './pages/facturacion/Facturacion';
import Almacenes from './pages/almacenes/Almacenes';
import Desempeno from './pages/desempeno/Desempeno';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

// Role Protected Route Component
function RoleProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el rol del usuario está en la lista de roles permitidos
  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Clientes - No accesible para Operarios */}
        <Route
          path="/clientes"
          element={
            <RoleProtectedRoute allowedRoles={['Vendedor', 'Jefe_Bodega', 'Facturacion', 'Administrador']}>
              <Clientes />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <Productos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ordenes"
          element={
            <ProtectedRoute>
              <Ordenes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ordenes/aprobar"
          element={
            <ProtectedRoute>
              <AprobarOrdenes />
            </ProtectedRoute>
          }
        />

        {/* Ubicaciones - No accesible para Vendedor */}
        <Route
          path="/ubicaciones"
          element={
            <RoleProtectedRoute allowedRoles={['Jefe_Bodega', 'Operario', 'Facturacion', 'Administrador']}>
              <Ubicaciones />
            </RoleProtectedRoute>
          }
        />

        {/* Actividades - No accesible para Vendedor */}
        <Route
          path="/actividades"
          element={
            <RoleProtectedRoute allowedRoles={['Jefe_Bodega', 'Operario', 'Facturacion', 'Administrador']}>
              <Actividades />
            </RoleProtectedRoute>
          }
        />

        {/* Desempeño Operativo - Operario, Jefe_Bodega, Administrador */}
        <Route
          path="/desempeno"
          element={
            <RoleProtectedRoute allowedRoles={['Operario', 'Jefe_Bodega', 'Administrador']}>
              <Desempeno />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/actividades/alistamiento"
          element={
            <RoleProtectedRoute allowedRoles={['Jefe_Bodega', 'Operario', 'Facturacion', 'Administrador']}>
              <ListaAlistamiento />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/actividades/alistamiento/:ordenId"
          element={
            <RoleProtectedRoute allowedRoles={['Jefe_Bodega', 'Operario', 'Facturacion', 'Administrador']}>
              <DetalleAlistamiento />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/actividades/empaque"
          element={
            <RoleProtectedRoute allowedRoles={['Jefe_Bodega', 'Operario', 'Facturacion', 'Administrador']}>
              <ListaEmpaque />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/actividades/empaque/:ordenId"
          element={
            <RoleProtectedRoute allowedRoles={['Jefe_Bodega', 'Operario', 'Facturacion', 'Administrador']}>
              <DetalleEmpaque />
            </RoleProtectedRoute>
          }
        />

        {/* Recepciones - No accesible para Vendedor */}
        <Route
          path="/recepciones"
          element={
            <RoleProtectedRoute allowedRoles={['Jefe_Bodega', 'Operario', 'Facturacion', 'Administrador']}>
              <Recepciones />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/proveedores"
          element={
            <ProtectedRoute>
              <Proveedores />
            </ProtectedRoute>
          }
        />

        {/* Averías - No accesible para Vendedor */}
        <Route
          path="/averias"
          element={
            <RoleProtectedRoute allowedRoles={['Jefe_Bodega', 'Operario', 'Facturacion', 'Administrador']}>
              <Averias />
            </RoleProtectedRoute>
          }
        />

        {/* Almacenes - Solo Jefe_Bodega y Administrador */}
        <Route
          path="/almacenes"
          element={
            <RoleProtectedRoute allowedRoles={['Jefe_Bodega', 'Administrador']}>
              <Almacenes />
            </RoleProtectedRoute>
          }
        />

        {/* Facturación - No accesible para Operarios */}
        <Route
          path="/facturacion"
          element={
            <RoleProtectedRoute allowedRoles={['Facturacion', 'Jefe_Bodega', 'Administrador']}>
              <Facturacion />
            </RoleProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

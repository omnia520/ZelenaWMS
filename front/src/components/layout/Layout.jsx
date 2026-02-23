import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import {
  Package,
  Users,
  ShoppingCart,
  MapPin,
  Inbox,
  AlertTriangle,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  HardHat,
  FileText,
  Warehouse,
  BarChart3
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['all'] },
    { path: '/actividades', icon: HardHat, label: 'Actividades', roles: ['Jefe_Bodega', 'Operario', 'Facturacion', 'Administrador'] },
    { path: '/desempeno', icon: BarChart3, label: 'Desempeño', roles: ['Operario', 'Jefe_Bodega', 'Administrador'] },
    { path: '/clientes', icon: Users, label: 'Clientes', roles: ['Vendedor', 'Jefe_Bodega', 'Facturacion', 'Administrador'] },
    { path: '/productos', icon: Package, label: 'Productos', roles: ['all'] },
    { path: '/ordenes', icon: ShoppingCart, label: 'Órdenes', roles: ['all'] },
    { path: '/ubicaciones', icon: MapPin, label: 'Ubicaciones', roles: ['Jefe_Bodega', 'Operario', 'Facturacion', 'Administrador'] },
    { path: '/recepciones', icon: Inbox, label: 'Recepciones', roles: ['Jefe_Bodega', 'Operario', 'Facturacion', 'Administrador'] },
    { path: '/averias', icon: AlertTriangle, label: 'Averías', roles: ['Jefe_Bodega', 'Operario', 'Facturacion', 'Administrador'] },
    { path: '/almacenes', icon: Warehouse, label: 'Almacenes', roles: ['Jefe_Bodega', 'Administrador'] },
    { path: '/facturacion', icon: FileText, label: 'Facturación', roles: ['Facturacion', 'Jefe_Bodega', 'Administrador'] },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes('all') || item.roles.includes(user?.rol)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">WMS</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <p className="text-sm font-medium text-gray-900">{user?.nombre}</p>
            <p className="text-xs text-gray-500">{user?.rol}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 sm:px-6 bg-white shadow">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {filteredMenuItems.find(item => item.path === location.pathname)?.label || 'WMS'}
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[120px] sm:max-w-none">{user?.email}</span>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

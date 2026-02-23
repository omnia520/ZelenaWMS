import { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, TrendingUp, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { productosAPI, clientesAPI, ordenesAPI } from '../../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalClientes: 0,
    ordenesActivas: 0,
    ordenesPendientes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [productos, clientes, ordenes] = await Promise.all([
        productosAPI.getAll(),
        clientesAPI.getAll(),
        ordenesAPI.getAll(),
      ]);

      const ordenesData = ordenes.data.data || [];
      const ordenesActivas = ordenesData.filter(o =>
        ['En_Alistamiento', 'En_Empaque'].includes(o.estado)
      ).length;
      const ordenesPendientes = ordenesData.filter(o =>
        o.estado === 'Pendiente'
      ).length;

      setStats({
        totalProductos: productos.data.count || 0,
        totalClientes: clientes.data.count || 0,
        ordenesActivas,
        ordenesPendientes,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Productos',
      value: stats.totalProductos,
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Clientes',
      value: stats.totalClientes,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Órdenes Activas',
      value: stats.ordenesActivas,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Órdenes Pendientes',
      value: stats.ordenesPendientes,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Resumen general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-8 w-8 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <a
            href="/ordenes"
            className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Nueva Orden</h4>
            <p className="text-xs sm:text-sm text-gray-600">Crear orden de venta</p>
          </a>

          <a
            href="/productos"
            className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Productos</h4>
            <p className="text-xs sm:text-sm text-gray-600">Ver catálogo</p>
          </a>

          <a
            href="/clientes"
            className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Clientes</h4>
            <p className="text-xs sm:text-sm text-gray-600">Gestionar clientes</p>
          </a>
        </div>
      </div>

      {/* Sección especial para Jefe de Bodega */}
      {(user?.rol === 'Jefe_Bodega' || user?.rol === 'Administrador') && (
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Panel de Jefe de Bodega</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/ordenes/aprobar')}
              className="p-4 border-2 border-orange-200 bg-orange-50 rounded-lg hover:border-orange-500 hover:bg-orange-100 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-6 w-6 text-orange-600" />
                    <h4 className="font-medium text-gray-900">Aprobar Órdenes</h4>
                  </div>
                  <p className="text-sm text-gray-600">Revisar y aprobar órdenes pendientes</p>
                </div>
                {stats.ordenesPendientes > 0 && (
                  <div className="bg-orange-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">
                    {stats.ordenesPendientes}
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

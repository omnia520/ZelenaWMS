import { Trophy, Medal, Award } from 'lucide-react';

export default function RankingCard({
  title,
  rankings = [],
  metrica = 'unidades',
  loading = false
}) {
  const getMedalIcon = (posicion) => {
    switch (posicion) {
      case 1:
        return <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />;
      default:
        return <span className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-500">{posicion}</span>;
    }
  };

  const getMedalBg = (posicion) => {
    switch (posicion) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{title}</h3>
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate pr-2">{title}</h3>
        <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0" />
      </div>

      {rankings.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <Trophy className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-gray-300 mb-2" />
          <p className="text-xs sm:text-sm text-gray-500">Sin datos para mostrar</p>
        </div>
      ) : (
        <div className="space-y-1.5 sm:space-y-2">
          {rankings.map((item) => (
            <div
              key={item.usuario_id}
              className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border ${getMedalBg(item.posicion)}`}
            >
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                {getMedalIcon(item.posicion)}
                <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">{item.nombre}</span>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                  {item.valor?.toLocaleString() || 0}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 ml-0.5 sm:ml-1">
                  {metrica === 'unidades' ? 'uds' : 'órd'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

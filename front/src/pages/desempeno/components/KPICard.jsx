import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  trendValue,
  compact = false
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-500',
      text: 'text-blue-600',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-500',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-500',
      text: 'text-purple-600',
      border: 'border-purple-200'
    },
    orange: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-500',
      text: 'text-orange-600',
      border: 'border-orange-200'
    },
    indigo: {
      bg: 'bg-indigo-50',
      iconBg: 'bg-indigo-500',
      text: 'text-indigo-600',
      border: 'border-indigo-200'
    },
    cyan: {
      bg: 'bg-cyan-50',
      iconBg: 'bg-cyan-500',
      text: 'text-cyan-600',
      border: 'border-cyan-200'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-3 sm:p-4 lg:p-5 transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-600 mb-0.5 sm:mb-1 truncate">
            {title}
          </p>
          <p className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold ${colors.text} truncate`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">
              {subtitle}
            </p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center mt-1 sm:mt-2 text-[10px] sm:text-xs lg:text-sm ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend === 'up' && <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />}
              <span className="truncate">{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`${colors.iconBg} p-1.5 sm:p-2 lg:p-3 rounded-lg flex-shrink-0`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { SystemMetric } from '../types';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface MetricsWidgetProps {
  metrics: SystemMetric[];
}

export const MetricsWidget: React.FC<MetricsWidgetProps> = ({ metrics }) => {
  const trendIcon = (trend: SystemMetric['trend']) => {
    if (trend === 'up')   return <TrendingUp  size={14} className="text-sx-success" />;
    if (trend === 'down') return <TrendingDown size={14} className="text-sx-error" />;
    return <Minus size={14} className="text-sx-faint" />;
  };

  const statusIcon = (status: SystemMetric['status']) => {
    if (status === 'healthy')  return <CheckCircle size={14} className="text-sx-success" />;
    if (status === 'warning')  return <AlertCircle size={14} className="text-sx-warning" />;
    return <AlertTriangle size={14} className="text-sx-error" />;
  };

  const statusBorder = (status: SystemMetric['status']) => {
    if (status === 'healthy')  return 'border-sx-success/30';
    if (status === 'warning')  return 'border-sx-warning/30';
    return 'border-sx-error/30';
  };

  const barColor = (status: SystemMetric['status']) => {
    if (status === 'healthy') return 'bg-sx-success';
    if (status === 'warning') return 'bg-sx-warning';
    return 'bg-sx-error';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className={`bg-sx-elevated border ${statusBorder(metric.status)} p-4`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sx-muted text-xs font-medium">{metric.name}</p>
            <div className="flex items-center space-x-1">
              {statusIcon(metric.status)}
              {trendIcon(metric.trend)}
            </div>
          </div>

          <div className="flex items-baseline space-x-2 mb-3">
            <span className="text-2xl font-medium text-sx-glow">
              {metric.value.toLocaleString()}
            </span>
            <span className="text-sx-faint text-sm">{metric.unit}</span>
          </div>

          <div className="h-0.5 bg-sx-border overflow-hidden">
            <div
              className={`h-full ${barColor(metric.status)} transition-all duration-500`}
              style={{ width: `${Math.min(100, metric.value)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

import React from 'react';
import { Wifi, Zap } from 'lucide-react';
import { WifiSpeed } from '../../types';

interface Props {
  speed: WifiSpeed;
  mbps?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const WifiSpeedMeter: React.FC<Props> = ({ speed, mbps, size = 'sm' }) => {
  const config = {
    ultra_fast: {
      label: 'Ultra Fiber',
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/50 border-emerald-700/40',
      bars: 4,
    },
    fast: {
      label: 'High Speed',
      color: 'text-teal-400',
      bg: 'bg-teal-950/50 border-teal-700/40',
      bars: 3,
    },
    decent: {
      label: 'Decent',
      color: 'text-amber-400',
      bg: 'bg-amber-950/50 border-amber-700/40',
      bars: 2,
    },
    slow_none: {
      label: 'Low / Offline',
      color: 'text-slate-400',
      bg: 'bg-slate-900 border-slate-700',
      bars: 1,
    },
  }[speed] || {
    label: speed,
    color: 'text-slate-400',
    bg: 'bg-slate-900 border-slate-700',
    bars: 2,
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-sm backdrop-blur-sm ${config.bg} ${config.color} ${sizeClasses}`}
    >
      <Wifi className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>{mbps ? `${mbps} Mbps` : config.label}</span>
    </span>
  );
};

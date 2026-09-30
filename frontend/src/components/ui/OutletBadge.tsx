import React from 'react';
import { BatteryCharging, Plug, Zap } from 'lucide-react';
import { OutletDensity } from '../../types';

interface Props {
  density: OutletDensity;
  size?: 'sm' | 'md';
}

export const OutletBadge: React.FC<Props> = ({ density, size = 'sm' }) => {
  const config = {
    abundant: {
      label: 'Every Desk Outlet',
      color: 'text-amber-400',
      bg: 'bg-amber-950/40 border-amber-700/40',
    },
    moderate: {
      label: 'Near Walls & Booths',
      color: 'text-slate-300',
      bg: 'bg-slate-800/80 border-slate-700',
    },
    scarce: {
      label: 'Limited Outlets',
      color: 'text-rose-400',
      bg: 'bg-rose-950/40 border-rose-800/40',
    },
    none: {
      label: 'Battery Only',
      color: 'text-slate-500',
      bg: 'bg-slate-900 border-slate-800',
    },
  }[density] || {
    label: density,
    color: 'text-slate-400',
    bg: 'bg-slate-800 border-slate-700',
  };

  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-1 gap-1.5' : 'text-sm px-3 py-1.5 gap-2';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-sm backdrop-blur-sm ${config.bg} ${config.color} ${sizeClasses}`}
    >
      <Plug className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>{config.label}</span>
    </span>
  );
};

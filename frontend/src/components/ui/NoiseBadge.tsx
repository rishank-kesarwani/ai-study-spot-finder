import React from 'react';
import { VolumeX, Volume1, Volume2, Volume } from 'lucide-react';
import { NoiseLevel } from '../../types';

interface Props {
  level: NoiseLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const NoiseBadge: React.FC<Props> = ({ level, size = 'sm', showLabel = true }) => {
  const config = {
    silent: {
      label: 'Silent Focus',
      icon: VolumeX,
      bg: 'bg-indigo-950/60 text-indigo-300 border-indigo-700/40',
      indicator: 'bg-indigo-400',
    },
    quiet: {
      label: 'Whisper Quiet',
      icon: Volume1,
      bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40',
      indicator: 'bg-emerald-400',
    },
    moderate: {
      label: 'Moderate Chatter',
      icon: Volume2,
      bg: 'bg-amber-950/60 text-amber-300 border-amber-700/40',
      indicator: 'bg-amber-400',
    },
    buzzing: {
      label: 'Energetic Buzz',
      icon: Volume,
      bg: 'bg-rose-950/60 text-rose-300 border-rose-700/40',
      indicator: 'bg-rose-400',
    },
  }[level] || {
    label: level,
    icon: Volume1,
    bg: 'bg-slate-800 text-slate-300 border-slate-700',
    indicator: 'bg-slate-400',
  };

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-sm backdrop-blur-sm ${config.bg} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};

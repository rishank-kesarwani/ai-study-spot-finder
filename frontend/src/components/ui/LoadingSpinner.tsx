import React from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<Props> = ({
  size = 'md',
  label,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-8 text-slate-400 ${className}`}>
      <Loader2 className={`${sizeMap} animate-spin text-primary-400`} />
      {label && <p className="text-sm font-medium animate-pulse">{label}</p>}
    </div>
  );
};

import React from 'react';
import { Sparkles, MapPinOff, BookOpen, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface Props {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<Props> = ({
  icon: Icon = BookOpen,
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-surface-card border border-surface-border">
      <div className="w-16 h-16 rounded-2xl bg-surface border border-surface-border flex items-center justify-center mb-4 text-primary-400 shadow-glow">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && (
        actionHref ? (
          <Link
            href={actionHref}
            className="py-2.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium shadow-glow transition-all"
          >
            {actionText}
          </Link>
        ) : (
          <button
            onClick={onActionClick}
            className="py-2.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium shadow-glow transition-all"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
};

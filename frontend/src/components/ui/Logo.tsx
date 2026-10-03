import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
  href?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = true,
  className = '',
  href = '/',
}) => {
  const sizeConfig = {
    sm: {
      iconSize: 'w-7 h-7',
      svgViewBox: '32',
      titleClass: 'text-sm font-bold',
      badgeClass: 'text-[9px] px-1 py-0.2',
      subClass: 'text-[9px]',
    },
    md: {
      iconSize: 'w-10 h-10',
      svgViewBox: '512',
      titleClass: 'text-base font-bold',
      badgeClass: 'text-xs px-1.5 py-0.5',
      subClass: 'text-[10px]',
    },
    lg: {
      iconSize: 'w-12 h-12',
      svgViewBox: '512',
      titleClass: 'text-xl font-extrabold',
      badgeClass: 'text-xs px-2 py-0.5',
      subClass: 'text-xs',
    },
    xl: {
      iconSize: 'w-16 h-16',
      svgViewBox: '512',
      titleClass: 'text-2xl font-black',
      badgeClass: 'text-sm px-2.5 py-1',
      subClass: 'text-sm',
    },
  };

  const current = sizeConfig[size];

  const logoIcon = (
    <div
      className={`relative ${current.iconSize} rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-primary-500/40 p-1 flex items-center justify-center shadow-glow group-hover:scale-105 group-hover:border-primary-400/70 transition-all duration-300 flex-shrink-0 overflow-hidden`}
    >
      {/* Background Ambient Aura */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/30 via-indigo-600/20 to-emerald-500/30 blur-sm pointer-events-none" />

      {/* Embedded Vector Graphic */}
      <svg
        viewBox="0 0 512 512"
        className="w-full h-full relative z-10 drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoSphereGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366F1" />
            <stop offset="50%" stop-color="#8B5CF6" />
            <stop offset="100%" stop-color="#10B981" />
          </linearGradient>
          <linearGradient id="logoFolioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="100%" stop-color="#C7D2FE" />
          </linearGradient>
          <linearGradient id="logoSparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#10B981" />
            <stop offset="100%" stop-color="#06B6D4" />
          </linearGradient>
        </defs>

        {/* Orbit Focus Ring */}
        <circle
          cx="256"
          cy="256"
          r="160"
          stroke="url(#logoSphereGrad)"
          strokeWidth="10"
          strokeDasharray="24 16"
          strokeOpacity="0.6"
          transform="rotate(-20 256 256)"
        />

        {/* Spatial Sphere Perimeter */}
        <circle cx="256" cy="256" r="120" stroke="url(#logoSphereGrad)" strokeWidth="16" strokeOpacity="0.9" />
        <ellipse
          cx="256"
          cy="256"
          rx="145"
          ry="65"
          stroke="url(#logoSparkGrad)"
          strokeWidth="8"
          strokeOpacity="0.8"
          transform="rotate(-30 256 256)"
        />
        <circle cx="380" cy="188" r="12" fill="#34D399" />

        {/* Scholarly Folio / Open Book */}
        <path
          d="M 256 316 C 220 286 168 284 132 296 L 132 192 C 170 180 220 182 256 212 Z"
          fill="url(#logoFolioGrad)"
          fillOpacity="0.95"
        />
        <path
          d="M 256 316 C 292 286 344 284 380 296 L 380 192 C 342 180 292 182 256 212 Z"
          fill="url(#logoFolioGrad)"
          fillOpacity="0.95"
        />
        <path d="M 256 210 L 256 324" stroke="#6366F1" strokeWidth="6" strokeLinecap="round" />

        {/* AI Luminary Star */}
        <g transform="translate(256, 168)">
          <path
            d="M 0 -40 Q 0 0 -40 0 Q 0 0 0 40 Q 0 0 40 0 Q 0 0 0 -40 Z"
            fill="url(#logoSparkGrad)"
          />
          <circle cx="0" cy="0" r="9" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      {logoIcon}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`${current.titleClass} text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-primary-200 transition-all`}
            >
              StudySphere
            </span>
            <span
              className={`${current.badgeClass} rounded-md bg-gradient-to-r from-primary-600/30 to-indigo-600/30 text-primary-300 font-bold border border-primary-500/40 shadow-sm`}
            >
              AI
            </span>
          </div>
          {showSubtitle && (
            <span className={`${current.subClass} text-slate-400 font-medium tracking-wide leading-tight`}>
              Smart Study Spot Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};

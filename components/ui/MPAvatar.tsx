'use client';

import React, { useState } from 'react';

interface MPAvatarProps {
  imageUrl?: string | null;
  name: string;
  party?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showPartyBadge?: boolean;
}

export const MPAvatar: React.FC<MPAvatarProps> = ({
  imageUrl,
  name,
  party,
  size = 'md',
  className = '',
  showPartyBadge = false,
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-xs',
    md: 'w-12 h-12 rounded-xl text-sm',
    lg: 'w-14 h-14 sm:w-16 sm:h-16 rounded-xl text-base sm:text-lg',
    xl: 'w-20 h-20 sm:w-22 sm:h-22 rounded-2xl text-xl sm:text-2xl',
  };

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <div className={`relative shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} bg-stone-100 dark:bg-[#151E2B] border border-stone-200/90 dark:border-[#26344A] overflow-hidden flex items-center justify-center font-bold font-mono text-stone-800 dark:text-stone-200 shadow-xs relative group-hover:border-amber-500/80 transition-all`}
      >
        {imageUrl && !hasError ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
            onError={() => setHasError(true)}
            loading={size === 'xl' ? 'eager' : 'lazy'}
          />
        ) : (
          <span className="select-none tracking-tight">{initials}</span>
        )}
      </div>

      {showPartyBadge && party && (
        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-stone-900 dark:bg-amber-600 text-white font-bold font-mono text-[9px] sm:text-[10px] tracking-wider uppercase shadow-xs border border-white/20">
          {party}
        </div>
      )}
    </div>
  );
};


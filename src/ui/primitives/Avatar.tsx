import React from 'react';

interface AvatarProps {
  initials: string;
  name?: string;
  colorClass?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  status?: 'online' | 'away' | 'offline';
}

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-xs',
  lg: 'w-11 h-11 text-sm',
};

const STATUS_DOT = {
  online: 'bg-emerald-500',
  away: 'bg-amber-400',
  offline: 'bg-slate-300',
};

export function Avatar({
  initials,
  name,
  colorClass = 'bg-indigo-600',
  size = 'md',
  status,
}: AvatarProps) {
  return (
    <div className="relative inline-flex shrink-0" title={name}>
      <div
        className={`${SIZES[size]} ${colorClass} rounded-full text-white font-semibold flex items-center justify-center ring-2 ring-white transition-transform duration-150 hover:scale-105`}
      >
        {initials}
      </div>
      {status && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${STATUS_DOT[status]}`}
        />
      )}
    </div>
  );
}

'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({
  interactive = false,
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-soft ${
        interactive
          ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-hover hover:border-slate-300 cursor-pointer'
          : ''
      } ${PADDING[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

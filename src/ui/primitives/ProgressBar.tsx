import React from 'react';

interface ProgressBarProps {
  value: number;
  colorClass?: string;
  heightClass?: string;
}

export function ProgressBar({
  value,
  colorClass = 'bg-indigo-600',
  heightClass = 'h-2',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full ${heightClass} rounded-full bg-slate-100 overflow-hidden`}>
      <div
        className={`${heightClass} ${colorClass} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

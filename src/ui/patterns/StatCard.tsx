'use client';

import React from 'react';
import { Card } from '../primitives/Card';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendTone?: 'positive' | 'neutral' | 'warning';
  icon: React.ReactNode;
  iconBg?: string;
}

export function StatCard({
  label,
  value,
  trend,
  trendTone = 'positive',
  icon,
  iconBg = 'bg-indigo-50 text-indigo-600',
}: StatCardProps) {
  const trendColor =
    trendTone === 'positive'
      ? 'text-emerald-600 bg-emerald-50'
      : trendTone === 'warning'
      ? 'text-amber-700 bg-amber-50'
      : 'text-slate-600 bg-slate-100';

  return (
    <Card interactive className="group">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{value}</p>
          {trend && (
            <span
              className={`inline-block mt-2.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${trendColor}`}
            >
              {trend}
            </span>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${iconBg}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

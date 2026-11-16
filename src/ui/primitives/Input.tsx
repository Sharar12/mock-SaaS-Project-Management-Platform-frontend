'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="block text-xs font-medium text-slate-700">{label}</span>}
      <input
        className={`w-full h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300 ${className}`}
        {...props}
      />
    </label>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="block text-xs font-medium text-slate-700">{label}</span>}
      <textarea
        className={`w-full p-3.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300 ${className}`}
        {...props}
      />
    </label>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="block text-xs font-medium text-slate-700">{label}</span>}
      <select
        className={`w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 transition-all duration-150 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

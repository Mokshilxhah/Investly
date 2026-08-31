import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-[#10b981] animate-spin`} />
    </div>
  );
};

export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
    <Spinner size="lg" />
    <span className="text-xs font-bold font-display text-slate-500">Loading...</span>
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-[24px] p-5 shadow-xs border border-slate-200/80 animate-pulse space-y-4">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="h-5 w-32 rounded bg-slate-200" />
        <div className="h-3 w-20 rounded bg-slate-200" />
      </div>
      <div className="h-6 w-20 rounded-full bg-slate-200" />
    </div>
    <div className="space-y-2">
      <div className="h-3 w-full rounded bg-slate-200" />
      <div className="h-3 w-4/5 rounded bg-slate-200" />
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="h-16 w-full rounded-2xl bg-white border border-slate-200/80 animate-pulse"
      />
    ))}
  </div>
);

export default Spinner;

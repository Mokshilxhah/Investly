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

export const PageLoader = ({ text = 'Loading...' }) => {
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  let statusText = text;
  if (seconds >= 2 && seconds < 5) {
    statusText = 'Connecting to cloud database...';
  } else if (seconds >= 5) {
    statusText = 'Waking up live backend (Render free tier may take ~30s on first load)...';
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 px-4 text-center">
      <div className="relative">
        <Spinner size="lg" />
      </div>
      <div className="space-y-1 max-w-sm">
        <span className="text-xs font-bold font-display text-slate-700 block transition-all">
          {statusText}
        </span>
        {seconds >= 5 && (
          <p className="text-[11px] text-slate-400 font-medium animate-pulse">
            Please hang tight, data will appear as soon as the server wakes up!
          </p>
        )}
      </div>
    </div>
  );
};

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

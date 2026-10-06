import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3"></div>
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-4/5"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-16"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div>
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-24"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-md w-28"></div>
      </div>
    </div>
  );
};

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

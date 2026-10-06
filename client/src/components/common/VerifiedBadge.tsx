import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface VerifiedBadgeProps {
  type?: 'college' | 'business' | 'trust';
  label?: string;
  size?: 'sm' | 'md';
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  type = 'college',
  label,
  size = 'md',
}) => {
  const isCollege = type === 'college';
  const displayLabel = label || (isCollege ? 'College Verified' : 'Verified Business');

  return (
    <span
      title={displayLabel}
      className={`inline-flex items-center gap-1 font-semibold rounded-full border transition-all ${
        size === 'sm'
          ? 'px-2 py-0.5 text-[11px]'
          : 'px-2.5 py-1 text-xs'
      } ${
        isCollege
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
          : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
      }`}
    >
      {isCollege ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-success fill-success/10" />
      ) : (
        <ShieldCheck className="w-3.5 h-3.5 text-accentBlue fill-accentBlue/10" />
      )}
      <span>{displayLabel}</span>
    </span>
  );
};

import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

interface SkillChipProps {
  name: string;
  level?: number;
  verified?: boolean;
  size?: 'sm' | 'md';
}

export const SkillChip: React.FC<SkillChipProps> = ({ name, level, verified, size = 'md' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-all ${
        size === 'sm'
          ? 'px-2 py-0.5 text-xs'
          : 'px-3 py-1 text-xs md:text-sm'
      } bg-brand-light/40 border-brand/20 text-brand-dark dark:bg-brand/10 dark:border-brand/40 dark:text-purple-300`}
    >
      <span>{name}</span>

      {level && (
        <span className="flex items-center text-amber-500 font-semibold text-xs ml-0.5">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
          <span className="ml-0.5">{level}</span>
        </span>
      )}

      {verified && (
        <span title="Verified Skill">
          <CheckCircle className="w-3.5 h-3.5 text-success inline ml-0.5" />
        </span>
      )}
    </span>
  );
};

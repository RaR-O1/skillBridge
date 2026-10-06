import React, { useState } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecommendationCardProps {
  id: string;
  title: string;
  type: 'project' | 'team' | 'mentor';
  category: string;
  whyMatch: string;
  targetUrl: string;
  onDismiss?: (id: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  id,
  title,
  type,
  category,
  whyMatch,
  targetUrl,
  onDismiss,
}) => {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50/70 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-brand/20 dark:border-brand/30 rounded-card p-4 shadow-xs relative transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-brand/10 text-brand dark:text-purple-300 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand dark:text-purple-400">
                Recommended {type}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{category}</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-brand transition-colors">
              <Link to={targetUrl}>{title}</Link>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5 italic">
              <span className="font-semibold text-brand-dark dark:text-purple-300 not-italic">
                Why match:
              </span>
              "{whyMatch}"
            </p>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => {
            setDismissed(true);
            onDismiss && onDismiss(id);
          }}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          title="Dismiss recommendation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-brand/10 dark:border-brand/20">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Helpful match?</span>
          <button
            onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
            className={`p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors ${
              feedback === 'up' ? 'text-success font-bold bg-white dark:bg-slate-800 shadow-xs' : 'text-slate-400'
            }`}
            title="Good match"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
            className={`p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors ${
              feedback === 'down' ? 'text-rose-500 font-bold bg-white dark:bg-slate-800 shadow-xs' : 'text-slate-400'
            }`}
            title="Poor match"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <Link
          to={targetUrl}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-dark dark:text-purple-300 dark:hover:text-purple-200"
        >
          <span>Explore</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

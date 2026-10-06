import React, { useState } from 'react';
import { Sparkles, X, Check, Edit2 } from 'lucide-react';

interface AIHelperSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  suggestion: string;
  whyExplanation?: string;
  onAccept: (text: string) => void;
}

export const AIHelperSheet: React.FC<AIHelperSheetProps> = ({
  isOpen,
  onClose,
  title,
  suggestion,
  whyExplanation,
  onAccept,
}) => {
  const [editedText, setEditedText] = useState(suggestion);
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-card p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-brand/10 text-brand dark:text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-light text-brand dark:bg-brand/20 dark:text-purple-300">
                  AI Assistant
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generated suggestions are drafts. AI never auto-sends without your consent.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {whyExplanation && (
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-brand dark:text-purple-400">Why this suggestion: </span>
            {whyExplanation}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {isEditing ? 'Edit Suggestion' : 'Draft Suggestion'}
          </label>
          {isEditing ? (
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={5}
              className="w-full text-sm p-3 rounded-lg border border-brand/50 dark:border-brand/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          ) : (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {editedText}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand dark:text-purple-400 hover:underline min-h-touch"
          >
            <Edit2 className="w-3.5 h-3.5" />
            {isEditing ? 'Preview' : 'Edit Text'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-button min-h-touch"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                onAccept(editedText);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-button transition-colors min-h-touch"
            >
              <Check className="w-4 h-4" />
              Accept & Insert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

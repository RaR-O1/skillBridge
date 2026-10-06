import React from 'react';
import { AlertCircle, IndianRupee } from 'lucide-react';

export const PaymentNoteBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div
      role="note"
      className={`rounded-card border border-amber-200 bg-amber-50/90 dark:border-amber-900/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 flex items-start gap-3 ${
        compact ? 'p-3 text-xs' : 'p-4 text-sm'
      }`}
    >
      <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 mt-0.5 shrink-0">
        <IndianRupee className="w-4 h-4" />
      </div>
      <div>
        <h4 className="font-semibold text-amber-950 dark:text-amber-100">
          Direct Peer-to-Peer Settlement Notice
        </h4>
        <p className="mt-0.5 text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
          SkillBridge records the agreement and confirmations. Students and businesses pay each other directly (UPI, bank transfer, or cash); there are no in-app marketplace payments. Once payment is made and confirmed by the student, reviews unlock.
        </p>
      </div>
    </div>
  );
};

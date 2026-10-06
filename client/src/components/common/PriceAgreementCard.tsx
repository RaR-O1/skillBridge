import React, { useState } from 'react';
import { IAgreement, IProject } from '../../types';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { CheckCircle2, Clock, IndianRupee, ShieldCheck, Check } from 'lucide-react';

interface PriceAgreementCardProps {
  project: IProject;
  agreement: IAgreement | null;
  onRefresh: () => void;
}

export const PriceAgreementCard: React.FC<PriceAgreementCardProps> = ({
  project,
  agreement,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!agreement) {
    return null;
  }

  const isOwner = user?._id === project.ownerId?._id;
  const isStudent = user?._id === project.assignedStudentId?._id;

  const bothConfirmed = agreement.businessConfirmed && agreement.studentConfirmed;

  const handleConfirmAgreement = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.agreements.confirm(agreement._id);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to confirm agreement');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPaymentReceived = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.agreements.confirmPaymentReceived(project._id);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-brand/20 dark:border-brand/40 rounded-card p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-brand/10 text-brand dark:text-purple-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Official Price & Milestone Agreement
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Binding terms recorded on SkillBridge ledger
            </p>
          </div>
        </div>

        <div className="flex items-baseline gap-1 bg-brand-light/50 dark:bg-brand/20 px-3 py-1.5 rounded-lg border border-brand/20 text-brand-dark dark:text-purple-200">
          <span className="text-xs font-semibold">Agreed:</span>
          <span className="text-lg font-black tracking-tight flex items-center">
            <IndianRupee className="w-4 h-4" />
            {agreement.amountINR.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Confirmation Tracker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Business Confirmation */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between ${
            agreement.businessConfirmed
              ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900'
              : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700'
          }`}
        >
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Client / Business
            </span>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {project.ownerId?.businessName || project.ownerId?.name}
            </div>
            {agreement.businessConfirmedAt && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(agreement.businessConfirmedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <div>
            {agreement.businessConfirmed ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-success bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-emerald-300 dark:border-emerald-700 shadow-xs">
                <Check className="w-3.5 h-3.5" /> Confirmed
              </span>
            ) : isOwner ? (
              <button
                onClick={handleConfirmAgreement}
                disabled={loading}
                className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-button transition-colors min-h-touch"
              >
                Confirm Terms
              </button>
            ) : (
              <span className="text-xs text-amber-600 font-medium">Pending Confirmation</span>
            )}
          </div>
        </div>

        {/* Student Confirmation */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between ${
            agreement.studentConfirmed
              ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900'
              : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700'
          }`}
        >
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Assigned Student
            </span>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {project.assignedStudentId?.name || 'Selected Student'}
            </div>
            {agreement.studentConfirmedAt && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(agreement.studentConfirmedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <div>
            {agreement.studentConfirmed ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-success bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-emerald-300 dark:border-emerald-700 shadow-xs">
                <Check className="w-3.5 h-3.5" /> Confirmed
              </span>
            ) : isStudent ? (
              <button
                onClick={handleConfirmAgreement}
                disabled={loading}
                className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-button transition-colors min-h-touch"
              >
                Confirm Agreement
              </button>
            ) : (
              <span className="text-xs text-amber-600 font-medium">Pending Student</span>
            )}
          </div>
        </div>
      </div>

      {/* Payment Settlement Status */}
      {project.status === 'completed' && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Payment Settlement Status
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {agreement.paymentReceived
                  ? `Payment of ₹${agreement.amountINR} confirmed received. Reviews are unlocked!`
                  : 'Deliverable approved. Client settles payment directly; student confirms receipt.'}
              </p>
            </div>

            {agreement.paymentReceived ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settled & Confirmed
              </span>
            ) : isStudent ? (
              <button
                onClick={handleConfirmPaymentReceived}
                disabled={loading}
                className="px-4 py-2 bg-success hover:bg-success-dark text-white font-semibold text-xs rounded-button transition-colors shadow-sm min-h-touch flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Payment Received
              </button>
            ) : (
              <span className="text-xs text-amber-600 font-medium">
                Awaiting student confirmation
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

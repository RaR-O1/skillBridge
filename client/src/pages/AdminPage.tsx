import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/authContext';
import { IReport, IAuditLog, IUser } from '../types';
import { CardSkeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  BarChart3,
  UserCheck,
  Ban,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'queue';

  const [queue, setQueue] = useState<{ students: IUser[]; businesses: IUser[]; companies?: any[] }>({
    students: [],
    businesses: [],
    companies: [],
  });
  const [reports, setReports] = useState<IReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'queue') {
        const res = await api.admin.getQueue();
        setQueue(res);
      } else if (activeTab === 'reports') {
        const res = await api.reports.list();
        setReports(res.reports || []);
      } else if (activeTab === 'audit') {
        const res = await api.admin.getAuditLogs();
        setAuditLogs(res.logs || []);
      } else if (activeTab === 'metrics') {
        const res = await api.admin.getMetrics();
        setMetrics(res.metrics);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  // Verification actions
  const handleVerify = async (userId: string, type: 'college' | 'business', approved: boolean) => {
    try {
      await api.admin.verifyUser(userId, { type, approved });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleVerifyCompany = async (companyId: string, approved: boolean) => {
    try {
      await api.admin.verifyCompany(companyId, approved);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  // Report resolution & moderation
  const handleResolveReport = async (reportId: string, action: 'none' | 'warn' | 'suspend' | 'ban') => {
    const notes = prompt(`Resolution notes for ${action} action:`, 'Issue investigated and resolved.');
    if (notes === null) return;

    try {
      await api.reports.updateStatus(reportId, {
        status: 'resolved',
        resolutionNotes: notes,
        actionToTake: action,
      });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-100 text-danger dark:bg-rose-950/60 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              SkillBridge Admin Console
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verification queues, peer-to-peer payment disputes, moderation actions, and tamper-evident audit logs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {[
            { id: 'queue', label: 'Verifications', icon: UserCheck },
            { id: 'reports', label: 'Disputes & Reports', icon: AlertTriangle },
            { id: 'audit', label: 'Audit Log', icon: FileText },
            { id: 'metrics', label: 'Metrics', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-touch ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAdminData} />
      ) : (
        <>
          {/* TAB 1: VERIFICATION QUEUE */}
          {activeTab === 'queue' && (
            <div className="space-y-6">
              {/* College Verification Queue */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Student College Email Approvals ({queue.students?.length || 0})
                </h3>

                {queue.students?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No pending student verifications.</p>
                ) : (
                  <div className="space-y-2">
                    {queue.students?.map((s) => (
                      <div
                        key={s._id}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-xs text-slate-900 dark:text-white">
                            {s.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {s.collegeEmail} • {s.college}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerify(s._id, 'college', false)}
                            className="px-2.5 py-1 text-xs border border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-button"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleVerify(s._id, 'college', true)}
                            className="px-3 py-1 text-xs bg-success hover:bg-success-dark text-white font-bold rounded-button"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Business Verification Queue */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-accentBlue" />
                  Business & Company Verifications ({queue.businesses?.length || 0})
                </h3>

                {queue.businesses?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No pending business verifications.</p>
                ) : (
                  <div className="space-y-2">
                    {queue.businesses?.map((b) => (
                      <div
                        key={b._id}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-xs text-slate-900 dark:text-white">
                            {b.businessName || b.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {b.email} • Role: {b.role}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerify(b._id, 'business', false)}
                            className="px-2.5 py-1 text-xs border border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-button"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleVerify(b._id, 'business', true)}
                            className="px-3 py-1 text-xs bg-accentBlue hover:bg-blue-700 text-white font-bold rounded-button"
                          >
                            Verify Business
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Company Entity Verification Queue (Stage 2A) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  Hiring Company Profiles ({queue.companies?.length || 0})
                </h3>

                {(!queue.companies || queue.companies.length === 0) ? (
                  <p className="text-xs text-slate-400 py-2">No pending company profile verifications.</p>
                ) : (
                  <div className="space-y-2">
                    {queue.companies.map((c: any) => (
                      <div
                        key={c._id}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-xs text-slate-900 dark:text-white">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Domain: {c.domain} • {c.description?.slice(0, 70)}...
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerifyCompany(c._id, false)}
                            className="px-2.5 py-1 text-xs border border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-button"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleVerifyCompany(c._id, true)}
                            className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-button"
                          >
                            Verify Company
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DISPUTES & REPORTS */}
          {activeTab === 'reports' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Disputes & Incident Reports ({reports.length})
              </h3>

              {reports.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No reports filed.</p>
              ) : (
                <div className="space-y-3">
                  {reports.map((rep) => (
                    <div
                      key={rep._id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-danger px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60">
                            {rep.category.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-500">
                            Reported by {rep.reporterId?.name} ({rep.reporterId?.role})
                          </span>
                        </div>
                        <span className="text-xs font-bold uppercase text-slate-400">
                          Status: {rep.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {rep.description}
                      </p>

                      {rep.evidenceUrl && (
                        <a
                          href={rep.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand hover:underline font-semibold"
                        >
                          <span>View Supporting Evidence</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {rep.targetUserId && (
                        <div className="text-xs text-slate-500">
                          Accused: <span className="font-bold text-slate-800 dark:text-slate-200">{rep.targetUserId.name}</span> • Status: {rep.targetUserId.status} • Trust Score: {rep.targetUserId.trustScore}
                        </div>
                      )}

                      {rep.status === 'pending' && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap gap-2 justify-end">
                          <button
                            onClick={() => handleResolveReport(rep._id, 'none')}
                            className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-button"
                          >
                            Resolve (No Action)
                          </button>
                          <button
                            onClick={() => handleResolveReport(rep._id, 'warn')}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-button"
                          >
                            Issue Formal Warning
                          </button>
                          <button
                            onClick={() => handleResolveReport(rep._id, 'suspend')}
                            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-button"
                          >
                            Suspend Account
                          </button>
                          <button
                            onClick={() => handleResolveReport(rep._id, 'ban')}
                            className="px-3 py-1.5 bg-danger hover:bg-rose-700 text-white text-xs font-bold rounded-button"
                          >
                            Ban User
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Administrative Audit Log ({auditLogs.length})
              </h3>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {auditLogs.map((log) => (
                  <div
                    key={log._id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-mono font-bold text-brand dark:text-purple-400">
                        [{log.action}]
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 ml-2">
                        Target: {log.targetType} (#{log.targetId.substring(0, 8)}...)
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Admin: {log.adminEmail}
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: METRICS */}
          {activeTab === 'metrics' && metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-semibold">Total Students</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {metrics.users?.students}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold">
                  {metrics.users?.verifiedStudents} Verified (.edu)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-semibold">Active Businesses</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {metrics.users?.businesses}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-semibold">Freelance Projects</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {metrics.projects?.total}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {metrics.projects?.completed} Completed
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-semibold">Hackathon Squads</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {metrics.teams?.total}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ITeam, ITeamApplication } from '../types';
import { useAuth } from '../lib/authContext';
import { SkillChip } from '../components/common/SkillChip';
import { StatusBadge } from '../components/common/StatusBadge';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { CardSkeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import {
  Users,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Check,
  X,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';

export const TeamDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [team, setTeam] = useState<ITeam | null>(null);
  const [applications, setApplications] = useState<ITeamApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply modal
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [applyNote, setApplyNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchTeamData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.teams.getById(id);
      setTeam(res.team);

      // If owner, fetch applications
      if (user && res.team.ownerId._id === user._id) {
        const appsRes = await api.teams.getApplications(id);
        setApplications(appsRes.applications || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch team details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [id, user]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setApplying(true);
    try {
      await api.teams.apply(id, applyNote);
      setActionSuccess('Your application was submitted! The team owner will review it.');
      setIsApplyOpen(false);
      setApplyNote('');
      fetchTeamData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleAppStatus = async (appId: string, status: 'accepted' | 'rejected') => {
    if (!id) return;
    try {
      await api.teams.updateApplication(id, appId, status);
      fetchTeamData();
    } catch (err: any) {
      alert(err.message || 'Failed to update application');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error || !team) {
    return <ErrorState message={error || 'Team not found'} onRetry={fetchTeamData} />;
  }

  const isOwner = user?._id === team.ownerId?._id;
  const isMember = team.members.some((m) => m._id === user?._id);
  const isFull = team.members.length >= team.teamSize;
  const isPast = new Date() > new Date(team.deadline);
  const canApply = user && !isOwner && !isMember && team.status === 'open' && !isFull && !isPast;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/teams"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Hackathon Teams
      </Link>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg text-xs font-semibold">
          {actionSuccess}
        </div>
      )}

      {/* Main Details Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand dark:text-purple-400">
              {team.hackathonName}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {team.title}
            </h1>
          </div>
          <StatusBadge status={team.status} />
        </div>

        {/* Key Facts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block">Team Size</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              <Users className="w-4 h-4 text-brand" />
              {team.members.length} / {team.teamSize} spots
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block">Deadline</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              {new Date(team.deadline).toLocaleDateString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block">Created By</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white truncate block mt-0.5">
              {team.ownerId?.name}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block">Status</span>
            <span className="text-sm font-bold capitalize text-slate-900 dark:text-white mt-0.5 block">
              {team.status}
            </span>
          </div>
        </div>

        {/* Skills Needed */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Required Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {team.skillsNeeded.map((skill, idx) => (
              <SkillChip key={idx} name={skill} />
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            About this Squad & Hackathon Project
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {team.description}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="pt-2 flex flex-wrap gap-3 items-center justify-between border-t border-slate-100 dark:border-slate-800">
          {(isMember || isOwner) ? (
            <Link
              to={`/chat?room=${team.chatRoomId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-button transition-colors min-h-touch"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Team Chat Room</span>
            </Link>
          ) : (
            <div className="text-xs text-slate-500">
              {isFull ? 'Squad is fully formed.' : isPast ? 'Deadline has passed.' : 'Recruiting teammates.'}
            </div>
          )}

          {canApply && (
            <button
              onClick={() => setIsApplyOpen(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-success hover:bg-success-dark text-white text-xs font-bold rounded-button transition-colors shadow-xs min-h-touch"
            >
              <Users className="w-4 h-4" />
              <span>Apply to Join Squad</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmed Members Roster */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-brand" />
          Confirmed Members ({team.members.length} / {team.teamSize})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {team.members.map((member) => (
            <div
              key={member._id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center text-xs">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {member.name}
                    </span>
                    {member._id === team.ownerId?._id && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-brand">
                        Lead
                      </span>
                    )}
                    {member.collegeVerified && <VerifiedBadge type="college" size="sm" label="" />}
                  </div>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {member.college || 'Verified Campus'}
                  </span>
                </div>
              </div>

              <Link
                to={`/profile/${member._id}`}
                className="text-xs text-brand hover:underline font-semibold"
              >
                Profile
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Owner Application Management Queue */}
      {isOwner && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Applicant Queue ({applications.length})
          </h3>

          {applications.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">
              No pending applications yet. Teammates who apply will appear here for your review.
            </p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {app.applicantId?.name}
                      </span>
                      {app.applicantId?.collegeVerified && (
                        <VerifiedBadge type="college" size="sm" />
                      )}
                      <span className="text-xs text-slate-500">
                        • Trust {app.applicantId?.trustScore}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      "{app.note || 'No cover note provided.'}"
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {app.applicantId?.skills?.slice(0, 3).map((s, idx) => (
                        <SkillChip key={idx} name={s.name} level={s.level} size="sm" />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {app.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAppStatus(app._id, 'rejected')}
                          className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-button text-xs font-semibold min-h-touch"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleAppStatus(app._id, 'accepted')}
                          className="px-3 py-1.5 bg-success hover:bg-success-dark text-white rounded-button text-xs font-semibold min-h-touch flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Accept to Squad
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold uppercase text-slate-500">
                        {app.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Apply Modal */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsApplyOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Apply to "{team.title}"
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Explain how your skills and hackathon interests match their requirements.
            </p>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cover Note / Pitch
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. I have experience with React and built a full Web3 dApp in the last hackathon..."
                  value={applyNote}
                  onChange={(e) => setApplyNote(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-button min-h-touch"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-4 py-2 text-xs font-bold text-white bg-success hover:bg-success-dark rounded-button transition-colors min-h-touch"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

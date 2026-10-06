import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ITeam } from '../types';
import { TeamCard } from '../components/cards/TeamCard';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { useAuth } from '../lib/authContext';
import { Users, Search, Plus, Filter, Calendar, X } from 'lucide-react';

export const TeamsPage: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [status, setStatus] = useState('open');

  // Create Team Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hackathonName: '',
    skillsNeeded: '',
    teamSize: 4,
    deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.teams.list({
        search: search || undefined,
        skill: skill || undefined,
        status: status || undefined,
      });
      setTeams(res.teams || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTeams();
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const skillsArray = formData.skillsNeeded
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (skillsArray.length === 0) {
        throw new Error('Please specify at least one skill needed.');
      }

      const isoDeadline = new Date(formData.deadline).toISOString();

      await api.teams.create({
        title: formData.title,
        description: formData.description,
        hackathonName: formData.hackathonName,
        skillsNeeded: skillsArray,
        teamSize: Number(formData.teamSize),
        deadline: isoDeadline,
      });

      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        hackathonName: '',
        skillsNeeded: '',
        teamSize: 4,
        deadline: '',
      });
      fetchTeams();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create team request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand dark:text-purple-400" />
            Hackathon Teammates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Form competitive hackathon squads, recruit missing roles, and auto-close when your team is filled.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-button transition-colors shadow-xs min-h-touch shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Team Request</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search hackathons, titles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-h-touch"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Filter by skill (e.g. React, Python)"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-h-touch"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-h-touch"
            >
              <option value="open">Open Teams Only</option>
              <option value="all">All Teams (Inc. Closed)</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold rounded-button min-h-touch"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* Grid or States */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTeams} />
      ) : teams.length === 0 ? (
        <EmptyState
          title="No Hackathon Teams Found"
          message="Be the first to post a team request with your required skills and hackathon target!"
          actionText="Post Team Request"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teams.map((team) => (
            <TeamCard key={team._id} team={team} />
          ))}
        </div>
      )}

      {/* Post Team Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Post Hackathon Team Request
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Recruit teammates with complementary skills. Team will automatically close when filled.
            </p>

            {formError && (
              <div className="p-3 mb-4 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Team / Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Financial Forecaster Squad"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hackathon Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ETHGlobal Bangkok 2026"
                    value={formData.hackathonName}
                    onChange={(e) => setFormData({ ...formData, hackathonName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Team Size
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    required
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Skills Needed (comma-separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React, Solidity, UI/UX, Python"
                  value={formData.skillsNeeded}
                  onChange={(e) => setFormData({ ...formData, skillsNeeded: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Application Deadline
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Team Vision & Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Briefly explain what you plan to build and who you are looking for..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-button min-h-touch"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-button transition-colors min-h-touch"
                >
                  {submitting ? 'Posting...' : 'Create Squad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

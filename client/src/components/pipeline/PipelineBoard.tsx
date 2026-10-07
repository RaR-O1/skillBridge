import React, { useState, useEffect } from 'react';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/authContext';
import { Users, Mail, Phone, ExternalLink, MessageSquare, Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Candidate {
  id: string;
  name: string;
  college: string;
  collegeVerified: boolean;
  stage: 'new' | 'shortlisted' | 'interview' | 'offer' | 'rejected';
  roleApplied: string;
  skills: string[];
  studentId?: string;
  note?: string;
  notes?: Array<{ authorId?: any; text: string; createdAt: string }>;
}

export const PipelineBoard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [noteModalAppId, setNoteModalAppId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Fallback demo candidates
  const fallbackCandidates: Candidate[] = [
    {
      id: 'c1',
      name: 'Aarav Sharma',
      college: 'IIT Delhi',
      collegeVerified: true,
      stage: 'shortlisted',
      roleApplied: 'Frontend Engineering Intern',
      skills: ['React', 'TypeScript', 'Tailwind CSS'],
    },
    {
      id: 'c2',
      name: 'Priya Patel',
      college: 'Delhi University',
      collegeVerified: true,
      stage: 'interview',
      roleApplied: 'ML Research Intern',
      skills: ['Python', 'FastAPI', 'Machine Learning'],
    },
    {
      id: 'c3',
      name: 'Rohan Mehra',
      college: 'BITS Pilani',
      collegeVerified: true,
      stage: 'new',
      roleApplied: 'Full Stack Developer Intern',
      skills: ['Node.js', 'React', 'MongoDB'],
    },
  ];

  const stages: Array<{ id: Candidate['stage']; label: string; bg: string }> = [
    { id: 'new', label: 'New Applicants', bg: 'border-blue-400' },
    { id: 'shortlisted', label: 'Shortlisted', bg: 'border-purple-400' },
    { id: 'interview', label: 'Interviewing', bg: 'border-amber-400' },
    { id: 'offer', label: 'Offer Extended', bg: 'border-emerald-400' },
    { id: 'rejected', label: 'Archived', bg: 'border-slate-300' },
  ];

  // Fetch jobs for recruiter
  useEffect(() => {
    api.jobs
      .list({ status: 'all' })
      .then((data: any[]) => {
        if (data && data.length > 0) {
          setJobs(data);
          setSelectedJobId(data[0]._id);
        } else {
          setCandidates(fallbackCandidates);
        }
      })
      .catch(() => {
        setCandidates(fallbackCandidates);
      });
  }, []);

  // Fetch applications whenever selected job changes
  const fetchApplications = async (jobId: string) => {
    if (!jobId) return;
    setLoading(true);
    try {
      const res = await api.jobs.getApplications(jobId);
      if (res && res.length > 0) {
        const mapped: Candidate[] = res.map((app: any) => ({
          id: app._id,
          name: app.studentId?.name || 'Applicant',
          college: app.studentId?.college || 'Student',
          collegeVerified: app.studentId?.collegeVerified || false,
          stage: app.stage || 'new',
          roleApplied: jobs.find((j) => j._id === jobId)?.title || 'Internship',
          skills: (app.studentId?.skills || []).map((s: any) => s.name || s),
          studentId: app.studentId?._id,
          note: app.note,
          notes: app.notes || [],
        }));
        setCandidates(mapped);
      } else {
        setCandidates([]);
      }
    } catch {
      // If unauthorized or error, fall back to sample
      setCandidates(fallbackCandidates);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      fetchApplications(selectedJobId);
    }
  }, [selectedJobId]);

  const handleStageChange = async (candidateId: string, nextStage: Candidate['stage']) => {
    // Optimistic UI update
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: nextStage } : c))
    );

    // Call API if real candidate
    try {
      if (!candidateId.startsWith('c')) {
        await api.jobs.updateStage(candidateId, nextStage);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update candidate stage');
      if (selectedJobId) fetchApplications(selectedJobId);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModalAppId || !newNoteText.trim()) return;

    try {
      if (!noteModalAppId.startsWith('c')) {
        await api.jobs.addNote(noteModalAppId, newNoteText.trim());
      }
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === noteModalAppId
            ? {
                ...c,
                notes: [
                  ...(c.notes || []),
                  { text: newNoteText.trim(), createdAt: new Date().toISOString() },
                ],
              }
            : c
        )
      );
      setNewNoteText('');
      setNoteModalAppId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to add recruiter note');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Recruiter Pipeline Kanban
          </h3>
          <p className="text-xs text-slate-500">
            Review candidates, add interviewer notes, and track offers across stages.
          </p>
        </div>

        {/* Job Selector */}
        {jobs.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Role:
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-touch"
            >
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title} ({j.companyId?.name || 'My Role'})
                </option>
              ))}
            </select>
            <button
              onClick={() => fetchApplications(selectedJobId)}
              className="p-1.5 text-slate-500 hover:text-brand rounded-lg border border-slate-200 dark:border-slate-800"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const list = candidates.filter((c) => c.stage === stage.id);
          return (
            <div
              key={stage.id}
              className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 min-w-[210px] flex flex-col space-y-2.5"
            >
              <div className={`flex items-center justify-between pb-2 border-b-2 ${stage.bg}`}>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {stage.label}
                </span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {list.length}
                </span>
              </div>

              <div className="space-y-2 flex-1">
                {list.length === 0 ? (
                  <div className="text-center py-6 text-[11px] text-slate-400">
                    No candidates here
                  </div>
                ) : (
                  list.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>{c.name}</span>
                          {c.collegeVerified && <VerifiedBadge type="college" size="sm" label="" />}
                        </div>
                        <div className="text-[11px] text-slate-500">{c.college}</div>
                      </div>

                      <div className="text-[11px] font-semibold text-brand dark:text-purple-400">
                        {c.roleApplied}
                      </div>

                      {c.note && (
                        <div className="text-[10px] bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 italic line-clamp-2">
                          "{c.note}"
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {c.skills.slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Recruiter notes display */}
                      {c.notes && c.notes.length > 0 && (
                        <div className="text-[10px] text-slate-500 border-t border-slate-100 dark:border-slate-700/60 pt-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Notes ({c.notes.length}):
                          </span>{' '}
                          {c.notes[c.notes.length - 1].text}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <button
                            type="button"
                            onClick={() => setNoteModalAppId(c.id)}
                            className="text-brand hover:underline flex items-center gap-0.5 font-semibold"
                          >
                            <MessageSquare className="w-3 h-3" /> Note
                          </button>
                          {c.studentId && (
                            <Link
                              to={`/profile/${c.studentId}`}
                              className="text-slate-500 hover:text-slate-800 flex items-center gap-0.5"
                            >
                              <ExternalLink className="w-3 h-3" /> Portfolio
                            </Link>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-[10px] pt-1">
                          <span className="text-slate-400">Move:</span>
                          <select
                            value={c.stage}
                            onChange={(e) => handleStageChange(c.id, e.target.value as any)}
                            className="p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-[10px]"
                          >
                            <option value="new">New</option>
                            <option value="shortlisted">Shortlist</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="rejected">Archive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recruiter Note Modal */}
      {noteModalAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-card p-5 max-w-sm w-full space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Add Recruiter / Interview Note
            </h4>
            <textarea
              rows={3}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="e.g. Cleared technical round; strong in system architecture..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setNoteModalAppId(null);
                  setNewNoteText('');
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNote}
                className="px-3 py-1.5 text-xs font-bold text-white bg-brand rounded-button hover:bg-brand-hover"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

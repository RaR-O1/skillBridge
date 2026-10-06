import React, { useState } from 'react';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { Users, Mail, Phone, ExternalLink } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  college: string;
  collegeVerified: boolean;
  stage: 'new' | 'shortlisted' | 'interview' | 'offer' | 'rejected';
  roleApplied: string;
  skills: string[];
}

export const PipelineBoard: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([
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
  ]);

  const stages: Array<{ id: Candidate['stage']; label: string; bg: string }> = [
    { id: 'new', label: 'New Applicants', bg: 'border-blue-400' },
    { id: 'shortlisted', label: 'Shortlisted', bg: 'border-purple-400' },
    { id: 'interview', label: 'Interviewing', bg: 'border-amber-400' },
    { id: 'offer', label: 'Offer Extended', bg: 'border-emerald-400' },
    { id: 'rejected', label: 'Archived', bg: 'border-slate-300' },
  ];

  const handleStageChange = (candidateId: string, nextStage: Candidate['stage']) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: nextStage } : c))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Recruiter Pipeline Kanban
          </h3>
          <p className="text-xs text-slate-500">
            Drag or transition applicants across review stages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const list = candidates.filter((c) => c.stage === stage.id);
          return (
            <div
              key={stage.id}
              className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 min-w-[200px] flex flex-col space-y-2.5"
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
                {list.map((c) => (
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

                    <div className="flex flex-wrap gap-1">
                      {c.skills.slice(0, 2).map((s, idx) => (
                        <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Move:</span>
                      <select
                        value={c.stage}
                        onChange={(e) => handleStageChange(c.id, e.target.value as any)}
                        className="p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      >
                        <option value="new">New</option>
                        <option value="shortlisted">Shortlist</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Archive</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/authContext';
import { JobCard } from '../components/cards/JobCard';
import { MentorCard } from '../components/cards/MentorCard';
import { PipelineBoard } from '../components/pipeline/PipelineBoard';
import { SessionScheduler } from '../components/mentorship/SessionScheduler';
import { SkillChip } from '../components/common/SkillChip';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import {
  Compass,
  Briefcase,
  Users,
  Award,
  Kanban,
  Search,
  Rocket,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const OpportunitiesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'jobs';

  // Talent search state
  const [talent, setTalent] = useState<any[]>([]);
  const [talentSkill, setTalentSkill] = useState('');
  const [talentLoading, setTalentLoading] = useState(false);

  // Mentor booking modal state
  const [selectedMentor, setSelectedMentor] = useState<any | null>(null);

  useEffect(() => {
    if (activeTab === 'talent') {
      setTalentLoading(true);
      api.users
        .searchTalent({ skill: talentSkill || undefined })
        .then((res) => setTalent(res.talent || []))
        .catch(() => setTalent([]))
        .finally(() => setTalentLoading(false));
    }
  }, [activeTab, talentSkill]);

  const sampleJobs = [
    {
      _id: 'j1',
      title: 'Full Stack Engineering Intern',
      companyName: 'TechSprint Software Labs',
      type: 'Internship' as const,
      location: 'Hybrid / Bangalore or Remote',
      stipendINR: 25000,
      skills: ['React', 'Node.js', 'PostgreSQL'],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'j2',
      title: 'Machine Learning Research Intern',
      companyName: 'NexusAI Health',
      type: 'Internship' as const,
      location: 'Remote',
      stipendINR: 30000,
      skills: ['Python', 'FastAPI', 'PyTorch'],
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const sampleMentors = [
    {
      _id: 'm1',
      name: 'Vikram Nair',
      bio: 'Staff Engineer at Stripe. Former hackathon winner and mentor to 40+ campus builders.',
      college: 'IIT Delhi (Class of 2020)',
      rating: 4.9,
      sessionsCount: 38,
      expertise: ['System Design', 'Distributed Systems', 'Career Prep'],
    },
    {
      _id: 'm2',
      name: 'Dr. Neha Swaminathan',
      bio: 'AI researcher and startup advisor. Guiding students through hackathon ML architectures.',
      college: 'IISc Bangalore (Alumni)',
      rating: 5.0,
      sessionsCount: 24,
      expertise: ['AI / ML', 'LLM Architectures', 'Research'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-brand dark:text-purple-400" />
            Opportunities Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Internships, startup co-founders, alumni mentors, and talent search.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto">
          {[
            { id: 'jobs', label: 'Internships', icon: Briefcase },
            { id: 'mentors', label: 'Mentors', icon: Award },
            { id: 'talent', label: 'Student Talent', icon: Users },
            { id: 'pipeline', label: 'Recruiter Pipeline', icon: Kanban },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-touch whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: JOBS & INTERNSHIPS */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Campus Internships & Postings
            </h2>
            <span className="text-xs text-slate-500">Verified Companies</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sampleJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MENTORS & SESSIONS */}
      {activeTab === 'mentors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Verified Alumni Mentors
            </h2>
            <span className="text-xs text-slate-500">1:1 Virtual Sessions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sampleMentors.map((mentor) => (
              <MentorCard
                key={mentor._id}
                mentor={mentor}
                onRequestSession={() => setSelectedMentor(mentor)}
              />
            ))}
          </div>

          {selectedMentor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <SessionScheduler
                mentorName={selectedMentor.name}
                onClose={() => setSelectedMentor(null)}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TALENT SEARCH (OPT-IN VISIBILITY) */}
      {activeTab === 'talent' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students by skill (e.g. React, Python, UI/UX)..."
                  value={talentSkill}
                  onChange={(e) => setTalentSkill(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-h-touch"
                />
              </div>
              <span className="text-[11px] text-slate-500 shrink-0">
                Only shows students who opted into recruiter visibility.
              </span>
            </div>
          </div>

          {talentLoading ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading talent directory...</div>
          ) : talent.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No students found with that skill or all currently opted out of search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {talent.map((student) => (
                <div
                  key={student._id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center text-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {student.name}
                          </h4>
                          {student.collegeVerified && (
                            <VerifiedBadge type="college" size="sm" label="" />
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{student.college}</div>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Trust {student.trustScore}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {student.bio || 'Student engineer building web & campus tools.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {student.skills?.slice(0, 4).map((s: any, idx: number) => (
                      <SkillChip key={idx} name={s.name} level={s.level} size="sm" />
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <Link
                      to={`/profile/${student._id}`}
                      className="text-xs font-bold text-brand hover:underline"
                    >
                      View Public Portfolio →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RECRUITER PIPELINE */}
      {activeTab === 'pipeline' && <PipelineBoard />}
    </div>
  );
};

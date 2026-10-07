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
import { CardSkeleton } from '../components/common/Skeleton';
import {
  Compass,
  Briefcase,
  Users,
  Award,
  Kanban,
  Search,
  Plus,
  X,
  FileCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Rocket,
  BookOpen,
  Share2,
  Calendar,
  Star,
  Video,
  Send,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const OpportunitiesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'jobs';

  // -------------------------------------------------------------
  // TAB 1: JOBS STATE
  // -------------------------------------------------------------
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [showMyApps, setShowMyApps] = useState(false);

  // Apply Job Modal
  const [selectedJobToApply, setSelectedJobToApply] = useState<any | null>(null);
  const [applyNote, setApplyNote] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  // Post Job Modal
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [postCompanyId, setPostCompanyId] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobType, setNewJobType] = useState<'internship' | 'full_time' | 'contract'>('internship');
  const [newJobLocation, setNewJobLocation] = useState('');
  const [newJobIsRemote, setNewJobIsRemote] = useState(false);
  const [newJobStipend, setNewJobStipend] = useState(25000);
  const [newJobSkills, setNewJobSkills] = useState('');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [newJobDeadline, setNewJobDeadline] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [postJobLoading, setPostJobLoading] = useState(false);

  // -------------------------------------------------------------
  // TAB 2: STARTUPS & CO-FOUNDERS STATE (Stage 2B)
  // -------------------------------------------------------------
  const [startups, setStartups] = useState<any[]>([]);
  const [startupsLoading, setStartupsLoading] = useState(false);
  const [startupStageFilter, setStartupStageFilter] = useState('');
  const [startupRoleTypeFilter, setStartupRoleTypeFilter] = useState('');
  const [coFounders, setCoFounders] = useState<any[]>([]);
  const [startupSubView, setStartupSubView] = useState<'startups' | 'cofounders'>('startups');

  // Register Startup Modal
  const [isRegisterStartupOpen, setIsRegisterStartupOpen] = useState(false);
  const [newStartupName, setNewStartupName] = useState('');
  const [newStartupPitch, setNewStartupPitch] = useState('');
  const [newStartupDesc, setNewStartupDesc] = useState('');
  const [newStartupStage, setNewStartupStage] = useState<'ideation' | 'mvp' | 'early_traction' | 'scaling'>('mvp');
  const [newStartupWebsite, setNewStartupWebsite] = useState('');

  // Add Startup Role Modal
  const [selectedStartupForRole, setSelectedStartupForRole] = useState<any | null>(null);
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleType, setNewRoleType] = useState<'co_founder' | 'intern' | 'contributor'>('co_founder');
  const [newRoleSkills, setNewRoleSkills] = useState('');
  const [newRoleEquity, setNewRoleEquity] = useState('10% Equity or ₹15,000/mo');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Apply to Startup Role Modal
  const [applyRoleStartup, setApplyRoleStartup] = useState<any | null>(null);
  const [applyRoleItem, setApplyRoleItem] = useState<any | null>(null);
  const [applyRoleLetter, setApplyRoleLetter] = useState('');

  // Co-Founder Profile Modal
  const [isCoFounderModalOpen, setIsCoFounderModalOpen] = useState(false);
  const [cfBio, setCfBio] = useState('');
  const [cfSkills, setCfSkills] = useState('');
  const [cfIdealRole, setCfIdealRole] = useState('Technical Co-Founder (AI & Web Systems)');
  const [cfIndustry, setCfIndustry] = useState('Developer Tools & AI');
  const [cfHours, setCfHours] = useState(25);
  const [cfLookingFor, setCfLookingFor] = useState('Looking for product-minded engineer or growth co-founder.');

  // -------------------------------------------------------------
  // TAB 3: MENTORS, SESSIONS, RESOURCES & REFERRALS (Stage 2B)
  // -------------------------------------------------------------
  const [mentors, setMentors] = useState<any[]>([]);
  const [mentorsLoading, setMentorsLoading] = useState(false);
  const [selectedMentorForSession, setSelectedMentorForSession] = useState<any | null>(null);
  const [mySessions, setMySessions] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [resourceCategory, setResourceCategory] = useState<string>('');
  const [mentorSubView, setMentorSubView] = useState<'mentors' | 'sessions' | 'resources'>('mentors');

  // Referral Modal
  const [selectedMentorForReferral, setSelectedMentorForReferral] = useState<any | null>(null);
  const [refCompany, setRefCompany] = useState('');
  const [refRole, setRefRole] = useState('');
  const [refResumeUrl, setRefResumeUrl] = useState('');
  const [refNote, setRefNote] = useState('');

  // Session Feedback Modal
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackReview, setFeedbackReview] = useState('');

  // -------------------------------------------------------------
  // TAB 4: TALENT SEARCH STATE
  // -------------------------------------------------------------
  const [talent, setTalent] = useState<any[]>([]);
  const [talentSkill, setTalentSkill] = useState('');
  const [talentLoading, setTalentLoading] = useState(false);

  // Fallback data
  const fallbackJobs = [
    {
      _id: 'j1',
      title: 'Full Stack Engineering Intern',
      companyName: 'TechSprint Software Labs',
      type: 'internship',
      location: 'Hybrid / Bangalore or Remote',
      isRemote: true,
      stipendINR: 25000,
      requiredSkills: ['React', 'Node.js', 'PostgreSQL'],
      description: 'Join our agile campus sprint team to build next-gen developer productivity tooling.',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'j2',
      title: 'Machine Learning Research Intern',
      companyName: 'NexusAI Health',
      type: 'internship',
      location: 'Remote',
      isRemote: true,
      stipendINR: 30000,
      requiredSkills: ['Python', 'FastAPI', 'PyTorch'],
      description: 'Assist in training computer vision models for clinical imaging diagnosis assistance.',
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const fallbackMentors = [
    {
      _id: 'm1',
      name: 'Vikram Nair',
      currentCompany: 'Stripe',
      jobTitle: 'Staff Engineer',
      bio: 'Staff Engineer at Stripe. Former hackathon winner and mentor to 40+ campus builders.',
      college: 'IIT Delhi (Class of 2020)',
      rating: 4.9,
      sessionsCount: 38,
      areasOfExpertise: ['System Design', 'Distributed Systems', 'Career Prep'],
    },
    {
      _id: 'm2',
      name: 'Dr. Neha Swaminathan',
      currentCompany: 'DeepMind Health',
      jobTitle: 'Senior AI Researcher',
      bio: 'AI researcher and startup advisor. Guiding students through hackathon ML architectures.',
      college: 'IISc Bangalore (Alumni)',
      rating: 5.0,
      sessionsCount: 24,
      areasOfExpertise: ['AI / ML', 'LLM Architectures', 'Research'],
    },
  ];

  const sampleResources = [
    {
      _id: 'r1',
      title: 'System Design Primer for Campus Engineers',
      category: 'system_design',
      url: 'https://github.com/donnemartin/system-design-primer',
      description: 'Comprehensive roadmap for designing high-volume distributed microservices.',
      tags: ['System Design', 'Scalability', 'Databases'],
    },
    {
      _id: 'r2',
      title: 'Modern Full-Stack React & Node Patterns',
      category: 'frontend',
      url: 'https://react.dev',
      description: 'Best practices for server components, TanStack Query, and real-time state.',
      tags: ['React', 'TypeScript', 'Node.js'],
    },
    {
      _id: 'r3',
      title: 'Hackathon Fast Prototyping Playbook',
      category: 'hackathons',
      url: 'https://devpost.com',
      description: 'How to take an idea from 0 to working MVP in 36 hours with pitching tips.',
      tags: ['Hackathons', 'MVP', 'Speed'],
    },
  ];

  // -------------------------------------------------------------
  // DATA LOADERS
  // -------------------------------------------------------------
  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const data = await api.jobs.list({
        search: searchQuery || undefined,
        type: typeFilter || undefined,
        isRemote: remoteOnly ? 'true' : undefined,
      });
      if (Array.isArray(data) && data.length > 0) setJobs(data);
      else if (!searchQuery && !typeFilter) setJobs(fallbackJobs);
      else setJobs([]);
    } catch {
      setJobs(fallbackJobs);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    if (!user || user.role !== 'student') return;
    try {
      const apps = await api.jobs.getMyApplications();
      if (Array.isArray(apps)) {
        setMyApplications(apps);
        const set = new Set<string>();
        apps.forEach((a: any) => {
          if (a.jobId?._id) set.add(a.jobId._id);
          else if (typeof a.jobId === 'string') set.add(a.jobId);
        });
        setAppliedJobIds(set);
      }
    } catch {
      // ignore
    }
  };

  const fetchStartups = async () => {
    setStartupsLoading(true);
    try {
      const res = await api.startups.list({
        stage: startupStageFilter || undefined,
        roleType: startupRoleTypeFilter || undefined,
      });
      if (Array.isArray(res) && res.length > 0) {
        setStartups(res);
      } else {
        setStartups([
          {
            _id: 's1',
            name: 'NexusAI Diagnostics',
            pitch: 'Real-time AI copilot assisting radiologists in triage clinics.',
            description: 'Building multimodal transformer models for clinical diagnostic workflows.',
            stage: 'early_traction',
            website: 'https://nexusai.dev',
            openRoles: [
              {
                _id: 'r1',
                roleTitle: 'Technical Co-Founder (Deep Learning)',
                roleType: 'co_founder',
                requiredSkills: ['PyTorch', 'FastAPI', 'CUDA'],
                equityOrStipend: '15% Equity Pool',
                description: 'Lead model training and clinical pipeline deployment.',
                status: 'open',
              },
              {
                _id: 'r2',
                roleTitle: 'Frontend Engineer Intern',
                roleType: 'intern',
                requiredSkills: ['React', 'TypeScript', 'Tailwind'],
                equityOrStipend: '₹25,000/mo',
                description: 'Build responsive DICOM viewer and annotation dashboard.',
                status: 'open',
              },
            ],
          },
        ]);
      }
    } catch {
      // Fallback
    } finally {
      setStartupsLoading(false);
    }
  };

  const fetchCoFounders = async () => {
    try {
      const res = await api.startups.listCoFounders();
      if (Array.isArray(res) && res.length > 0) {
        setCoFounders(res);
      } else {
        setCoFounders([
          {
            _id: 'cf1',
            userId: { name: 'Aarav Sharma', college: 'IIT Delhi', collegeVerified: true, trustScore: 98 },
            skills: ['React', 'Node.js', 'System Architecture'],
            idealCoFounderRole: 'Product & Business Co-Founder',
            targetIndustry: 'EdTech & Campus Productivity',
            hoursPerWeek: 30,
            lookingFor: 'Looking for a builder to launch a college developer community platform.',
          },
        ]);
      }
    } catch {
      // ignore
    }
  };

  const fetchMentorsAndSessions = async () => {
    setMentorsLoading(true);
    try {
      const data = await api.mentorship.listMentors();
      if (Array.isArray(data) && data.length > 0) setMentors(data);
      else setMentors(fallbackMentors);

      const sess = await api.mentorship.listSessions();
      if (Array.isArray(sess)) setMySessions(sess);

      const resList = await api.mentorship.listResources({ category: resourceCategory || undefined });
      if (Array.isArray(resList) && resList.length > 0) setResources(resList);
      else setResources(sampleResources);
    } catch {
      setMentors(fallbackMentors);
      setResources(sampleResources);
    } finally {
      setMentorsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'jobs') {
      fetchJobs();
      fetchMyApplications();
    } else if (activeTab === 'startups') {
      fetchStartups();
      fetchCoFounders();
    } else if (activeTab === 'mentors') {
      fetchMentorsAndSessions();
    } else if (activeTab === 'talent') {
      setTalentLoading(true);
      api.users
        .searchTalent({ skill: talentSkill || undefined })
        .then((res) => setTalent(res.talent || []))
        .catch(() => setTalent([]))
        .finally(() => setTalentLoading(false));
    }
  }, [activeTab, searchQuery, typeFilter, remoteOnly, startupStageFilter, startupRoleTypeFilter, resourceCategory, talentSkill]);

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------
  const handleApplyJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobToApply) return;
    setApplyLoading(true);
    try {
      await api.jobs.apply(selectedJobToApply._id, applyNote);
      setAppliedJobIds((prev) => new Set(prev).add(selectedJobToApply._id));
      alert('Application submitted successfully!');
      setSelectedJobToApply(null);
      setApplyNote('');
      fetchMyApplications();
    } catch (err: any) {
      alert(err.message || 'Failed to apply');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleRegisterStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.startups.create({
        name: newStartupName,
        pitch: newStartupPitch,
        description: newStartupDesc,
        stage: newStartupStage,
        website: newStartupWebsite || undefined,
      });
      alert('Startup profile registered!');
      setIsRegisterStartupOpen(false);
      setNewStartupName('');
      setNewStartupPitch('');
      setNewStartupDesc('');
      fetchStartups();
    } catch (err: any) {
      alert(err.message || 'Failed to create startup');
    }
  };

  const handleAddStartupRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStartupForRole) return;
    try {
      await api.startups.addRole(selectedStartupForRole._id, {
        roleTitle: newRoleTitle,
        roleType: newRoleType,
        requiredSkills: newRoleSkills.split(',').map((s) => s.trim()).filter(Boolean),
        equityOrStipend: newRoleEquity,
        description: newRoleDesc,
      });
      alert('Open role published!');
      setSelectedStartupForRole(null);
      setNewRoleTitle('');
      setNewRoleSkills('');
      setNewRoleDesc('');
      fetchStartups();
    } catch (err: any) {
      alert(err.message || 'Failed to add role');
    }
  };

  const handleApplyStartupRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyRoleStartup || !applyRoleItem) return;
    try {
      await api.startups.applyToRole(applyRoleStartup._id, applyRoleItem._id, applyRoleLetter);
      alert('Application submitted to startup founders!');
      setApplyRoleStartup(null);
      setApplyRoleItem(null);
      setApplyRoleLetter('');
    } catch (err: any) {
      alert(err.message || 'Failed to apply to startup');
    }
  };

  const handleSaveCoFounderProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.startups.upsertCoFounderProfile({
        bio: cfBio,
        skills: cfSkills.split(',').map((s) => s.trim()).filter(Boolean),
        idealCoFounderRole: cfIdealRole,
        targetIndustry: cfIndustry,
        hoursPerWeek: Number(cfHours),
        lookingFor: cfLookingFor,
      });
      alert('Co-founder profile updated!');
      setIsCoFounderModalOpen(false);
      fetchCoFounders();
    } catch (err: any) {
      alert(err.message || 'Failed to save co-founder profile');
    }
  };

  const handleRequestReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentorForReferral) return;
    try {
      const mentorUid = selectedMentorForReferral.mentorId?._id || selectedMentorForReferral._id;
      await api.mentorship.requestReferral({
        mentorId: mentorUid,
        companyName: refCompany || selectedMentorForReferral.currentCompany || 'Top Tech Partner',
        role: refRole,
        resumeUrl: refResumeUrl,
        note: refNote,
      });
      alert('Referral request sent to alumni mentor!');
      setSelectedMentorForReferral(null);
      setRefCompany('');
      setRefRole('');
      setRefResumeUrl('');
      setRefNote('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit referral request');
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackSessionId) return;
    try {
      await api.mentorship.submitFeedback(feedbackSessionId, {
        rating: Number(feedbackRating),
        review: feedbackReview,
      });
      alert('Feedback recorded! Thank you for rating your mentor.');
      setFeedbackSessionId(null);
      setFeedbackReview('');
      fetchMentorsAndSessions();
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-brand dark:text-purple-400" />
            Opportunities & Network Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Internships, startups, co-founder matching, alumni mentors, and student talent.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto">
          {[
            { id: 'jobs', label: 'Internships', icon: Briefcase },
            { id: 'startups', label: 'Startups & Co-Founders', icon: Rocket },
            { id: 'mentors', label: 'Mentors & Sessions', icon: Award },
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

      {/* ============================================================= */}
      {/* TAB 1: JOBS & INTERNSHIPS */}
      {/* ============================================================= */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Campus Internships & Postings
              </h2>
              {user?.role === 'student' && myApplications.length > 0 && (
                <button
                  onClick={() => setShowMyApps(!showMyApps)}
                  className="text-xs font-semibold text-brand hover:underline flex items-center gap-1 ml-2"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  {showMyApps ? 'View All Listings' : `My Applications (${myApplications.length})`}
                </button>
              )}
            </div>

            {(user?.role === 'company' || user?.role === 'startup' || user?.role === 'admin') && (
              <button
                onClick={() => setIsPostJobOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-button shadow-xs min-h-touch"
              >
                <Plus className="w-4 h-4" />
                <span>Post Opportunity</span>
              </button>
            )}
          </div>

          {/* Student's My Applications */}
          {showMyApps && user?.role === 'student' && (
            <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Your Submitted Applications
                </h3>
                <span className="text-[11px] text-slate-500">Live Stage Tracker</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {myApplications.map((app) => (
                  <div
                    key={app._id}
                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-1.5 shadow-2xs"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">
                      {app.jobId?.title || 'Internship Application'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {app.jobId?.companyId?.name || 'Partner Company'}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          app.stage === 'offer'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : app.stage === 'interview'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : app.stage === 'shortlisted'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : app.stage === 'rejected'
                            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {app.stage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Bar */}
          {!showMyApps && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by role or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-h-touch"
                  />
                </div>
                <div className="sm:col-span-3">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-h-touch"
                  >
                    <option value="">All Types</option>
                    <option value="internship">Internship</option>
                    <option value="full_time">Full-time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div className="sm:col-span-3 flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remoteOnly}
                      onChange={(e) => setRemoteOnly(e.target.checked)}
                      className="rounded text-brand focus:ring-brand"
                    />
                    Remote Only
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Job List */}
          {!showMyApps && (
            <>
              {jobsLoading ? (
                <CardSkeleton />
              ) : jobs.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No postings match your search criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      hasApplied={appliedJobIds.has(job._id)}
                      onApply={(j) => setSelectedJobToApply(j)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Apply Modal */}
          {selectedJobToApply && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-card p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Apply to {selectedJobToApply.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {typeof selectedJobToApply.companyId === 'object'
                        ? selectedJobToApply.companyId.name
                        : selectedJobToApply.companyName}
                    </p>
                  </div>
                  <button onClick={() => setSelectedJobToApply(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleApplyJob} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cover Note / Why you're a great fit (Optional)
                    </label>
                    <textarea
                      rows={4}
                      value={applyNote}
                      onChange={(e) => setApplyNote(e.target.value)}
                      placeholder="Mention your coursework, hackathon achievements, or links to relevant GitHub code..."
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedJobToApply(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applyLoading}
                      className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-button shadow-xs min-h-touch"
                    >
                      {applyLoading ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Post Job Modal */}
          {isPostJobOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-card p-6 max-w-lg w-full space-y-4 shadow-xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Post Campus Opportunity
                  </h3>
                  <button onClick={() => setIsPostJobOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleRegisterStartup} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Backend Engineering Intern"
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Type *
                      </label>
                      <select
                        value={newJobType}
                        onChange={(e) => setNewJobType(e.target.value as any)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      >
                        <option value="internship">Internship</option>
                        <option value="full_time">Full-time</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Stipend (INR/mo) *
                      </label>
                      <input
                        type="number"
                        required
                        value={newJobStipend}
                        onChange={(e) => setNewJobStipend(Number(e.target.value))}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Required Skills (comma separated) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. React, Node.js, TypeScript"
                      value={newJobSkills}
                      onChange={(e) => setNewJobSkills(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Description *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={newJobDesc}
                      onChange={(e) => setNewJobDesc(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPostJobOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={postJobLoading}
                      className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-button shadow-xs"
                    >
                      Publish Posting
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: STARTUPS & CO-FOUNDERS (Stage 2B) */}
      {/* ============================================================= */}
      {activeTab === 'startups' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Student Startups & Co-Founder Hub
              </h2>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg ml-2">
                <button
                  onClick={() => setStartupSubView('startups')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    startupSubView === 'startups'
                      ? 'bg-white dark:bg-slate-900 text-brand dark:text-purple-300 shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  Startups ({startups.length})
                </button>
                <button
                  onClick={() => setStartupSubView('cofounders')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    startupSubView === 'cofounders'
                      ? 'bg-white dark:bg-slate-900 text-brand dark:text-purple-300 shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  Co-Founder Pool ({coFounders.length})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCoFounderModalOpen(true)}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-button min-h-touch"
              >
                Join Co-Founder Pool
              </button>
              <button
                onClick={() => setIsRegisterStartupOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-button shadow-xs min-h-touch"
              >
                <Plus className="w-4 h-4" />
                <span>Register Startup</span>
              </button>
            </div>
          </div>

          {/* SUBVIEW 1: STARTUPS & OPEN ROLES */}
          {startupSubView === 'startups' && (
            <div className="space-y-4">
              {startupsLoading ? (
                <CardSkeleton />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {startups.map((st) => (
                    <div
                      key={st._id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 space-y-4 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">
                              {st.name}
                            </h3>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-brand dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              {st.stage}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                            {st.pitch}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {st.website && (
                            <a
                              href={st.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-slate-500 hover:text-brand flex items-center gap-1"
                            >
                              <span>Website</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedStartupForRole(st)}
                            className="text-xs font-bold text-brand hover:underline flex items-center gap-0.5"
                          >
                            <Plus className="w-3.5 h-3.5" /> Post Role
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {st.description}
                      </p>

                      {/* Open Roles Sub-grid */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Open Roles ({st.openRoles?.length || 0})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {st.openRoles?.map((r: any) => (
                            <div
                              key={r._id}
                              className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                                    {r.roleTitle}
                                  </h5>
                                  <span className="text-[10px] text-brand font-semibold capitalize">
                                    {r.roleType.replace('_', ' ')} • {r.equityOrStipend}
                                  </span>
                                </div>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold uppercase">
                                  {r.status}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                                {r.description}
                              </p>

                              <div className="flex flex-wrap gap-1">
                                {r.requiredSkills?.map((s: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="text-[9px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>

                              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                                <button
                                  onClick={() => {
                                    setApplyRoleStartup(st);
                                    setApplyRoleItem(r);
                                  }}
                                  className="text-xs font-bold text-white bg-brand hover:bg-brand-hover px-2.5 py-1 rounded-button transition-colors min-h-touch"
                                >
                                  Apply for Role →
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUBVIEW 2: CO-FOUNDER DIRECTORY */}
          {startupSubView === 'cofounders' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coFounders.map((cf) => (
                  <div
                    key={cf._id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-brand font-bold flex items-center justify-center text-sm">
                          {cf.userId?.name?.charAt(0) || 'F'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {cf.userId?.name}
                            </h4>
                            {cf.userId?.collegeVerified && (
                              <VerifiedBadge type="college" size="sm" label="" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{cf.userId?.college}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                        {cf.hoursPerWeek} hrs/wk
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        Seeking: {cf.idealCoFounderRole}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Target Domain: {cf.targetIndustry}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 italic pt-1">
                        "{cf.lookingFor}"
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {cf.skills?.map((s: string, idx: number) => (
                        <SkillChip key={idx} name={s} size="sm" />
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <Link
                        to={`/chat?recipient=${cf.userId?._id}`}
                        className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Discuss Co-Founding</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Register Startup Modal */}
          {isRegisterStartupOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-card p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Register Campus Startup
                  </h3>
                  <button onClick={() => setIsRegisterStartupOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleRegisterStartup} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Startup Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CloudScale Health"
                      value={newStartupName}
                      onChange={(e) => setNewStartupName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      One-line Pitch *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AI-powered clinical radiology triage platform"
                      value={newStartupPitch}
                      onChange={(e) => setNewStartupPitch(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Current Stage
                      </label>
                      <select
                        value={newStartupStage}
                        onChange={(e) => setNewStartupStage(e.target.value as any)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      >
                        <option value="ideation">Ideation</option>
                        <option value="mvp">MVP</option>
                        <option value="early_traction">Early Traction</option>
                        <option value="scaling">Scaling</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Website (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newStartupWebsite}
                        onChange={(e) => setNewStartupWebsite(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Description & Architecture *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="What is your product, stack, and target market?"
                      value={newStartupDesc}
                      onChange={(e) => setNewStartupDesc(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsRegisterStartupOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-button shadow-xs"
                    >
                      Create Startup
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Startup Role Modal */}
          {selectedStartupForRole && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-card p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Add Role for {selectedStartupForRole.name}
                  </h3>
                  <button onClick={() => setSelectedStartupForRole(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddStartupRole} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Role Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Technical Co-Founder (Full Stack)"
                      value={newRoleTitle}
                      onChange={(e) => setNewRoleTitle(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Role Type *
                      </label>
                      <select
                        value={newRoleType}
                        onChange={(e) => setNewRoleType(e.target.value as any)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      >
                        <option value="co_founder">Co-Founder</option>
                        <option value="intern">Intern</option>
                        <option value="contributor">Contributor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Equity / Stipend *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 10% Equity or ₹20k"
                        value={newRoleEquity}
                        onChange={(e) => setNewRoleEquity(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Required Skills (comma separated) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. React, Node.js, MongoDB"
                      value={newRoleSkills}
                      onChange={(e) => setNewRoleSkills(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Responsibilities *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={newRoleDesc}
                      onChange={(e) => setNewRoleDesc(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStartupForRole(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-button shadow-xs"
                    >
                      Publish Role
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Apply to Role Modal */}
          {applyRoleItem && applyRoleStartup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-card p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Apply: {applyRoleItem.roleTitle}
                  </h3>
                  <button onClick={() => setApplyRoleItem(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleApplyStartupRole} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cover Letter / Why you want to join {applyRoleStartup.name}
                    </label>
                    <textarea
                      rows={4}
                      value={applyRoleLetter}
                      onChange={(e) => setApplyRoleLetter(e.target.value)}
                      placeholder="Share your relevant background and excitement for this venture..."
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setApplyRoleItem(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-button shadow-xs"
                    >
                      Submit Application
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Co-Founder Profile Upsert Modal */}
          {isCoFounderModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-card p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Join Co-Founder Matching Pool
                  </h3>
                  <button onClick={() => setIsCoFounderModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCoFounderProfile} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ideal Co-Founder Role Needed *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Technical Co-Founder (AI Systems)"
                      value={cfIdealRole}
                      onChange={(e) => setCfIdealRole(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Target Industry *
                      </label>
                      <input
                        type="text"
                        required
                        value={cfIndustry}
                        onChange={(e) => setCfIndustry(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Commitment (hrs/wk) *
                      </label>
                      <input
                        type="number"
                        required
                        min={5}
                        max={80}
                        value={cfHours}
                        onChange={(e) => setCfHours(Number(e.target.value))}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Your Strengths & Skills (comma separated) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Python, FastAPI, Machine Learning"
                      value={cfSkills}
                      onChange={(e) => setNewStartupPitch(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      What are you looking for in a partner? *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={cfLookingFor}
                      onChange={(e) => setCfLookingFor(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCoFounderModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-button shadow-xs"
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: MENTORS, SESSIONS, RESOURCES & REFERRALS (Stage 2B) */}
      {/* ============================================================= */}
      {activeTab === 'mentors' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Alumni Mentors & Learning Hub
              </h2>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg ml-2">
                <button
                  onClick={() => setMentorSubView('mentors')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    mentorSubView === 'mentors'
                      ? 'bg-white dark:bg-slate-900 text-brand dark:text-purple-300 shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  Verified Mentors ({mentors.length})
                </button>
                <button
                  onClick={() => setMentorSubView('sessions')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    mentorSubView === 'sessions'
                      ? 'bg-white dark:bg-slate-900 text-brand dark:text-purple-300 shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  My Sessions ({mySessions.length})
                </button>
                <button
                  onClick={() => setMentorSubView('resources')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    mentorSubView === 'resources'
                      ? 'bg-white dark:bg-slate-900 text-brand dark:text-purple-300 shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  Resources ({resources.length})
                </button>
              </div>
            </div>
          </div>

          {/* SUBVIEW 1: MENTOR DIRECTORY */}
          {mentorSubView === 'mentors' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mentors.map((mentor) => (
                <MentorCard
                  key={mentor._id}
                  mentor={mentor}
                  onRequestSession={(m) => setSelectedMentorForSession(m)}
                  onRequestReferral={(m) => setSelectedMentorForReferral(m)}
                />
              ))}
            </div>
          )}

          {/* SUBVIEW 2: SESSIONS LIFECYCLE */}
          {mentorSubView === 'sessions' && (
            <div className="space-y-3">
              {mySessions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card">
                  No scheduled mentorship sessions yet. Book a session with an alumni mentor above!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mySessions.map((s) => (
                    <div
                      key={s._id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-4 space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                            {s.topic}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            with {s.mentorId?.name || s.studentId?.name}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            s.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : s.status === 'completed'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>

                      {s.confirmedTime && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-brand" />
                          <span>{new Date(s.confirmedTime).toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Link
                          to={`/chat?room=${s.chatRoomId}`}
                          className="text-xs font-semibold text-brand hover:underline"
                        >
                          Session Chat →
                        </Link>

                        {s.status === 'confirmed' && (
                          <div className="flex gap-2">
                            {s.meetingLink && (
                              <a
                                href={s.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-button inline-flex items-center gap-1"
                              >
                                <Video className="w-3 h-3" />
                                <span>Join Meet</span>
                              </a>
                            )}
                            <button
                              onClick={() => setFeedbackSessionId(s._id)}
                              className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-brand px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-button"
                            >
                              Feedback
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUBVIEW 3: CURATED LEARNING RESOURCES */}
          {mentorSubView === 'resources' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {resources.map((res) => (
                  <div
                    key={res._id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-4 space-y-2.5 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-brand px-1.5 py-0.5 rounded bg-brand/10 dark:text-purple-300">
                        {res.category?.replace('_', ' ')}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {res.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3">
                        {res.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {res.tags?.slice(0, 2).map((t: string, idx: number) => (
                          <span key={idx} className="text-[9px] text-slate-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-brand hover:underline flex items-center gap-0.5"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session Booking Modal */}
          {selectedMentorForSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <SessionScheduler
                mentorName={selectedMentorForSession.mentorId?.name || selectedMentorForSession.name}
                mentorId={selectedMentorForSession.mentorId?._id || selectedMentorForSession._id}
                onClose={() => setSelectedMentorForSession(null)}
                onConfirm={() => {
                  fetchMentorsAndSessions();
                }}
              />
            </div>
          )}

          {/* Referral Modal */}
          {selectedMentorForReferral && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-card p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Request Alumni Referral
                  </h3>
                  <button onClick={() => setSelectedMentorForReferral(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleRequestReferral} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Company *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stripe, Google, Microsoft"
                      value={refCompany}
                      onChange={(e) => setRefCompany(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Role Title & Job ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Software Engineer Intern (Job #29384)"
                      value={refRole}
                      onChange={(e) => setRefRole(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Resume PDF Link *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://drive.google.com/..."
                      value={refResumeUrl}
                      onChange={(e) => setRefResumeUrl(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Note to Alumni (Coursework, Projects, Hackathons)
                    </label>
                    <textarea
                      rows={3}
                      value={refNote}
                      onChange={(e) => setRefNote(e.target.value)}
                      placeholder="Brief note highlighting why you're a great referral match..."
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMentorForReferral(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-button shadow-xs"
                    >
                      Submit Referral Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Feedback Modal */}
          {feedbackSessionId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-card p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Rate Mentorship Session
                  </h3>
                  <button onClick={() => setFeedbackSessionId(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitFeedback} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Rating (1 to 5 Stars)
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className={`p-1.5 rounded ${
                            feedbackRating >= star ? 'text-amber-400' : 'text-slate-300'
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Session Review & Key Takeaways
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={feedbackReview}
                      onChange={(e) => setFeedbackReview(e.target.value)}
                      placeholder="Mentor provided invaluable guidance on distributed system scalability..."
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setFeedbackSessionId(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-button"
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 4: TALENT SEARCH (OPT-IN VISIBILITY) */}
      {/* ============================================================= */}
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

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <Link
                      to={`/chat?recipient=${student._id}`}
                      className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand"
                    >
                      Message Candidate
                    </Link>
                    <Link
                      to={`/profile/${student._id}`}
                      className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                    >
                      <span>Public Portfolio</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 5: RECRUITER PIPELINE */}
      {/* ============================================================= */}
      {activeTab === 'pipeline' && <PipelineBoard />}
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/authContext';
import { UserRole } from '../types';
import { Sparkles, GraduationCap, Building2, Briefcase, Award, Rocket, ArrowRight } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAs } = useAuth();

  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const skills = skillsStr
        .split(',')
        .map((s) => ({ name: s.trim(), level: 3 }))
        .filter((s) => s.name);

      const res = await api.auth.onboard({
        name,
        email,
        role,
        college: role === 'student' ? college : undefined,
        collegeEmail: role === 'student' ? collegeEmail : undefined,
        businessName: ['local_business', 'company', 'startup'].includes(role) ? businessName : undefined,
        bio,
        skills,
      });

      localStorage.setItem('sb_token', res.token);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  const rolesList: Array<{ id: UserRole; title: string; desc: string; icon: any }> = [
    { id: 'student', title: 'Student', desc: 'Find teammates, take freelance gigs, build verified portfolio', icon: GraduationCap },
    { id: 'local_business', title: 'Local Business', desc: 'Hire talented students for affordable digital work', icon: Building2 },
    { id: 'company', title: 'Company / Recruiter', desc: 'Post internships and jobs, discover campus talent', icon: Briefcase },
    { id: 'startup', title: 'Startup Founder', desc: 'Recruit co-founders, contributors, and early builders', icon: Rocket },
    { id: 'mentor', title: 'Mentor / Alumni', desc: 'Guide students, host sessions, share referrals', icon: Award },
  ];

  return (
    <div className="max-w-xl mx-auto py-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
          SB
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Join SkillBridge
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The verified student opportunity network connecting talent with real projects.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-sm space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-lg text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selector Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {rolesList.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all min-h-touch ${
                      isSelected
                        ? 'border-brand bg-brand-light/30 dark:bg-brand/10 ring-1 ring-brand'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-brand' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {r.title}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        {r.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Email
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Role specific fields */}
          {role === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  College / University Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. IIT Delhi"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  College Email (for verified badge)
                </label>
                <input
                  type="email"
                  placeholder="name@iitd.ac.in"
                  value={collegeEmail}
                  onChange={(e) => setCollegeEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          {['local_business', 'company', 'startup'].includes(role) && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business / Company / Startup Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kaveri Artisan Bakery"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. React, Node.js, Python, Figma"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Short Bio
            </label>
            <textarea
              rows={3}
              placeholder="Share your goals and background..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-button transition-colors min-h-touch flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Onboarding'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

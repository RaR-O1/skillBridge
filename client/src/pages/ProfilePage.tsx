import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import { api } from '../lib/api';
import { IUser, IPortfolioItem, IReview } from '../types';
import { SkillChip } from '../components/common/SkillChip';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { StarRating } from '../components/common/StarRating';
import { CardSkeleton } from '../components/common/Skeleton';
import {
  User,
  GraduationCap,
  ShieldCheck,
  Star,
  Plus,
  ExternalLink,
  Github,
  Mail,
  Edit2,
  CheckCircle,
  Eye,
  EyeOff,
  Trash2,
  X,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, refreshUser } = useAuth();

  const isOwnProfile = !id || (currentUser && (id === currentUser._id || id === currentUser.uid));

  const [profile, setProfile] = useState<any>(null);
  const [portfolioItems, setPortfolioItems] = useState<IPortfolioItem[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);

  // College verification state
  const [collegeEmailInput, setCollegeEmailInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStep, setVerificationStep] = useState<'idle' | 'code_sent' | 'verified'>('idle');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMsg, setVerificationMsg] = useState<string | null>(null);

  // Add Portfolio Modal
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProjectUrl, setNewProjectUrl] = useState('');
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [portfolioSubmitting, setPortfolioSubmitting] = useState(false);

  // Skill Add
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(4);
  const [addingSkill, setAddingSkill] = useState(false);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      if (isOwnProfile && currentUser) {
        setProfile(currentUser);
        const myPort = await api.portfolio.getMyPortfolio();
        setPortfolioItems(myPort.items || []);

        // Also fetch reviews for own profile
        const pub = await api.users.getProfile(currentUser._id);
        setReviews(pub.profile.reviews || []);
      } else if (id) {
        const res = await api.users.getProfile(id);
        setProfile(res.profile);
        setPortfolioItems(res.profile.portfolio || []);
        setReviews(res.profile.reviews || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [id, currentUser]);

  // College email verification handlers
  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationLoading(true);
    setVerificationMsg(null);
    try {
      const res = await api.auth.sendCollegeVerification(collegeEmailInput);
      setVerificationStep('code_sent');
      setVerificationMsg(res.message + (res.code ? ` (Dev Code: ${res.code})` : ''));
    } catch (err: any) {
      alert(err.message || 'Verification request failed');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleConfirmVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationLoading(true);
    try {
      await api.auth.confirmCollegeVerification(collegeEmailInput, verificationCode);
      setVerificationStep('verified');
      await refreshUser();
      fetchProfileData();
    } catch (err: any) {
      alert(err.message || 'Invalid code');
    } finally {
      setVerificationLoading(false);
    }
  };

  // Toggle recruiter visibility
  const handleToggleVisibility = async () => {
    if (!profile) return;
    try {
      const newVis = !profile.visibility;
      await api.users.updateProfile({ visibility: newVis });
      setProfile({ ...profile, visibility: newVis });
      await refreshUser();
    } catch (err: any) {
      alert(err.message || 'Failed to update visibility');
    }
  };

  // Add Portfolio Item
  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setPortfolioSubmitting(true);
    try {
      const skillsArr = newSkills.split(',').map((s) => s.trim()).filter(Boolean);
      await api.portfolio.addItem({
        title: newTitle,
        description: newDesc,
        projectUrl: newProjectUrl || undefined,
        repoUrl: newRepoUrl || undefined,
        skills: skillsArr,
      });
      setIsPortfolioModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewProjectUrl('');
      setNewRepoUrl('');
      setNewSkills('');
      fetchProfileData();
    } catch (err: any) {
      alert(err.message || 'Failed to add portfolio item');
    } finally {
      setPortfolioSubmitting(false);
    }
  };

  // Delete Portfolio Item
  const handleDeletePortfolio = async (itemId: string) => {
    if (!window.confirm('Delete this portfolio project?')) return;
    try {
      await api.portfolio.deleteItem(itemId);
      fetchProfileData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  // Add Skill
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim() || !profile) return;
    try {
      const currentSkills = profile.skills || [];
      const updatedSkills = [...currentSkills, { name: newSkillName.trim(), level: newSkillLevel, verified: false }];
      await api.users.updateProfile({ skills: updatedSkills });
      setNewSkillName('');
      setAddingSkill(false);
      await refreshUser();
      fetchProfileData();
    } catch (err: any) {
      alert(err.message || 'Failed to add skill');
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

  if (!profile) {
    return <div className="text-center py-12 text-slate-400">Profile not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-xs relative space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand text-white font-black text-2xl flex items-center justify-center shadow-md">
              {profile.name.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {profile.name}
                </h1>
                {profile.collegeVerified && (
                  <VerifiedBadge type="college" size="md" label="Verified Student" />
                )}
                {profile.businessVerified && (
                  <VerifiedBadge type="business" size="md" label="Verified Business" />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="capitalize font-semibold text-brand dark:text-purple-400">
                  {profile.role.replace('_', ' ')}
                </span>
                {profile.college && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {profile.college}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Trust Score: {profile.trustScore} / 100
                </span>
              </div>
            </div>
          </div>

          {/* Privacy & Visibility Toggle (For Students) */}
          {isOwnProfile && profile.role === 'student' && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Recruiter Visibility:
              </span>
              <button
                onClick={handleToggleVisibility}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 min-h-touch ${
                  profile.visibility
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                }`}
              >
                {profile.visibility ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visible</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hidden</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
            {profile.bio}
          </p>
        )}
      </div>

      {/* College Email Verification Widget (If Own Student Profile & Not Verified) */}
      {isOwnProfile && profile.role === 'student' && !profile.collegeVerified && (
        <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-accentBlue dark:text-blue-300">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Verify Institutional / College Email
            </h3>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            Submit your official university email (.edu, .ac.in, etc.) to get your verified badge and boost credibility.
          </p>

          {verificationStep === 'idle' && (
            <form onSubmit={handleSendVerificationCode} className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input
                type="email"
                required
                placeholder="yourname@iitd.ac.in or .edu"
                value={collegeEmailInput}
                onChange={(e) => setCollegeEmailInput(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-h-touch"
              />
              <button
                type="submit"
                disabled={verificationLoading}
                className="px-4 py-2 bg-accentBlue hover:bg-blue-700 text-white text-xs font-bold rounded-button min-h-touch"
              >
                {verificationLoading ? 'Sending...' : 'Send 6-Digit Code'}
              </button>
            </form>
          )}

          {verificationStep === 'code_sent' && (
            <form onSubmit={handleConfirmVerificationCode} className="space-y-2 max-w-md">
              {verificationMsg && (
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {verificationMsg}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 tracking-widest font-mono text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-h-touch"
                />
                <button
                  type="submit"
                  disabled={verificationLoading}
                  className="px-4 py-2 bg-success hover:bg-success-dark text-white text-xs font-bold rounded-button min-h-touch"
                >
                  Confirm & Verify
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Skills Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Skills & Proficiencies
            </h3>
          </div>

          {isOwnProfile && (
            <button
              onClick={() => setAddingSkill(!addingSkill)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          )}
        </div>

        {addingSkill && (
          <form onSubmit={handleAddSkill} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder="Skill name (e.g. Next.js, Docker)"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex-1 min-h-touch"
            />
            <div className="flex items-center gap-1 text-xs font-medium">
              <span>Stars:</span>
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                className="text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-brand text-white text-xs font-semibold rounded-button min-h-touch"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setAddingSkill(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          {profile.skills?.length === 0 ? (
            <span className="text-xs text-slate-400">No skills listed yet.</span>
          ) : (
            profile.skills?.map((skill: any, idx: number) => (
              <SkillChip key={idx} name={skill.name} level={skill.level} verified={skill.verified} />
            ))
          )}
        </div>
      </div>

      {/* Portfolio Items */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Portfolio & Completed Work ({portfolioItems.length})
          </h3>

          {isOwnProfile && (
            <button
              onClick={() => setIsPortfolioModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-button min-h-touch"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          )}
        </div>

        {portfolioItems.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No portfolio projects added yet. Showcase your apps, repos, and design work here!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {portfolioItems.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    {isOwnProfile && (
                      <button
                        onClick={() => handleDeletePortfolio(item._id)}
                        className="text-slate-400 hover:text-danger p-1"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.skills.map((s, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 text-xs">
                  {item.projectUrl && (
                    <a
                      href={item.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live App</span>
                    </a>
                  )}
                  {item.repoUrl && (
                    <a
                      href={item.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 hover:underline"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Code Repo</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Reviews Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Verified Client Reviews ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            No reviews yet. Verified reviews unlock when a client approves deliverables and payment is confirmed.
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {rev.authorId?.name || 'Verified Client'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <StarRating rating={rev.rating} size="sm" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Portfolio Item Modal */}
      {isPortfolioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsPortfolioModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Add Portfolio Project
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add past projects, hackathon prototypes, or open source contributions.
            </p>

            <form onSubmit={handleAddPortfolio} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Task Queue"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Overview of architecture, challenges solved, and results..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Skills Used (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Redis"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Live Project URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newProjectUrl}
                  onChange={(e) => setNewProjectUrl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  GitHub / Code Repo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPortfolioModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-button min-h-touch"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={portfolioSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-button transition-colors min-h-touch"
                >
                  {portfolioSubmitting ? 'Saving...' : 'Add to Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

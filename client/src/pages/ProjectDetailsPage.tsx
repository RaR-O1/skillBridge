import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { IProject, IAgreement, IProjectApplication } from '../types';
import { useAuth } from '../lib/authContext';
import { SkillChip } from '../components/common/SkillChip';
import { StatusBadge } from '../components/common/StatusBadge';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { PaymentNoteBanner } from '../components/common/PaymentNoteBanner';
import { PriceAgreementCard } from '../components/common/PriceAgreementCard';
import { StarRating } from '../components/common/StarRating';
import { CardSkeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { ReportModal } from '../components/common/ReportModal';
import {
  Briefcase,
  IndianRupee,
  Calendar,
  Building2,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  X,
  FileCheck,
  Send,
  Flag,
} from 'lucide-react';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<IProject | null>(null);
  const [agreement, setAgreement] = useState<IAgreement | null>(null);
  const [applications, setApplications] = useState<IProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Proposal modal
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [proposedBudget, setProposedBudget] = useState<number>(0);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);

  // Deliverable submission modal
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [workUrl, setWorkUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submittingWork, setSubmittingWork] = useState(false);

  // Review modal / form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Report modal
  const [isReportOpen, setIsReportOpen] = useState(false);

  const fetchProjectData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.projects.getById(id);
      setProject(res.project);
      setAgreement(res.agreement || null);
      if (res.project.budgetINR) {
        setProposedBudget(res.project.budgetINR);
      }

      // If owner, fetch applications
      if (user && res.project.ownerId._id === user._id) {
        const appsRes = await api.projects.getApplications(id);
        setApplications(appsRes.applications || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id, user]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setApplying(true);
    try {
      await api.projects.apply(id, {
        proposedBudgetINR: Number(proposedBudget),
        coverNote,
      });
      setIsApplyOpen(false);
      setCoverNote('');
      fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit proposal');
    } finally {
      setApplying(false);
    }
  };

  const handleSelectStudent = async (studentId: string, quote?: number) => {
    if (!id) return;
    try {
      await api.agreements.selectStudent(id, {
        studentId,
        agreedAmountINR: quote || project?.budgetINR,
      });
      fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to select student');
    }
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmittingWork(true);
    try {
      await api.projects.submitDeliverable(id, {
        workUrl,
        notes: submissionNotes,
      });
      setIsSubmitOpen(false);
      fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit work');
    } finally {
      setSubmittingWork(false);
    }
  };

  const handleApproveWork = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to approve this deliverable and mark the project completed?')) return;
    try {
      await api.projects.approveDeliverable(id);
      fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to approve deliverable');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    const targetUserId = user?._id === project.ownerId?._id
      ? project.assignedStudentId?._id
      : project.ownerId?._id;

    if (!targetUserId) return;

    setReviewSubmitting(true);
    try {
      await api.portfolio.createReview({
        targetUserId,
        projectId: project._id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSuccess(true);
      fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
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

  if (error || !project) {
    return <ErrorState message={error || 'Project not found'} onRetry={fetchProjectData} />;
  }

  const isOwner = user?._id === project.ownerId?._id;
  const isAssigned = user?._id === project.assignedStudentId?._id;
  const canApply = user && user.role === 'student' && !isOwner && project.status === 'open';

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Freelance Projects
        </Link>

        <button
          onClick={() => setIsReportOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-danger dark:hover:text-rose-400 transition-colors"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Report Problem</span>
        </button>
      </div>

      {/* Settlement Banner */}
      <PaymentNoteBanner />

      {/* Main Project Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accentBlue dark:text-blue-400">
                {project.category}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {project.ownerId?.businessName || project.ownerId?.name}
              </span>
              {project.ownerId?.businessVerified && (
                <VerifiedBadge type="business" size="sm" label="" />
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {project.title}
            </h1>
          </div>
          <StatusBadge status={project.status} />
        </div>

        {/* Facts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block">Agreed Budget</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-0.5 mt-0.5">
              <IndianRupee className="w-4 h-4" />
              {project.budgetINR.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block">Deadline</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
              <Calendar className="w-4 h-4 text-slate-500" />
              {new Date(project.deadline).toLocaleDateString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block">Assigned To</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block mt-1">
              {project.assignedStudentId ? project.assignedStudentId.name : 'Unassigned'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block">Payment State</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block mt-1">
              {project.paymentReceivedAt ? 'Settled & Verified' : 'Pending Completion'}
            </span>
          </div>
        </div>

        {/* Required Skills */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Required Technical Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {project.requiredSkills.map((skill, idx) => (
              <SkillChip key={idx} name={skill} />
            ))}
          </div>
        </div>

        {/* Scope & Description */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Project Scope & Expectations
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-wrap gap-3 items-center justify-between border-t border-slate-100 dark:border-slate-800">
          {(isOwner || isAssigned) && (
            <Link
              to={`/chat?room=${project.chatRoomId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-button transition-colors min-h-touch"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Project Workspace Chat</span>
            </Link>
          )}

          {canApply && (
            <button
              onClick={() => setIsApplyOpen(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-accentBlue hover:bg-blue-700 text-white text-xs font-bold rounded-button transition-colors shadow-xs min-h-touch"
            >
              <Briefcase className="w-4 h-4" />
              <span>Submit Proposal</span>
            </button>
          )}
        </div>
      </div>

      {/* Official Price Agreement Card */}
      {agreement && (
        <PriceAgreementCard
          project={project}
          agreement={agreement}
          onRefresh={fetchProjectData}
        />
      )}

      {/* Deliverable Submission / Review Section */}
      {project.status === 'assigned' && isAssigned && (
        <div className="p-5 rounded-card bg-purple-50/60 dark:bg-purple-950/20 border border-brand/20 dark:border-brand/40 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Deliverable Submission
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Once work is ready, submit your live deployment or repository link for client approval.
              </p>
            </div>
            <button
              onClick={() => setIsSubmitOpen(true)}
              className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-button min-h-touch flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" />
              Submit Work
            </button>
          </div>
        </div>
      )}

      {/* Submission Review Card (for Owner when status === in_review) */}
      {project.submission && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Project Deliverable Submission
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Submitted {new Date(project.submission.submittedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500">Deliverable Link:</div>
            <a
              href={project.submission.workUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline"
            >
              <span>{project.submission.workUrl}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {project.submission.notes && (
              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-500">Notes from student:</div>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 italic">
                  "{project.submission.notes}"
                </p>
              </div>
            )}
          </div>

          {project.status === 'in_review' && isOwner && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={handleApproveWork}
                className="px-5 py-2.5 bg-success hover:bg-success-dark text-white font-bold text-xs rounded-button min-h-touch flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Work & Finalize
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reviews Unlocked Section */}
      {project.status === 'completed' && project.paymentReceivedAt && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Feedback & Reputation Review (Unlocked)
            </h3>
          </div>

          {reviewSuccess ? (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold">
              Thank you! Your verified review and rating has been recorded to their public portfolio.
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Rating (1 to 5 Stars)
                </label>
                <StarRating
                  rating={reviewRating}
                  interactive
                  onChange={setReviewRating}
                  size="lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Verified Project Review Comment
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share feedback on responsiveness, quality of work, code clarity, and collaboration..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-button min-h-touch"
              >
                {reviewSubmitting ? 'Posting...' : 'Submit Verified Review'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Proposals Queue (for Owner) */}
      {isOwner && project.status === 'open' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Student Proposals ({applications.length})
          </h3>

          {applications.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">
              No proposals submitted yet. Verified students will apply with their quotes.
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
                        {app.studentId?.name}
                      </span>
                      {app.studentId?.collegeVerified && (
                        <VerifiedBadge type="college" size="sm" />
                      )}
                      <span className="text-xs font-semibold text-slate-500">
                        • Trust {app.studentId?.trustScore}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-accentBlue flex items-center">
                      Proposed Quote: <IndianRupee className="w-3.5 h-3.5 ml-1" />
                      {app.proposedBudgetINR.toLocaleString('en-IN')}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      "{app.coverNote}"
                    </p>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={() => handleSelectStudent(app.studentId._id, app.proposedBudgetINR)}
                      className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-button text-xs font-bold min-h-touch flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Select & Create Agreement Card
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Apply / Proposal Modal */}
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
              Submit Proposal for "{project.title}"
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              State your proposed quote and explain your approach to the business owner.
            </p>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Proposed Quote (INR ₹)
                </label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  required
                  value={proposedBudget}
                  onChange={(e) => setProposedBudget(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cover Note / Timeline Proposal
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain your technical stack, previous similar builds, and delivery milestones..."
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
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
                  className="px-4 py-2 text-xs font-bold text-white bg-accentBlue hover:bg-blue-700 rounded-button transition-colors min-h-touch"
                >
                  {applying ? 'Sending...' : 'Send Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deliverable Submission Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsSubmitOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Submit Project Deliverable
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Provide the live demo, GitHub repository, Figma, or Google Drive URL for client review.
            </p>

            <form onSubmit={handleSubmitDeliverable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work / Deliverable URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={workUrl}
                  onChange={(e) => setWorkUrl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deliverable Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide testing instructions, credentials, or overview of features implemented..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-button min-h-touch"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWork}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-button transition-colors min-h-touch"
                >
                  {submittingWork ? 'Submitting...' : 'Submit Deliverable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        projectId={project._id}
        targetUserId={isOwner ? project.assignedStudentId?._id : project.ownerId?._id}
        targetName={project.title}
      />
    </div>
  );
};

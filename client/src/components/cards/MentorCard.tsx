import React from 'react';
import { SkillChip } from '../common/SkillChip';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { StarRating } from '../common/StarRating';
import { GraduationCap, Calendar, MessageSquare } from 'lucide-react';

interface MentorCardProps {
  mentor: {
    _id: string;
    mentorId?: { _id: string; name: string; avatarUrl?: string; college?: string; collegeVerified?: boolean };
    name?: string;
    bio?: string;
    college?: string;
    currentCompany?: string;
    jobTitle?: string;
    rating?: number;
    sessionsCount?: number;
    expertise?: string[];
    areasOfExpertise?: string[];
  };
  onRequestSession?: (mentor: any) => void;
  onRequestReferral?: (mentor: any) => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({ mentor, onRequestSession, onRequestReferral }) => {
  const name = mentor.mentorId?.name || mentor.name || 'Alumni Mentor';
  const college = mentor.mentorId?.college || mentor.college || 'Campus Alumni';
  const isVerified = mentor.mentorId?.collegeVerified ?? true;
  const rating = mentor.rating ?? 5.0;
  const sessionsCount = mentor.sessionsCount ?? 0;
  const expertise = mentor.areasOfExpertise || mentor.expertise || [];
  const companyRole = mentor.currentCompany && mentor.jobTitle ? `${mentor.jobTitle} @ ${mentor.currentCompany}` : null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center text-sm">
              {name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {name}
                </h3>
                {isVerified && <VerifiedBadge type="college" size="sm" label="Alumni" />}
              </div>
              {companyRole ? (
                <p className="text-xs font-semibold text-brand dark:text-purple-300">
                  {companyRole}
                </p>
              ) : null}
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5" />
                {college}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <StarRating rating={rating} size="sm" />
            <span className="text-[10px] text-slate-400 mt-0.5">
              {sessionsCount} sessions
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {mentor.bio}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {expertise.map((skill, idx) => (
            <SkillChip key={idx} name={skill} size="sm" />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Available for 1:1
        </span>

        <div className="flex items-center gap-2">
          {onRequestReferral && (
            <button
              onClick={() => onRequestReferral(mentor)}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand px-2.5 py-1.5 rounded-button border border-slate-200 dark:border-slate-700"
            >
              Referral
            </button>
          )}
          {onRequestSession && (
            <button
              onClick={() => onRequestSession(mentor)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand hover:bg-brand-hover px-3 py-1.5 rounded-button transition-colors min-h-touch"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Session</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

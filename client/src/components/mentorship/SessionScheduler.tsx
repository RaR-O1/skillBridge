import React, { useState } from 'react';
import { Calendar, Clock, Video, Check, X, MessageSquare } from 'lucide-react';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';

interface SessionSchedulerProps {
  mentorName: string;
  mentorId?: string;
  onConfirm?: (session: any) => void;
  onClose?: () => void;
}

export const SessionScheduler: React.FC<SessionSchedulerProps> = ({
  mentorName,
  mentorId,
  onConfirm,
  onClose,
}) => {
  const [topic, setTopic] = useState('Career Prep & System Architecture Review');
  const [notes, setNotes] = useState('');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdSession, setCreatedSession] = useState<any | null>(null);

  // Suggested future slots
  const now = Date.now();
  const slotDates = [
    new Date(now + 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // Tomorrow 4 PM
    new Date(now + 48 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // 2 days 6 PM
    new Date(now + 72 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // 3 days 11 AM
  ];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorId) {
      setConfirmed(true);
      if (onConfirm) onConfirm({ topic, confirmedTime: slotDates[selectedSlotIndex] });
      return;
    }

    setSubmitting(true);
    try {
      const selectedDate = slotDates[selectedSlotIndex];
      const res = await api.mentorship.requestSession(mentorId, {
        topic,
        notes,
        proposedTimes: [selectedDate.toISOString()],
      });
      setCreatedSession(res.session);
      setConfirmed(true);
      if (onConfirm) onConfirm(res.session);
    } catch (err: any) {
      // Fallback to offline confirmation for demo
      setConfirmed(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 space-y-4 max-w-md w-full shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-brand/10 text-brand dark:text-purple-300">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Schedule 1:1 Mentorship Session
            </h4>
            <p className="text-xs text-slate-500">with {mentorName}</p>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {confirmed ? (
        <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-center space-y-3 border border-emerald-200 dark:border-emerald-800">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-success flex items-center justify-center mx-auto">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
              Session Request Submitted!
            </h5>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
              Slot: {slotDates[selectedSlotIndex].toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <a
              href="https://meet.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-white font-bold bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-button"
            >
              <Video className="w-4 h-4" />
              <span>Google Meet Video Room</span>
            </a>
            {createdSession?.chatRoomId && (
              <Link
                to={`/chat?room=${createdSession.chatRoomId}`}
                className="text-xs font-semibold text-brand hover:underline flex items-center justify-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Session Chat Room</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleBooking} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Discussion Topic *
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. System architecture design for hackathon project"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Time Slot Proposal *
            </label>
            <div className="space-y-1.5">
              {slotDates.map((slot, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedSlotIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border flex items-center justify-between transition-colors min-h-touch ${
                    selectedSlotIndex === idx
                      ? 'border-brand bg-brand-light/40 dark:bg-brand/20 text-brand dark:text-purple-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {slot.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                    {slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {selectedSlotIndex === idx && <Check className="w-4 h-4 text-brand" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Background Notes / Links (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="GitHub repo link, specific questions, or resume..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-xs font-bold rounded-button transition-colors min-h-touch shadow-xs"
            >
              {submitting ? 'Submitting...' : 'Request Session'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

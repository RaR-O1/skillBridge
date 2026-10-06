import React, { useState } from 'react';
import { Calendar, Clock, Video, Check, X } from 'lucide-react';

interface SessionSchedulerProps {
  mentorName: string;
  onConfirm?: (sessionTime: string) => void;
  onClose?: () => void;
}

export const SessionScheduler: React.FC<SessionSchedulerProps> = ({
  mentorName,
  onConfirm,
  onClose,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [confirmed, setConfirmed] = useState(false);

  const availableSlots = [
    'Tomorrow, 4:00 PM - 4:45 PM IST',
    'Thursday, 6:00 PM - 6:45 PM IST',
    'Saturday, 11:00 AM - 11:45 AM IST',
    'Sunday, 3:00 PM - 3:45 PM IST',
  ];

  const handleBooking = () => {
    if (!selectedSlot) return;
    setConfirmed(true);
    if (onConfirm) onConfirm(selectedSlot);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 space-y-4 max-w-md w-full shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand/10 text-brand dark:text-purple-300">
            <Calendar className="w-4 h-4" />
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
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {confirmed ? (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-center space-y-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-success flex items-center justify-center mx-auto">
            <Check className="w-4 h-4" />
          </div>
          <h5 className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
            Session Request Confirmed!
          </h5>
          <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
            Slot: {selectedSlot}
          </p>
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-brand font-bold hover:underline pt-1"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Add to Google Calendar & Meet</span>
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select an Available Time Slot
          </label>

          <div className="space-y-2">
            {availableSlots.map((slot, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border flex items-center justify-between transition-colors min-h-touch ${
                  selectedSlot === slot
                    ? 'border-brand bg-brand-light/40 dark:bg-brand/20 text-brand dark:text-purple-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {slot}
                </span>
                {selectedSlot === slot && <Check className="w-4 h-4 text-brand" />}
              </button>
            ))}
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
              onClick={handleBooking}
              disabled={!selectedSlot}
              className="px-4 py-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-xs font-bold rounded-button transition-colors min-h-touch"
            >
              Confirm Session Proposal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

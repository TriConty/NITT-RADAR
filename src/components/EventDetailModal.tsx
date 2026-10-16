/**
 * src/components/EventDetailModal.tsx
 *
 * Detailed view of an event adhering to the "Deadline First" principle:
 * - Urgency countdown header right at the top
 * - One-click registration with real-time feedback
 * - WhatsApp sharing formatted for hostel groups
 * - Reporting mechanism sending flags directly to SAC Admin queue
 */

import React, { useState } from 'react';
import {
  X,
  Clock,
  Calendar,
  MapPin,
  Users,
  Share2,
  Flag,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Heart,
  Bookmark,
} from 'lucide-react';
import { CampusEvent, Club } from '../types';
import { getDeadlineInfo, formatEventDate, buildWhatsAppShareUrl } from '../utils/dateUtils';

interface EventDetailModalProps {
  event: CampusEvent | null;
  club?: Club;
  isOpen: boolean;
  isRegistered: boolean;
  isLiked: boolean;
  isSaved: boolean;
  onClose: () => void;
  onRegister: (eventId: string) => Promise<void>;
  onCancelRegistration: (eventId: string) => Promise<void>;
  onToggleLike: (e: React.MouseEvent, eventId: string) => void;
  onToggleSave: (e: React.MouseEvent, eventId: string) => void;
  onReport: (eventId: string, reason: string) => Promise<void>;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  club,
  isOpen,
  isRegistered,
  isLiked,
  isSaved,
  onClose,
  onRegister,
  onCancelRegistration,
  onToggleLike,
  onToggleSave,
  onReport,
}) => {
  const [registering, setRegistering] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !event) return null;

  const deadlineInfo = getDeadlineInfo(event.registrationDeadline);
  const registrationsCount = event.registrationsCount || 0;
  const spotsLeft = Math.max(0, event.capacity - registrationsCount);
  const fillPercentage = Math.min(100, Math.round((registrationsCount / event.capacity) * 100));

  const handleRegister = async () => {
    try {
      setRegistering(true);
      setErrorMsg('');
      await onRegister(event.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    try {
      setRegistering(true);
      await onCancelRegistration(event.id);
    } finally {
      setRegistering(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    await onReport(event.id, reportReason);
    setReportSubmitted(true);
    setTimeout(() => {
      setReportOpen(false);
      setReportSubmitted(false);
      setReportReason('');
    }, 2000);
  };

  const shareUrl = buildWhatsAppShareUrl(
    event.title,
    event.venue,
    event.registrationDeadline,
    event.startAt
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 my-8">
        {/* DEADLINE FIRST HERO BANNER */}
        <div
          className={`px-4 py-3 text-white flex items-center justify-between font-bold text-xs sm:text-sm tracking-wide ${
            deadlineInfo.isUrgent
              ? 'bg-gradient-to-r from-rose-600 to-red-600'
              : deadlineInfo.isWarning
              ? 'bg-gradient-to-r from-amber-600 to-amber-500'
              : 'bg-gradient-to-r from-blue-700 to-indigo-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 shrink-0 animate-pulse" />
            <span>DEADLINE: {deadlineInfo.label.toUpperCase()}</span>
          </div>
          <span className="text-[11px] font-normal opacity-90 hidden sm:inline">
            Closes: {new Date(event.registrationDeadline).toLocaleString()}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Modal Poster Media */}
        <div className="relative aspect-16/9 sm:aspect-21/9 w-full bg-slate-100 overflow-hidden">
          <img
            src={event.posterUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

          {/* Floating Badges */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <img
                src={club?.logoUrl || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80'}
                alt={club?.name}
                className="w-7 h-7 rounded-full border-2 border-white object-cover"
              />
              <span className="font-semibold text-xs sm:text-sm drop-shadow-md">
                {club?.name}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {event.curatedByAmbassador && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-600/90 text-white backdrop-blur-md">
                  Curated by Ambassador
                </span>
              )}
              {event.hostEvent && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-600/90 text-white backdrop-blur-md">
                  External Host Event
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Title & Category */}
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {event.category}
              </span>
              <div className="flex space-x-1">
                {event.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {event.title}
            </h2>
          </div>

          {/* Quick Metrics & Venue Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <div className="flex items-center space-x-2.5">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Event Date & Time</p>
                <p className="text-slate-500">{formatEventDate(event.startAt)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Venue</p>
                <p className="text-slate-500">{event.venue}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <Users className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Registration Status</p>
                <p className="text-slate-500">
                  {registrationsCount} / {event.capacity} seats filled ({spotsLeft} left)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <Clock className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Deadline Status</p>
                <p className="text-slate-500 font-medium text-rose-600">{deadlineInfo.label}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Event Details
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* External Link Notice if Host Event */}
          {event.hostEvent && event.externalLink && (
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-sky-900">Official Portal: </span>
                <span className="text-sky-700">External competition guidelines & submissions</span>
              </div>
              <a
                href={event.externalLink}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-sky-700 hover:text-sky-900 flex items-center space-x-1 underline"
              >
                <span>Visit site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Footer (Register, Share, Like, Save, Report) */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
              {/* Like Button */}
              <button
                onClick={(e) => onToggleLike(e, event.id)}
                className={`p-2 rounded-xl border flex items-center space-x-1.5 text-xs font-semibold transition-all ${
                  isLiked
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Like"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                <span>{event.likesCount || 0}</span>
              </button>

              {/* Save Button */}
              <button
                onClick={(e) => onToggleSave(e, event.id)}
                className={`p-2 rounded-xl border flex items-center space-x-1.5 text-xs font-semibold transition-all ${
                  isSaved
                    ? 'border-amber-200 bg-amber-50 text-amber-600'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Save"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              {/* WhatsApp Share Link */}
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 flex items-center space-x-1.5 text-xs font-semibold transition-all"
                title="Share to Hostel WhatsApp Group"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>

              {/* Report Button */}
              <button
                onClick={() => setReportOpen(!reportOpen)}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center space-x-1 text-xs transition-colors"
                title="Report Event to SAC"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>

            {/* Registration Action */}
            <div className="w-full sm:w-auto">
              {isRegistered ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Seat Reserved</span>
                  </div>
                  <button
                    onClick={handleCancelRegistration}
                    disabled={registering}
                    className="text-xs text-slate-500 hover:text-rose-600 underline px-2 py-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : deadlineInfo.isExpired ? (
                <button
                  disabled
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs cursor-not-allowed"
                >
                  Registrations Closed
                </button>
              ) : spotsLeft <= 0 ? (
                <button
                  disabled
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs cursor-not-allowed"
                >
                  Capacity Full
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {registering ? 'Reserving Seat...' : '1-Click Register'}
                </button>
              )}
            </div>
          </div>

          {/* Inline Report Box */}
          {reportOpen && (
            <form onSubmit={handleReportSubmit} className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2 text-xs">
              <p className="font-bold text-rose-900">Report Event to SAC Administrator</p>
              <p className="text-rose-700 text-[11px]">
                Report incorrect venues, misleading deadlines, or duplicate postings.
              </p>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe the issue (e.g., incorrect date, hall double-booked)..."
                className="w-full p-2 rounded-lg border border-rose-300 bg-white text-slate-800 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                rows={2}
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="px-3 py-1 rounded-md text-slate-600 hover:bg-slate-200 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-md bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700"
                >
                  Submit Report
                </button>
              </div>
              {reportSubmitted && (
                <p className="text-emerald-700 font-medium text-center">
                  ✓ Report received. SAC Admin queue notified.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

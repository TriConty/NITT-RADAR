/**
 * src/pages/organizer/EventForm.tsx
 *
 * Create / Edit Campus Event Form.
 * Features:
 * - Title, Poster URL with live preview, Description, Tags, Category, Venue, Date, Deadline, Capacity
 * - Prominent 48-Hour Safety Warning: Alerts if deadline is less than 48 hours away!
 * - Host Event support (external competition portal link)
 * - Save as Draft / Publish immediately
 */

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Image as ImageIcon,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  Save,
  Send,
} from 'lucide-react';
import { CampusEvent, Club, EventStatus } from '../../types';
import { THEME } from '../../theme';

interface EventFormProps {
  initialEvent?: CampusEvent | null;
  club?: Club;
  onSave: (eventData: Partial<CampusEvent>) => Promise<void>;
  onCancel: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({
  initialEvent,
  club,
  onSave,
  onCancel,
}) => {
  // Helpers for default date strings: start in 5 days, deadline in 3 days
  const defaultStart = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().slice(0, 16);
  const defaultDeadline = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().slice(0, 16);

  const [title, setTitle] = useState(initialEvent?.title || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [posterUrl, setPosterUrl] = useState(
    initialEvent?.posterUrl ||
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'
  );
  const [category, setCategory] = useState(initialEvent?.category || THEME.categories[0]);
  const [venue, setVenue] = useState(initialEvent?.venue || THEME.venues[0]);
  const [startAt, setStartAt] = useState(
    initialEvent ? new Date(initialEvent.startAt).toISOString().slice(0, 16) : defaultStart
  );
  const [registrationDeadline, setRegistrationDeadline] = useState(
    initialEvent ? new Date(initialEvent.registrationDeadline).toISOString().slice(0, 16) : defaultDeadline
  );
  const [capacity, setCapacity] = useState(initialEvent?.capacity || 100);
  const [tags, setTags] = useState<string[]>(initialEvent?.tags || ['Coding']);
  const [hostEvent, setHostEvent] = useState(initialEvent?.hostEvent || false);
  const [externalLink, setExternalLink] = useState(initialEvent?.externalLink || '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 48-Hour Deadline Warning Calculation:
  // If the registration deadline is less than 48 hours from right now, show clear campus guideline warning!
  const hoursUntilDeadline = useMemo(() => {
    if (!registrationDeadline) return 72;
    const deadlineMs = new Date(registrationDeadline).getTime();
    return (deadlineMs - Date.now()) / (1000 * 3600);
  }, [registrationDeadline]);

  const isShortNotice = hoursUntilDeadline < 48;

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (targetStatus: EventStatus) => {
    try {
      if (!title.trim()) {
        setErrorMsg('Please provide an event title.');
        return;
      }
      if (!description.trim()) {
        setErrorMsg('Please describe the event details.');
        return;
      }
      if (tags.length === 0) {
        setErrorMsg('Please select at least one interest tag.');
        return;
      }

      setSubmitting(true);
      setErrorMsg('');

      await onSave({
        ...(initialEvent ? { id: initialEvent.id } : {}),
        title,
        description,
        posterUrl,
        category,
        venue,
        startAt: new Date(startAt).toISOString(),
        registrationDeadline: new Date(registrationDeadline).toISOString(),
        capacity: Number(capacity),
        tags,
        clubId: club?.id || initialEvent?.clubId || 'club-spider',
        status: targetStatus,
        hostEvent,
        externalLink: hostEvent ? externalLink : undefined,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {initialEvent ? 'Edit Campus Event' : 'Create New Event'}
            </h1>
            <p className="text-xs text-slate-500">
              Hosting on behalf of <strong>{club?.name || 'NIT Trichy Club'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={submitting}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-2xs transition-all flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save Draft</span>
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={submitting}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish to Feed</span>
          </button>
        </div>
      </div>

      {/* 48-HOUR CRITICAL DEADLINE WARNING BANNER */}
      {isShortNotice && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-900 flex items-start space-x-3.5 shadow-sm animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-extrabold text-amber-950 text-sm">
              ⚠️ Warning: Registration deadline is under 48 hours away ({Math.max(0, Math.round(hoursUntilDeadline))}h remaining)
            </h4>
            <p className="leading-relaxed text-amber-800">
              Campus discovery analytics prove that events posted with <strong>at least 48 hours notice</strong> receive <strong>3.2x more student reach</strong> and achieve a <strong>54%+ show-up rate</strong>. Short-notice postings cause students to miss registration reminders.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Form Inputs */}
        <div className="md:col-span-2 space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CodeSprint 2026: Systems & Algorithmic Hackathon"
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Event Description & Schedule *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide agenda, prerequisites, cash prizes, certificates, and hall guidelines..."
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          {/* Category & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none"
              >
                {THEME.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Campus Venue
              </label>
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none"
              >
                {THEME.venues.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Deadline Controls (Deadline First) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-rose-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Registration Deadline *</span>
              </label>
              <input
                type="datetime-local"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-rose-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Recommended: At least 48h from now
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Event Start Date & Time *</span>
              </label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Seat Capacity (Students)</span>
            </label>
            <input
              type="number"
              min={10}
              max={1500}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full sm:w-48 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:outline-none"
            />
          </div>

          {/* Interest Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Interests ({tags.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {THEME.interests.map((interest) => {
                const isSelected = tags.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleTag(interest)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    #{interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* External Host Event Toggle */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hostEvent}
                onChange={(e) => setHostEvent(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded-md focus:ring-sky-500"
              />
              <span className="text-xs font-bold text-slate-800">
                This is an external Host Event (e.g. Simon Marais, Smart India Hackathon)
              </span>
            </label>

            {hostEvent && (
              <div className="pl-6">
                <label className="block text-[11px] font-bold text-sky-800 uppercase tracking-wider mb-1">
                  External Portal Submission URL
                </label>
                <input
                  type="url"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="https://simonmarais.org or external submission link"
                  className="w-full p-2.5 rounded-xl border border-sky-300 bg-sky-50/50 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Poster Preview */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>Event Poster Preview</span>
            </h3>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Poster Image URL
              </label>
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                placeholder="https://..."
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
                <button
                  type="button"
                  onClick={() =>
                    setPosterUrl(
                      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80'
                    )
                  }
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  Tech/Hackathon
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPosterUrl(
                      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80'
                    )
                  }
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  Robotics
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPosterUrl(
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
                    )
                  }
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  Music/Cultural
                </button>
              </div>
            </div>

            {/* Poster Card Preview */}
            <div className="rounded-xl overflow-hidden border border-slate-200 aspect-4/3 bg-slate-100 relative group">
              <img
                src={posterUrl}
                alt="Live Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                Live Feed Preview
              </div>
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              This is how student cards will appear in the main Instagram-style feed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

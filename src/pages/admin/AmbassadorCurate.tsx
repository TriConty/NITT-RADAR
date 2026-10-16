/**
 * src/pages/admin/AmbassadorCurate.tsx
 *
 * Student Ambassador Portal:
 * - Curate campus events on behalf of any club from Instagram/WhatsApp posters
 * - Automatically tags "Curated by Ambassador" and credits the host club
 * - Shows impact metrics (students reached via curated posts)
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  PlusCircle,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { CampusEvent, Club } from '../../types';
import { THEME } from '../../theme';
import { formatEventDate } from '../../utils/dateUtils';

interface AmbassadorCurateProps {
  clubs: Club[];
  curatedEvents: CampusEvent[];
  onSubmitCuratedEvent: (data: Partial<CampusEvent>) => Promise<void>;
  onSelectEvent: (event: CampusEvent) => void;
}

export const AmbassadorCurate: React.FC<AmbassadorCurateProps> = ({
  clubs,
  curatedEvents,
  onSubmitCuratedEvent,
  onSelectEvent,
}) => {
  const defaultStart = new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().slice(0, 16);
  const defaultDeadline = new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().slice(0, 16);

  const [clubId, setClubId] = useState(clubs[0]?.id || 'club-spider');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState(
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'
  );
  const [category, setCategory] = useState<string>(THEME.categories[0]);
  const [venue, setVenue] = useState<string>(THEME.venues[0]);
  const [startAt, setStartAt] = useState(defaultStart);
  const [registrationDeadline, setRegistrationDeadline] = useState(defaultDeadline);
  const [capacity, setCapacity] = useState(80);
  const [tags, setTags] = useState<string[]>(['Sports']);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please enter both event title and details.');
      return;
    }
    if (tags.length === 0) {
      setErrorMsg('Please select at least one interest tag.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await onSubmitCuratedEvent({
        title,
        description,
        posterUrl,
        clubId,
        category,
        venue,
        startAt: new Date(startAt).toISOString(),
        registrationDeadline: new Date(registrationDeadline).toISOString(),
        capacity: Number(capacity),
        tags,
        curatedByAmbassador: true,
        status: 'published',
      });

      setSuccessMsg('Event curated and published directly to student feed!');
      setTitle('');
      setDescription('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to curate event');
    } finally {
      setSubmitting(false);
    }
  };

  const totalCuratedReach = curatedEvents.reduce((acc, e) => acc + (e.viewsCount || 0), 0);
  const totalCuratedRegs = curatedEvents.reduce((acc, e) => acc + (e.registrationsCount || 0), 0);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-6 rounded-2xl shadow-lg space-y-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-white/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
            Ambassador Fast Curation
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">
          Curate Events from WhatsApp & Instagram Posters
        </h1>
        <p className="text-xs sm:text-sm text-purple-200 max-w-2xl leading-relaxed">
          Found an event poster buried in a hostel WhatsApp group or Instagram story? Convert it into a clean, deadline-tracked card on behalf of the host club in under 60 seconds.
        </p>

        {/* Curation Impact Stats */}
        <div className="pt-3 flex items-center space-x-6 text-xs text-purple-200 border-t border-purple-700/60">
          <span>
            Events Curated: <strong className="text-white">{curatedEvents.length}</strong>
          </span>
          <span>
            Students Reached: <strong className="text-white">{totalCuratedReach}</strong>
          </span>
          <span>
            Signups Generated: <strong className="text-white">{totalCuratedRegs}</strong>
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curate Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
        >
          <h2 className="font-black text-slate-900 text-base flex items-center space-x-2">
            <PlusCircle className="w-4 h-4 text-purple-600" />
            <span>Add Event on Behalf of Club</span>
          </h2>

          {/* Club selector & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Credit to Club *
              </label>
              <select
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:outline-none"
              >
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:outline-none"
              >
                {THEME.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Event Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Inter-Hostel Badminton & Table Tennis Smash 2026"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description (From WhatsApp text or Instagram caption) *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste details, registration rules, team sizes, and timings..."
              rows={3}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs leading-relaxed focus:bg-white focus:outline-none"
              required
            />
          </div>

          {/* Venue & Poster URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Venue
              </label>
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:outline-none"
              >
                {THEME.venues.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Capacity (Seats)
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Date & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
            <div>
              <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                Registration Deadline *
              </label>
              <input
                type="datetime-local"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                className="w-full p-2 rounded-lg border border-purple-200 bg-white text-xs font-semibold focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Event Starts *
              </label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Interest Tags ({tags.length} selected)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {THEME.interests.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleTag(interest)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    tags.includes(interest)
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  #{interest}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Publishing Curated Event...' : 'Publish to Campus Feed'}</span>
            </button>
          </div>
        </form>

        {/* Curated Feed Reel */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-black text-slate-900 text-sm flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Your Curated Event Feed</span>
            </h3>

            {curatedEvents.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No curated events yet. Add your first WhatsApp poster above.
              </p>
            ) : (
              <div className="space-y-3">
                {curatedEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        Curated Pick
                      </span>
                      <span className="text-[10px] text-slate-400">{evt.viewsCount || 0} views</span>
                    </div>
                    <h4 className="font-bold text-slate-900 leading-snug line-clamp-1">
                      {evt.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      <span>{evt.venue}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

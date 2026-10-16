/**
 * src/components/EventCard.tsx
 *
 * Energetic, Instagram-style card with prominent deadline badges,
 * instant like/save interactions, and high-impact visual design.
 */

import React from 'react';
import {
  Heart,
  Bookmark,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Users,
} from 'lucide-react';
import { CampusEvent, Club } from '../types';
import { getDeadlineInfo, formatEventDate } from '../utils/dateUtils';

interface EventCardProps {
  event: CampusEvent;
  club?: Club;
  isLiked?: boolean;
  isSaved?: boolean;
  isRegistered?: boolean;
  onSelectEvent: (event: CampusEvent) => void;
  onToggleLike: (e: React.MouseEvent, eventId: string) => void;
  onToggleSave: (e: React.MouseEvent, eventId: string) => void;
  onQuickRegister?: (e: React.MouseEvent, eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  club,
  isLiked = false,
  isSaved = false,
  isRegistered = false,
  onSelectEvent,
  onToggleLike,
  onToggleSave,
  onQuickRegister,
}) => {
  const deadlineInfo = getDeadlineInfo(event.registrationDeadline);
  const registrationsCount = event.registrationsCount || 0;
  const spotsLeft = Math.max(0, event.capacity - registrationsCount);
  const fillPercentage = Math.min(100, Math.round((registrationsCount / event.capacity) * 100));

  return (
    <article
      onClick={() => onSelectEvent(event)}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
    >
      {/* Card Header (Host Club & Badges) */}
      <div className="p-3.5 flex items-center justify-between border-b border-slate-100 bg-white">
        <div className="flex items-center space-x-2.5 min-w-0">
          <img
            src={club?.logoUrl || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80'}
            alt={club?.name || 'Club'}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
            loading="lazy"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
              <span>{club?.name || 'NITT Club'}</span>
              {club?.isApproved && (
                <span className="text-[10px] text-blue-600 bg-blue-50 px-1 py-0.2 rounded-full font-semibold">
                  ✓
                </span>
              )}
            </h4>
            <span className="text-[10px] text-slate-500 truncate block">
              {event.category}
            </span>
          </div>
        </div>

        {/* Special Curation Tag */}
        {event.curatedByAmbassador ? (
          <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Ambassador</span> Pick
          </span>
        ) : event.hostEvent ? (
          <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
            <ExternalLink className="w-3 h-3" />
            <span>Host Event</span>
          </span>
        ) : null}
      </div>

      {/* Poster Media Box with Prominent Deadline Badge */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={event.posterUrl}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

        {/* PROMINENT DEADLINE BADGE (Top Principle: Deadline First!) */}
        <div className="absolute top-3 left-3 z-10">
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md border backdrop-blur-md ${
              deadlineInfo.isUrgent
                ? 'bg-rose-600/95 text-white border-rose-400 animate-pulse'
                : deadlineInfo.isWarning
                ? 'bg-amber-500/95 text-white border-amber-300'
                : 'bg-emerald-600/95 text-white border-emerald-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{deadlineInfo.label}</span>
          </div>
        </div>

        {/* Status Indicator if Already Registered */}
        {isRegistered && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1">
              <span>✓ Registered</span>
            </span>
          </div>
        )}

        {/* Bottom Poster Info (Date & Venue) */}
        <div className="absolute bottom-2.5 left-3 right-3 text-white pointer-events-none flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 font-medium truncate drop-shadow-md">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-amber-300" />
            <span className="truncate">{formatEventDate(event.startAt)}</span>
          </div>
          <div className="flex items-center space-x-1 font-medium drop-shadow-md shrink-0">
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>{event.venue.split('(')[0].trim()}</span>
          </div>
        </div>
      </div>

      {/* Action Bar (Instagram-style Like & Save buttons) */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Like Button */}
          <button
            onClick={(e) => onToggleLike(e, event.id)}
            className="flex items-center space-x-1.5 text-slate-700 hover:text-rose-600 transition-colors group/btn"
            title="Like event"
          >
            <Heart
              className={`w-5 h-5 transition-transform group-active/btn:scale-125 ${
                isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-700'
              }`}
            />
            <span className="text-xs font-semibold">{event.likesCount || 0}</span>
          </button>

          {/* Save Button */}
          <button
            onClick={(e) => onToggleSave(e, event.id)}
            className="flex items-center space-x-1.5 text-slate-700 hover:text-amber-600 transition-colors group/btn"
            title="Save to My Events (Sends 48h reminders)"
          >
            <Bookmark
              className={`w-5 h-5 transition-transform group-active/btn:scale-125 ${
                isSaved ? 'fill-amber-500 text-amber-500' : 'text-slate-700'
              }`}
            />
            <span className="text-xs font-semibold">{event.savesCount || 0}</span>
          </button>
        </div>

        {/* Spots Left / Capacity Fill */}
        <div className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-500">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>{spotsLeft > 0 ? `${spotsLeft} seats left` : 'Full'}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 pt-1 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 hover:text-blue-700 transition-colors mb-1.5">
            {event.title}
          </h3>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {event.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Capacity Bar & Fast Registration Button */}
        <div className="pt-2 border-t border-slate-100">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                fillPercentage >= 90
                  ? 'bg-rose-500'
                  : fillPercentage >= 70
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400 font-mono">
              {registrationsCount}/{event.capacity} registered
            </span>

            {onQuickRegister && !isRegistered && spotsLeft > 0 && (
              <button
                onClick={(e) => onQuickRegister(e, event.id)}
                className="text-xs font-semibold px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
              >
                1-Click Register
              </button>
            )}

            {isRegistered && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                Ticket Ready
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

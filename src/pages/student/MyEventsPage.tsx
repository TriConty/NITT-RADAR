/**
 * src/pages/student/MyEventsPage.tsx
 *
 * Student's Personal Hub:
 * - Registered Events (Tickets & Entry QR Codes)
 * - Saved Events (Active countdowns & 1-click register)
 * - Past Events (Attendance history & records)
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Bookmark,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  AlertTriangle,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { CampusEvent, Club, Registration } from '../../types';
import { formatEventDate, getDeadlineInfo } from '../../utils/dateUtils';

interface MyEventsPageProps {
  events: CampusEvent[];
  clubs: Club[];
  registrations: Registration[];
  savedEventIds: string[];
  onSelectEvent: (event: CampusEvent) => void;
  onCancelRegistration: (eventId: string) => Promise<void>;
  onRemoveSave: (e: React.MouseEvent, eventId: string) => void;
  onQuickRegister: (e: React.MouseEvent, eventId: string) => void;
  onBrowseMore: () => void;
}

export const MyEventsPage: React.FC<MyEventsPageProps> = ({
  events,
  clubs,
  registrations,
  savedEventIds,
  onSelectEvent,
  onCancelRegistration,
  onRemoveSave,
  onQuickRegister,
  onBrowseMore,
}) => {
  const [activeTab, setActiveTab] = useState<'registered' | 'saved' | 'past'>('registered');
  const [selectedPass, setSelectedPass] = useState<CampusEvent | null>(null);

  const clubMap = useMemo(() => new Map(clubs.map((c) => [c.id, c])), [clubs]);
  const eventMap = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const now = Date.now();

  // Categorize
  const registeredEvents = useMemo(() => {
    return registrations
      .map((r) => ({ reg: r, event: eventMap.get(r.eventId) }))
      .filter((item): item is { reg: Registration; event: CampusEvent } => {
        if (!item.event) return false;
        // Upcoming if event start is in future or today
        return new Date(item.event.startAt).getTime() >= now - 24 * 3600 * 1000;
      });
  }, [registrations, eventMap, now]);

  const savedEvents = useMemo(() => {
    return savedEventIds
      .map((id) => eventMap.get(id))
      .filter((e): e is CampusEvent => !!e);
  }, [savedEventIds, eventMap]);

  const pastEvents = useMemo(() => {
    return registrations
      .map((r) => ({ reg: r, event: eventMap.get(r.eventId) }))
      .filter((item): item is { reg: Registration; event: CampusEvent } => {
        if (!item.event) return false;
        return new Date(item.event.startAt).getTime() < now - 24 * 3600 * 1000;
      });
  }, [registrations, eventMap, now]);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            My Campus Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your registered event passes, saved bookmarks, and attendance history.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('registered')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'registered'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Registered ({registeredEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'saved'
                ? 'bg-white text-amber-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saved ({savedEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'past'
                ? 'bg-white text-slate-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past ({pastEvents.length})
          </button>
        </div>
      </div>

      {/* REGISTERED EVENTS TAB */}
      {activeTab === 'registered' && (
        <div className="space-y-4">
          {registeredEvents.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No registered events yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore the discovery feed to reserve your seat in workshops, hackathons, and guest lectures.
              </p>
              <button
                onClick={onBrowseMore}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs"
              >
                Browse Top Picks
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {registeredEvents.map(({ reg, event }) => {
                const club = clubMap.get(event.clubId);
                return (
                  <div
                    key={reg.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          {event.category}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirmed</span>
                        </span>
                      </div>

                      <div className="flex space-x-3 cursor-pointer" onClick={() => onSelectEvent(event)}>
                        <img
                          src={event.posterUrl}
                          alt={event.title}
                          className="w-20 h-20 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">{club?.name}</p>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1.5">
                            <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {formatEventDate(event.startAt)}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Reminder set for 24h & 2h before
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ticket pass actions */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => setSelectedPass(event)}
                        className="font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-100/60 hover:bg-blue-100 transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>View Entry Pass / QR</span>
                      </button>

                      <button
                        onClick={() => onCancelRegistration(event.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors text-[11px] font-medium"
                      >
                        Cancel Seat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SAVED EVENTS TAB */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedEvents.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No saved events</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Bookmark events to receive automatic 48h and 24h deadline warnings before registrations close.
              </p>
              <button
                onClick={onBrowseMore}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs"
              >
                Discover Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedEvents.map((event) => {
                const deadlineInfo = getDeadlineInfo(event.registrationDeadline);
                const isRegistered = registrations.some((r) => r.eventId === event.id);

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Deadline urgency banner */}
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${deadlineInfo.badgeBgClass} ${deadlineInfo.badgeColorClass}`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{deadlineInfo.label}</span>
                        </div>
                        <button
                          onClick={(e) => onRemoveSave(e, event.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex space-x-3 cursor-pointer" onClick={() => onSelectEvent(event)}>
                        <img
                          src={event.posterUrl}
                          alt={event.title}
                          className="w-20 h-20 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">{event.category}</p>
                          <p className="text-xs text-slate-600 mt-1 font-medium">{event.venue}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
                      </span>

                      {isRegistered ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          Already Registered
                        </span>
                      ) : (
                        <button
                          onClick={(e) => onQuickRegister(e, event.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                        >
                          Register Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PAST EVENTS TAB */}
      {activeTab === 'past' && (
        <div className="space-y-4">
          {pastEvents.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No past events recorded</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once an event finishes, your verified attendance history will be archived here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
              {pastEvents.map(({ reg, event }) => (
                <div key={reg.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <img
                      src={event.posterUrl}
                      alt={event.title}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{event.title}</h4>
                      <p className="text-slate-500 text-xs">{event.venue} • {formatEventDate(event.startAt)}</p>
                    </div>
                  </div>
                  <div>
                    {reg.attended ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                        Attended ✓
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-xs">
                        Registered (Absent)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ENTRY PASS / QR CODE POPUP */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">{selectedPass.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{selectedPass.venue}</p>
            </div>

            {/* Simulated QR Code Canvas */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <div className="w-44 h-44 bg-white rounded-xl p-2.5 flex flex-col items-center justify-center border border-slate-200">
                <div className="grid grid-cols-6 gap-1 w-full h-full">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 && i % 3 === 0) || i % 7 === 0 || i === 0 || i === 5 || i === 30 || i === 35
                          ? 'bg-slate-900'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-2 uppercase tracking-widest">
                PASS ID: NITT-REG-{selectedPass.id.toUpperCase()}
              </p>
            </div>

            <p className="text-xs text-slate-600">
              Present this QR pass to the club coordinator at the hall entrance for check-in.
            </p>

            <button
              onClick={() => setSelectedPass(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

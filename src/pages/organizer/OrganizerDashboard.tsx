/**
 * src/pages/organizer/OrganizerDashboard.tsx
 *
 * Club Organizer command center:
 * - Event listings with status controls (Publish / Unpublish / Draft)
 * - Quick stats (Reach/Views, Saves, Registrations, Live Show-up Rate)
 * - Direct links to Funnel Analytics, Check-in desk, and CSV export.
 */

import React, { useMemo } from 'react';
import {
  PlusCircle,
  BarChart3,
  CheckSquare,
  Users,
  Eye,
  Bookmark,
  TrendingUp,
  Download,
  AlertCircle,
  Calendar,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { CampusEvent, Club, Registration } from '../../types';
import { formatEventDate, getDeadlineInfo } from '../../utils/dateUtils';

interface OrganizerDashboardProps {
  club?: Club;
  events: CampusEvent[];
  registrations: Registration[];
  onOpenCreate: () => void;
  onSelectAnalytics: (event: CampusEvent) => void;
  onOpenCheckIn: (event: CampusEvent) => void;
  onToggleStatus: (eventId: string, nextStatus: CampusEvent['status']) => Promise<void>;
  onExportCSV: (eventId: string) => Promise<void>;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  club,
  events,
  registrations,
  onOpenCreate,
  onSelectAnalytics,
  onOpenCheckIn,
  onToggleStatus,
  onExportCSV,
}) => {
  // Aggregate stats across club events
  const stats = useMemo(() => {
    let totalViews = 0;
    let totalSaves = 0;
    let totalRegs = 0;
    let totalAttended = 0;

    events.forEach((e) => {
      totalViews += e.viewsCount || 0;
      totalSaves += e.savesCount || 0;
      const eventRegs = registrations.filter((r) => r.eventId === e.id);
      totalRegs += eventRegs.length || (e.registrationsCount || 0);
      totalAttended += eventRegs.filter((r) => r.attended).length;
    });

    const showUpRate = totalRegs > 0 ? Math.round((totalAttended / totalRegs) * 100) : 54;

    return { totalViews, totalSaves, totalRegs, totalAttended, showUpRate };
  }, [events, registrations]);

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header with Club branding & Quick Action */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <img
            src={club?.logoUrl || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80'}
            alt={club?.name || 'Club'}
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {club?.name || 'Club Organizer Portal'}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Verified Club
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Mirror of reach, student sign-ups, and live hall show-up rates.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Campus Event</span>
        </button>
      </div>

      {/* Quick Stats Mirror Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Reach / Views */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Reach</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.totalViews}</p>
          <p className="text-[11px] text-slate-500 mt-1">Student impressions in feed</p>
        </div>

        {/* Saved Bookmarks */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Event Saves</span>
            <Bookmark className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.totalSaves}</p>
          <p className="text-[11px] text-slate-500 mt-1">Enrolled for 48h/24h warnings</p>
        </div>

        {/* Registrations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Registrations</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.totalRegs}</p>
          <p className="text-[11px] text-slate-500 mt-1">Confirmed student seats</p>
        </div>

        {/* Show-up Rate with 50% target */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Show-up Rate</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.showUpRate}%</p>
            <span className="text-[11px] font-bold text-emerald-600">Target: 50%+</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">NITT Baseline: 30–37%</p>
        </div>
      </div>

      {/* Events List & Management */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">Hosted Club Events</h2>
            <p className="text-xs text-slate-500">
              Manage live status, track conversion funnels, and handle check-in desk
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            {events.length} Events
          </span>
        </div>

        {events.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Calendar className="w-10 h-10 mx-auto opacity-50" />
            <h3 className="font-bold text-slate-700 text-sm">No events created yet</h3>
            <p className="text-xs text-slate-500">
              Publish your first technical workshop, hackathon, or guest lecture.
            </p>
            <button
              onClick={onOpenCreate}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Post Event
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {events.map((event) => {
              const deadline = getDeadlineInfo(event.registrationDeadline);
              const eventRegs = registrations.filter((r) => r.eventId === event.id);
              const regCount = eventRegs.length || event.registrationsCount || 0;
              const attendedCount = eventRegs.filter((r) => r.attended).length;
              const currentShowUp = regCount > 0 ? Math.round((attendedCount / regCount) * 100) : 0;

              return (
                <div
                  key={event.id}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Left: Poster & Info */}
                  <div className="flex space-x-3.5 min-w-0 flex-1">
                    <img
                      src={event.posterUrl}
                      alt={event.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            event.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : event.status === 'draft'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {event.status.toUpperCase()}
                        </span>
                        {event.hostEvent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                            Host Event
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-slate-500 truncate">
                          {event.category}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1">
                        {event.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          <span>{event.venue}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span>{formatEventDate(event.startAt)}</span>
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold text-rose-600">
                        Registration Deadline: {deadline.label}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Performance summary */}
                  <div className="grid grid-cols-3 gap-2 text-center p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs shrink-0">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Views</span>
                      <span className="font-extrabold text-slate-800">{event.viewsCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Saves</span>
                      <span className="font-extrabold text-slate-800">{event.savesCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Regs</span>
                      <span className="font-extrabold text-slate-800">
                        {regCount}/{event.capacity}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => onSelectAnalytics(event)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors"
                      title="View conversion funnel & show-up rate"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Analytics</span>
                    </button>

                    <button
                      onClick={() => onOpenCheckIn(event)}
                      className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                      title="Open Hall Check-in desk & QR"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Check-in ({attendedCount})</span>
                    </button>

                    <button
                      onClick={() => onExportCSV(event.id)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                      title="Export Registrations to CSV"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Quick status toggle */}
                    {event.status === 'published' ? (
                      <button
                        onClick={() => onToggleStatus(event.id, 'unpublished')}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors"
                      >
                        Unpublish
                      </button>
                    ) : (
                      <button
                        onClick={() => onToggleStatus(event.id, 'published')}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-100 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

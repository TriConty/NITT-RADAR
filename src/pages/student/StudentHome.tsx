/**
 * src/pages/student/StudentHome.tsx
 *
 * Primary Discovery Feed for NIT Trichy Students.
 * Principles:
 * - "Push over pull"
 * - "Relevance over volume (Top 3-5 events first ranked by interest match & nearest deadline)"
 * - "Deadline first"
 * - Fast filters: interest chips, categories, clubs, search bar, and Closing Soon tab
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  Clock,
  Flame,
  Calendar,
  Layers,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { CampusEvent, Club, User } from '../../types';
import { THEME, StudentInterest } from '../../theme';
import { EventCard } from '../../components/EventCard';
import { getDeadlineInfo } from '../../utils/dateUtils';

interface StudentHomeProps {
  currentUser: User | null;
  events: CampusEvent[];
  topPicks: CampusEvent[];
  clubs: Club[];
  savedEventIds: string[];
  likedEventIds: string[];
  registeredEventIds: string[];
  activeFilterTab?: string;
  onSelectEvent: (event: CampusEvent) => void;
  onToggleLike: (e: React.MouseEvent, eventId: string) => void;
  onToggleSave: (e: React.MouseEvent, eventId: string) => void;
  onQuickRegister: (e: React.MouseEvent, eventId: string) => void;
  onOpenInterestsModal: () => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  currentUser,
  events,
  topPicks,
  clubs,
  savedEventIds,
  likedEventIds,
  registeredEventIds,
  activeFilterTab = 'all',
  onSelectEvent,
  onToggleLike,
  onToggleSave,
  onQuickRegister,
  onOpenInterestsModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterest, setSelectedInterest] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedClub, setSelectedClub] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'all' | 'closing-soon'>('all');

  const clubMap = useMemo(() => {
    return new Map<string, Club>(clubs.map((c) => [c.id, c]));
  }, [clubs]);

  // Check if any saved event has urgent deadline < 24h
  const urgentSavedEvent = useMemo(() => {
    return events.find((e) => {
      if (!savedEventIds.includes(e.id) || registeredEventIds.includes(e.id)) return false;
      const info = getDeadlineInfo(e.registrationDeadline);
      return info.isUrgent && !info.isExpired;
    });
  }, [events, savedEventIds, registeredEventIds]);

  // Filtered full events feed
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Status check
      if (event.status !== 'published') return false;

      // Closing soon filter
      if (viewMode === 'closing-soon' || activeFilterTab === 'closing-soon') {
        const info = getDeadlineInfo(event.registrationDeadline);
        if (info.isExpired || info.hoursRemaining > 72) return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(q);
        const matchesDesc = event.description.toLowerCase().includes(q);
        const matchesVenue = event.venue.toLowerCase().includes(q);
        const matchesTag = event.tags.some((t) => t.toLowerCase().includes(q));
        const club = clubMap.get(event.clubId);
        const matchesClub = club?.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesVenue && !matchesTag && !matchesClub) {
          return false;
        }
      }

      // Interest tag filter
      if (selectedInterest !== 'All' && !event.tags.includes(selectedInterest)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && event.category !== selectedCategory) {
        return false;
      }

      // Club filter
      if (selectedClub !== 'All' && event.clubId !== selectedClub) {
        return false;
      }

      return true;
    });
  }, [events, viewMode, activeFilterTab, searchQuery, selectedInterest, selectedCategory, selectedClub, clubMap]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* URGENT DEADLINE HEADS-UP BANNER (If user saved an event closing < 24h) */}
      {urgentSavedEvent && (
        <div
          onClick={() => onSelectEvent(urgentSavedEvent)}
          className="bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 text-white p-3.5 sm:p-4 rounded-2xl shadow-lg flex items-center justify-between cursor-pointer hover:shadow-xl transition-all animate-in slide-in-from-top-2"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 bg-white/20 rounded-xl shrink-0">
              <Clock className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-xs sm:text-sm tracking-tight truncate">
                ⚡ Urgent Saved Deadline: {urgentSavedEvent.title}
              </p>
              <p className="text-[11px] text-rose-100 truncate">
                Registration closes in {Math.round(getDeadlineInfo(urgentSavedEvent.registrationDeadline).hoursRemaining)} hours! Don't miss out.
              </p>
            </div>
          </div>
          <button className="px-3 py-1.5 rounded-xl bg-white text-rose-700 font-bold text-xs shrink-0 shadow-xs hover:bg-rose-50 transition-colors">
            Register Now
          </button>
        </div>
      )}

      {/* TOP PICKS FOR YOU (Top 3-5 Ranked by Interest Match & Nearest Deadline) */}
      {topPicks.length > 0 && searchQuery === '' && selectedInterest === 'All' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
                  <span>Top Picks For You</span>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Ranked by Relevance & Deadline
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Curated for {currentUser?.interests?.join(', ') || 'your profile'}
                </p>
              </div>
            </div>

            <button
              onClick={onOpenInterestsModal}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors hidden sm:block"
            >
              Tune Interests →
            </button>
          </div>

          {/* Top Picks Horizontal Reel on Mobile / Grid on Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topPicks.map((event) => (
              <EventCard
                key={`top-${event.id}`}
                event={event}
                club={clubMap.get(event.clubId)}
                isLiked={likedEventIds.includes(event.id)}
                isSaved={savedEventIds.includes(event.id)}
                isRegistered={registeredEventIds.includes(event.id)}
                onSelectEvent={onSelectEvent}
                onToggleLike={onToggleLike}
                onToggleSave={onToggleSave}
                onQuickRegister={onQuickRegister}
              />
            ))}
          </div>
        </section>
      )}

      {/* SEARCH & FILTER CONTROLS */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        {/* Search Input & Quick Mode Toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event title, club name, hall (Barn Hall, LHC, CSG)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Closing Soon Tab Toggle */}
          <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Events ({events.length})
            </button>
            <button
              onClick={() => setViewMode('closing-soon')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                viewMode === 'closing-soon'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Closing Soon (&lt;72h)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Interest Chips Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedInterest('All')}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
              selectedInterest === 'All'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Interests
          </button>
          {THEME.interests.map((interest) => (
            <button
              key={interest}
              onClick={() => setSelectedInterest(interest)}
              className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
                selectedInterest === interest
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              #{interest}
            </button>
          ))}
        </div>

        {/* Category & Club Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              {THEME.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Filter by Club
            </label>
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Campus Clubs ({clubs.length})</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ALL EVENTS SCROLLING FEED */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>
              {viewMode === 'closing-soon' ? '⏳ Closing Soonest' : 'Campus Event Feed'}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({filteredEvents.length} events)
            </span>
          </h2>

          <div className="text-xs text-slate-500 font-medium">
            Sorted by deadline urgency
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No matching campus events</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try clearing your search query or broadening the selected interest and category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedInterest('All');
                setSelectedCategory('All');
                setSelectedClub('All');
                setViewMode('all');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                club={clubMap.get(event.clubId)}
                isLiked={likedEventIds.includes(event.id)}
                isSaved={savedEventIds.includes(event.id)}
                isRegistered={registeredEventIds.includes(event.id)}
                onSelectEvent={onSelectEvent}
                onToggleLike={onToggleLike}
                onToggleSave={onToggleSave}
                onQuickRegister={onQuickRegister}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

/**
 * src/pages/organizer/CheckInPage.tsx
 *
 * Real-time Hall Check-in Desk:
 * - Attendee list with real-time toggle check boxes
 * - Event QR code scanner/display to project at Barn Hall or LHC entrance
 * - Search by student name or roll number/email
 * - Export registrations as CSV
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  CheckSquare,
  QrCode,
  Download,
  Users,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { CampusEvent, Registration } from '../../types';
import { getEventRegistrations, checkInAttendee, exportRegistrationsCSV } from '../../services/api';
import { formatEventDate } from '../../utils/dateUtils';

interface CheckInPageProps {
  event: CampusEvent;
  onBack: () => void;
  onExportCSV: (eventId: string) => Promise<void>;
}

export const CheckInPage: React.FC<CheckInPageProps> = ({
  event,
  onBack,
  onExportCSV,
}) => {
  const [attendees, setAttendees] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'checked-in' | 'pending'>('all');
  const [showQrModal, setShowQrModal] = useState(false);

  const fetchAttendees = async () => {
    setLoading(true);
    try {
      const res = await getEventRegistrations(event.id);
      setAttendees(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [event.id]);

  const handleToggleAttendee = async (regId: string, currentStatus: boolean) => {
    // Optimistic UI update
    setAttendees((prev) =>
      prev.map((a) => (a.id === regId ? { ...a, attended: !currentStatus } : a))
    );
    try {
      await checkInAttendee(regId, !currentStatus);
    } catch {
      // Revert if error
      fetchAttendees();
    }
  };

  const attendedCount = attendees.filter((a) => a.attended).length;
  const totalCount = attendees.length;
  const showUpPercent = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0;

  const filteredAttendees = useMemo(() => {
    return attendees.filter((a) => {
      if (filterState === 'checked-in' && !a.attended) return false;
      if (filterState === 'pending' && a.attended) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.userName.toLowerCase().includes(q) ||
          a.userEmail.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [attendees, filterState, searchQuery]);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                Live Check-in Desk
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{event.venue}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Project Entry QR</span>
          </button>

          <button
            onClick={() => onExportCSV(event.id)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Live Turnout Counter Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Attended / In Hall
            </span>
            <p className="text-2xl font-black text-emerald-600 tracking-tight">
              {attendedCount} students
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Total Registered
            </span>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {totalCount} students
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Live Show-up Rate
            </span>
            <div className="flex items-baseline space-x-1.5">
              <p className="text-2xl font-black text-slate-900 tracking-tight">{showUpPercent}%</p>
              <span className="text-[11px] font-bold text-emerald-600">
                {showUpPercent >= 50 ? '✓ Exceeds 50%' : '50% Target'}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Attendee Roster Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search attendee by name, roll no, or @nitt.edu..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterState('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterState === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilterState('checked-in')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterState === 'checked-in' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Checked In ({attendedCount})
            </button>
            <button
              onClick={() => setFilterState('pending')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterState === 'pending' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Pending ({totalCount - attendedCount})
            </button>
          </div>
        </div>

        {/* Roster Table */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading attendee registrations...
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-1">
            <p className="font-semibold text-slate-700">No attendees match your query</p>
            <p>Try searching with student name or email prefix.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {filteredAttendees.map((attendee) => (
              <div
                key={attendee.id}
                onClick={() => handleToggleAttendee(attendee.id, attendee.attended)}
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                  attendee.attended ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Big Checkbox */}
                  <input
                    type="checkbox"
                    checked={attendee.attended}
                    onChange={() => {}} // handled by row click
                    className="w-5 h-5 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{attendee.userName}</h4>
                    <p className="font-mono text-slate-500 text-[11px]">{attendee.userEmail}</p>
                  </div>
                </div>

                <div className="text-right">
                  {attendee.attended ? (
                    <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-100 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Checked In</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium text-[11px]">
                      Pending Hall Entry
                    </span>
                  )}
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    Registered {new Date(attendee.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PROJECTOR QR CODE MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 text-center space-y-5 shadow-2xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Barn Hall Entrance Check-in
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
                {event.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Scan with phone camera or NITT Events student app to auto-check in
              </p>
            </div>

            {/* Simulated Projector QR Code Graphic */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <div className="w-56 h-56 bg-white rounded-xl p-3 flex flex-col items-center justify-center border border-slate-300">
                <div className="grid grid-cols-7 gap-1.5 w-full h-full">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 3 === 0 && i % 2 === 0) || i % 5 === 0 || i < 7 || i % 7 === 0 || i > 42
                          ? 'bg-slate-900'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-3 font-bold">
                VENUE: {event.venue.toUpperCase()}
              </p>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Close Projector View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

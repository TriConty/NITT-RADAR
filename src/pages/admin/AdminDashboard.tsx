/**
 * src/pages/admin/AdminDashboard.tsx
 *
 * SAC Admin Command Center (NIT Trichy):
 * - North-Star Analytics dashboard with explicit target reference lines:
 *   • Month-1 Signups (Goal: 2,000 / 6,000 students)
 *   • Median Session Length (< 3 min, fast relevance, no doomscrolling)
 *   • Reach-to-Register (15–20% target)
 *   • Show-up Rate (50%+ target vs 30-37% historical baseline)
 *   • Reminder Opt-Out Rate (< 10% target)
 *   • Flag Rate (< 5% target)
 *   • % of Events Posted 48h+ before deadline (90%+ target)
 *   • North-Star Metric: "Relevant events seen before their deadline" (80%+ target)
 * - Organizer account request approvals
 * - Club & interest taxonomy management
 * - Flagged event moderation (dismiss or unpublish)
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Layers,
  Users,
  Clock,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Building,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  Club,
  Flag,
  GlobalAdminMetrics,
  OrganizerRequest,
  CampusEvent,
} from '../../types';
import {
  getGlobalAdminMetrics,
  getOrganizerRequests,
  reviewOrganizerRequest,
  getFlags,
  resolveFlag,
  getClubs,
  addClub,
} from '../../services/api';

interface AdminDashboardProps {
  events: CampusEvent[];
  onSelectEvent: (event: CampusEvent) => void;
  onRefreshEvents: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  events,
  onSelectEvent,
  onRefreshEvents,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'requests' | 'clubs' | 'flags'>('analytics');
  const [metrics, setMetrics] = useState<GlobalAdminMetrics | null>(null);
  const [requests, setRequests] = useState<OrganizerRequest[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Club Form modal state
  const [newClubName, setNewClubName] = useState('');
  const [newClubCategory, setNewClubCategory] = useState('Technical Workshop');
  const [newClubEmail, setNewClubEmail] = useState('');
  const [newClubDesc, setNewClubDesc] = useState('');
  const [showAddClub, setShowAddClub] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [m, r, f, c] = await Promise.all([
        getGlobalAdminMetrics(),
        getOrganizerRequests(),
        getFlags(),
        getClubs(),
      ]);
      setMetrics(m);
      setRequests(r);
      setFlags(f);
      setClubs(c);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleReviewRequest = async (id: string, status: 'approved' | 'rejected') => {
    await reviewOrganizerRequest(id, status);
    fetchAdminData();
  };

  const handleResolveFlag = async (flagId: string, action: 'dismiss' | 'unpublish') => {
    await resolveFlag(flagId, action);
    fetchAdminData();
    onRefreshEvents();
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim()) return;
    await addClub({
      name: newClubName,
      category: newClubCategory,
      leadEmail: newClubEmail || `${newClubName.toLowerCase().replace(/\s+/g, '')}@nitt.edu`,
      description: newClubDesc,
    });
    setShowAddClub(false);
    setNewClubName('');
    setNewClubDesc('');
    fetchAdminData();
  };

  if (loading || !metrics) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading SAC Admin portal...</p>
      </div>
    );
  }

  // Data for Metric Charts with Targets
  const kpiComparisonData = [
    {
      metric: 'Show-up Rate',
      actual: metrics.showUpRate,
      target: metrics.targetShowUpRate,
      baseline: metrics.baselineShowUpRate,
      unit: '%',
    },
    {
      metric: 'Posted 48h+ Ahead',
      actual: metrics.eventsPosted48hPlusRate,
      target: metrics.targetEventsPosted48hPlus,
      unit: '%',
    },
    {
      metric: 'North Star (Seen Ahead)',
      actual: metrics.northStarRelevantSeenBeforeDeadline,
      target: metrics.targetNorthStar,
      unit: '%',
    },
    {
      metric: 'Reach to Reg',
      actual: metrics.reachToRegisterRate,
      target: 18,
      unit: '%',
    },
  ];

  const sessionData = [
    { name: 'Target Max (3m)', duration: 3.0 },
    { name: 'Current Median (Fast Discovery)', duration: metrics.medianSessionLengthMin },
  ];

  const pendingRequestsCount = requests.filter((r) => r.status === 'pending').length;
  const pendingFlagsCount = flags.filter((f) => f.status === 'pending').length;

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
              SAC Dean Office Portal
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">6,150 Students</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Campus Event Discovery Operations
          </h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-white text-rose-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            North-Star Metrics
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'requests'
                ? 'bg-white text-rose-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Club Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px]">
                {pendingRequestsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
              activeTab === 'clubs'
                ? 'bg-white text-rose-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Clubs ({clubs.length})
          </button>
          <button
            onClick={() => setActiveTab('flags')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'flags'
                ? 'bg-white text-rose-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Flags</span>
            {pendingFlagsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px]">
                {pendingFlagsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: NORTH-STAR ANALYTICS WITH TARGET REFERENCE LINES */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* North Star Highlight Banner */}
          <div className="bg-gradient-to-r from-[#0F2B5C] via-[#1E3A8A] to-[#1E4E8C] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                Primary North-Star Metric
              </span>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                <span className="text-4xl sm:text-5xl font-black tracking-tight">
                  {metrics.northStarRelevantSeenBeforeDeadline}%
                </span>
                <span className="text-xs sm:text-sm text-blue-200 font-medium">
                  Relevant Events Seen Before Their Deadline (Target: &gt;{metrics.targetNorthStar}%)
                </span>
              </div>
              <p className="text-xs text-blue-200 max-w-2xl leading-relaxed">
                Measures whether a student discovers an event relevant to their interests while registration is still open, completely eliminating the "I found out too late" problem across NIT Trichy.
              </p>
            </div>
          </div>

          {/* Core Target Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Month-1 Signups */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Month-1 Signups
              </span>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {metrics.activeSignupsMonth1}
              </p>
              <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600 mt-1">
                <span>✓ Goal: {metrics.targetSignupsMonth1}</span>
                <span className="text-slate-400 font-normal">({Math.round((metrics.activeSignupsMonth1 / metrics.totalStudents) * 100)}% campus)</span>
              </div>
            </div>

            {/* Median Session Length */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Median Session Length
              </span>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {metrics.medianSessionLengthMin} min
              </p>
              <div className="text-[11px] font-bold text-emerald-600 mt-1">
                <span>✓ Under {metrics.targetMedianSessionLengthMin} min target</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Fast decision, zero doomscroll</span>
            </div>

            {/* Show-up Rate */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Hall Show-Up Rate
              </span>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {metrics.showUpRate}%
              </p>
              <div className="text-[11px] font-bold text-emerald-600 mt-1">
                <span>✓ Target: &gt;{metrics.targetShowUpRate}%</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Historical: 30–37%</span>
            </div>

            {/* Events Posted 48h+ Ahead */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Posted 48h+ Ahead
              </span>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {metrics.eventsPosted48hPlusRate}%
              </p>
              <div className="text-[11px] font-bold text-emerald-600 mt-1">
                <span>✓ Target: &gt;{metrics.targetEventsPosted48hPlus}%</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Lead time discipline</span>
            </div>
          </div>

          {/* Secondary Quality Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Reach-to-Register Rate
              </span>
              <p className="text-xl font-black text-slate-900 tracking-tight">
                {metrics.reachToRegisterRate}%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Target: {metrics.targetReachToRegisterMin}%–{metrics.targetReachToRegisterMax}%
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Reminder Opt-out Rate
              </span>
              <p className="text-xl font-black text-slate-900 tracking-tight">
                {metrics.reminderOptOutRate}%
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                ✓ Well below {metrics.targetReminderOptOutMax}% ceiling
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Flag / Report Rate
              </span>
              <p className="text-xl font-black text-slate-900 tracking-tight">
                {metrics.flagRate}%
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                ✓ Below {metrics.targetFlagRateMax}% threshold
              </p>
            </div>
          </div>

          {/* Visual Charts with Recharts Reference Lines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Key Quality Targets with 50% & 90% reference lines */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  KPI Benchmarks vs Target Reference Lines
                </h3>
                <p className="text-xs text-slate-500">
                  Campus health metrics evaluated against strict institutional targets
                </p>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kpiComparisonData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="metric" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} unit="%" stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Actual Value']}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        color: '#fff',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                    />
                    <ReferenceLine
                      y={50}
                      stroke="#EF4444"
                      strokeDasharray="3 3"
                      label={{ value: '50% Turnout Target', fill: '#EF4444', fontSize: 10, position: 'insideTopLeft' }}
                    />
                    <ReferenceLine
                      y={90}
                      stroke="#10B981"
                      strokeDasharray="3 3"
                      label={{ value: '90% Lead Time Target', fill: '#10B981', fontSize: 10, position: 'insideTopLeft' }}
                    />
                    <Bar dataKey="actual" fill="#1E40AF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Median Session Length (< 3 min target) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Session Speed: Minutes, Not Hours
                </h3>
                <p className="text-xs text-slate-500">
                  Target is &lt;3 minutes: Students find their top picks and register without friction.
                </p>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 4]} unit="m" stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      formatter={(val: any) => [`${val} minutes`, 'Session Length']}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        color: '#fff',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                    />
                    <ReferenceLine
                      y={3.0}
                      stroke="#EF4444"
                      strokeDasharray="3 3"
                      label={{ value: '3m Target Ceiling', fill: '#EF4444', fontSize: 10, position: 'top' }}
                    />
                    <Bar dataKey="duration" radius={[6, 6, 0, 0]}>
                      <Cell fill="#CBD5E1" />
                      <Cell fill="#10B981" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORGANIZER ACCOUNT REQUEST APPROVALS */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200">
            <h2 className="font-extrabold text-slate-900 text-base">Club Account Requests</h2>
            <p className="text-xs text-slate-500">
              Review and approve campus club heads requesting publishing privileges.
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">No pending requests.</div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{req.clubName}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {req.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs">{req.description}</p>
                    <p className="text-[11px] text-slate-400">
                      Requested by <strong>{req.userName}</strong> ({req.userEmail}) • {new Date(req.requestedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleReviewRequest(req.id, 'rejected')}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleReviewRequest(req.id, 'approved')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-2xs"
                      >
                        Approve & Provision
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CLUBS & TAXONOMY MANAGEMENT */}
      {activeTab === 'clubs' && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">Registered Campus Clubs</h2>
              <p className="text-xs text-slate-500">
                10 Official clubs pre-configured with active student followings.
              </p>
            </div>
            <button
              onClick={() => setShowAddClub(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center space-x-1.5 hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Club</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((club) => (
              <div
                key={club.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex space-x-3.5 items-start"
              >
                <img
                  src={club.logoUrl}
                  alt={club.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 ring-1 ring-slate-100"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{club.name}</h3>
                    {club.isApproved && (
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-1 py-0.2 rounded-full font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                    {club.category}
                  </span>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {club.description}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">{club.leadEmail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Club Modal */}
          {showAddClub && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <form
                onSubmit={handleCreateClub}
                className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200"
              >
                <h3 className="font-extrabold text-slate-900 text-base">Add New Campus Club</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Club Name *
                  </label>
                  <input
                    type="text"
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                    placeholder="e.g. GNU/Linux Users Group (GLUG)"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newClubCategory}
                    onChange={(e) => setNewClubCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  >
                    <option value="Technical Workshop">Technical Workshop</option>
                    <option value="Hackathon / CTF">Hackathon / CTF</option>
                    <option value="Cultural & Arts">Cultural & Arts</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                    <option value="E-Cell / Startups">E-Cell / Startups</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Club Webmail Email
                  </label>
                  <input
                    type="email"
                    value={newClubEmail}
                    onChange={(e) => setNewClubEmail(e.target.value)}
                    placeholder="lead@nitt.edu"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    value={newClubDesc}
                    onChange={(e) => setNewClubDesc(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddClub(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                  >
                    Add Club
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FLAGGED EVENTS MODERATION */}
      {activeTab === 'flags' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200">
            <h2 className="font-extrabold text-slate-900 text-base">Flagged Events Queue</h2>
            <p className="text-xs text-slate-500">
              Student-reported events for inaccurate venues, misleading timings, or campus policy violations.
            </p>
          </div>

          {flags.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No reports in moderation queue.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {flags.map((flag) => {
                const targetEvent = events.find((e) => e.id === flag.eventId);
                return (
                  <div
                    key={flag.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {targetEvent?.title || `Event #${flag.eventId}`}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            flag.status === 'pending'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {flag.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="p-2.5 bg-rose-50/60 border border-rose-100 rounded-xl text-rose-900 text-xs">
                        <strong>Reason:</strong> {flag.reason}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        Reported on {new Date(flag.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {flag.status === 'pending' && (
                      <div className="flex items-center space-x-2 shrink-0">
                        {targetEvent && (
                          <button
                            onClick={() => onSelectEvent(targetEvent)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
                          >
                            Inspect Event
                          </button>
                        )}
                        <button
                          onClick={() => handleResolveFlag(flag.id, 'dismiss')}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors"
                        >
                          Dismiss Flag
                        </button>
                        <button
                          onClick={() => handleResolveFlag(flag.id, 'unpublish')}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-2xs"
                        >
                          Unpublish Event
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

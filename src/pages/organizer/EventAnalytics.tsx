/**
 * src/pages/organizer/EventAnalytics.tsx
 *
 * Detailed Per-Event Analytics:
 * - Conversion Funnel (Views → Saves → Registrations → Attended) using Recharts
 * - Show-up Rate benchmark gauge comparing against 50% Target and 30-37% NITT Baseline
 * - Reach-to-Register conversion metrics
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Eye,
  Bookmark,
  Users,
  CheckCircle2,
  TrendingUp,
  Download,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import { CampusEvent, EventFunnelData } from '../../types';
import { getEventAnalytics, exportRegistrationsCSV } from '../../services/api';
import { formatEventDate } from '../../utils/dateUtils';

interface EventAnalyticsProps {
  event: CampusEvent;
  onBack: () => void;
  onExportCSV: (eventId: string) => Promise<void>;
}

export const EventAnalytics: React.FC<EventAnalyticsProps> = ({
  event,
  onBack,
  onExportCSV,
}) => {
  const [data, setData] = useState<{
    funnel: EventFunnelData;
    showUpRate: number;
    totalRegistered: number;
    totalAttended: number;
    capacity: number;
    occupancyRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getEventAnalytics(event.id);
        setData(res);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [event.id]);

  if (loading || !data) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Crunching event engagement & conversion funnel...</p>
      </div>
    );
  }

  // Funnel chart data points
  const funnelChartData = [
    { stage: 'Views (Reach)', count: data.funnel.views, color: '#3B82F6', conversion: '100%' },
    {
      stage: 'Saves (Intent)',
      count: data.funnel.saves,
      color: '#F59E0B',
      conversion: `${Math.round((data.funnel.saves / data.funnel.views) * 100)}% of views`,
    },
    {
      stage: 'Registered',
      count: data.funnel.registrations,
      color: '#10B981',
      conversion: `${Math.round((data.funnel.registrations / data.funnel.views) * 100)}% of views`,
    },
    {
      stage: 'Attended (Hall)',
      count: data.funnel.attended,
      color: '#8B5CF6',
      conversion: `${data.showUpRate}% of registered`,
    },
  ];

  // Benchmark comparison data for Show-up Rate
  const showUpBenchmarkData = [
    { name: 'NITT Historical Baseline', rate: 35, fill: '#94A3B8' },
    { name: 'Campus Target', rate: 50, fill: '#0F2B5C' },
    { name: 'This Event', rate: data.showUpRate, fill: data.showUpRate >= 50 ? '#10B981' : '#F59E0B' },
  ];

  const reachToRegisterRate =
    data.funnel.views > 0
      ? ((data.funnel.registrations / data.funnel.views) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
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
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Event Analytics Mirror
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{event.venue}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {event.title}
            </h1>
          </div>
        </div>

        <button
          onClick={() => onExportCSV(event.id)}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center space-x-2 shadow-2xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Export Attendee CSV</span>
        </button>
      </div>

      {/* Top Level Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Student Impressions
          </span>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{data.funnel.views}</p>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">Unique feed views</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Reach-to-Register
          </span>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{reachToRegisterRate}%</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Target range: 15–20%</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Occupancy Rate
          </span>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{data.occupancyRate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {data.totalRegistered} of {data.capacity} seats filled
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Hall Show-up Rate
          </span>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-black text-slate-900 tracking-tight">{data.showUpRate}%</p>
            <span
              className={`text-xs font-bold ${
                data.showUpRate >= 50 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {data.showUpRate >= 50 ? '✓ Exceeds 50% target' : 'Near target'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {data.totalAttended} attended / {data.totalRegistered} registered
          </p>
        </div>
      </div>

      {/* Main Funnel Chart */}
      <section className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Engagement & Conversion Funnel
            </h2>
            <p className="text-xs text-slate-500">
              Tracking student progress: Views → Saved Bookmarks → Registered Seats → Physical Hall Attendance
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-400 hidden sm:inline">
            Recharts Funnel
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnelChartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" stroke="#94A3B8" fontSize={11} />
              <YAxis
                type="category"
                dataKey="stage"
                stroke="#475569"
                fontSize={12}
                tickLine={false}
                width={110}
              />
              <Tooltip
                formatter={(val: any, name: any, item: any) => [
                  `${val} students (${item.payload.conversion})`,
                  item.payload.stage,
                ]}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#fff',
                  borderRadius: '12px',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {funnelChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel Stage Explanations */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <span className="font-bold text-blue-900 block">1. Feed Impression</span>
            <span className="text-slate-500 text-[11px]">{data.funnel.views} students saw card</span>
          </div>
          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
            <span className="font-bold text-amber-900 block">2. Saved Intent</span>
            <span className="text-slate-500 text-[11px]">
              {data.funnel.saves} enabled 48h/24h warnings
            </span>
          </div>
          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <span className="font-bold text-emerald-900 block">3. One-Click Reg</span>
            <span className="text-slate-500 text-[11px]">
              {data.funnel.registrations} received QR tickets
            </span>
          </div>
          <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
            <span className="font-bold text-purple-900 block">4. Hall Turnout</span>
            <span className="text-slate-500 text-[11px]">
              {data.funnel.attended} scanned in at venue
            </span>
          </div>
        </div>
      </section>

      {/* Show-up Rate Benchmark Section with 50% target */}
      <section className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Turnout Benchmark vs. Campus Target
            </h2>
            <p className="text-xs text-slate-500">
              NIT Trichy baseline without deadline nudges is 30–37%. Campus goal is 50%+.
            </p>
          </div>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={showUpBenchmarkData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis
                domain={[0, 100]}
                unit="%"
                stroke="#94A3B8"
                fontSize={11}
              />
              <Tooltip
                formatter={(val: any) => [`${val}% Show-up`, 'Rate']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#fff',
                  borderRadius: '12px',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <ReferenceLine
                y={50}
                stroke="#EF4444"
                strokeDasharray="4 4"
                label={{
                  value: '50% Campus Target Marker',
                  position: 'top',
                  fill: '#EF4444',
                  fontSize: 11,
                  fontWeight: 'bold',
                }}
              />
              <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                {showUpBenchmarkData.map((entry, index) => (
                  <Cell key={`bench-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            <strong>Organizer Takeaway:</strong> Timely 48h and 24h deadline notifications sent to registered students boosted attendance by <strong>+{data.showUpRate - 35}%</strong> over historical campus walk-in rates.
          </p>
        </div>
      </section>
    </div>
  );
};

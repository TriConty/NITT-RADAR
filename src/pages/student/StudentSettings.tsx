/**
 * src/pages/student/StudentSettings.tsx
 *
 * Student Settings:
 * - Update interests anytime
 * - Fine-grained reminder preferences (48h/24h deadline, 24h/2h event, interest matches, exam week hold)
 * - Track opt-outs for admin analytics
 */

import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  Check,
  ShieldCheck,
  Clock,
  BookOpen,
  Calendar,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { User, ReminderPreferences } from '../../types';
import { THEME } from '../../theme';

interface StudentSettingsProps {
  currentUser: User | null;
  onUpdateInterests: (interests: string[]) => Promise<void>;
  onUpdateReminders: (reminders: ReminderPreferences) => Promise<void>;
}

export const StudentSettings: React.FC<StudentSettingsProps> = ({
  currentUser,
  onUpdateInterests,
  onUpdateReminders,
}) => {
  const [interests, setInterests] = useState<string[]>(currentUser?.interests || []);
  const [reminders, setReminders] = useState<ReminderPreferences>(
    currentUser?.reminderSettings || {
      deadline48h: true,
      deadline24h: true,
      event24h: true,
      event2h: true,
      interestMatches: true,
      examWeekHold: true,
    }
  );
  const [savingInterests, setSavingInterests] = useState(false);
  const [savingReminders, setSavingReminders] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleReminder = (key: keyof ReminderPreferences) => {
    setReminders((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveInterests = async () => {
    try {
      setSavingInterests(true);
      await onUpdateInterests(interests);
      setSuccessMsg('Interests updated! Feed recalculated.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      setSavingInterests(false);
    }
  };

  const handleSaveReminders = async () => {
    try {
      setSavingReminders(true);
      await onUpdateReminders(reminders);
      setSuccessMsg('Reminder preferences saved.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      setSavingReminders(false);
    }
  };

  // Calculate opt-out telemetry
  const totalReminders = 6;
  const activeReminders = Object.values(reminders).filter(Boolean).length;
  const optOutCount = totalReminders - activeReminders;
  const optOutPercentage = Math.round((optOutCount / totalReminders) * 100);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Student Preferences & Reminders
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tune what you want to hear about and when. We respect your attention: zero spam, only deadlines.
        </p>

        {successMsg && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* SECTION 1: INTERESTS SELECTION */}
      <section className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">Your Active Interests</h2>
              <p className="text-xs text-slate-500">
                Powers your "Top Picks" and new event drop notifications
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            {interests.length} selected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2">
          {THEME.interests.map((interest) => {
            const isSelected = interests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{interest}</span>
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSaveInterests}
            disabled={savingInterests}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingInterests ? 'Saving...' : 'Update Interests'}</span>
          </button>
        </div>
      </section>

      {/* SECTION 2: NOTIFICATION & REMINDER TRIGGERS */}
      <section className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">Reminder Preferences</h2>
              <p className="text-xs text-slate-500">
                Automated alerts dispatched to in-app drawer and your @nitt.edu webmail
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-500">
              Opt-out Rate: <strong className="text-slate-800">{optOutPercentage}%</strong>
            </span>
            <span className="block text-[10px] text-slate-400">Target: &lt;10%</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {/* 48h Deadline */}
          <div className="py-3 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-900">48-Hour Deadline Warning</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Notifies you 2 days before registration closes for any bookmarked event.
              </p>
            </div>
            <button
              onClick={() => toggleReminder('deadline48h')}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                reminders.deadline48h ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  reminders.deadline48h ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* 24h Deadline */}
          <div className="py-3 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-rose-600" />
                <span className="font-bold text-slate-900">24-Hour Final Deadline Alert</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Urgent heads-up when registrations are about to seal in 24 hours.
              </p>
            </div>
            <button
              onClick={() => toggleReminder('deadline24h')}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                reminders.deadline24h ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  reminders.deadline24h ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* 24h Event Reminder */}
          <div className="py-3 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900">24h Event Day-Before Reminder</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Reminds you about venue & timings the day before your registered event begins.
              </p>
            </div>
            <button
              onClick={() => toggleReminder('event24h')}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                reminders.event24h ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  reminders.event24h ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* 2h Event Reminder */}
          <div className="py-3 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900">2-Hour Hall Arrival Ping</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Last-minute reminder with hall instructions (e.g., Barn Hall entrance check-in).
              </p>
            </div>
            <button
              onClick={() => toggleReminder('event2h')}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                reminders.event2h ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  reminders.event2h ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Interest Matches */}
          <div className="py-3 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-slate-900">New Matching Event Drops</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Notify immediately when Spider, Delta, or RMI drop a workshop matching your tags.
              </p>
            </div>
            <button
              onClick={() => toggleReminder('interestMatches')}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                reminders.interestMatches ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  reminders.interestMatches ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Exam Week Hold */}
          <div className="py-3 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-900">Exam Week "Nudge Later" Mode</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Holds non-critical notifications during midsems/endsems and delivers a single catch-up digest.
              </p>
            </div>
            <button
              onClick={() => toggleReminder('examWeekHold')}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                reminders.examWeekHold ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  reminders.examWeekHold ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSaveReminders}
            disabled={savingReminders}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingReminders ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </section>
    </div>
  );
};

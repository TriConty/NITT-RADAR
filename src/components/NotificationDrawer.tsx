/**
 * src/components/NotificationDrawer.tsx
 *
 * Notification Centre:
 * - Deadline reminders at 48h / 24h for saved events
 * - Event reminders at 24h / 2h for registered events
 * - Interest-match alerts for new club postings
 * - "Nudge later" for events saved during exam week
 * - Quick jump to simulated email log
 */

import React from 'react';
import {
  X,
  Bell,
  Clock,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { AppNotification, NotificationType } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  notifications: AppNotification[];
  onClose: () => void;
  onMarkRead: (id: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  onOpenEmailLog: () => void;
  onSelectEventById?: (eventId: string) => void;
  onTriggerExamWeekTest?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onOpenEmailLog,
  onSelectEventById,
  onTriggerExamWeekTest,
}) => {
  if (!isOpen) return null;

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case 'deadline_48h':
      case 'deadline_24h':
        return <Clock className="w-4 h-4 text-rose-500" />;
      case 'event_24h':
      case 'event_2h':
        return <Calendar className="w-4 h-4 text-emerald-500" />;
      case 'interest_match':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'exam_nudge':
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getNotifBg = (type: NotificationType) => {
    switch (type) {
      case 'deadline_48h':
      case 'deadline_24h':
        return 'bg-rose-50 border-rose-100';
      case 'event_24h':
      case 'event_2h':
        return 'bg-emerald-50 border-emerald-100';
      case 'interest_match':
        return 'bg-amber-50 border-amber-100';
      case 'exam_nudge':
        return 'bg-indigo-50 border-indigo-100';
      default:
        return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Campus Alerts</h3>
              <p className="text-xs text-slate-500">Deadline & event reminders</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={onMarkAllRead}
            className="text-blue-700 hover:text-blue-900 font-semibold flex items-center space-x-1"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>

          <button
            onClick={onOpenEmailLog}
            className="text-amber-800 hover:text-amber-900 font-semibold flex items-center space-x-1"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Inspect Webmail Log</span>
          </button>
        </div>

        {/* Exam Week Simulation Banner */}
        <div className="p-3 bg-indigo-50/90 border-b border-indigo-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-950">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Exam Week Mode:</strong> Holding non-urgent alerts
            </span>
          </div>
          {onTriggerExamWeekTest && (
            <button
              onClick={onTriggerExamWeekTest}
              className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px] shrink-0"
            >
              Test Catch-up
            </button>
          )}
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs">No pending campus alerts</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.read) onMarkRead(n.id);
                  if (n.eventId && onSelectEventById) onSelectEventById(n.eventId);
                }}
                className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer relative ${getNotifBg(
                  n.type
                )} ${!n.read ? 'ring-1 ring-blue-500/30' : 'opacity-85'}`}
              >
                {!n.read && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                )}
                <div className="flex items-start space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-white shadow-2xs shrink-0 mt-0.5">
                    {getNotifIcon(n.type)}
                  </div>
                  <div className="flex-1 pr-3">
                    <h4 className="font-bold text-slate-900 text-xs mb-0.5">{n.title}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">{n.message}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {n.emailSimulated && (
                        <span className="text-emerald-700 font-medium flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>Sent to @nitt.edu</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * src/components/Navbar.tsx
 *
 * Role-aware navbar with quick role switcher, notification badge,
 * and simulated campus email drawer toggle.
 */

import React, { useState } from 'react';
import {
  Bell,
  Mail,
  User as UserIcon,
  Sparkles,
  Calendar,
  PlusCircle,
  BarChart3,
  CheckSquare,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Layers,
  Send,
} from 'lucide-react';
import { User, UserRole, Club } from '../types';
import { THEME } from '../theme';

interface NavbarProps {
  currentUser: User | null;
  clubs: Club[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount: number;
  emailLogCount: number;
  onOpenNotifications: () => void;
  onOpenEmailLog: () => void;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
  onOpenInterestsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  clubs,
  activeTab,
  setActiveTab,
  unreadCount,
  emailLogCount,
  onOpenNotifications,
  onOpenEmailLog,
  onSwitchRole,
  onLogout,
  onOpenInterestsModal,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Find club name if organizer
  const organizerClub = clubs.find((c) => c.id === currentUser?.clubId);

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'organizer':
        return { label: `Organizer: ${organizerClub?.name || 'Club'}`, bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'ambassador':
        return { label: 'Ambassador', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'admin':
        return { label: 'Admin (SAC)', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      default:
        return { label: 'Student', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
  };

  const badge = getRoleBadge(currentUser?.role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Campus Badge */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F2B5C] to-[#1E4E8C] flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/10">
              <span className="text-lg tracking-wider">NIT</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                  {THEME.shortName}
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Trichy
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Relevance over volume • Deadline first
              </p>
            </div>
          </div>

          {/* Navigation Links based on Active Role */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {currentUser?.role === 'student' && (
              <>
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'feed'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Discover Feed
                </button>
                <button
                  onClick={() => setActiveTab('closing-soon')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                    activeTab === 'closing-soon'
                      ? 'bg-amber-50 text-amber-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                  <span>Closing Soon</span>
                </button>
                <button
                  onClick={() => setActiveTab('my-events')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'my-events'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  My Events
                </button>
              </>
            )}

            {currentUser?.role === 'organizer' && (
              <>
                <button
                  onClick={() => setActiveTab('organizer-dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                    activeTab === 'organizer-dashboard'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>My Events & Reach</span>
                </button>
                <button
                  onClick={() => setActiveTab('create-event')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                    activeTab === 'create-event'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Event</span>
                </button>
                <button
                  onClick={() => setActiveTab('check-in')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                    activeTab === 'check-in'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Live Check-in</span>
                </button>
              </>
            )}

            {currentUser?.role === 'ambassador' && (
              <>
                <button
                  onClick={() => setActiveTab('ambassador-curate')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                    activeTab === 'ambassador-curate'
                      ? 'bg-purple-50 text-purple-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Curate Event</span>
                </button>
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'feed'
                      ? 'bg-purple-50 text-purple-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Campus Feed Preview
                </button>
              </>
            )}

            {currentUser?.role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('admin-metrics')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                    activeTab === 'admin-metrics'
                      ? 'bg-rose-50 text-rose-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>North-Star Metrics</span>
                </button>
                <button
                  onClick={() => setActiveTab('admin-clubs')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                    activeTab === 'admin-clubs'
                      ? 'bg-rose-50 text-rose-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Approvals & Clubs</span>
                </button>
                <button
                  onClick={() => setActiveTab('admin-flags')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                    activeTab === 'admin-flags'
                      ? 'bg-rose-50 text-rose-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Flagged Events</span>
                </button>
              </>
            )}
          </nav>

          {/* Quick Role Switcher + Utilities */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${badge.bg}`}
                title="Switch test role"
              >
                <span>{badge.label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {roleMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
                  onClick={() => setRoleMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Switch Test Persona
                  </div>
                  <button
                    onClick={() => onSwitchRole('student')}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between text-slate-700"
                  >
                    <span>🎓 Student (Priya - CSE)</span>
                    {currentUser?.role === 'student' && <span className="text-blue-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => onSwitchRole('organizer')}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center justify-between text-slate-700"
                  >
                    <span>🎪 Club Organizer (Spider R&D)</span>
                    {currentUser?.role === 'organizer' && <span className="text-emerald-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => onSwitchRole('ambassador')}
                    className="w-full text-left px-3 py-2 hover:bg-purple-50 flex items-center justify-between text-slate-700"
                  >
                    <span>📢 Ambassador (Curator)</span>
                    {currentUser?.role === 'ambassador' && <span className="text-purple-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => onSwitchRole('admin')}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center justify-between text-slate-700"
                  >
                    <span>🛡️ Admin (Dean SAC)</span>
                    {currentUser?.role === 'admin' && <span className="text-rose-600 font-bold">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Email Sent Log Button */}
            <button
              onClick={onOpenEmailLog}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Inspect Simulated Webmail Log"
            >
              <Mail className="w-5 h-5" />
              {emailLogCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Campus Alerts & Deadlines"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-1.5 p-1 rounded-full hover:ring-2 hover:ring-slate-300 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-medium flex items-center justify-center text-xs">
                  {currentUser?.name?.slice(0, 2).toUpperCase() || 'NI'}
                </div>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900 truncate">{currentUser?.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{currentUser?.email}</p>
                  </div>

                  {currentUser?.role === 'student' && (
                    <>
                      <button
                        onClick={onOpenInterestsModal}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Edit My Interests</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                      >
                        <Bell className="w-3.5 h-3.5 text-blue-500" />
                        <span>Reminder Preferences</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center space-x-2 text-rose-600 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 overflow-x-auto text-xs">
          {currentUser?.role === 'student' && (
            <>
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-3 py-1 rounded-full font-medium ${
                  activeTab === 'feed' ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                Feed
              </button>
              <button
                onClick={() => setActiveTab('closing-soon')}
                className={`px-3 py-1 rounded-full font-medium ${
                  activeTab === 'closing-soon' ? 'bg-amber-600 text-white' : 'text-slate-600'
                }`}
              >
                Closing Soon
              </button>
              <button
                onClick={() => setActiveTab('my-events')}
                className={`px-3 py-1 rounded-full font-medium ${
                  activeTab === 'my-events' ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                My Events
              </button>
            </>
          )}

          {currentUser?.role === 'organizer' && (
            <>
              <button
                onClick={() => setActiveTab('organizer-dashboard')}
                className={`px-3 py-1 rounded-full font-medium ${
                  activeTab === 'organizer-dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                }`}
              >
                Events
              </button>
              <button
                onClick={() => setActiveTab('create-event')}
                className={`px-3 py-1 rounded-full font-medium ${
                  activeTab === 'create-event' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                }`}
              >
                Post Event
              </button>
              <button
                onClick={() => setActiveTab('check-in')}
                className={`px-3 py-1 rounded-full font-medium ${
                  activeTab === 'check-in' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                }`}
              >
                Check-in
              </button>
            </>
          )}

          {currentUser?.role === 'ambassador' && (
            <>
              <button
                onClick={() => setActiveTab('ambassador-curate')}
                className={`px-3 py-1 rounded-full font-medium ${
                  activeTab === 'ambassador-curate' ? 'bg-purple-600 text-white' : 'text-slate-600'
                }`}
              >
                Curate Event
              </button>
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-3 py-1 rounded-full font-medium ${
                  activeTab === 'feed' ? 'bg-purple-600 text-white' : 'text-slate-600'
                }`}
              >
                Feed
              </button>
            </>
          )}

          {currentUser?.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('admin-metrics')}
                className={`px-3 py-1 rounded-full font-medium ${
                  activeTab === 'admin-metrics' ? 'bg-rose-600 text-white' : 'text-slate-600'
                }`}
              >
                Metrics
              </button>
              <button
                onClick={() => setActiveTab('admin-clubs')}
                className={`px-3 py-1 rounded-full font-medium ${
                  activeTab === 'admin-clubs' ? 'bg-rose-600 text-white' : 'text-slate-600'
                }`}
              >
                Approvals
              </button>
              <button
                onClick={() => setActiveTab('admin-flags')}
                className={`px-3 py-1 rounded-full font-medium ${
                  activeTab === 'admin-flags' ? 'bg-rose-600 text-white' : 'text-slate-600'
                }`}
              >
                Flags
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

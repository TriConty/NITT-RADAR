/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CampusEvent,
  Club,
  Registration,
  Save,
  Like,
  AppNotification,
  SimulatedEmailLog,
  User,
  UserRole,
  ReminderPreferences,
} from './types';
import * as api from './services/api';
import { Navbar } from './components/Navbar';
import { EventDetailModal } from './components/EventDetailModal';
import { OnboardingModal } from './components/OnboardingModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { EmailLogDrawer } from './components/EmailLogDrawer';
import { AuthPage } from './pages/AuthPage';
import { StudentHome } from './pages/student/StudentHome';
import { MyEventsPage } from './pages/student/MyEventsPage';
import { StudentSettings } from './pages/student/StudentSettings';
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard';
import { EventForm } from './pages/organizer/EventForm';
import { EventAnalytics } from './pages/organizer/EventAnalytics';
import { CheckInPage } from './pages/organizer/CheckInPage';
import { AmbassadorCurate } from './pages/admin/AmbassadorCurate';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { THEME } from './theme';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Global Application State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [topPicks, setTopPicks] = useState<CampusEvent[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [saves, setSaves] = useState<Save[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [emailLogs, setEmailLogs] = useState<SimulatedEmailLog[]>([]);

  // Routing and Navigation
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [loading, setLoading] = useState<boolean>(true);

  // Modals and Drawers
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<CampusEvent | null>(null);
  const [selectedEventForAnalytics, setSelectedEventForAnalytics] = useState<CampusEvent | null>(null);
  const [selectedEventForCheckIn, setSelectedEventForCheckIn] = useState<CampusEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState<boolean>(false);
  const [emailDrawerOpen, setEmailDrawerOpen] = useState<boolean>(false);

  // Toast notification feedback
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  }, []);

  // Initial Data Hydration
  const loadData = useCallback(async () => {
    try {
      const [user, clubList, eventList, notifList, emailList] = await Promise.all([
        api.getCurrentUser(),
        api.getClubs(),
        api.getEvents(),
        api.getNotifications(),
        api.getSimulatedEmailLogs(),
      ]);

      setCurrentUser(user);
      setClubs(clubList);
      setEvents(eventList);
      setNotifications(notifList);
      setEmailLogs(emailList);

      if (user) {
        const [userRegs, userSaves, userLikes, picks] = await Promise.all([
          api.getUserRegistrations(user.id),
          api.getUserSaves(user.id),
          api.getUserLikes(user.id),
          api.getTopPicks(user.interests),
        ]);
        setRegistrations(userRegs);
        setSaves(userSaves);
        setLikes(userLikes);
        setTopPicks(picks);

        // Auto-prompt onboarding if student has 0 interests
        if (user.role === 'student' && (!user.interests || user.interests.length === 0)) {
          setOnboardingOpen(true);
        }
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived user ids for quick lookup
  const registeredEventIds = useMemo(() => registrations.map((r) => r.eventId), [registrations]);
  const savedEventIds = useMemo(() => saves.map((s) => s.eventId), [saves]);
  const likedEventIds = useMemo(() => likes.map((l) => l.eventId), [likes]);
  const unreadNotifCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  // Auth Handlers
  const handleLogin = async (email: string) => {
    const user = await api.loginWithEmail(email);
    setCurrentUser(user);
    if (user.role === 'organizer') setActiveTab('organizer-dashboard');
    else if (user.role === 'ambassador') setActiveTab('ambassador-curate');
    else if (user.role === 'admin') setActiveTab('admin-metrics');
    else setActiveTab('feed');
    loadData();
    showToast(`Welcome, ${user.name}!`);
  };

  const handleDemoLogin = async (role: UserRole) => {
    const user = await api.demoLogin(role);
    setCurrentUser(user);
    if (role === 'organizer') setActiveTab('organizer-dashboard');
    else if (role === 'ambassador') setActiveTab('ambassador-curate');
    else if (role === 'admin') setActiveTab('admin-metrics');
    else setActiveTab('feed');
    loadData();
    showToast(`Logged in as Demo ${role.toUpperCase()}: ${user.name}`);
  };

  const handleSignup = async (data: {
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    clubId?: string;
    interests?: string[];
  }) => {
    const user = await api.signupUser(data);
    setCurrentUser(user);
    if (user.role === 'organizer') setActiveTab('organizer-dashboard');
    else if (user.role === 'ambassador') setActiveTab('ambassador-curate');
    else if (user.role === 'admin') setActiveTab('admin-metrics');
    else setActiveTab('feed');
    loadData();
    showToast(`Account created for ${user.name}!`);
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    showToast('Signed out successfully.', 'info');
  };

  const handleSwitchRole = async (role: UserRole) => {
    await handleDemoLogin(role);
  };

  // Event Interactions
  const handleSelectEvent = (event: CampusEvent) => {
    api.recordEventView(event.id, currentUser?.id);
    setSelectedEventForDetail(event);
  };

  const handleToggleLike = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    if (!currentUser) return;
    const { liked, count } = await api.toggleLike(eventId, currentUser.id);

    setLikes((prev) =>
      liked ? [...prev, { userId: currentUser.id, eventId }] : prev.filter((l) => l.eventId !== eventId)
    );

    setEvents((prev) =>
      prev.map((evt) => (evt.id === eventId ? { ...evt, likesCount: count } : evt))
    );
    if (selectedEventForDetail?.id === eventId) {
      setSelectedEventForDetail((prev) => (prev ? { ...prev, likesCount: count } : null));
    }
  };

  const handleToggleSave = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    if (!currentUser) return;
    const { saved, count } = await api.toggleSave(eventId, currentUser.id);

    setSaves((prev) =>
      saved
        ? [...prev, { userId: currentUser.id, eventId, savedAt: new Date().toISOString() }]
        : prev.filter((s) => s.eventId !== eventId)
    );

    setEvents((prev) =>
      prev.map((evt) => (evt.id === eventId ? { ...evt, savesCount: count } : evt))
    );
    if (selectedEventForDetail?.id === eventId) {
      setSelectedEventForDetail((prev) => (prev ? { ...prev, savesCount: count } : null));
    }

    if (saved) {
      showToast('📌 Event bookmarked! We will send 48h and 24h deadline reminders.');
    }
    // Refresh email logs in background
    api.getSimulatedEmailLogs().then(setEmailLogs);
  };

  const handleRegister = async (eventId: string) => {
    if (!currentUser) return;
    const newReg = await api.registerForEvent(eventId, currentUser);
    setRegistrations((prev) => [...prev, newReg]);

    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === eventId
          ? { ...evt, registrationsCount: (evt.registrationsCount || 0) + 1 }
          : evt
      )
    );

    if (selectedEventForDetail?.id === eventId) {
      setSelectedEventForDetail((prev) =>
        prev ? { ...prev, registrationsCount: (prev.registrationsCount || 0) + 1 } : null
      );
    }

    showToast('🎟️ Seat confirmed! Simulated pass sent to your @nitt.edu webmail.');
    // Refresh notifications and email logs
    api.getNotifications(currentUser.id).then(setNotifications);
    api.getSimulatedEmailLogs().then(setEmailLogs);
  };

  const handleCancelRegistration = async (eventId: string) => {
    if (!currentUser) return;
    await api.cancelRegistration(eventId, currentUser.id);
    setRegistrations((prev) => prev.filter((r) => r.eventId !== eventId));

    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === eventId
          ? { ...evt, registrationsCount: Math.max(0, (evt.registrationsCount || 1) - 1) }
          : evt
      )
    );

    if (selectedEventForDetail?.id === eventId) {
      setSelectedEventForDetail((prev) =>
        prev ? { ...prev, registrationsCount: Math.max(0, (prev.registrationsCount || 1) - 1) } : null
      );
    }
    showToast('Registration cancelled.', 'info');
  };

  const handleQuickRegister = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    await handleRegister(eventId);
  };

  const handleReportEvent = async (eventId: string, reason: string) => {
    await api.reportEvent(eventId, reason);
    showToast('Report submitted to SAC Dean administrator queue.');
  };

  const handleSaveInterests = async (newInterests: string[]) => {
    if (!currentUser) return;
    const updatedUser = await api.updateUserInterests(newInterests);
    setCurrentUser(updatedUser);
    const picks = await api.getTopPicks(newInterests);
    setTopPicks(picks);
    showToast('Interests updated! Feed recalculated.');
  };

  const handleSaveReminders = async (reminders: ReminderPreferences) => {
    if (!currentUser) return;
    const updated = await api.updateReminderSettings(reminders);
    setCurrentUser(updated);
    showToast('Reminder preferences updated.');
  };

  // Organizer Actions
  const handleSaveEvent = async (eventData: Partial<CampusEvent>) => {
    if (eventData.id) {
      const updated = await api.updateEvent(eventData.id, eventData);
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      showToast('Event updated successfully!');
    } else {
      const created = await api.createEvent(eventData);
      setEvents((prev) => [created, ...prev]);
      showToast('🎉 Event posted! Students with matching interests were notified.');
    }
    setActiveTab('organizer-dashboard');
    setEditingEvent(null);
    loadData();
  };

  const handleToggleEventStatus = async (eventId: string, nextStatus: CampusEvent['status']) => {
    const updated = await api.setEventStatus(eventId, nextStatus);
    setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
    showToast(`Event status updated to: ${nextStatus.toUpperCase()}`);
  };

  const handleExportCSV = async (eventId: string) => {
    const csvData = await api.exportRegistrationsCSV(eventId);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nitt_event_attendees_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Attendee CSV downloaded.');
  };

  // Ambassador Action
  const handleCurateEvent = async (data: Partial<CampusEvent>) => {
    const curated = await api.addCuratedEvent(data);
    setEvents((prev) => [curated, ...prev]);
    showToast('🎉 Event curated and published on behalf of club!');
    loadData();
  };

  // Notification actions
  const handleMarkNotifRead = async (id: string) => {
    await api.markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllNotifsRead = async () => {
    if (!currentUser) return;
    await api.markAllNotificationsRead(currentUser.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  };

  const handleTriggerExamWeekTest = async () => {
    if (!currentUser) return;
    await api.triggerExamWeekNudges(currentUser.id);
    const freshNotifs = await api.getNotifications(currentUser.id);
    setNotifications(freshNotifs);
    showToast('📚 Exam Week digest simulated!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#0F2B5C] flex items-center justify-center text-white font-black text-xl mb-3 shadow-lg animate-pulse">
          NIT
        </div>
        <p className="font-bold text-slate-800 text-sm">Campus Event Discovery</p>
        <p className="text-xs text-slate-400 mt-1">Initializing NIT Trichy event feeds...</p>
      </div>
    );
  }

  // Find club for active organizer
  const organizerClub = clubs.find((c) => c.id === currentUser?.clubId) || clubs[0];
  const clubEvents = events.filter((e) => e.clubId === organizerClub?.id);
  const curatedEvents = events.filter((e) => e.curatedByAmbassador);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs animate-in slide-in-from-top-2">
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Role-Aware Navbar */}
      <Navbar
        currentUser={currentUser}
        clubs={clubs}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setEditingEvent(null);
          setSelectedEventForAnalytics(null);
          setSelectedEventForCheckIn(null);
        }}
        unreadCount={unreadNotifCount}
        emailLogCount={emailLogs.length}
        onOpenNotifications={() => setNotifDrawerOpen(true)}
        onOpenEmailLog={() => setEmailDrawerOpen(true)}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
        onOpenInterestsModal={() => setOnboardingOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {!currentUser ? (
          <AuthPage
            clubs={clubs}
            onLogin={handleLogin}
            onDemoLogin={handleDemoLogin}
            onSignup={handleSignup}
          />
        ) : (
          <>
            {/* STUDENT VIEWS */}
            {activeTab === 'feed' && (
              <StudentHome
                currentUser={currentUser}
                events={events}
                topPicks={topPicks}
                clubs={clubs}
                savedEventIds={savedEventIds}
                likedEventIds={likedEventIds}
                registeredEventIds={registeredEventIds}
                onSelectEvent={handleSelectEvent}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onQuickRegister={handleQuickRegister}
                onOpenInterestsModal={() => setOnboardingOpen(true)}
              />
            )}

            {activeTab === 'closing-soon' && (
              <StudentHome
                currentUser={currentUser}
                events={events}
                topPicks={[]}
                clubs={clubs}
                savedEventIds={savedEventIds}
                likedEventIds={likedEventIds}
                registeredEventIds={registeredEventIds}
                activeFilterTab="closing-soon"
                onSelectEvent={handleSelectEvent}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onQuickRegister={handleQuickRegister}
                onOpenInterestsModal={() => setOnboardingOpen(true)}
              />
            )}

            {activeTab === 'my-events' && (
              <MyEventsPage
                events={events}
                clubs={clubs}
                registrations={registrations}
                savedEventIds={savedEventIds}
                onSelectEvent={handleSelectEvent}
                onCancelRegistration={handleCancelRegistration}
                onRemoveSave={(e, id) => handleToggleSave(e, id)}
                onQuickRegister={handleQuickRegister}
                onBrowseMore={() => setActiveTab('feed')}
              />
            )}

            {activeTab === 'settings' && (
              <StudentSettings
                currentUser={currentUser}
                onUpdateInterests={handleSaveInterests}
                onUpdateReminders={handleSaveReminders}
              />
            )}

            {/* ORGANIZER VIEWS */}
            {activeTab === 'organizer-dashboard' && !selectedEventForAnalytics && !selectedEventForCheckIn && (
              <OrganizerDashboard
                club={organizerClub}
                events={clubEvents}
                registrations={registrations}
                onOpenCreate={() => {
                  setEditingEvent(null);
                  setActiveTab('create-event');
                }}
                onSelectAnalytics={(evt) => setSelectedEventForAnalytics(evt)}
                onOpenCheckIn={(evt) => setSelectedEventForCheckIn(evt)}
                onToggleStatus={handleToggleEventStatus}
                onExportCSV={handleExportCSV}
              />
            )}

            {activeTab === 'create-event' && (
              <EventForm
                initialEvent={editingEvent}
                club={organizerClub}
                onSave={handleSaveEvent}
                onCancel={() => {
                  setEditingEvent(null);
                  setActiveTab('organizer-dashboard');
                }}
              />
            )}

            {selectedEventForAnalytics && (
              <EventAnalytics
                event={selectedEventForAnalytics}
                onBack={() => setSelectedEventForAnalytics(null)}
                onExportCSV={handleExportCSV}
              />
            )}

            {(activeTab === 'check-in' || selectedEventForCheckIn) && (
              <CheckInPage
                event={selectedEventForCheckIn || clubEvents[0] || events[0]}
                onBack={() => {
                  setSelectedEventForCheckIn(null);
                  setActiveTab('organizer-dashboard');
                }}
                onExportCSV={handleExportCSV}
              />
            )}

            {/* AMBASSADOR VIEWS */}
            {activeTab === 'ambassador-curate' && (
              <AmbassadorCurate
                clubs={clubs}
                curatedEvents={curatedEvents}
                onSubmitCuratedEvent={handleCurateEvent}
                onSelectEvent={handleSelectEvent}
              />
            )}

            {/* ADMIN VIEWS */}
            {(activeTab === 'admin-metrics' || activeTab === 'admin-clubs' || activeTab === 'admin-flags') && (
              <AdminDashboard
                events={events}
                onSelectEvent={handleSelectEvent}
                onRefreshEvents={loadData}
              />
            )}
          </>
        )}
      </main>

      {/* MODALS AND DRAWERS */}
      <EventDetailModal
        event={selectedEventForDetail}
        club={clubs.find((c) => c.id === selectedEventForDetail?.clubId)}
        isOpen={!!selectedEventForDetail}
        isRegistered={selectedEventForDetail ? registeredEventIds.includes(selectedEventForDetail.id) : false}
        isLiked={selectedEventForDetail ? likedEventIds.includes(selectedEventForDetail.id) : false}
        isSaved={selectedEventForDetail ? savedEventIds.includes(selectedEventForDetail.id) : false}
        onClose={() => setSelectedEventForDetail(null)}
        onRegister={handleRegister}
        onCancelRegistration={handleCancelRegistration}
        onToggleLike={handleToggleLike}
        onToggleSave={handleToggleSave}
        onReport={handleReportEvent}
      />

      <OnboardingModal
        isOpen={onboardingOpen}
        initialInterests={currentUser?.interests || []}
        onSaveInterests={handleSaveInterests}
        onClose={() => setOnboardingOpen(false)}
      />

      <NotificationDrawer
        isOpen={notifDrawerOpen}
        notifications={notifications}
        onClose={() => setNotifDrawerOpen(false)}
        onMarkRead={handleMarkNotifRead}
        onMarkAllRead={handleMarkAllNotifsRead}
        onOpenEmailLog={() => {
          setNotifDrawerOpen(false);
          setEmailDrawerOpen(true);
        }}
        onSelectEventById={(id) => {
          const evt = events.find((e) => e.id === id);
          if (evt) {
            setNotifDrawerOpen(false);
            setSelectedEventForDetail(evt);
          }
        }}
        onTriggerExamWeekTest={handleTriggerExamWeekTest}
      />

      <EmailLogDrawer
        isOpen={emailDrawerOpen}
        logs={emailLogs}
        onClose={() => setEmailDrawerOpen(false)}
      />
    </div>
  );
}

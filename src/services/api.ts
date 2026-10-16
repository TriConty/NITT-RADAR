/**
 * src/services/api.ts
 *
 * Centralized asynchronous API client for Campus Event Discovery (NIT Trichy).
 * Backed by localStorage and pre-populated seed data.
 * All UI components consume this interface so it can be swapped for a REST/GraphQL API
 * without refactoring the view layer.
 */

import {
  CampusEvent,
  Club,
  EventFunnelData,
  Flag,
  GlobalAdminMetrics,
  Like,
  AppNotification,
  OrganizerRequest,
  Registration,
  ReminderPreferences,
  Save,
  SimulatedEmailLog,
  User,
  UserRole,
} from '../types';
import {
  SEED_CLUBS,
  SEED_EMAIL_LOG,
  SEED_EVENTS,
  SEED_FLAGS,
  SEED_GLOBAL_ADMIN_METRICS,
  SEED_LIKES,
  SEED_NOTIFICATIONS,
  SEED_ORGANIZER_REQUESTS,
  SEED_REGISTRATIONS,
  SEED_SAVES,
  SEED_USERS,
} from '../data/seed';

// Storage Keys
const STORAGE_KEYS = {
  CURRENT_USER: 'nitt_events_currentUser',
  USERS: 'nitt_events_users',
  EVENTS: 'nitt_events_events',
  CLUBS: 'nitt_events_clubs',
  REGISTRATIONS: 'nitt_events_registrations',
  SAVES: 'nitt_events_saves',
  LIKES: 'nitt_events_likes',
  NOTIFICATIONS: 'nitt_events_notifications',
  EMAIL_LOG: 'nitt_events_email_log',
  FLAGS: 'nitt_events_flags',
  REQUESTS: 'nitt_events_organizer_requests',
  VIEWS_COUNT: 'nitt_events_views_count',
  PENDING_OTP: 'nitt_events_pending_otp',
};

// Simulated network delay helper to emulate real async behavior
const delay = (ms = 120): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Initialize storage with seed data if keys don't exist yet.
 */
function initStorage(): void {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    // Default to student demo user for instant interactive experience
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SEED_EVENTS));
  } else {
    // Ensure evt-03 is mapped to club-maximus
    try {
      const storedEvents = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
      const simonEvt = storedEvents.find((e: any) => e.id === 'evt-03');
      if (simonEvt && simonEvt.clubId !== 'club-maximus') {
        simonEvt.clubId = 'club-maximus';
        simonEvt.description = 'Prestigious undergraduate mathematics competition across the Asia-Pacific, organized on campus by Maximus (The Mathematics Club of NIT Trichy). Test your problem-solving prowess on challenging real analysis, abstract algebra, and combinatorics.';
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(storedEvents));
      }
    } catch {}
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLUBS)) {
    localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(SEED_CLUBS));
  } else {
    // Ensure club-maximus is present
    try {
      const storedClubs = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLUBS) || '[]');
      if (!storedClubs.some((c: any) => c.id === 'club-maximus')) {
        const maximusClub = SEED_CLUBS.find((c) => c.id === 'club-maximus');
        if (maximusClub) {
          storedClubs.push(maximusClub);
          localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(storedClubs));
        }
      }
    } catch {}
  }
  if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(SEED_REGISTRATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SAVES)) {
    localStorage.setItem(STORAGE_KEYS.SAVES, JSON.stringify(SEED_SAVES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LIKES)) {
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(SEED_LIKES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EMAIL_LOG)) {
    localStorage.setItem(STORAGE_KEYS.EMAIL_LOG, JSON.stringify(SEED_EMAIL_LOG));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FLAGS)) {
    localStorage.setItem(STORAGE_KEYS.FLAGS, JSON.stringify(SEED_FLAGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(SEED_ORGANIZER_REQUESTS));
  }
}

// Auto-run initialization on module load
initStorage();

// Generic helper methods
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.error(`Failed to parse storage key ${key}`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write to storage key ${key}`, err);
  }
}

/* =========================================================================
   AUTHENTICATION & PROFILE SERVICES
   ========================================================================= */

export async function getCurrentUser(): Promise<User | null> {
  await delay(60);
  return getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export async function loginWithEmail(email: string): Promise<User> {
  await delay(150);
  const normalized = email.trim().toLowerCase();

  // Validate domain must end in @nitt.edu
  if (!normalized.endsWith('@nitt.edu')) {
    throw new Error('Access restricted: Only official @nitt.edu email addresses are permitted.');
  }

  const users = getItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  let user = users.find((u) => u.email.toLowerCase() === normalized);

  if (!user) {
    // Automatically provision new student user if first time logging in with @nitt.edu
    user = {
      id: `user-${Date.now()}`,
      name: normalized.split('@')[0].replace('.', ' ').toUpperCase(),
      email: normalized,
      role: 'student',
      interests: [], // Will trigger onboarding modal
      department: 'NIT Trichy',
      reminderSettings: {
        deadline48h: true,
        deadline24h: true,
        event24h: true,
        event2h: true,
        interestMatches: true,
        examWeekHold: true,
      },
    };
    users.push(user);
    setItem(STORAGE_KEYS.USERS, users);
  }

  setItem(STORAGE_KEYS.CURRENT_USER, user);
  return user;
}

export async function demoLogin(role: UserRole): Promise<User> {
  await delay(100);
  const users = getItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  const target = users.find((u) => u.role === role) || SEED_USERS.find((u) => u.role === role);

  if (!target) {
    throw new Error(`Demo account for role ${role} not found.`);
  }

  setItem(STORAGE_KEYS.CURRENT_USER, target);
  return target;
}

export async function signupUser(userData: {
  name: string;
  email: string;
  role: UserRole;
  interests?: string[];
  department?: string;
  clubId?: string;
}): Promise<User> {
  await delay(200);
  const normalized = userData.email.trim().toLowerCase();

  if (!normalized.endsWith('@nitt.edu')) {
    throw new Error('Registration requires an active @nitt.edu campus email address.');
  }

  const users = getItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  if (users.some((u) => u.email.toLowerCase() === normalized)) {
    throw new Error('An account with this @nitt.edu address already exists. Please log in.');
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: userData.name,
    email: normalized,
    role: userData.role,
    interests: userData.interests || [],
    department: userData.department || 'NIT Trichy',
    clubId: userData.clubId,
    reminderSettings: {
      deadline48h: true,
      deadline24h: true,
      event24h: true,
      event2h: true,
      interestMatches: true,
      examWeekHold: true,
    },
  };

  users.push(newUser);
  setItem(STORAGE_KEYS.USERS, users);
  setItem(STORAGE_KEYS.CURRENT_USER, newUser);

  // If registering as organizer, create an organizer pending approval request
  if (userData.role === 'organizer' && userData.clubId) {
    const clubs = getItem<Club[]>(STORAGE_KEYS.CLUBS, SEED_CLUBS);
    const club = clubs.find((c) => c.id === userData.clubId);
    await submitOrganizerRequest({
      userId: newUser.id,
      userName: newUser.name,
      userEmail: newUser.email,
      clubName: club?.name || 'New Club Request',
      category: club?.category || 'Technical Workshop',
      description: 'Account activation request for club coordination.',
    });
  }

  return newUser;
}

/**
 * Dispatch simulated NITT Webmail 6-Digit OTP for student signup verification.
 */
export async function requestSignupOtp(email: string, name: string): Promise<{ otp: string; snippet: string }> {
  await delay(150);
  const normalized = email.trim().toLowerCase();
  if (!normalized.endsWith('@nitt.edu')) {
    throw new Error('OTP verification requires an active @nitt.edu address.');
  }

  // Generate 6-digit code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const pendingMap = getItem<Record<string, { otp: string; expiresAt: number }>>(STORAGE_KEYS.PENDING_OTP, {});
  pendingMap[normalized] = {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  };
  setItem(STORAGE_KEYS.PENDING_OTP, pendingMap);

  const snippet = `Your NIT Trichy verification OTP code is ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;

  // Log to simulated campus webmail
  await sendSimulatedEmail({
    recipientEmail: normalized,
    recipientName: name,
    subject: `[NITT Webmail Auth] 🔒 Verification Code: ${otp}`,
    snippet,
    type: 'system',
  });

  return { otp, snippet };
}

/**
 * Verify student entered 6-digit OTP
 */
export async function verifySignupOtp(email: string, enteredOtp: string): Promise<boolean> {
  await delay(100);
  const normalized = email.trim().toLowerCase();
  const pendingMap = getItem<Record<string, { otp: string; expiresAt: number }>>(STORAGE_KEYS.PENDING_OTP, {});
  const entry = pendingMap[normalized];

  if (!entry) {
    throw new Error('No pending verification code found. Please request a new OTP.');
  }
  if (Date.now() > entry.expiresAt) {
    throw new Error('Verification code has expired. Please request a new OTP.');
  }
  if (entry.otp !== enteredOtp.trim()) {
    throw new Error('Invalid 6-digit OTP code. Please check your simulated NITT webmail log.');
  }

  // Clean up
  delete pendingMap[normalized];
  setItem(STORAGE_KEYS.PENDING_OTP, pendingMap);
  return true;
}

/**
 * Secret demo accounts known only to the evaluator/evaluator portal
 */
export function getSecretDemoAccounts() {
  return [
    {
      role: 'student' as UserRole,
      name: 'Priya Sharma',
      email: 'priya.sharma@nitt.edu',
      department: 'Computer Science & Engineering',
      tagline: 'Student Explorer (Top picks, 1-click registration, reminders)',
      badge: '🎓 Student Persona',
    },
    {
      role: 'organizer' as UserRole,
      name: 'Arunachalam S.',
      email: 'spider.lead@nitt.edu',
      department: 'Spider R&D Head',
      tagline: 'Club Organizer (Reach mirror, funnel analytics, check-in desk)',
      badge: '🎪 Organizer Persona',
    },
    {
      role: 'ambassador' as UserRole,
      name: 'Karthik Ram',
      email: 'karthik.ambassador@nitt.edu',
      department: 'Campus Curator',
      tagline: 'Student Ambassador (Post event from WhatsApp/Instagram poster)',
      badge: '📢 Ambassador Persona',
    },
    {
      role: 'admin' as UserRole,
      name: 'Dr. N. Kumaresan',
      email: 'dean.sac@nitt.edu',
      department: 'Dean (Students Welfare) / SAC Office',
      tagline: 'Campus Administrator (North-star targets, club approvals, moderation)',
      badge: '🛡️ Admin Persona',
    },
  ];
}

export async function logout(): Promise<void> {
  await delay(80);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

export async function updateUserInterests(interests: string[]): Promise<User> {
  await delay(100);
  const currentUser = getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  if (!currentUser) throw new Error('Not authenticated');

  currentUser.interests = interests;
  setItem(STORAGE_KEYS.CURRENT_USER, currentUser);

  const users = getItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  const idx = users.findIndex((u) => u.id === currentUser.id);
  if (idx !== -1) {
    users[idx].interests = interests;
    setItem(STORAGE_KEYS.USERS, users);
  }

  return currentUser;
}

export async function updateReminderSettings(settings: ReminderPreferences): Promise<User> {
  await delay(100);
  const currentUser = getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  if (!currentUser) throw new Error('Not authenticated');

  currentUser.reminderSettings = settings;
  setItem(STORAGE_KEYS.CURRENT_USER, currentUser);

  const users = getItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  const idx = users.findIndex((u) => u.id === currentUser.id);
  if (idx !== -1) {
    users[idx].reminderSettings = settings;
    setItem(STORAGE_KEYS.USERS, users);
  }

  return currentUser;
}

/* =========================================================================
   CAMPUS EVENTS & DISCOVERY SERVICES
   ========================================================================= */

export async function getEvents(filters?: {
  search?: string;
  interest?: string;
  category?: string;
  clubId?: string;
  closingSoon?: boolean;
  status?: string;
}): Promise<CampusEvent[]> {
  await delay(120);
  let events = getItem<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);

  if (filters?.status) {
    events = events.filter((e) => e.status === filters.status);
  } else {
    // Default show only published events to student feed
    events = events.filter((e) => e.status === 'published');
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    events = events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (filters?.interest && filters.interest !== 'All') {
    events = events.filter((e) => e.tags.includes(filters.interest!));
  }

  if (filters?.category && filters.category !== 'All') {
    events = events.filter((e) => e.category === filters.category);
  }

  if (filters?.clubId && filters.clubId !== 'All') {
    events = events.filter((e) => e.clubId === filters.clubId);
  }

  if (filters?.closingSoon) {
    const now = Date.now();
    // Closes within 72 hours and deadline is in the future
    events = events.filter((e) => {
      const deadline = new Date(e.registrationDeadline).getTime();
      const diffHours = (deadline - now) / (1000 * 3600);
      return diffHours > 0 && diffHours <= 72;
    });
  }

  // Sort by deadline urgency (closest deadline first)
  return events.sort(
    (a, b) => new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime()
  );
}

/**
 * Push over pull & Relevance over volume:
 * Computes the top 3-5 events ranked strictly by interest match score + nearest deadline urgency.
 */
export async function getTopPicks(userInterests?: string[]): Promise<CampusEvent[]> {
  await delay(100);
  const events = getItem<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS).filter(
    (e) => e.status === 'published'
  );
  const now = Date.now();

  const userInts = userInterests && userInterests.length > 0 ? userInterests : ['Coding', 'Robotics', 'Hackathons'];

  const scored = events.map((event) => {
    const deadlineMs = new Date(event.registrationDeadline).getTime();
    const hoursLeft = Math.max(0.5, (deadlineMs - now) / (1000 * 3600));

    // Match count between event tags and user interests
    const matchCount = event.tags.filter((t) => userInts.includes(t)).length;

    // Relevance score: heavy weight on matching interests + deadline bonus
    // Score formula: (matchCount * 50) + (1000 / (hoursLeft + 5))
    const score = matchCount * 60 + 500 / (hoursLeft + 12);
    return { event, score, matchCount };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return top 4 events
  return scored.slice(0, 4).map((s) => s.event);
}

export async function getEventById(id: string): Promise<CampusEvent | null> {
  await delay(80);
  const events = getItem<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
  return events.find((e) => e.id === id) || null;
}

export async function recordEventView(eventId: string, userId?: string): Promise<void> {
  const events = getItem<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
  const evt = events.find((e) => e.id === eventId);
  if (evt) {
    evt.viewsCount = (evt.viewsCount || 0) + 1;
    setItem(STORAGE_KEYS.EVENTS, events);
  }
}

export async function toggleLike(eventId: string, userId: string): Promise<{ liked: boolean; count: number }> {
  await delay(50);
  let likes = getItem<Like[]>(STORAGE_KEYS.LIKES, SEED_LIKES);
  const existingIdx = likes.findIndex((l) => l.eventId === eventId && l.userId === userId);

  let liked = false;
  if (existingIdx !== -1) {
    likes.splice(existingIdx, 1);
    liked = false;
  } else {
    likes.push({ userId, eventId });
    liked = true;
  }
  setItem(STORAGE_KEYS.LIKES, likes);

  // Update denormalized count on event
  const events = getItem<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
  const evt = events.find((e) => e.id === eventId);
  if (evt) {
    evt.likesCount = Math.max(0, (evt.likesCount || 0) + (liked ? 1 : -1));
    setItem(STORAGE_KEYS.EVENTS, events);
    return { liked, count: evt.likesCount };
  }
  return { liked, count: 0 };
}

export async function toggleSave(eventId: string, userId: string): Promise<{ saved: boolean; count: number }> {
  await delay(50);
  let saves = getItem<Save[]>(STORAGE_KEYS.SAVES, SEED_SAVES);
  const existingIdx = saves.findIndex((s) => s.eventId === eventId && s.userId === userId);

  let saved = false;
  if (existingIdx !== -1) {
    saves.splice(existingIdx, 1);
    saved = false;
  } else {
    saves.push({ userId, eventId, savedAt: new Date().toISOString() });
    saved = true;

    // Send a 48h simulated reminder trigger check
    const events = getItem<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    const targetEvt = events.find((e) => e.id === eventId);
    if (targetEvt) {
      await sendSimulatedEmail({
        recipientEmail: 'student@nitt.edu',
        recipientName: 'Student',
        subject: `[NITT Events] 📌 Event Saved: ${targetEvt.title}`,
        snippet: `You saved ${targetEvt.title}. We'll notify you 48h and 24h before registrations close.`,
        eventId,
        type: 'deadline_48h',
      });
    }
  }
  setItem(STORAGE_KEYS.SAVES, saves);

  const events = getItem<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
  const evt = events.find((e) => e.id === eventId);
  if (evt) {
    evt.savesCount = Math.max(0, (evt.savesCount || 0) + (saved ? 1 : -1));
    setItem(STORAGE_KEYS.EVENTS, events);
    return { saved, count: evt.savesCount };
  }
  return { saved, count: 0 };
}

export async function registerForEvent(
  eventId: string,
  user: { id: string; name: string; email: string }
): Promise<Registration> {
  await delay(150);
  const events = getItem<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
  const evt = events.find((e) => e.id === eventId);
  if (!evt) throw new Error('Event not found');

  const regs = getItem<Registration[]>(STORAGE_KEYS.REGISTRATIONS, SEED_REGISTRATIONS);
  const already = regs.find((r) => r.eventId === eventId && r.userId === user.id);
  if (already) {
    throw new Error('You are already registered for this event.');
  }

  const currentCount = regs.filter((r) => r.eventId === eventId).length;
  if (currentCount >= evt.capacity) {
    throw new Error('Event registration is full (capacity reached).');
  }

  const newReg: Registration = {
    id: `reg-${Date.now()}`,
    eventId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    registeredAt: new Date().toISOString(),
    attended: false,
  };

  regs.push(newReg);
  setItem(STORAGE_KEYS.REGISTRATIONS, regs);

  // Update denormalized event registrations count
  evt.registrationsCount = (evt.registrationsCount || 0) + 1;
  setItem(STORAGE_KEYS.EVENTS, events);

  // Dispatch simulated confirmation notification and email
  await addNotification({
    userId: user.id,
    eventId,
    title: '🎟️ Registration Confirmed!',
    message: `You're in for ${evt.title} at ${evt.venue}. We'll remind you 24h & 2h before start!`,
    type: 'event_24h',
    emailSimulated: true,
  });

  await sendSimulatedEmail({
    recipientEmail: user.email,
    recipientName: user.name,
    subject: `[NITT Events Confirmation] 🎟️ ${evt.title}`,
    snippet: `Confirmed! Venue: ${evt.venue}. Date: ${new Date(evt.startAt).toLocaleDateString()}. Show your QR at entry.`,
    eventId,
    type: 'event_24h',
  });

  return newReg;
}

export async function cancelRegistration(eventId: string, userId: string): Promise<void> {
  await delay(100);
  let regs = getItem<Registration[]>(STORAGE_KEYS.REGISTRATIONS, SEED_REGISTRATIONS);
  regs = regs.filter((r) => !(r.eventId === eventId && r.userId === userId));
  setItem(STORAGE_KEYS.REGISTRATIONS, regs);

  const events = getItem<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
  const evt = events.find((e) => e.id === eventId);
  if (evt) {
    evt.registrationsCount = Math.max(0, (evt.registrationsCount || 1) - 1);
    setItem(STORAGE_KEYS.EVENTS, events);
  }
}

export async function getUserRegistrations(userId: string): Promise<Registration[]> {
  await delay(80);
  const regs = getItem<Registration[]>(STORAGE_KEYS.REGISTRATIONS, SEED_REGISTRATIONS);
  return regs.filter((r) => r.userId === userId);
}

export async function getUserSaves(userId: string): Promise<Save[]> {
  await delay(60);
  const saves = getItem<Save[]>(STORAGE_KEYS.SAVES, SEED_SAVES);
  return saves.filter((s) => s.userId === userId);
}

export async function getUserLikes(userId: string): Promise<Like[]> {
  await delay(60);
  const likes = getItem<Like[]>(STORAGE_KEYS.LIKES, SEED_LIKES);
  return likes.filter((l) => l.userId === userId);
}

/* =========================================================================
   ORGANIZER & EVENT CREATION SERVICES
   ========================================================================= */

export async function createEvent(data: Partial<CampusEvent>): Promise<CampusEvent> {
  await delay(200);
  const events = getItem<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);

  const newEvent: CampusEvent = {
    id: `evt-${Date.now()}`,
    title: data.title || 'Untitled Event',
    description: data.description || '',
    posterUrl: data.posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    clubId: data.clubId || 'club-spider',
    tags: data.tags || ['Coding'],
    category: data.category || 'Technical Workshop',
    venue: data.venue || 'Barn Hall',
    startAt: data.startAt || new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    registrationDeadline: data.registrationDeadline || new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    capacity: Number(data.capacity) || 100,
    status: data.status || 'published',
    curatedByAmbassador: !!data.curatedByAmbassador,
    hostEvent: !!data.hostEvent,
    externalLink: data.externalLink || '',
    createdAt: new Date().toISOString(),
    likesCount: 0,
    savesCount: 0,
    registrationsCount: 0,
    viewsCount: 1,
  };

  events.unshift(newEvent);
  setItem(STORAGE_KEYS.EVENTS, events);

  // If published, alert students with matching interests
  if (newEvent.status === 'published') {
    const users = getItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
    const clubs = getItem<Club[]>(STORAGE_KEYS.CLUBS, SEED_CLUBS);
    const clubName = clubs.find((c) => c.id === newEvent.clubId)?.name || 'Campus Club';

    for (const student of users.filter((u) => u.role === 'student')) {
      const match = newEvent.tags.some((t) => student.interests.includes(t));
      if (match && student.reminderSettings?.interestMatches) {
        await addNotification({
          userId: student.id,
          eventId: newEvent.id,
          title: `🎯 New ${newEvent.tags[0]} Event by ${clubName}`,
          message: `${newEvent.title} was just posted. Registration closes on ${new Date(newEvent.registrationDeadline).toLocaleDateString()}.`,
          type: 'interest_match',
          emailSimulated: true,
        });
      }
    }
  }

  return newEvent;
}

export async function updateEvent(id: string, updates: Partial<CampusEvent>): Promise<CampusEvent> {
  await delay(150);
  const events = getItem<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Event not found');

  events[idx] = { ...events[idx], ...updates };
  setItem(STORAGE_KEYS.EVENTS, events);
  return events[idx];
}

export async function setEventStatus(id: string, status: CampusEvent['status']): Promise<CampusEvent> {
  return updateEvent(id, { status });
}

export async function getClubEvents(clubId: string): Promise<CampusEvent[]> {
  await delay(100);
  const events = getItem<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
  return events.filter((e) => e.clubId === clubId);
}

export async function getEventAnalytics(eventId: string): Promise<{
  funnel: EventFunnelData;
  showUpRate: number;
  totalRegistered: number;
  totalAttended: number;
  capacity: number;
  occupancyRate: number;
}> {
  await delay(120);
  const events = getItem<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
  const evt = events.find((e) => e.id === eventId);
  const regs = getItem<Registration[]>(STORAGE_KEYS.REGISTRATIONS, SEED_REGISTRATIONS).filter(
    (r) => r.eventId === eventId
  );

  const views = Math.max(evt?.viewsCount || 350, regs.length * 3);
  const saves = Math.max(evt?.savesCount || 45, Math.round(regs.length * 0.8));
  const registrations = regs.length;
  const attended = regs.filter((r) => r.attended).length;

  const showUpRate = registrations > 0 ? Math.round((attended / registrations) * 100) : 0;
  const capacity = evt?.capacity || 100;
  const occupancyRate = Math.min(100, Math.round((registrations / capacity) * 100));

  return {
    funnel: { views, saves, registrations, attended },
    showUpRate,
    totalRegistered: registrations,
    totalAttended: attended,
    capacity,
    occupancyRate,
  };
}

export async function getEventRegistrations(eventId: string): Promise<Registration[]> {
  await delay(90);
  const regs = getItem<Registration[]>(STORAGE_KEYS.REGISTRATIONS, SEED_REGISTRATIONS);
  return regs.filter((r) => r.eventId === eventId);
}

export async function checkInAttendee(registrationId: string, attended: boolean): Promise<Registration> {
  await delay(80);
  const regs = getItem<Registration[]>(STORAGE_KEYS.REGISTRATIONS, SEED_REGISTRATIONS);
  const reg = regs.find((r) => r.id === registrationId);
  if (!reg) throw new Error('Registration record not found');

  reg.attended = attended;
  reg.checkedInAt = attended ? new Date().toISOString() : undefined;
  setItem(STORAGE_KEYS.REGISTRATIONS, regs);
  return reg;
}

export async function exportRegistrationsCSV(eventId: string): Promise<string> {
  await delay(100);
  const events = getItem<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
  const evt = events.find((e) => e.id === eventId);
  const regs = await getEventRegistrations(eventId);

  const headers = ['Registration ID', 'Student Name', 'NITT Email', 'Registered At', 'Attended', 'Checked In Time'];
  const rows = regs.map((r) => [
    r.id,
    `"${r.userName}"`,
    r.userEmail,
    new Date(r.registeredAt).toLocaleString(),
    r.attended ? 'YES' : 'NO',
    r.checkedInAt ? new Date(r.checkedInAt).toLocaleString() : 'N/A',
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  return csvContent;
}

/* =========================================================================
   AMBASSADOR & ADMIN SERVICES
   ========================================================================= */

export async function addCuratedEvent(data: Partial<CampusEvent>): Promise<CampusEvent> {
  return createEvent({
    ...data,
    curatedByAmbassador: true,
  });
}

export async function getClubs(): Promise<Club[]> {
  await delay(80);
  return getItem<Club[]>(STORAGE_KEYS.CLUBS, SEED_CLUBS);
}

export async function addClub(clubData: Partial<Club>): Promise<Club> {
  await delay(150);
  const clubs = getItem<Club[]>(STORAGE_KEYS.CLUBS, SEED_CLUBS);
  const newClub: Club = {
    id: `club-${Date.now()}`,
    name: clubData.name || 'New Club',
    category: clubData.category || 'Technical Workshop',
    logoUrl: clubData.logoUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    description: clubData.description || '',
    leadEmail: clubData.leadEmail || 'club.admin@nitt.edu',
    isApproved: true,
    followerCount: 0,
  };
  clubs.push(newClub);
  setItem(STORAGE_KEYS.CLUBS, clubs);
  return newClub;
}

export async function getOrganizerRequests(): Promise<OrganizerRequest[]> {
  await delay(90);
  return getItem<OrganizerRequest[]>(STORAGE_KEYS.REQUESTS, SEED_ORGANIZER_REQUESTS);
}

export async function submitOrganizerRequest(data: Omit<OrganizerRequest, 'id' | 'requestedAt' | 'status'>): Promise<OrganizerRequest> {
  const reqs = getItem<OrganizerRequest[]>(STORAGE_KEYS.REQUESTS, SEED_ORGANIZER_REQUESTS);
  const newReq: OrganizerRequest = {
    ...data,
    id: `req-${Date.now()}`,
    requestedAt: new Date().toISOString(),
    status: 'pending',
  };
  reqs.unshift(newReq);
  setItem(STORAGE_KEYS.REQUESTS, reqs);
  return newReq;
}

export async function reviewOrganizerRequest(requestId: string, status: 'approved' | 'rejected'): Promise<OrganizerRequest> {
  await delay(120);
  const reqs = getItem<OrganizerRequest[]>(STORAGE_KEYS.REQUESTS, SEED_ORGANIZER_REQUESTS);
  const req = reqs.find((r) => r.id === requestId);
  if (!req) throw new Error('Request not found');

  req.status = status;
  setItem(STORAGE_KEYS.REQUESTS, reqs);

  if (status === 'approved') {
    // If approved, create the club if not already present, or grant role
    const clubs = getItem<Club[]>(STORAGE_KEYS.CLUBS, SEED_CLUBS);
    let existingClub = clubs.find((c) => c.name.toLowerCase() === req.clubName.toLowerCase());
    if (!existingClub) {
      existingClub = {
        id: `club-${Date.now()}`,
        name: req.clubName,
        category: req.category,
        logoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
        description: req.description,
        leadEmail: req.userEmail,
        isApproved: true,
        followerCount: 50,
      };
      clubs.push(existingClub);
      setItem(STORAGE_KEYS.CLUBS, clubs);
    }

    // Update user role to organizer
    const users = getItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
    const u = users.find((usr) => usr.id === req.userId);
    if (u) {
      u.role = 'organizer';
      u.clubId = existingClub.id;
      setItem(STORAGE_KEYS.USERS, users);
    }
  }

  return req;
}

export async function reportEvent(eventId: string, reason: string): Promise<Flag> {
  await delay(100);
  const flags = getItem<Flag[]>(STORAGE_KEYS.FLAGS, SEED_FLAGS);
  const currentUser = getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);

  const newFlag: Flag = {
    id: `flag-${Date.now()}`,
    eventId,
    userId: currentUser?.id || 'anonymous',
    reason,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  flags.unshift(newFlag);
  setItem(STORAGE_KEYS.FLAGS, flags);
  return newFlag;
}

export async function getFlags(): Promise<Flag[]> {
  await delay(90);
  return getItem<Flag[]>(STORAGE_KEYS.FLAGS, SEED_FLAGS);
}

export async function resolveFlag(flagId: string, action: 'dismiss' | 'unpublish'): Promise<void> {
  await delay(120);
  const flags = getItem<Flag[]>(STORAGE_KEYS.FLAGS, SEED_FLAGS);
  const flag = flags.find((f) => f.id === flagId);
  if (!flag) throw new Error('Flag not found');

  flag.status = action === 'dismiss' ? 'dismissed' : 'resolved';
  setItem(STORAGE_KEYS.FLAGS, flags);

  if (action === 'unpublish') {
    const events = getItem<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    const evt = events.find((e) => e.id === flag.eventId);
    if (evt) {
      evt.status = 'unpublished';
      setItem(STORAGE_KEYS.EVENTS, events);
    }
  }
}

export async function getGlobalAdminMetrics(): Promise<GlobalAdminMetrics> {
  await delay(100);
  return SEED_GLOBAL_ADMIN_METRICS;
}

/* =========================================================================
   NOTIFICATIONS & SIMULATED EMAIL SERVICES
   ========================================================================= */

export async function getNotifications(userId?: string): Promise<AppNotification[]> {
  await delay(60);
  const notifs = getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  if (!userId) return notifs;
  return notifs.filter((n) => n.userId === userId || n.userId === 'user-student-demo');
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const notifs = getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  const target = notifs.find((n) => n.id === id);
  if (target) {
    target.read = true;
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const notifs = getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  notifs.forEach((n) => {
    if (n.userId === userId || n.userId === 'user-student-demo') {
      n.read = true;
    }
  });
  setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
}

export async function addNotification(data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<AppNotification> {
  const notifs = getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  const newNotif: AppNotification = {
    ...data,
    id: `notif-${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  notifs.unshift(newNotif);
  setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  return newNotif;
}

export async function getSimulatedEmailLogs(): Promise<SimulatedEmailLog[]> {
  await delay(60);
  return getItem<SimulatedEmailLog[]>(STORAGE_KEYS.EMAIL_LOG, SEED_EMAIL_LOG);
}

export async function sendSimulatedEmail(
  log: Omit<SimulatedEmailLog, 'id' | 'sentAt'>
): Promise<SimulatedEmailLog> {
  const logs = getItem<SimulatedEmailLog[]>(STORAGE_KEYS.EMAIL_LOG, SEED_EMAIL_LOG);
  const newEmail: SimulatedEmailLog = {
    ...log,
    id: `email-${Date.now()}`,
    sentAt: new Date().toISOString(),
  };
  logs.unshift(newEmail);
  setItem(STORAGE_KEYS.EMAIL_LOG, logs);
  return newEmail;
}

/**
 * Triggers exam week hold check:
 * Postpones notifications for exam periods and surfaces a summary banner.
 */
export async function triggerExamWeekNudges(userId: string): Promise<number> {
  await delay(100);
  const notif = await addNotification({
    userId,
    title: '📚 Exam Week Catch-up Nudge',
    message: 'Your midsem break has ended. Here are 3 events closing soon that were kept on hold!',
    type: 'exam_nudge',
    emailSimulated: true,
  });
  return 1;
}

/**
 * Reset database back to seed state
 */
export async function resetDatabase(): Promise<void> {
  localStorage.clear();
  initStorage();
}

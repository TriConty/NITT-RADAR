/**
 * Type definitions for Campus Event Discovery (NIT Trichy)
 */

export type UserRole = 'student' | 'organizer' | 'ambassador' | 'admin';

export interface ReminderPreferences {
  deadline48h: boolean;
  deadline24h: boolean;
  event24h: boolean;
  event2h: boolean;
  interestMatches: boolean;
  examWeekHold: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  interests: string[];
  clubId?: string;
  department?: string;
  year?: string;
  reminderSettings?: ReminderPreferences;
}

export interface Club {
  id: string;
  name: string;
  category: string;
  logoUrl: string;
  description: string;
  leadEmail: string;
  isApproved: boolean;
  followerCount?: number;
}

export type EventStatus = 'draft' | 'published' | 'unpublished';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  clubId: string;
  tags: string[];
  category: string;
  venue: string;
  startAt: string; // ISO 8601 string
  registrationDeadline: string; // ISO 8601 string
  capacity: number;
  status: EventStatus;
  curatedByAmbassador?: boolean;
  hostEvent?: boolean;
  externalLink?: string;
  createdAt: string;
  // Denormalized counts for quick rendering
  likesCount?: number;
  savesCount?: number;
  registrationsCount?: number;
  viewsCount?: number;
}

export interface Save {
  userId: string;
  eventId: string;
  savedAt: string;
}

export interface Like {
  userId: string;
  eventId: string;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  registeredAt: string;
  attended: boolean;
  checkedInAt?: string;
}

export type NotificationType =
  | 'deadline_48h'
  | 'deadline_24h'
  | 'event_24h'
  | 'event_2h'
  | 'interest_match'
  | 'exam_nudge'
  | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  eventId?: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
  emailSimulated?: boolean;
}

export interface Flag {
  id: string;
  eventId: string;
  userId: string;
  reason: string;
  createdAt: string;
  status: 'pending' | 'dismissed' | 'resolved';
}

export interface EventView {
  id: string;
  eventId: string;
  userId?: string;
  timestamp: string;
}

export interface OrganizerRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  clubName: string;
  category: string;
  description: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SimulatedEmailLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  snippet: string;
  sentAt: string;
  eventId?: string;
  type: NotificationType;
}

export interface EventFunnelData {
  views: number;
  saves: number;
  registrations: number;
  attended: number;
}

export interface GlobalAdminMetrics {
  totalStudents: number;
  activeSignupsMonth1: number;
  targetSignupsMonth1: number;
  medianSessionLengthMin: number;
  targetMedianSessionLengthMin: number;
  reachToRegisterRate: number; // e.g. 18.2%
  targetReachToRegisterMin: number; // 15%
  targetReachToRegisterMax: number; // 20%
  showUpRate: number; // e.g. 56%
  baselineShowUpRate: number; // 35%
  targetShowUpRate: number; // 50%
  reminderOptOutRate: number; // e.g. 6.4%
  targetReminderOptOutMax: number; // 10%
  flagRate: number; // e.g. 1.2%
  targetFlagRateMax: number; // 5%
  eventsPosted48hPlusRate: number; // e.g. 93.5%
  targetEventsPosted48hPlus: number; // 90%
  northStarRelevantSeenBeforeDeadline: number; // e.g. 84.8%
  targetNorthStar: number; // 80%
}

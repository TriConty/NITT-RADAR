/**
 * Theme configuration and constants for Campus Event Discovery (NIT Trichy)
 * All branding, campus venues, categories, and colors in one centralized place.
 */

export const THEME = {
  appName: 'Campus Event Discovery',
  shortName: 'NITT Events',
  campus: 'National Institute of Technology, Tiruchirappalli',
  campusShort: 'NIT Trichy',
  statsSubtitle: '~6,000 students • 50+ campus clubs & teams',

  colors: {
    primary: '#0F2B5C', // Deep NITT heritage navy
    primaryHover: '#0A1E40',
    accent: '#F59E0B', // Energetic amber
    urgent: '#EF4444', // Red for closing < 24h
    warning: '#F59E0B', // Amber for closing < 48h
    safe: '#10B981', // Emerald for active / plenty of time
    background: '#F8FAFC',
    card: '#FFFFFF',
    textMain: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
  },

  // Standard student interest taxonomy
  interests: [
    'Coding',
    'Maths',
    'Robotics',
    'Design',
    'Music',
    'Dance',
    'Entrepreneurship',
    'Sports',
    'Literary',
    'Hackathons',
  ] as const,

  // Common NITT venues
  venues: [
    'Barn Hall',
    'Octagon Computer Center',
    'CSG Hall',
    'LHC (Lecture Hall Complex)',
    'ORION Complex',
    'A13 Hall',
    'EEE Auditorium',
    'Chemical Engineering Audi',
    'Sports Complex / Grounds',
    'SAC (Students Activity Center)',
    'Online (GMeet/Discord)',
  ] as const,

  categories: [
    'Technical Workshop',
    'Hackathon / CTF',
    'Guest Lecture',
    'Cultural & Arts',
    'Competitions & Quizzes',
    'Sports & Fitness',
    'E-Cell / Startups',
    'Academic & Higher Studies',
    'Auditions & Inductions',
  ] as const,
};

export type StudentInterest = (typeof THEME.interests)[number];
export type CampusVenue = (typeof THEME.venues)[number];
export type EventCategory = (typeof THEME.categories)[number];

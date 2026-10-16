/**
 * src/utils/dateUtils.ts
 *
 * Helpers for calculating time to deadlines, formatting urgency badges,
 * and generating WhatsApp share links.
 */

export interface DeadlineInfo {
  label: string;
  shortLabel: string;
  isUrgent: boolean; // < 24h
  isWarning: boolean; // < 48h
  isExpired: boolean;
  hoursRemaining: number;
  badgeColorClass: string;
  badgeBgClass: string;
}

export function getDeadlineInfo(deadlineIso: string): DeadlineInfo {
  const deadline = new Date(deadlineIso).getTime();
  const now = Date.now();
  const diffMs = deadline - now;
  const hours = diffMs / (1000 * 60 * 60);

  if (diffMs <= 0) {
    return {
      label: 'Registrations Closed',
      shortLabel: 'Closed',
      isUrgent: true,
      isWarning: true,
      isExpired: true,
      hoursRemaining: 0,
      badgeColorClass: 'text-slate-600',
      badgeBgClass: 'bg-slate-100 border-slate-300',
    };
  }

  if (hours < 1) {
    const mins = Math.max(1, Math.round(diffMs / (1000 * 60)));
    return {
      label: `Closes in ${mins} minute${mins === 1 ? '' : 's'}!`,
      shortLabel: `${mins}m left`,
      isUrgent: true,
      isWarning: false,
      isExpired: false,
      hoursRemaining: hours,
      badgeColorClass: 'text-rose-700',
      badgeBgClass: 'bg-rose-50 border-rose-200 animate-pulse',
    };
  }

  if (hours < 24) {
    const roundedHours = Math.round(hours);
    return {
      label: `Closes in ${roundedHours} hour${roundedHours === 1 ? '' : 's'}!`,
      shortLabel: `${roundedHours}h left`,
      isUrgent: true,
      isWarning: false,
      isExpired: false,
      hoursRemaining: hours,
      badgeColorClass: 'text-rose-700',
      badgeBgClass: 'bg-rose-50 border-rose-200',
    };
  }

  if (hours < 48) {
    const days = Math.round(hours / 24);
    return {
      label: `Closes in ${Math.round(hours)}h (Tomorrow)`,
      shortLabel: 'Tomorrow',
      isUrgent: false,
      isWarning: true,
      isExpired: false,
      hoursRemaining: hours,
      badgeColorClass: 'text-amber-800',
      badgeBgClass: 'bg-amber-50 border-amber-300',
    };
  }

  const days = Math.floor(hours / 24);
  return {
    label: `Closes in ${days} days`,
    shortLabel: `${days}d left`,
    isUrgent: false,
    isWarning: false,
    isExpired: false,
    hoursRemaining: hours,
    badgeColorClass: 'text-emerald-800',
    badgeBgClass: 'bg-emerald-50 border-emerald-200',
  };
}

export function formatEventDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatTimeRemaining(deadlineIso: string): string {
  const diffMs = new Date(deadlineIso).getTime() - Date.now();
  if (diffMs <= 0) return 'Closed';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${mins}m`;
}

export function buildWhatsAppShareUrl(eventTitle: string, venue: string, deadlineIso: string, startIso: string): string {
  const deadlineStr = formatEventDate(deadlineIso);
  const startStr = formatEventDate(startIso);
  const text = `🚨 *NIT Trichy Campus Event Alert* 🚨\n\n📌 *${eventTitle}*\n📍 Venue: ${venue}\n📅 Starts: ${startStr}\n⏰ *Registration Deadline:* ${deadlineStr}\n\nRegister quickly before seats fill up on NITT Events!`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

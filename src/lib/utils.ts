import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns a Tailwind CSS class string for a given status value.
 */
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    // Trip statuses
    assigned: 'bg-blue-100 text-blue-700',
    enroute: 'bg-indigo-100 text-indigo-700',
    arrived_site: 'bg-violet-100 text-violet-700',
    loading: 'bg-amber-100 text-amber-700',
    in_transit: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-teal-100 text-teal-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    // Vehicle / driver statuses
    available: 'bg-green-100 text-green-700',
    in_use: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-amber-100 text-amber-700',
    inactive: 'bg-slate-100 text-slate-500',
    on_trip: 'bg-indigo-100 text-indigo-700',
    off_duty: 'bg-slate-100 text-slate-500',
    suspended: 'bg-red-100 text-red-700',
    // Order statuses
    pending: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-cyan-100 text-cyan-700',
    // Inspection statuses
    passed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    conditional: 'bg-amber-100 text-amber-700',
    // Document statuses
    valid: 'bg-green-100 text-green-700',
    near_expiry: 'bg-amber-100 text-amber-700',
    expired: 'bg-red-100 text-red-700',
  };
  return map[status] ?? 'bg-slate-100 text-slate-500';
}

/**
 * Formats an ISO date/time string into a readable local format.
 * Returns '—' for null/undefined values.
 */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

/**
 * Formats an ISO date string into a readable date only.
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

/**
 * Returns true if the given ISO date string is within the next `days` days.
 */
export function isNearExpiry(dateStr: string | null | undefined, days = 30): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}

/**
 * Returns true if the given ISO date string is in the past.
 */
export function isExpired(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

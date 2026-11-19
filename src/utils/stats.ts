import type { SessionRecord } from '../types/storage';

export interface WeeklySummary {
  weekSessionsCount: number;
  weekDurationSec: number;
  totalSessionsCount: number;
  totalDurationSec: number;
  completedSessionsCount: number;
}

/**
 * Returns local Monday 00:00:00.000 of the ISO week containing `referenceDate`.
 */
export function getStartOfIsoWeekLocal(referenceDate: Date): Date {
  const d = new Date(referenceDate);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun, 1=Mon .. 6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d;
}

/**
 * Computes weekly (ISO Mon-Sun local) and overall statistics from saved sessions.
 * Partial sessions are included in session count and duration; completedSessionsCount tracks 6/6.
 */
export function computeStats(
  sessions: SessionRecord[],
  now: Date = new Date(),
): WeeklySummary {
  const weekStartMs = getStartOfIsoWeekLocal(now).getTime();
  const weekEndMs = weekStartMs + 7 * 24 * 60 * 60 * 1000;

  let weekSessionsCount = 0;
  let weekDurationSec = 0;
  let totalDurationSec = 0;
  let completedSessionsCount = 0;

  for (const session of sessions) {
    const startedMs = Date.parse(session.startedAt);
    const dur = Math.max(0, Math.floor(session.durationSec));
    totalDurationSec += dur;
    if (session.completed) {
      completedSessionsCount += 1;
    }
    if (!Number.isNaN(startedMs) && startedMs >= weekStartMs && startedMs < weekEndMs) {
      weekSessionsCount += 1;
      weekDurationSec += dur;
    }
  }

  return {
    weekSessionsCount,
    weekDurationSec,
    totalSessionsCount: sessions.length,
    totalDurationSec,
    completedSessionsCount,
  };
}

export function formatDuration(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const hours = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function formatMinutesLabel(totalSec: number): string {
  const mins = Math.round(Math.max(0, totalSec) / 60);
  return `${mins} min`;
}

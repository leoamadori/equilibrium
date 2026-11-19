import type { WeeklyReminderConfig } from '../types/storage';

export interface PlannedNotification {
  /** Deterministic int32 ID in range 1..7 (ISO weekday) */
  id: number;
  /** Capacitor weekday: 1 = Sunday, 2 = Monday .. 7 = Saturday */
  capacitorWeekday: number;
  hour: number;
  minute: number;
}

/**
 * Maps ISO weekday (1 = Monday .. 7 = Sunday) to Capacitor LocalNotifications weekday
 * (1 = Sunday, 2 = Monday .. 7 = Saturday).
 */
export function isoWeekdayToCapacitor(isoDay: number): number {
  if (!Number.isInteger(isoDay) || isoDay < 1 || isoDay > 7) {
    throw new RangeError(`Giorno ISO non valido: ${isoDay}`);
  }
  return (isoDay % 7) + 1;
}

/**
 * Builds deterministic Android notification descriptors (IDs 1..7) for a single weekly schedule.
 */
export function buildPlannedNotifications(
  config: WeeklyReminderConfig,
): PlannedNotification[] {
  if (!config.enabled) {
    return [];
  }
  const uniqueSortedDays = Array.from(
    new Set(config.daysOfWeek.filter((d) => Number.isInteger(d) && d >= 1 && d <= 7)),
  ).sort((a, b) => a - b);

  const hour = Math.min(23, Math.max(0, Math.floor(config.hour)));
  const minute = Math.min(59, Math.max(0, Math.floor(config.minute)));

  return uniqueSortedDays.map((isoDay) => ({
    id: isoDay,
    capacitorWeekday: isoWeekdayToCapacitor(isoDay),
    hour,
    minute,
  }));
}

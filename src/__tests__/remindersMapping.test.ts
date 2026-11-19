import { describe, expect, it } from 'vitest';
import {
  buildPlannedNotifications,
  isoWeekdayToCapacitor,
} from '../platform/reminders';

describe('reminders mapping (ISO 1..7 -> Capacitor 1=Sun..7=Sat)', () => {
  it('maps ISO Monday..Sunday accurately to Capacitor weekdays', () => {
    expect(isoWeekdayToCapacitor(1)).toBe(2); // Mon -> 2
    expect(isoWeekdayToCapacitor(2)).toBe(3); // Tue -> 3
    expect(isoWeekdayToCapacitor(3)).toBe(4); // Wed -> 4
    expect(isoWeekdayToCapacitor(4)).toBe(5); // Thu -> 5
    expect(isoWeekdayToCapacitor(5)).toBe(6); // Fri -> 6
    expect(isoWeekdayToCapacitor(6)).toBe(7); // Sat -> 7
    expect(isoWeekdayToCapacitor(7)).toBe(1); // Sun -> 1
  });

  it('throws on out-of-range ISO weekday', () => {
    expect(() => isoWeekdayToCapacitor(0)).toThrow();
    expect(() => isoWeekdayToCapacitor(8)).toThrow();
  });

  it('builds deterministic int32 IDs 1..7 and returns empty when disabled', () => {
    expect(
      buildPlannedNotifications({
        enabled: false,
        daysOfWeek: [1, 3, 5],
        hour: 18,
        minute: 30,
      }),
    ).toEqual([]);

    const planned = buildPlannedNotifications({
      enabled: true,
      daysOfWeek: [7, 1, 3, 1],
      hour: 18,
      minute: 15,
    });
    expect(planned).toEqual([
      { id: 1, capacitorWeekday: 2, hour: 18, minute: 15 },
      { id: 3, capacitorWeekday: 4, hour: 18, minute: 15 },
      { id: 7, capacitorWeekday: 1, hour: 18, minute: 15 },
    ]);
  });
});

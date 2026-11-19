import { describe, expect, it } from 'vitest';
import { computeStats, formatDuration } from '../utils/stats';
import type { SessionRecord } from '../types/storage';

describe('statsCalculation', () => {
  it('computes ISO week (Mon-Sun) and overall totals including partial sessions', () => {
    // Thursday 2026-11-19 local time -> ISO week starts Mon 2026-11-16
    const now = new Date(2026, 10, 19, 14, 0, 0);
    const sessions: SessionRecord[] = [
      {
        id: '1',
        startedAt: new Date(2026, 10, 16, 9, 0, 0).toISOString(),
        endedAt: new Date(2026, 10, 16, 9, 15, 0).toISOString(),
        durationSec: 900,
        completedExercises: 6,
        totalExercises: 6,
        completed: true,
      },
      {
        id: '2',
        startedAt: new Date(2026, 10, 18, 18, 0, 0).toISOString(),
        endedAt: new Date(2026, 10, 18, 18, 10, 0).toISOString(),
        durationSec: 600,
        completedExercises: 3,
        totalExercises: 6,
        completed: false,
      },
      {
        id: '3',
        // Previous week (Sunday 2026-11-15)
        startedAt: new Date(2026, 10, 15, 18, 0, 0).toISOString(),
        endedAt: new Date(2026, 10, 15, 18, 20, 0).toISOString(),
        durationSec: 1200,
        completedExercises: 6,
        totalExercises: 6,
        completed: true,
      },
    ];

    const summary = computeStats(sessions, now);
    expect(summary.weekSessionsCount).toBe(2);
    expect(summary.weekDurationSec).toBe(1500);
    expect(summary.totalSessionsCount).toBe(3);
    expect(summary.totalDurationSec).toBe(2700);
    expect(summary.completedSessionsCount).toBe(2);
  });

  it('formats durations cleanly', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(65)).toBe('01:05');
    expect(formatDuration(3661)).toBe('1:01:01');
  });
});

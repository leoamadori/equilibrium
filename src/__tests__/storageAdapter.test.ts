import { describe, expect, it } from 'vitest';
import { parseAndValidateState } from '../platform/adapter';

describe('storageAdapter parseAndValidateState', () => {
  it('parses valid backup JSON', () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      settings: { audioMode: 'full' },
      sessions: [
        {
          id: 's1',
          startedAt: '2026-11-18T10:00:00.000Z',
          endedAt: '2026-11-18T10:18:00.000Z',
          durationSec: 1080,
          completedExercises: 6,
          totalExercises: 6,
          completed: true,
        },
      ],
      reminder: { enabled: true, daysOfWeek: [1, 3, 5], hour: 18, minute: 30 },
    });

    const parsed = parseAndValidateState(raw);
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.settings.audioMode).toBe('full');
    expect(parsed.sessions).toHaveLength(1);
    expect(parsed.reminder.daysOfWeek).toEqual([1, 3, 5]);
  });

  it('rejects malformed JSON', () => {
    expect(() => parseAndValidateState('{bad json')).toThrow('File JSON non valido.');
  });

  it('rejects unsupported schemaVersion', () => {
    const raw = JSON.stringify({ schemaVersion: 2, sessions: [] });
    expect(() => parseAndValidateState(raw)).toThrow('Versione schema backup non supportata.');
  });
});

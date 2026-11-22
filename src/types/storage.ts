import type { TrainingLevel } from './exercise';

export type AudioMode = 'full' | 'short' | 'off';

export interface SessionRecord {
  id: string;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  completedExercises: number;
  totalExercises: number;
  completed: boolean;
}

export interface WeeklyReminderConfig {
  enabled: boolean;
  /** 1 = Lunedì .. 7 = Domenica (ISO-8601) */
  daysOfWeek: number[];
  hour: number;
  minute: number;
}

export interface AppSettings {
  audioMode: AudioMode;
  trainingLevel: TrainingLevel;
}

export interface PersistedState {
  schemaVersion: 1;
  settings: AppSettings;
  sessions: SessionRecord[];
  reminder: WeeklyReminderConfig;
}

export const DEFAULT_PERSISTED_STATE: PersistedState = {
  schemaVersion: 1,
  settings: {
    audioMode: 'short',
    trainingLevel: 'facile',
  },
  sessions: [],
  reminder: {
    enabled: false,
    daysOfWeek: [1, 3, 5],
    hour: 18,
    minute: 30,
  },
};

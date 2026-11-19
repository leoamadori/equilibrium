import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';
import { KeepAwake } from '@capacitor-community/keep-awake';
import {
  DEFAULT_PERSISTED_STATE,
  type AudioMode,
  type PersistedState,
  type SessionRecord,
  type WeeklyReminderConfig,
} from '../types/storage';
import { buildPlannedNotifications } from './reminders';

const STORAGE_KEY = 'equilibrium_state_v1';
const REMINDER_CHANNEL_ID = 'equilibrium-reminders';

export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform();
}

function isValidAudioMode(value: unknown): value is AudioMode {
  return value === 'full' || value === 'short' || value === 'off';
}

function isValidSessionRecord(item: unknown): item is SessionRecord {
  if (typeof item !== 'object' || item === null) return false;
  const r = item as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.startedAt === 'string' &&
    typeof r.endedAt === 'string' &&
    typeof r.durationSec === 'number' &&
    Number.isFinite(r.durationSec) &&
    r.durationSec >= 0 &&
    typeof r.completedExercises === 'number' &&
    typeof r.totalExercises === 'number' &&
    typeof r.completed === 'boolean'
  );
}

function normalizeReminder(raw: unknown): WeeklyReminderConfig {
  if (typeof raw !== 'object' || raw === null) {
    return { ...DEFAULT_PERSISTED_STATE.reminder };
  }
  const r = raw as Record<string, unknown>;
  const days = Array.isArray(r.daysOfWeek)
    ? r.daysOfWeek.filter(
        (d): d is number => typeof d === 'number' && Number.isInteger(d) && d >= 1 && d <= 7,
      )
    : DEFAULT_PERSISTED_STATE.reminder.daysOfWeek;
  return {
    enabled: typeof r.enabled === 'boolean' ? r.enabled : false,
    daysOfWeek: Array.from(new Set(days)).sort((a, b) => a - b),
    hour:
      typeof r.hour === 'number' && r.hour >= 0 && r.hour <= 23
        ? Math.floor(r.hour)
        : DEFAULT_PERSISTED_STATE.reminder.hour,
    minute:
      typeof r.minute === 'number' && r.minute >= 0 && r.minute <= 59
        ? Math.floor(r.minute)
        : DEFAULT_PERSISTED_STATE.reminder.minute,
  };
}

export function parseAndValidateState(rawJson: string): PersistedState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('File JSON non valido.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Struttura backup non valida.');
  }

  const obj = parsed as Record<string, unknown>;
  if (obj.schemaVersion !== 1) {
    throw new Error('Versione schema backup non supportata.');
  }

  const rawSettings = (obj.settings ?? {}) as Record<string, unknown>;
  const audioMode: AudioMode = isValidAudioMode(rawSettings.audioMode)
    ? rawSettings.audioMode
    : DEFAULT_PERSISTED_STATE.settings.audioMode;

  if (!Array.isArray(obj.sessions)) {
    throw new Error('Elenco sessioni mancante o non valido.');
  }
  const sessions = obj.sessions.filter(isValidSessionRecord);
  const reminder = normalizeReminder(obj.reminder);

  return {
    schemaVersion: 1,
    settings: { audioMode },
    sessions,
    reminder,
  };
}

export const storageAdapter = {
  async loadState(): Promise<PersistedState> {
    try {
      let raw: string | null = null;
      if (isNativeAndroid()) {
        const res = await Preferences.get({ key: STORAGE_KEY });
        raw = res.value;
      } else {
        raw = window.localStorage.getItem(STORAGE_KEY);
      }
      if (!raw) {
        return structuredClone(DEFAULT_PERSISTED_STATE);
      }
      return parseAndValidateState(raw);
    } catch {
      return structuredClone(DEFAULT_PERSISTED_STATE);
    }
  },

  async saveState(state: PersistedState): Promise<void> {
    const serialized = JSON.stringify(state);
    try {
      if (isNativeAndroid()) {
        await Preferences.set({ key: STORAGE_KEY, value: serialized });
      } else {
        window.localStorage.setItem(STORAGE_KEY, serialized);
      }
    } catch {
      // Ignore QuotaExceededError / Safari Private Mode without crashing UI
    }
  },

  serializeForExport(state: PersistedState): string {
    return JSON.stringify(state, null, 2);
  },

  downloadExportFile(state: PersistedState): void {
    const blob = new Blob([this.serializeForExport(state)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `equilibrium-backup-${dateStamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};

let webWakeLockSentinel: WakeLockSentinel | null = null;
let wakeLockDesired = false;
let visibilityListenerAttached = false;

async function requestWebWakeLock(): Promise<void> {
  if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') {
    return;
  }
  try {
    webWakeLockSentinel = await navigator.wakeLock.request('screen');
    webWakeLockSentinel.addEventListener('release', () => {
      webWakeLockSentinel = null;
    });
  } catch {
    // Low Power Mode or unsupported browser: degrade silently
  }
}

function handleWakeLockVisibility(): void {
  if (wakeLockDesired && document.visibilityState === 'visible' && !webWakeLockSentinel) {
    void requestWebWakeLock();
  }
}

export const wakeLockAdapter = {
  async enable(): Promise<void> {
    wakeLockDesired = true;
    if (isNativeAndroid()) {
      try {
        await KeepAwake.keepAwake();
      } catch {
        // Ignore native errors
      }
      return;
    }
    if (!visibilityListenerAttached) {
      document.addEventListener('visibilitychange', handleWakeLockVisibility);
      visibilityListenerAttached = true;
    }
    await requestWebWakeLock();
  },

  async disable(): Promise<void> {
    wakeLockDesired = false;
    if (isNativeAndroid()) {
      try {
        await KeepAwake.allowSleep();
      } catch {
        // Ignore native errors
      }
      return;
    }
    if (webWakeLockSentinel) {
      try {
        await webWakeLockSentinel.release();
      } catch {
        // Ignore
      }
      webWakeLockSentinel = null;
    }
  },
};

export const remindersAdapter = {
  isSupported(): boolean {
    return isNativeAndroid();
  },

  async ensurePermission(): Promise<boolean> {
    if (!isNativeAndroid()) return false;
    try {
      const current = await LocalNotifications.checkPermissions();
      if (current.display === 'granted') return true;
      const requested = await LocalNotifications.requestPermissions();
      return requested.display === 'granted';
    } catch {
      return false;
    }
  },

  async syncWeeklyReminder(config: WeeklyReminderConfig): Promise<{ ok: boolean; reason?: string }> {
    if (!isNativeAndroid()) {
      return { ok: false, reason: 'Disponibile solo su APK Android.' };
    }

    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications.map((n) => ({ id: n.id })),
        });
      }

      if (!config.enabled || config.daysOfWeek.length === 0) {
        return { ok: true };
      }

      const granted = await this.ensurePermission();
      if (!granted) {
        return {
          ok: false,
          reason: 'Permesso notifiche negato. Abilitalo dalle impostazioni di Android.',
        };
      }

      await LocalNotifications.createChannel({
        id: REMINDER_CHANNEL_ID,
        name: 'Promemoria Allenamento',
        description: 'Promemoria settimanali per le sessioni Equilibrium',
        importance: 4,
      });

      const planned = buildPlannedNotifications(config);
      if (planned.length === 0) {
        return { ok: true };
      }

      await LocalNotifications.schedule({
        notifications: planned.map((item) => ({
          id: item.id,
          channelId: REMINDER_CHANNEL_ID,
          title: 'Equilibrium — Ora di allenarsi',
          body: 'Dedica 15 minuti ai 6 esercizi per il tuo equilibrio.',
          schedule: {
            on: {
              weekday: item.capacitorWeekday,
              hour: item.hour,
              minute: item.minute,
            },
            repeats: true,
          },
        })),
      });

      return { ok: true };
    } catch {
      return {
        ok: false,
        reason: 'Impossibile pianificare le notifiche su questo dispositivo.',
      };
    }
  },
};

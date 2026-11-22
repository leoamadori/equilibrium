import { useCallback, useEffect, useState } from 'react';
import type { TrainingLevel } from '../types/exercise';
import {
  DEFAULT_PERSISTED_STATE,
  type AudioMode,
  type PersistedState,
  type SessionRecord,
  type WeeklyReminderConfig,
} from '../types/storage';
import {
  parseAndValidateState,
  remindersAdapter,
  storageAdapter,
} from '../platform/adapter';

export function useAppState() {
  const [state, setState] = useState<PersistedState>(() =>
    structuredClone(DEFAULT_PERSISTED_STATE),
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void storageAdapter.loadState().then((initial) => {
      if (active) {
        setState(initial);
        setLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((updater: (prev: PersistedState) => PersistedState) => {
    setState((prev) => {
      const next = updater(prev);
      void storageAdapter.saveState(next);
      return next;
    });
  }, []);

  const setAudioMode = useCallback(
    (audioMode: AudioMode) => {
      persist((prev) => ({
        ...prev,
        settings: { ...prev.settings, audioMode },
      }));
    },
    [persist],
  );

  const setTrainingLevel = useCallback(
    (trainingLevel: TrainingLevel) => {
      persist((prev) => ({
        ...prev,
        settings: { ...prev.settings, trainingLevel },
      }));
    },
    [persist],
  );

  const addSession = useCallback(
    (record: SessionRecord) => {
      persist((prev) => ({
        ...prev,
        sessions: [record, ...prev.sessions],
      }));
    },
    [persist],
  );

  const clearSessions = useCallback(() => {
    persist((prev) => ({
      ...prev,
      sessions: [],
    }));
  }, [persist]);

  const updateReminder = useCallback(
    async (reminder: WeeklyReminderConfig): Promise<{ ok: boolean; reason?: string }> => {
      const result = remindersAdapter.isSupported()
        ? await remindersAdapter.syncWeeklyReminder(reminder)
        : { ok: true };

      if (result.ok || !reminder.enabled) {
        persist((prev) => ({
          ...prev,
          reminder,
        }));
      }
      return result;
    },
    [persist],
  );

  const exportBackup = useCallback(() => {
    storageAdapter.downloadExportFile(state);
  }, [state]);

  const importBackup = useCallback(
    async (rawJson: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        const imported = parseAndValidateState(rawJson);
        setState(imported);
        await storageAdapter.saveState(imported);
        if (remindersAdapter.isSupported()) {
          await remindersAdapter.syncWeeklyReminder(imported.reminder);
        }
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "Errore durante l'importazione.",
        };
      }
    },
    [],
  );

  return {
    state,
    loaded,
    setAudioMode,
    setTrainingLevel,
    addSession,
    clearSessions,
    updateReminder,
    exportBackup,
    importBackup,
  };
}

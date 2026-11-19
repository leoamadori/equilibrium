import { useRef, useState } from 'react';
import { remindersAdapter } from '../platform/adapter';
import type { AudioMode, WeeklyReminderConfig } from '../types/storage';

interface SettingsPageProps {
  audioMode: AudioMode;
  reminder: WeeklyReminderConfig;
  onChangeAudioMode: (mode: AudioMode) => void;
  onUpdateReminder: (config: WeeklyReminderConfig) => Promise<{ ok: boolean; reason?: string }>;
  onExportBackup: () => void;
  onImportBackup: (rawJson: string) => Promise<{ ok: boolean; error?: string }>;
  onClearSessions: () => void;
}

const WEEKDAYS: Array<{ iso: number; short: string }> = [
  { iso: 1, short: 'Lun' },
  { iso: 2, short: 'Mar' },
  { iso: 3, short: 'Mer' },
  { iso: 4, short: 'Gio' },
  { iso: 5, short: 'Ven' },
  { iso: 6, short: 'Sab' },
  { iso: 7, short: 'Dom' },
];

export function SettingsPage({
  audioMode,
  reminder,
  onChangeAudioMode,
  onUpdateReminder,
  onExportBackup,
  onImportBackup,
  onClearSessions,
}: SettingsPageProps) {
  const [draftReminder, setDraftReminder] = useState<WeeklyReminderConfig>(reminder);
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeRemindersSupported = remindersAdapter.isSupported();

  const toggleDay = (isoDay: number) => {
    setDraftReminder((prev) => {
      const exists = prev.daysOfWeek.includes(isoDay);
      const nextDays = exists
        ? prev.daysOfWeek.filter((d) => d !== isoDay)
        : [...prev.daysOfWeek, isoDay].sort((a, b) => a - b);
      return { ...prev, daysOfWeek: nextDays };
    });
  };

  const handleTimeChange = (value: string) => {
    const [hStr, mStr] = value.split(':');
    const hour = Number(hStr);
    const minute = Number(mStr);
    if (!Number.isNaN(hour) && !Number.isNaN(minute)) {
      setDraftReminder((prev) => ({ ...prev, hour, minute }));
    }
  };

  const handleSaveReminder = async () => {
    setReminderStatus('Salvataggio promemoria…');
    const res = await onUpdateReminder(draftReminder);
    if (res.ok) {
      setReminderStatus(
        draftReminder.enabled
          ? 'Promemoria settimanale salvato sul dispositivo.'
          : 'Promemoria disattivato.',
      );
    } else {
      setReminderStatus(res.reason ?? 'Errore durante il salvataggio del promemoria.');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = await onImportBackup(text);
    setBackupStatus(
      res.ok ? 'Backup importato correttamente.' : res.error ?? 'Importazione fallita.',
    );
    e.target.value = '';
  };

  const timeValue = `${String(draftReminder.hour).padStart(2, '0')}:${String(
    draftReminder.minute,
  ).padStart(2, '0')}`;

  return (
    <section className="page settings-page">
      <h1>Impostazioni e Promemoria</h1>

      <div className="card">
        <h2>Voce guida allenatore</h2>
        <p className="muted-text">
          Scegli la modalità predefinita per le tracce vocali durante la sessione guidata.
        </p>
        <div className="segmented">
          {(['short', 'full', 'off'] as AudioMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`segmented-btn ${audioMode === mode ? 'segmented-btn-active' : ''}`}
              onClick={() => onChangeAudioMode(mode)}
            >
              {mode === 'short' ? 'Sintetica' : mode === 'full' ? 'Completa' : 'Spento'}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Promemoria settimanale</h2>
        {nativeRemindersSupported ? (
          <div className="reminder-form">
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={draftReminder.enabled}
                onChange={(e) =>
                  setDraftReminder((prev) => ({ ...prev, enabled: e.target.checked }))
                }
              />
              <span>Attiva notifica settimanale offline</span>
            </label>

            <div className="weekday-picker">
              {WEEKDAYS.map((d) => {
                const active = draftReminder.daysOfWeek.includes(d.iso);
                return (
                  <button
                    key={d.iso}
                    type="button"
                    className={`chip ${active ? 'chip-active' : ''}`}
                    onClick={() => toggleDay(d.iso)}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>

            <div className="time-row">
              <label htmlFor="reminder-time">Orario:</label>
              <input
                id="reminder-time"
                type="time"
                value={timeValue}
                onChange={(e) => handleTimeChange(e.target.value)}
              />
            </div>

            <p className="muted-text">
              Nota: il risparmio energetico aggressivo di Android (Doze Mode) può differire
              leggermente la consegna delle notifiche a schermo spento.
            </p>

            <button type="button" className="btn btn-primary" onClick={handleSaveReminder}>
              Salva Promemoria
            </button>

            {reminderStatus && <p className="status-text">{reminderStatus}</p>}
          </div>
        ) : (
          <p className="muted-text">
            I promemoria ricorrenti automatici tramite notifica locale sono disponibili solo
            nell&apos;APK Android offline.
          </p>
        )}
      </div>

      <div className="card">
        <h2>Backup e Dati Locali</h2>
        <p className="muted-text">
          Lo storico è salvato solo su questo dispositivo. Su iPhone Safari (Intelligent Tracking
          Prevention), i dati del browser possono essere rimossi dopo 7 giorni senza aprire il sito:
          usa il backup JSON per conservarli.
        </p>

        <div className="backup-actions">
          {!nativeRemindersSupported && (
            <button type="button" className="btn btn-secondary" onClick={onExportBackup}>
              Esporta Backup JSON
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Importa Backup JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm('Confermi di voler azzerare tutto lo storico delle sessioni?')) {
                onClearSessions();
                setBackupStatus('Storico sessioni azzerato.');
              }
            }}
          >
            Azzera Storico
          </button>
        </div>
        {backupStatus && <p className="status-text">{backupStatus}</p>}
      </div>
    </section>
  );
}

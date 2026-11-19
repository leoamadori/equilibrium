import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { useHashRoute, type RouteName } from './router';
import { HomePage } from './pages/HomePage';
import { GuidePage } from './pages/GuidePage';
import { SessionPage } from './pages/SessionPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';

const NAV_ITEMS: Array<{ route: RouteName; label: string }> = [
  { route: 'home', label: 'Home' },
  { route: 'guida', label: 'Guida' },
  { route: 'sessione', label: 'Sessione' },
  { route: 'statistiche', label: 'Statistiche' },
  { route: 'impostazioni', label: 'Impostazioni' },
];

export function App() {
  const [route, navigate] = useHashRoute();
  const [tvActive, setTvActive] = useState(false);
  const {
    state,
    setAudioMode,
    addSession,
    clearSessions,
    updateReminder,
    exportBackup,
    importBackup,
  } = useAppState();

  return (
    <div className="app-shell">
      {!tvActive && (
        <header className="top-nav">
          <button type="button" className="brand-btn" onClick={() => navigate('home')}>
            Equilibrium
          </button>
          <nav className="nav-links" aria-label="Navigazione principale">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.route}
                type="button"
                className={`nav-link ${route === item.route ? 'nav-link-active' : ''}`}
                onClick={() => navigate(item.route)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>
      )}

      <main className="app-main">
        {route === 'home' && (
          <HomePage sessions={state.sessions} onNavigate={navigate} />
        )}
        {route === 'guida' && <GuidePage />}
        {route === 'sessione' && (
          <SessionPage
            defaultAudioMode={state.settings.audioMode}
            onSaveSession={addSession}
            onNavigate={navigate}
            onTvModeChange={setTvActive}
          />
        )}
        {route === 'statistiche' && <StatsPage sessions={state.sessions} />}
        {route === 'impostazioni' && (
          <SettingsPage
            audioMode={state.settings.audioMode}
            reminder={state.reminder}
            onChangeAudioMode={setAudioMode}
            onUpdateReminder={updateReminder}
            onExportBackup={exportBackup}
            onImportBackup={importBackup}
            onClearSessions={clearSessions}
          />
        )}
      </main>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { beepEngine } from '../services/beepEngine';

export interface StopwatchState {
  elapsedSec: number;
  running: boolean;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
}

export function useStopwatch(autoStart = false): StopwatchState {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(autoStart);
  const lastTickRef = useRef<number | null>(autoStart ? Date.now() : null);

  useEffect(() => {
    if (!running) {
      lastTickRef.current = null;
      return;
    }
    lastTickRef.current = Date.now();
    const id = window.setInterval(() => {
      const now = Date.now();
      const prev = lastTickRef.current ?? now;
      const delta = Math.max(0, now - prev);
      lastTickRef.current = now;
      setElapsedMs((ms) => ms + delta);
    }, 250);
    return () => window.clearInterval(id);
  }, [running]);

  const start = useCallback(() => {
    lastTickRef.current = Date.now();
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (lastTickRef.current !== null) {
      const delta = Math.max(0, Date.now() - lastTickRef.current);
      setElapsedMs((ms) => ms + delta);
      lastTickRef.current = null;
    }
    setRunning(false);
  }, []);

  const toggle = useCallback(() => {
    setRunning((prev) => {
      if (prev) {
        if (lastTickRef.current !== null) {
          const delta = Math.max(0, Date.now() - lastTickRef.current);
          setElapsedMs((ms) => ms + delta);
          lastTickRef.current = null;
        }
        return false;
      }
      lastTickRef.current = Date.now();
      return true;
    });
  }, []);

  const reset = useCallback(() => {
    lastTickRef.current = null;
    setRunning(false);
    setElapsedMs(0);
  }, []);

  return {
    elapsedSec: Math.floor(elapsedMs / 1000),
    running,
    start,
    pause,
    toggle,
    reset,
  };
}

export type TimerKind = 'work' | 'rest';

export interface CountdownState {
  remainingSec: number;
  initialSec: number;
  activeLabel: string | null;
  activeKind: TimerKind | null;
  running: boolean;
  finishedFlash: boolean;
  startPreset: (durationSec: number, label: string, kind: TimerKind) => void;
  toggle: () => void;
  pause: () => void;
  reset: () => void;
  clear: () => void;
}

export function useCountdown(): CountdownState {
  const [initialSec, setInitialSec] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [activeKind, setActiveKind] = useState<TimerKind | null>(null);
  const [running, setRunning] = useState(false);
  const [finishedFlash, setFinishedFlash] = useState(false);

  const lastTickRef = useRef<number | null>(null);
  const lastBeepSecRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      lastTickRef.current = null;
      return;
    }
    lastTickRef.current = Date.now();
    const id = window.setInterval(() => {
      const now = Date.now();
      const prev = lastTickRef.current ?? now;
      const delta = Math.max(0, now - prev);
      lastTickRef.current = now;

      setRemainingMs((cur) => {
        const next = Math.max(0, cur - delta);
        const nextSec = Math.ceil(next / 1000);

        if (next === 0 && cur > 0) {
          beepEngine.playComplete();
          setRunning(false);
          setFinishedFlash(true);
          window.setTimeout(() => setFinishedFlash(false), 1800);
          lastBeepSecRef.current = 0;
        } else if (nextSec >= 1 && nextSec <= 3 && lastBeepSecRef.current !== nextSec) {
          lastBeepSecRef.current = nextSec;
          beepEngine.playTick();
        }
        return next;
      });
    }, 150);

    return () => window.clearInterval(id);
  }, [running]);

  const startPreset = useCallback((durationSec: number, label: string, kind: TimerKind) => {
    beepEngine.unlock();
    const safeSec = Math.max(1, Math.floor(durationSec));
    setInitialSec(safeSec);
    setRemainingMs(safeSec * 1000);
    setActiveLabel(label);
    setActiveKind(kind);
    setFinishedFlash(false);
    lastBeepSecRef.current = null;
    lastTickRef.current = Date.now();
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    setRunning(false);
    lastTickRef.current = null;
  }, []);

  const toggle = useCallback(() => {
    beepEngine.unlock();
    setRunning((prev) => {
      if (prev) {
        lastTickRef.current = null;
        return false;
      }
      if (remainingMs <= 0 && initialSec > 0) {
        setRemainingMs(initialSec * 1000);
        lastBeepSecRef.current = null;
      }
      if (remainingMs > 0 || initialSec > 0) {
        lastTickRef.current = Date.now();
        return true;
      }
      return false;
    });
  }, [initialSec, remainingMs]);

  const reset = useCallback(() => {
    setRunning(false);
    lastTickRef.current = null;
    lastBeepSecRef.current = null;
    setFinishedFlash(false);
    setRemainingMs(initialSec * 1000);
  }, [initialSec]);

  const clear = useCallback(() => {
    setRunning(false);
    lastTickRef.current = null;
    lastBeepSecRef.current = null;
    setFinishedFlash(false);
    setInitialSec(0);
    setRemainingMs(0);
    setActiveLabel(null);
    setActiveKind(null);
  }, []);

  return {
    remainingSec: Math.ceil(remainingMs / 1000),
    initialSec,
    activeLabel,
    activeKind,
    running,
    finishedFlash,
    startPreset,
    toggle,
    pause,
    reset,
    clear,
  };
}

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { RestTimerState } from '../types';

interface RestTimerContextType extends RestTimerState {
  startTimer: (seconds: number) => void;
  stopTimer: () => void;
  resetTimer: () => void;
  addTime: (seconds: number) => void;
  setMinimized: (minimized: boolean) => void;
  setDuration: (seconds: number) => void;
}

const RestTimerContext = createContext<RestTimerContextType | undefined>(undefined);

const STORAGE_KEY = 'restTimerState';

export const RestTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<RestTimerState>(() => {
    try {
      if (typeof localStorage !== 'undefined' && localStorage.getItem) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<RestTimerState>;
          return {
            ...parsed,
            remainingTime: parsed.remainingTime ?? 0,
            duration: parsed.duration ?? 90,
            isActive: false,
            isMinimized: true,
          };
        }
      }
    } catch {
      return {
        remainingTime: 0,
        isActive: false,
        duration: 90,
        isMinimized: true,
      };
    }
    return {
      remainingTime: 0,
      isActive: false,
      duration: 90,
      isMinimized: true,
    };
  });

  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined' && localStorage.setItem) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          remainingTime: state.remainingTime,
          duration: state.duration,
          isMinimized: state.isMinimized,
          isActive: false,
        }));
      }
    } catch {
      // Ignore storage failures.
    }
  }, [state.remainingTime, state.duration, state.isMinimized]);

  const syncTimer = useCallback(() => {
    const endTime = endTimeRef.current;
    if (!endTime) return;

    const timeLeft = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    setState((prev) => ({
      ...prev,
      remainingTime: timeLeft,
      isActive: timeLeft > 0,
    }));

    if (timeLeft <= 0) {
      endTimeRef.current = null;
    }
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (state.isActive && state.remainingTime > 0) {
      endTimeRef.current = endTimeRef.current ?? Date.now() + state.remainingTime * 1000;

      const tick = () => {
        const endTime = endTimeRef.current;
        if (!endTime) return;

        const timeLeft = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

        setState((prev) => ({
          ...prev,
          remainingTime: timeLeft,
          isActive: timeLeft > 0,
        }));

        if (timeLeft <= 0 && interval) {
          clearInterval(interval);
          interval = undefined;
          endTimeRef.current = null;
        }
      };

      tick();
      interval = setInterval(tick, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isActive, state.remainingTime]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncTimer]);

  const startTimer = useCallback((seconds: number) => {
    endTimeRef.current = seconds > 0 ? Date.now() + seconds * 1000 : null;
    setState((prev) => ({
      remainingTime: seconds,
      isActive: seconds > 0,
      duration: seconds,
      isMinimized: prev.isMinimized,
    }));
  }, []);

  const stopTimer = useCallback(() => {
    endTimeRef.current = null;
    setState((prev) => ({ ...prev, isActive: false }));
  }, []);

  const resetTimer = useCallback(() => {
    setState((prev) => {
      endTimeRef.current = prev.duration > 0 ? Date.now() + prev.duration * 1000 : null;
      return {
        ...prev,
        remainingTime: prev.duration,
        isActive: prev.duration > 0,
        isMinimized: false,
      };
    });
  }, []);

  const addTime = useCallback((seconds: number) => {
    endTimeRef.current = endTimeRef.current ? endTimeRef.current + seconds * 1000 : null;
    setState((prev) => ({
      ...prev,
      remainingTime: prev.remainingTime + seconds,
      duration: prev.duration + seconds,
    }));
  }, []);

  const setMinimized = useCallback((isMinimized: boolean) => {
    setState((prev) => ({ ...prev, isMinimized }));
  }, []);

  const setDuration = useCallback((duration: number) => {
    setState((prev) => {
      endTimeRef.current = prev.isActive && duration > 0 ? Date.now() + duration * 1000 : null;
      return { ...prev, duration, remainingTime: duration };
    });
  }, []);

  return (
    <RestTimerContext.Provider value={{ ...state, startTimer, stopTimer, resetTimer, addTime, setMinimized, setDuration }}>
      {children}
    </RestTimerContext.Provider>
  );
};

export const useRestTimer = () => {
  const context = useContext(RestTimerContext);
  if (context === undefined) {
    throw new Error('useRestTimer must be used within a RestTimerProvider');
  }
  return context;
};

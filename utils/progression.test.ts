import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getLastProgressionDate, calculateProgression, getCurrentMax, getRecentProgressions } from './progression';
import { ExerciseLog, Exercise } from '../types';

describe('progression utilities', () => {
  let today: Date;

  beforeEach(() => {
    today = new Date('2026-02-02');
    vi.useFakeTimers();
    vi.setSystemTime(today);
  });

  describe('getLastProgressionDate', () => {
    it('should return null for empty logs', () => {
      expect(getLastProgressionDate([])).toBeNull();
    });

    it('should return the only log date if there is only one log', () => {
      const logs: ExerciseLog[] = [{ date: '2026-02-01', weight: 50, reps: 10 }];
      expect(getLastProgressionDate(logs)).toBe('2026-02-01');
    });

    it('should detect last variation in weight', () => {
      const logs: ExerciseLog[] = [
        { date: '2026-01-30', weight: 50, reps: 10 },
        { date: '2026-01-31', weight: 50, reps: 10 },
        { date: '2026-02-01', weight: 55, reps: 10 },
      ];
      expect(getLastProgressionDate(logs)).toBe('2026-02-01');
    });

    it('should detect last variation in reps', () => {
      const logs: ExerciseLog[] = [
        { date: '2026-01-30', weight: 50, reps: 10 },
        { date: '2026-01-31', weight: 50, reps: 10 },
        { date: '2026-02-01', weight: 50, reps: 12 },
      ];
      expect(getLastProgressionDate(logs)).toBe('2026-02-01');
    });

    it('should detect decrease in weight as progression', () => {
      const logs: ExerciseLog[] = [
        { date: '2026-01-30', weight: 50, reps: 10 },
        { date: '2026-02-01', weight: 45, reps: 10 },
      ];
      expect(getLastProgressionDate(logs)).toBe('2026-02-01');
    });

    it('should detect decrease in reps as progression', () => {
      const logs: ExerciseLog[] = [
        { date: '2026-01-30', weight: 50, reps: 10 },
        { date: '2026-02-01', weight: 50, reps: 8 },
      ];
      expect(getLastProgressionDate(logs)).toBe('2026-02-01');
    });

    it('should return last date when same weight/reps logged multiple times', () => {
      const logs: ExerciseLog[] = [
        { date: '2026-02-01', weight: 50, reps: 10 },
        { date: '2026-02-02', weight: 50, reps: 10 },
      ];
      expect(getLastProgressionDate(logs)).toBe('2026-02-02');
    });

    it('should handle unsorted logs', () => {
      const logs: ExerciseLog[] = [
        { date: '2026-02-01', weight: 50, reps: 10 },
        { date: '2026-01-30', weight: 50, reps: 10 },
        { date: '2026-02-02', weight: 55, reps: 10 },
      ];
      expect(getLastProgressionDate(logs)).toBe('2026-02-02');
    });
  });

  describe('calculateProgression', () => {
    it('should return null for empty logs', () => {
      expect(calculateProgression([])).toBeNull();
    });

    it('should calculate days ago correctly', () => {
      const logs: ExerciseLog[] = [{ date: '2026-01-30', weight: 50, reps: 10 }];
      const result = calculateProgression(logs);
      expect(result).toBe('3 días');
    });

    it('should calculate weeks correctly', () => {
      const logs: ExerciseLog[] = [{ date: '2026-01-02', weight: 50, reps: 10 }];
      const result = calculateProgression(logs);
      expect(result).toBe('4 semanas');
    });

    it('should calculate months correctly', () => {
      const logs: ExerciseLog[] = [{ date: '2025-10-02', weight: 50, reps: 10 }];
      const result = calculateProgression(logs);
      expect(result).toBe('4 meses');
    });

    it('should use singular form for 1 day', () => {
      const logs: ExerciseLog[] = [{ date: '2026-02-01', weight: 50, reps: 10 }];
      const result = calculateProgression(logs);
      expect(result).toBe('1 día');
    });

    it('should calculate weeks correctly when past threshold', () => {
      const logs: ExerciseLog[] = [{ date: '2026-01-02', weight: 50, reps: 10 }];
      const result = calculateProgression(logs);
      expect(result).toBe('4 semanas');
    });

    it('should use singular form for 1 month', () => {
      const logs: ExerciseLog[] = [{ date: '2025-11-01', weight: 50, reps: 10 }];
      const result = calculateProgression(logs);
      expect(result).toBe('3 meses');
    });

    it('should consider last variation date, not all-time max', () => {
      const logs: ExerciseLog[] = [
        { date: '2026-01-01', weight: 100, reps: 10 },
        { date: '2026-02-01', weight: 50, reps: 10 },
      ];
      expect(calculateProgression(logs)).toBe('1 día');
    });
  });

  describe('getRecentProgressions', () => {
    it('should return empty array for no exercises', () => {
      expect(getRecentProgressions([])).toEqual([]);
    });

    it('should return empty array when exercises have no logs', () => {
      const exercises: Exercise[] = [
        { id: '1', name: 'Bench', muscleGroup: 'Pecho', logs: [] },
        { id: '2', name: 'Squat', muscleGroup: 'Pierna', logs: [] },
      ];
      expect(getRecentProgressions(exercises)).toEqual([]);
    });

    it('should sort by most recent progression first', () => {
      const exercises: Exercise[] = [
        {
          id: '1',
          name: 'Bench',
          muscleGroup: 'Pecho',
          logs: [
            { date: '2026-01-15', weight: 50, reps: 10 },
            { date: '2026-02-01', weight: 55, reps: 10 },
          ],
        },
        {
          id: '2',
          name: 'Squat',
          muscleGroup: 'Pierna',
          logs: [
            { date: '2026-01-30', weight: 100, reps: 8 },
            { date: '2026-01-31', weight: 105, reps: 8 },
          ],
        },
      ];
      const result = getRecentProgressions(exercises);
      expect(result[0].exerciseName).toBe('Bench');
      expect(result[1].exerciseName).toBe('Squat');
    });

    it('should limit results to specified number', () => {
      const exercises: Exercise[] = [
        { id: '1', name: 'Ex1', muscleGroup: 'G1', logs: [{ date: '2026-02-01', weight: 50, reps: 10 }] },
        { id: '2', name: 'Ex2', muscleGroup: 'G2', logs: [{ date: '2026-02-02', weight: 50, reps: 10 }] },
        { id: '3', name: 'Ex3', muscleGroup: 'G3', logs: [{ date: '2026-02-03', weight: 50, reps: 10 }] },
        { id: '4', name: 'Ex4', muscleGroup: 'G4', logs: [{ date: '2026-02-04', weight: 50, reps: 10 }] },
      ];
      const result = getRecentProgressions(exercises, 2);
      expect(result).toHaveLength(2);
    });

    it('should include correct progression data', () => {
      const exercises: Exercise[] = [
        {
          id: '1',
          name: 'Bench Press',
          muscleGroup: 'Pecho',
          logs: [{ date: '2026-02-01', weight: 50, reps: 10 }],
        },
      ];
      const result = getRecentProgressions(exercises);
      expect(result[0]).toEqual({
        exerciseId: '1',
        exerciseName: 'Bench Press',
        muscleGroup: 'Pecho',
        lastProgressionDate: '2026-02-01',
        weight: 50,
        reps: 10,
        progressionText: '1 día',
      });
    });
  });

  describe('getCurrentMax', () => {
    it('should return null for empty logs', () => {
      expect(getCurrentMax([])).toBeNull();
    });

    it('should return the only log', () => {
      const logs: ExerciseLog[] = [{ date: '2026-02-01', weight: 50, reps: 10 }];
      expect(getCurrentMax(logs)).toEqual({ date: '2026-02-01', weight: 50, reps: 10 });
    });

    it('should prioritize highest weight', () => {
      const logs: ExerciseLog[] = [
        { date: '2026-02-01', weight: 50, reps: 10 },
        { date: '2026-02-02', weight: 55, reps: 8 },
      ];
      expect(getCurrentMax(logs)).toEqual({ date: '2026-02-02', weight: 55, reps: 8 });
    });

    it('should use highest reps for same weight', () => {
      const logs: ExerciseLog[] = [
        { date: '2026-02-01', weight: 50, reps: 10 },
        { date: '2026-02-02', weight: 50, reps: 12 },
      ];
      expect(getCurrentMax(logs)).toEqual({ date: '2026-02-02', weight: 50, reps: 12 });
    });

    it('should use most recent for identical weight/reps', () => {
      const logs: ExerciseLog[] = [
        { date: '2026-02-01', weight: 50, reps: 10 },
        { date: '2026-02-02', weight: 50, reps: 10 },
      ];
      expect(getCurrentMax(logs)).toEqual({ date: '2026-02-02', weight: 50, reps: 10 });
    });
  });
});

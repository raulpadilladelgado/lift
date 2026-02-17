import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getMostFrequentExercises, getTopWeightExercises } from './insights';
import { Exercise } from '../types';

describe('insights utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-02'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should order top weight exercises by latest weight', () => {
    const exercises: Exercise[] = [
      {
        id: '1',
        name: 'Bench',
        muscleGroup: 'Pecho',
        logs: [
          { date: '2026-01-01', weight: 120, reps: 6 },
          { date: '2026-02-01', weight: 80, reps: 8 },
        ],
      },
      {
        id: '2',
        name: 'Squat',
        muscleGroup: 'Pierna',
        logs: [{ date: '2026-02-01', weight: 90, reps: 5 }],
      },
    ];

    const result = getTopWeightExercises(exercises, 2);
    expect(result).toHaveLength(2);
    expect(result[0].exerciseId).toBe('2');
    expect(result[0].weight).toBe(90);
    expect(result[1].exerciseId).toBe('1');
    expect(result[1].weight).toBe(80);
  });

  it('should order most frequent exercises by total logs', () => {
    const exercises: Exercise[] = [
      {
        id: '1',
        name: 'Press',
        muscleGroup: 'Hombro',
        logs: [
          { date: '2026-01-01', weight: 40, reps: 10 },
          { date: '2026-01-15', weight: 45, reps: 8 },
          { date: '2026-02-01', weight: 47, reps: 6 },
        ],
      },
      {
        id: '2',
        name: 'Row',
        muscleGroup: 'Espalda',
        logs: [{ date: '2026-02-01', weight: 60, reps: 8 }],
      },
    ];

    const result = getMostFrequentExercises(exercises, 2);
    expect(result[0].exerciseId).toBe('1');
    expect(result[0].sessions).toBe(3);
    expect(result[1].exerciseId).toBe('2');
    expect(result[1].sessions).toBe(1);
  });
});

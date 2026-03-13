import { describe, it, expect } from 'vitest';
import { sortExercisesForGroup } from './exerciseSorting';
import { Exercise, GroupSortPreference } from '../types';

describe('exercise sorting utilities', () => {
  it('should sort by latest progression date descending', () => {
    const exercises: Exercise[] = [
      {
        id: '1',
        name: 'Bench',
        muscleGroup: 'Pecho',
        logs: [
          { date: '2026-01-01', weight: 50, reps: 8 },
          { date: '2026-01-10', weight: 50, reps: 10 }, // subida de reps: progreso el 10 ene
        ],
      },
      {
        id: '2',
        name: 'Squat',
        muscleGroup: 'Pierna',
        logs: [
          { date: '2026-01-15', weight: 90, reps: 5 },
          { date: '2026-02-01', weight: 95, reps: 5 }, // subida de peso: progreso el 1 feb
        ],
      },
      {
        id: '3',
        name: 'Curls',
        muscleGroup: 'Bíceps',
        logs: [],
      },
    ];

    const preference: GroupSortPreference = { field: 'progress', direction: 'desc' };
    const result = sortExercisesForGroup(exercises, preference);
    expect(result[0].id).toBe('2'); // progreso más reciente: 1 feb
    expect(result[1].id).toBe('1'); // progreso: 10 ene
    expect(result[2].id).toBe('3'); // sin logs → al final
  });

  it('should sort by latest weight ascending', () => {
    const exercises: Exercise[] = [
      {
        id: '1',
        name: 'Bench',
        muscleGroup: 'Pecho',
        logs: [{ date: '2026-02-01', weight: 100, reps: 6 }],
      },
      {
        id: '2',
        name: 'Squat',
        muscleGroup: 'Pierna',
        logs: [{ date: '2026-02-01', weight: 80, reps: 8 }],
      },
    ];

    const preference: GroupSortPreference = { field: 'weight', direction: 'asc' };
    const result = sortExercisesForGroup(exercises, preference);
    expect(result[0].id).toBe('2');
    expect(result[1].id).toBe('1');
  });
});

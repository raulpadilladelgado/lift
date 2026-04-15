import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { storageManager } from './storageService';
import { Routine } from '../types';

const mockStorage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
  clear: vi.fn(() => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); }),
  length: 0,
  key: vi.fn((index: number) => Object.keys(mockStorage)[index] || null),
});

// storageService uses localStorage — jsdom provides it in the test env.

describe('storageService — routines', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // --- getRoutines ---

  it('returns an empty array when no routines are stored', () => {
    expect(storageManager.getRoutines()).toEqual([]);
  });

  // --- saveRoutine ---

  it('saves a new routine and retrieves it', () => {
    const routine: Routine = {
      id: 'r1',
      name: 'Push Day',
      exercises: [{ exerciseId: 'ex1', sets: 3, reps: '10', dropset: false, toFailure: false }],
    };
    storageManager.saveRoutine(routine);
    const routines = storageManager.getRoutines();
    expect(routines).toHaveLength(1);
    expect(routines[0]).toEqual(routine);
  });

  it('saves multiple routines independently', () => {
    storageManager.saveRoutine({ id: 'r1', name: 'Push Day', exercises: [] });
    storageManager.saveRoutine({
      id: 'r2',
      name: 'Pull Day',
      exercises: [{ exerciseId: 'ex1', sets: 3, reps: '10', dropset: false, toFailure: false }],
    });
    expect(storageManager.getRoutines()).toHaveLength(2);
  });

  it('updates an existing routine when saved with same id', () => {
    storageManager.saveRoutine({ id: 'r1', name: 'Push Day', exercises: [] });
    storageManager.saveRoutine({
      id: 'r1',
      name: 'Push Day Updated',
      exercises: [{ exerciseId: 'ex1', sets: 4, reps: '8', dropset: true, toFailure: false }],
    });
    const routines = storageManager.getRoutines();
    expect(routines).toHaveLength(1);
    expect(routines[0].name).toBe('Push Day Updated');
    expect(routines[0].exercises[0].exerciseId).toBe('ex1');
  });

  // --- deleteRoutine ---

  it('deletes a routine by id', () => {
    storageManager.saveRoutine({ id: 'r1', name: 'Push Day', exercises: [] });
    storageManager.saveRoutine({ id: 'r2', name: 'Leg Day', exercises: [] });
    storageManager.deleteRoutine('r1');
    const routines = storageManager.getRoutines();
    expect(routines).toHaveLength(1);
    expect(routines[0].id).toBe('r2');
  });

  it('does nothing when deleting a non-existent routine id', () => {
    storageManager.saveRoutine({ id: 'r1', name: 'Push Day', exercises: [] });
    storageManager.deleteRoutine('does-not-exist');
    expect(storageManager.getRoutines()).toHaveLength(1);
  });

  it('results in an empty list after all routines are deleted', () => {
    storageManager.saveRoutine({ id: 'r1', name: 'Push Day', exercises: [] });
    storageManager.deleteRoutine('r1');
    expect(storageManager.getRoutines()).toEqual([]);
  });

  // --- persistence ---

  it('persists routines across separate getRoutines calls', () => {
    const ex = { exerciseId: 'ex1', sets: 3, reps: '10', dropset: false, toFailure: false };
    storageManager.saveRoutine({ id: 'r1', name: 'Push Day', exercises: [ex] });
    expect(storageManager.getRoutines()).toEqual(storageManager.getRoutines());
    expect(storageManager.getRoutines()[0].exercises[0].exerciseId).toBe('ex1');
  });

  // --- migration from old format ---

  it('migrates routines stored in old exerciseIds format', () => {
    const oldFormat = JSON.stringify([
      { id: 'r1', name: 'Push Day', exerciseIds: ['ex1', 'ex2'] },
    ]);
    localStorage.setItem('lift_routines_v1', oldFormat);
    const routines = storageManager.getRoutines();
    expect(routines).toHaveLength(1);
    expect(routines[0].exercises).toHaveLength(2);
    expect(routines[0].exercises[0]).toEqual({
      exerciseId: 'ex1',
      sets: 3,
      reps: '10',
      dropset: false,
      toFailure: false,
    });
  });

  it('migrates reps from number to string when loading old data', () => {
    const oldFormat = JSON.stringify([
      {
        id: 'r1',
        name: 'Push Day',
        exercises: [{ exerciseId: 'ex1', sets: 3, reps: 10, dropset: false }],
      },
    ]);
    localStorage.setItem('lift_routines_v1', oldFormat);
    const routines = storageManager.getRoutines();
    expect(routines[0].exercises[0].reps).toBe('10');
  });

  it('deletes exercises from a removed group and cleans routine references', () => {
    storageManager.addMuscleGroup('Pecho');
    storageManager.saveExercise({ id: 'ex-keep', name: 'Squat', muscleGroup: 'Pierna', logs: [] });
    storageManager.saveExercise({ id: 'ex-main', name: 'Bench', muscleGroup: 'Pecho', logs: [] });
    storageManager.saveExercise({ id: 'ex-alt', name: 'Fly', muscleGroup: 'Pecho', logs: [] });
    storageManager.saveRoutine({
      id: 'r1',
      name: 'Test',
      exercises: [
        { exerciseId: 'ex-main', sets: 3, reps: '8', dropset: false, toFailure: false },
        { exerciseId: 'ex-keep', alternativeExerciseId: 'ex-alt', sets: 3, reps: '10', dropset: false, toFailure: false },
      ],
    });

    storageManager.deleteMuscleGroup('Pecho');

    expect(storageManager.getExercises().map((exercise) => exercise.id)).toEqual(['ex-keep']);
    expect(storageManager.getMuscleGroups()).not.toContain('Pecho');
    expect(storageManager.getRoutines()[0].exercises).toEqual([
      { exerciseId: 'ex-keep', sets: 3, reps: '10', dropset: false, toFailure: false },
    ]);
  });

  it('only removes the group when it has no exercises', () => {
    storageManager.addMuscleGroup('Movilidad');
    storageManager.saveExercise({ id: 'ex-1', name: 'Plank', muscleGroup: 'Core', logs: [] });

    storageManager.deleteMuscleGroup('Movilidad');

    expect(storageManager.getExercises().map((exercise) => exercise.id)).toEqual(['ex-1']);
    expect(storageManager.getMuscleGroups()).not.toContain('Movilidad');
  });
});

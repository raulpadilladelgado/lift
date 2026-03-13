import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { storageManager } from './storageService';
import { Routine } from '../types';

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
    const routine: Routine = { id: 'r1', name: 'Push Day', exerciseIds: ['ex1', 'ex2'] };
    storageManager.saveRoutine(routine);
    const routines = storageManager.getRoutines();
    expect(routines).toHaveLength(1);
    expect(routines[0]).toEqual(routine);
  });

  it('saves multiple routines independently', () => {
    storageManager.saveRoutine({ id: 'r1', name: 'Push Day', exerciseIds: [] });
    storageManager.saveRoutine({ id: 'r2', name: 'Pull Day', exerciseIds: ['ex1'] });
    expect(storageManager.getRoutines()).toHaveLength(2);
  });

  it('updates an existing routine when saved with same id', () => {
    storageManager.saveRoutine({ id: 'r1', name: 'Push Day', exerciseIds: [] });
    storageManager.saveRoutine({ id: 'r1', name: 'Push Day Updated', exerciseIds: ['ex1'] });
    const routines = storageManager.getRoutines();
    expect(routines).toHaveLength(1);
    expect(routines[0].name).toBe('Push Day Updated');
    expect(routines[0].exerciseIds).toEqual(['ex1']);
  });

  // --- deleteRoutine ---

  it('deletes a routine by id', () => {
    storageManager.saveRoutine({ id: 'r1', name: 'Push Day', exerciseIds: [] });
    storageManager.saveRoutine({ id: 'r2', name: 'Leg Day', exerciseIds: [] });
    storageManager.deleteRoutine('r1');
    const routines = storageManager.getRoutines();
    expect(routines).toHaveLength(1);
    expect(routines[0].id).toBe('r2');
  });

  it('does nothing when deleting a non-existent routine id', () => {
    storageManager.saveRoutine({ id: 'r1', name: 'Push Day', exerciseIds: [] });
    storageManager.deleteRoutine('does-not-exist');
    expect(storageManager.getRoutines()).toHaveLength(1);
  });

  it('results in an empty list after all routines are deleted', () => {
    storageManager.saveRoutine({ id: 'r1', name: 'Push Day', exerciseIds: [] });
    storageManager.deleteRoutine('r1');
    expect(storageManager.getRoutines()).toEqual([]);
  });

  // --- persistence ---

  it('persists routines across separate getRoutines calls', () => {
    storageManager.saveRoutine({ id: 'r1', name: 'Push Day', exerciseIds: ['ex1'] });
    // Read twice — both should return the same data
    expect(storageManager.getRoutines()).toEqual(storageManager.getRoutines());
    expect(storageManager.getRoutines()[0].exerciseIds).toContain('ex1');
  });
});

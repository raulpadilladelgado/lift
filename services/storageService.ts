import { Exercise, ExerciseLog, GroupSortPreference, StorageManagerInterface } from '../types';
import { DEFAULT_GROUP_SORT_PREFERENCE } from '../utils/exerciseSorting';

const STORAGE_KEY = 'lift_data_v1';
const GROUPS_KEY = 'lift_groups_v1';
const GROUP_SORT_KEY = 'lift_group_sort_v1';

const DEFAULT_GROUPS = [
  'Pecho',
  'Espalda',
  'Pierna',
  'Hombro',
  'Bíceps',
  'Tríceps',
  'Abdominales',
  'Cardio',
  'Otro'
];

class LocalStorageManager implements StorageManagerInterface {
  private loadData(): Exercise[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveData(data: Exercise[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  getExercises(): Exercise[] {
    return this.loadData();
  }

  saveExercise(exercise: Exercise): void {
    const exercises = this.loadData();
    const index = exercises.findIndex((e) => e.id === exercise.id);
    if (index >= 0) {
      exercises[index] = exercise;
    } else {
      exercises.push(exercise);
    }
    this.saveData(exercises);
  }

  deleteExercise(id: string): void {
    let exercises = this.loadData();
    exercises = exercises.filter((e) => e.id !== id);
    this.saveData(exercises);
  }

  updateExerciseDetails(id: string, newName: string, newGroup: string): void {
    const exercises = this.loadData();
    const exercise = exercises.find((e) => e.id === id);
    if (exercise) {
      exercise.name = newName;
      exercise.muscleGroup = newGroup;
      this.saveData(exercises);
    }
  }

  renameExercise(id: string, newName: string): void {
    this.updateExerciseDetails(id, newName, this.getExercises().find(e => e.id === id)?.muscleGroup || 'Otro');
  }

  logSession(exerciseId: string, weight: number, reps: number): void {
    const exercises = this.loadData();
    const exercise = exercises.find((e) => e.id === exerciseId);
    
    if (exercise) {
      const today = new Date().toISOString().split('T')[0];
      const existingLogIndex = exercise.logs.findIndex((l) => l.date === today);

      const newLog: ExerciseLog = { date: today, weight, reps };

      if (existingLogIndex >= 0) {
        exercise.logs[existingLogIndex] = newLog;
      } else {
        exercise.logs.push(newLog);
      }
      
      this.saveExercise(exercise);
    }
  }

  updateExerciseNote(id: string, note: string): void {
    const exercises = this.loadData();
    const exercise = exercises.find((e) => e.id === id);
    if (exercise) {
      const trimmedNote = note.trim();
      exercise.note = trimmedNote.length > 0 ? trimmedNote : undefined;
      this.saveData(exercises);
    }
  }

  updateExerciseLog(exerciseId: string, originalDate: string, log: ExerciseLog): void {
    const exercises = this.loadData();
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    const originalIndex = exercise.logs.findIndex((item) => item.date === originalDate);
    if (originalIndex === -1) return;

    const updatedLog: ExerciseLog = {
      date: log.date,
      weight: log.weight,
      reps: log.reps,
    };

    const existingIndex = exercise.logs.findIndex((item) => item.date === updatedLog.date);
    if (existingIndex !== -1 && existingIndex !== originalIndex) {
      exercise.logs[existingIndex] = updatedLog;
      exercise.logs.splice(originalIndex, 1);
    } else {
      exercise.logs[originalIndex] = updatedLog;
    }

    this.saveData(exercises);
  }

  deleteExerciseLog(exerciseId: string, date: string): void {
    const exercises = this.loadData();
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (exercise) {
      exercise.logs = exercise.logs.filter((log) => log.date !== date);
      this.saveData(exercises);
    }
  }

  getMuscleGroups(): string[] {
    const data = localStorage.getItem(GROUPS_KEY);
    if (data) {
      return JSON.parse(data);
    } else {
      this.saveMuscleGroups(DEFAULT_GROUPS);
      return DEFAULT_GROUPS;
    }
  }

  private saveMuscleGroups(groups: string[]): void {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  }

  addMuscleGroup(group: string): void {
    const groups = this.getMuscleGroups();
    if (!groups.includes(group)) {
      groups.push(group);
      this.saveMuscleGroups(groups);
    }
  }

  deleteMuscleGroup(group: string): void {
    let groups = this.getMuscleGroups();
    groups = groups.filter(g => g !== group);
    this.saveMuscleGroups(groups);

    const exercises = this.loadData();
    let changed = false;
    exercises.forEach(ex => {
      if (ex.muscleGroup === group) {
        ex.muscleGroup = 'Otro';
        changed = true;
      }
    });
    if (changed) this.saveData(exercises);
  }

  renameMuscleGroup(oldName: string, newName: string): void {
    const groups = this.getMuscleGroups();
    const index = groups.indexOf(oldName);
    if (index !== -1) {
      groups[index] = newName;
      this.saveMuscleGroups(groups);

      const exercises = this.loadData();
      let changed = false;
      exercises.forEach(ex => {
        if (ex.muscleGroup === oldName) {
          ex.muscleGroup = newName;
          changed = true;
        }
      });
      if (changed) this.saveData(exercises);
    }
  }

  getGroupSortPreference(): GroupSortPreference {
    const data = localStorage.getItem(GROUP_SORT_KEY);
    if (!data) return DEFAULT_GROUP_SORT_PREFERENCE;

    try {
      const parsed = JSON.parse(data) as GroupSortPreference;
      const isValidField = parsed.field === 'progress' || parsed.field === 'weight';
      const isValidDirection = parsed.direction === 'asc' || parsed.direction === 'desc';
      if (isValidField && isValidDirection) {
        return parsed;
      }
    } catch {
      // Ignore invalid data and fall back to default
    }

    return DEFAULT_GROUP_SORT_PREFERENCE;
  }

  saveGroupSortPreference(preference: GroupSortPreference): void {
    localStorage.setItem(GROUP_SORT_KEY, JSON.stringify(preference));
  }

  // --- Backup Features ---

  exportData(): string {
    const backup = {
      exercises: this.loadData(),
      groups: this.getMuscleGroups()
    };
    return JSON.stringify(backup, null, 2);
  }

  importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      
      let exercisesToImport: Exercise[] = [];
      let groupsToImport: string[] = [];

      if (Array.isArray(parsed)) {
        exercisesToImport = parsed;
      } else if (parsed.exercises && Array.isArray(parsed.exercises)) {
        exercisesToImport = parsed.exercises;
        if (Array.isArray(parsed.groups)) {
          groupsToImport = parsed.groups;
        }
      } else {
        return false;
      }
      
      const isValid = exercisesToImport.every(item => item.id && item.name && Array.isArray(item.logs));
      if (!isValid) return false;

      const currentData = this.loadData();
      const newMap = new Map(currentData.map(item => [item.id, item]));
      exercisesToImport.forEach((item: Exercise) => {
        newMap.set(item.id, item);
      });
      this.saveData(Array.from(newMap.values()));

      if (groupsToImport.length > 0) {
        const currentGroups = this.getMuscleGroups();
        const combinedGroups = Array.from(new Set([...currentGroups, ...groupsToImport]));
        this.saveMuscleGroups(combinedGroups);
      }

      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
}

export const storageManager = new LocalStorageManager();

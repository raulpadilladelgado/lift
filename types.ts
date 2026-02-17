export interface ExerciseLog {
  date: string; // ISO Date String (YYYY-MM-DD)
  weight: number;
  reps: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  logs: ExerciseLog[];
  note?: string;
}

export type GroupSortField = 'progress' | 'weight';
export type SortDirection = 'asc' | 'desc';

export interface GroupSortPreference {
  field: GroupSortField;
  direction: SortDirection;
}

export interface StorageManagerInterface {
  getExercises(): Exercise[];
  saveExercise(exercise: Exercise): void;
  deleteExercise(id: string): void;
  updateExerciseDetails(id: string, name: string, muscleGroup: string): void;
  logSession(exerciseId: string, weight: number, reps: number): void;
  updateExerciseNote(id: string, note: string): void;
  updateExerciseLog(exerciseId: string, originalDate: string, log: ExerciseLog): void;
  deleteExerciseLog(exerciseId: string, date: string): void;
  
  // Muscle Group Management
  getMuscleGroups(): string[];
  addMuscleGroup(group: string): void;
  deleteMuscleGroup(group: string): void;
  renameMuscleGroup(oldName: string, newName: string): void;

  // Preferences
  getGroupSortPreference(): GroupSortPreference;
  saveGroupSortPreference(preference: GroupSortPreference): void;
}

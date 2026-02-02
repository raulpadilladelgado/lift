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
}

export interface StorageManagerInterface {
  getExercises(): Exercise[];
  saveExercise(exercise: Exercise): void;
  deleteExercise(id: string): void;
  updateExerciseDetails(id: string, name: string, muscleGroup: string): void;
  logSession(exerciseId: string, weight: number, reps: number): void;
  
  // Muscle Group Management
  getMuscleGroups(): string[];
  addMuscleGroup(group: string): void;
  deleteMuscleGroup(group: string): void;
  renameMuscleGroup(oldName: string, newName: string): void;
}
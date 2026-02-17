import { Exercise } from '../types';
import { calculateTimeSince, getLatestLog } from './progression';

export interface WeightInsight {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  timeSince: string;
}

export const getTopWeightExercises = (exercises: Exercise[], limit: number = 3): WeightInsight[] => {
  return exercises
    .map((exercise) => {
      const latestLog = getLatestLog(exercise.logs);
      if (!latestLog) return null;

      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        muscleGroup: exercise.muscleGroup,
        weight: latestLog.weight,
        reps: latestLog.reps,
        timeSince: calculateTimeSince(latestLog.date),
      };
    })
    .filter((item): item is WeightInsight => item !== null)
    .sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return a.exerciseName.localeCompare(b.exerciseName);
    })
    .slice(0, limit);
};

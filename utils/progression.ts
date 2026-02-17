import { ExerciseLog } from '../types';
import { Exercise } from '../types';
import { t } from './translations';

export const getLastProgressionDate = (logs: ExerciseLog[]): string | null => {
  if (!logs || logs.length < 1) return null;
  if (logs.length === 1) return logs[0].date;

  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (let i = sortedLogs.length - 1; i > 0; i--) {
    const current = sortedLogs[i];
    const previous = sortedLogs[i - 1];

    if (current.weight !== previous.weight || current.reps !== previous.reps) {
      return current.date;
    }
  }

  return sortedLogs[sortedLogs.length - 1].date;
};

export const getLatestLog = (logs: ExerciseLog[]): ExerciseLog | null => {
  if (!logs || logs.length === 0) return null;
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return sortedLogs[0];
};

export interface RecentProgression {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  lastProgressionDate: string;
  weight: number;
  reps: number;
  progressionText: string;
}

export const getRecentProgressions = (exercises: Exercise[], limit: number = 3): RecentProgression[] => {
  return exercises
    .map((exercise) => {
      const lastProgressionDate = getLastProgressionDate(exercise.logs);
      if (!lastProgressionDate) return null;

      const latestLog = getLatestLog(exercise.logs);
      if (!latestLog) return null;

      const progressionText = calculateProgression(exercise.logs);
      if (!progressionText) return null;

      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        muscleGroup: exercise.muscleGroup,
        lastProgressionDate,
        weight: latestLog.weight,
        reps: latestLog.reps,
        progressionText,
      };
    })
    .filter((item): item is RecentProgression => item !== null)
    .sort((a, b) => new Date(b.lastProgressionDate).getTime() - new Date(a.lastProgressionDate).getTime())
    .slice(0, limit);
};

export const calculateProgression = (logs: ExerciseLog[]): string | null => {
  const lastProgressionDate = getLastProgressionDate(logs);
  if (!lastProgressionDate) return null;

  return calculateTimeSince(lastProgressionDate);
};

const formatRelativeDays = (diffDays: number): string => {
  if (diffDays <= 0) return t.time.today;
  if (diffDays === 1) return t.time.yesterday;
  if (diffDays < 7) return `${diffDays} ${t.time.days}`;

  const weeks = Math.floor(diffDays / 7);
  if (weeks < 4) {
    return `${weeks} ${weeks === 1 ? t.time.week : t.time.weeks}`;
  }

  const months = Math.max(1, Math.floor(diffDays / 30));
  if (months < 12) {
    return `${months} ${months === 1 ? t.time.month : t.time.months}`;
  }

  const years = Math.max(1, Math.floor(months / 12));
  return `${years} ${years === 1 ? t.time.year : t.time.years}`;
};

export const calculateTimeSince = (date: string): string => {
  const targetDate = new Date(date);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - targetDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return formatRelativeDays(diffDays);
};

import { Exercise, GroupSortPreference } from '../types';
import { getLastProgressionDate, getLatestLog } from './progression';

export const DEFAULT_GROUP_SORT_PREFERENCE: GroupSortPreference = {
  field: 'progress',
  direction: 'desc',
};

const getSortValue = (exercise: Exercise, preference: GroupSortPreference): number | null => {
  if (preference.field === 'weight') {
    const latestLog = getLatestLog(exercise.logs);
    return latestLog ? latestLog.weight : null;
  }

  const lastProgressionDate = getLastProgressionDate(exercise.logs);
  return lastProgressionDate ? new Date(lastProgressionDate).getTime() : null;
};

export const sortExercisesForGroup = (
  exercises: Exercise[],
  preference: GroupSortPreference
): Exercise[] => {
  const multiplier = preference.direction === 'asc' ? 1 : -1;

  return [...exercises].sort((a, b) => {
    const valueA = getSortValue(a, preference);
    const valueB = getSortValue(b, preference);

    if (valueA === null && valueB === null) {
      return a.name.localeCompare(b.name);
    }

    if (valueA === null) return 1;
    if (valueB === null) return -1;

    const diff = (valueA - valueB) * multiplier;
    if (diff !== 0) return diff;

    return a.name.localeCompare(b.name);
  });
};

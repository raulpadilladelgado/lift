import React from 'react';
import { Exercise } from '../types';
import { getRecentProgressions } from '../utils/progression';
import { t } from '../utils/translations';
import { BarChart3 } from 'lucide-react';

interface Props {
  exercises: Exercise[];
}

export const InsightsScreen: React.FC<Props> = ({ exercises }) => {
  const recentProgressions = getRecentProgressions(exercises, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <BarChart3 className="text-ios-blue" size={28} />
          <h1 className="text-2xl font-bold text-ios-text">{t.labels.insights || 'Insights'}</h1>
        </div>
        <p className="text-sm text-ios-gray">{t.labels.recentProgress || 'Your recent progressions'}</p>
      </div>

      {/* Recent Progressions */}
      {recentProgressions.length === 0 ? (
        <div className="text-center py-20 opacity-50">
          <BarChart3 className="mx-auto text-ios-gray mb-4" size={48} />
          <p className="text-ios-text font-medium">{t.labels.noInsights || 'No progressions yet'}</p>
          <p className="text-sm text-ios-gray mt-2">
            {t.labels.noInsightsDesc || 'Start logging exercises to see your progress'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentProgressions.map((progression, index) => (
            <div
              key={progression.exerciseId}
              className="bg-ios-card rounded-2xl p-4 border-l-4 border-ios-blue animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-ios-text">{progression.exerciseName}</h3>
                  <p className="text-xs text-ios-gray mt-1 uppercase tracking-wide">
                    {(t.muscleGroups as any)[progression.muscleGroup] || progression.muscleGroup}
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <div>
                      <p className="text-xs text-ios-gray mb-1">{t.labels.maxWeight || 'Max weight'}</p>
                      <p className="text-xl font-bold text-ios-text">
                        {progression.weight}
                        <span className="text-sm font-normal text-ios-gray ml-1">kg</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-ios-gray mb-1">{t.labels.maxReps || 'Max reps'}</p>
                      <p className="text-xl font-bold text-ios-text">
                        {progression.reps}
                        <span className="text-sm font-normal text-ios-gray ml-1">rep{progression.reps !== 1 ? 's' : ''}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Badge */}
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap">
                    {t.labels.ago || 'ago'} {progression.progressionText}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {recentProgressions.length > 0 && (
        <div className="pt-6 border-t border-ios-separator mt-8">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-ios-bg rounded-xl p-4 text-center">
              <p className="text-xs text-ios-gray uppercase tracking-wide mb-2">{t.labels.totalExercises || 'Total Exercises'}</p>
              <p className="text-2xl font-bold text-ios-text">{exercises.length}</p>
            </div>
            <div className="bg-ios-bg rounded-xl p-4 text-center">
              <p className="text-xs text-ios-gray uppercase tracking-wide mb-2">{t.labels.withProgress || 'With Progress'}</p>
              <p className="text-2xl font-bold text-ios-blue">{recentProgressions.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

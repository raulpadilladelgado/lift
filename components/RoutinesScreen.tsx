import React, { useState, useMemo } from 'react';
import { Plus, ChevronRight, Pencil, Trash2, Check, X } from 'lucide-react';
import { Exercise, Routine } from '../types';
import { t, translations } from '../utils/translations';
import { getLatestLog } from '../utils/progression';

interface Props {
  routines: Routine[];
  exercises: Exercise[];
  onSaveRoutine: (routine: Routine) => void;
  onDeleteRoutine: (id: string) => void;
  onLogExercise: (exerciseId: string, weight: number, reps: number) => void;
}

type ModalMode = 'create' | 'edit';

interface LogFormState {
  weight: string;
  reps: string;
}

export const RoutinesScreen: React.FC<Props> = ({
  routines,
  exercises,
  onSaveRoutine,
  onDeleteRoutine,
  onLogExercise,
}) => {
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  const [formName, setFormName] = useState('');
  const [formSelectedIds, setFormSelectedIds] = useState<string[]>([]);

  const [logForms, setLogForms] = useState<Record<string, LogFormState>>({});

  const getTranslatedGroupName = (group: string) => {
    return (translations.es.muscleGroups as Record<string, string>)[group]
      ? (t.muscleGroups as Record<string, string>)[group]
      : group;
  };

  const activeRoutine = useMemo(
    () => routines.find((r) => r.id === activeRoutineId) ?? null,
    [routines, activeRoutineId]
  );

  const activeRoutineExercises = useMemo(() => {
    if (!activeRoutine) return [];
    return activeRoutine.exerciseIds
      .map((id) => exercises.find((e) => e.id === id))
      .filter((e): e is Exercise => e !== undefined);
  }, [activeRoutine, exercises]);

  const openCreate = () => {
    setFormName('');
    setFormSelectedIds([]);
    setEditingRoutine(null);
    setModalMode('create');
  };

  const openEdit = (routine: Routine, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormName(routine.name);
    setFormSelectedIds([...routine.exerciseIds]);
    setEditingRoutine(routine);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingRoutine(null);
  };

  const toggleExercise = (id: string) => {
    setFormSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const name = formName.trim();
    if (!name) return;
    const routine: Routine = {
      id: editingRoutine?.id ?? Date.now().toString(),
      name,
      exerciseIds: formSelectedIds,
    };
    onSaveRoutine(routine);
    closeModal();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(t.prompts.confirmDelete)) return;
    onDeleteRoutine(id);
    if (activeRoutineId === id) setActiveRoutineId(null);
  };

  const getLogForm = (exerciseId: string): LogFormState => {
    if (logForms[exerciseId]) return logForms[exerciseId];
    const latest = getLatestLog(exercises.find((e) => e.id === exerciseId)?.logs ?? []);
    return {
      weight: latest ? latest.weight.toString() : '',
      reps: latest ? latest.reps.toString() : '',
    };
  };

  const updateLogForm = (exerciseId: string, field: keyof LogFormState, value: string) => {
    setLogForms((prev) => ({
      ...prev,
      [exerciseId]: { ...getLogForm(exerciseId), [field]: value },
    }));
  };

  const handleLog = (exerciseId: string) => {
    const form = getLogForm(exerciseId);
    const weight = parseFloat(form.weight);
    const reps = parseInt(form.reps, 10);
    if (Number.isNaN(weight) || Number.isNaN(reps)) return;
    onLogExercise(exerciseId, weight, reps);
  };

  if (activeRoutine) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setActiveRoutineId(null)}
            className="text-ios-blue font-semibold text-sm active:opacity-70"
          >
            ← {t.labels.routines}
          </button>
          <h1 className="text-xl font-bold text-ios-text truncate max-w-[60%] text-center">
            {activeRoutine.name}
          </h1>
          <div className="w-16" />
        </div>

        {activeRoutineExercises.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <p className="text-ios-text font-medium">{t.labels.noExercises}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeRoutineExercises.map((exercise) => {
              const form = getLogForm(exercise.id);
              const latest = getLatestLog(exercise.logs);
              return (
                <div key={exercise.id} className="bg-ios-card rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-ios-text">{exercise.name}</h3>
                      <p className="text-xs text-ios-gray uppercase tracking-wide mt-0.5">
                        {getTranslatedGroupName(exercise.muscleGroup)}
                      </p>
                    </div>
                    {latest && (
                      <div className="text-right text-xs text-ios-gray">
                        <p>{latest.weight} kg</p>
                        <p>{latest.reps} reps</p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-ios-gray mb-1">
                        {t.labels.weightShort}
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={form.weight}
                        onChange={(e) => updateLogForm(exercise.id, 'weight', e.target.value)}
                        className="w-full bg-ios-bg text-ios-text p-2 rounded-lg border-none outline-none focus:ring-2 focus:ring-ios-blue text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ios-gray mb-1">
                        {t.labels.reps}
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={form.reps}
                        onChange={(e) => updateLogForm(exercise.id, 'reps', e.target.value)}
                        className="w-full bg-ios-bg text-ios-text p-2 rounded-lg border-none outline-none focus:ring-2 focus:ring-ios-blue text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => handleLog(exercise.id)}
                        className="w-full py-2 rounded-lg bg-ios-blue text-white text-sm font-semibold active:opacity-80"
                      >
                        {t.actions.log}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-ios-text">{t.labels.routines}</h1>
        <p className="text-sm text-ios-gray mt-2">{t.labels.routinesDesc}</p>
      </div>

      {routines.length === 0 ? (
        <div className="text-center py-20 opacity-50">
          <p className="text-ios-text font-medium">{t.labels.noRoutines}</p>
          <p className="text-sm text-ios-gray mt-2">{t.labels.noRoutinesDesc}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="relative bg-ios-card rounded-2xl p-4"
            >
              {/* Tap area to open detail — covers full card except action buttons */}
              <button
                onClick={() => setActiveRoutineId(routine.id)}
                className="absolute inset-0 w-full h-full rounded-2xl active:opacity-70 transition-opacity"
                aria-label={routine.name}
              />
              <div className="flex items-center justify-between relative pointer-events-none">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-ios-text truncate">{routine.name}</h3>
                  <p className="text-xs text-ios-gray mt-1">
                    {routine.exerciseIds.length} {t.labels.exercises}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3 pointer-events-auto">
                  <button
                    onClick={(e) => openEdit(routine, e)}
                    className="p-2 rounded-lg text-ios-gray active:opacity-70"
                    aria-label={t.actions.edit}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(routine.id, e)}
                    className="p-2 rounded-lg text-red-500 active:opacity-70"
                    aria-label={t.actions.delete}
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={18} className="text-ios-gray" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={openCreate}
        className="fixed bottom-24 right-6 w-14 h-14 bg-ios-blue text-white rounded-full shadow-lg flex items-center justify-center active:opacity-80 z-20"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}
        aria-label={t.labels.newRoutine}
      >
        <Plus size={28} />
      </button>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="bg-ios-card w-full max-w-md rounded-t-3xl p-6 shadow-2xl"
            style={{ maxHeight: '85vh', overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-ios-text">
                {modalMode === 'create' ? t.labels.newRoutine : t.labels.editRoutine}
              </h2>
              <button onClick={closeModal} className="text-ios-gray active:opacity-70">
                <X size={22} />
              </button>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-medium text-ios-gray mb-2 uppercase tracking-wide">
                {t.labels.routineName}
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t.labels.routineName}
                className="w-full bg-ios-bg text-ios-text p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-ios-blue"
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-medium text-ios-gray mb-2 uppercase tracking-wide">
                {t.labels.selectExercises}
              </label>
              {exercises.length === 0 ? (
                <p className="text-ios-gray text-sm text-center py-4">{t.labels.noExercisesAvailable}</p>
              ) : (
                <div className="space-y-2">
                  {exercises
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((exercise) => {
                      const selected = formSelectedIds.includes(exercise.id);
                      return (
                        <button
                          key={exercise.id}
                          onClick={() => toggleExercise(exercise.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors active:opacity-70 ${
                            selected
                              ? 'bg-ios-blue/10 border border-ios-blue/40'
                              : 'bg-ios-bg border border-transparent'
                          }`}
                        >
                          <div className="text-left">
                            <p className="text-sm font-semibold text-ios-text">{exercise.name}</p>
                            <p className="text-xs text-ios-gray mt-0.5">
                              {getTranslatedGroupName(exercise.muscleGroup)}
                            </p>
                          </div>
                          {selected && <Check size={18} className="text-ios-blue flex-shrink-0" />}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={!formName.trim()}
              className="w-full py-3 rounded-xl bg-ios-blue text-white font-semibold text-base active:opacity-80 disabled:opacity-40"
            >
              {t.actions.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

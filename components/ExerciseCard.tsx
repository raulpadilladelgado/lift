import React, { useState, useRef } from 'react';
import { Exercise } from '../types';
import { calculateProgression, getCurrentMax } from '../utils/progression';
import { Trash2, Pencil } from 'lucide-react';
import { t } from '../utils/translations';

interface Props {
  exercise: Exercise;
  onLog: (weight: number, reps: number) => void;
  onDelete: () => void;
  onRename: () => void;
}

export const ExerciseCard: React.FC<Props> = ({ exercise, onLog, onDelete, onRename }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentMax = getCurrentMax(exercise.logs);
  const progression = calculateProgression(exercise.logs);

  // Form State
  const [weight, setWeight] = useState<string>('');
  const [reps, setReps] = useState<string>('');

  // Swipe State
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef<number>(0);
  const startTranslate = useRef<number>(0);

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent swipe if interacting with inputs
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    
    startX.current = e.touches[0].clientX;
    startTranslate.current = translateX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    
    // Calculate new position
    let newX = startTranslate.current + diff;
    
    // Clamp values
    // Left swipe (Delete): up to -80
    // Right swipe (Rename): up to 80
    if (newX < -80) newX = -80;
    if (newX > 80) newX = 80;

    setTranslateX(newX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Threshold to snap open/close
    if (translateX < -40) {
      setTranslateX(-80); // Snap Delete
    } else if (translateX > 40) {
      setTranslateX(80); // Snap Rename
    } else {
      setTranslateX(0); // Snap Closed
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t.prompts.deleteExercise.replace('{name}', exercise.name))) {
        onDelete();
        setTranslateX(0);
    } else {
        setTranslateX(0); 
    }
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRename();
    setTranslateX(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !reps) return;
    onLog(parseFloat(weight), parseInt(reps, 10));
    setWeight('');
    setReps('');
    setIsExpanded(false);
  };

  return (
    <div className="relative mb-4 rounded-2xl bg-ios-bg overflow-hidden select-none">
      
      {/* Background Actions Layer */}
      <div className="absolute inset-0 flex justify-between">
         {/* Left Action (Rename) - Revealed when swiping RIGHT */}
         <div className="bg-blue-500 w-[80px] flex items-center justify-center">
            <button 
                onClick={handleRenameClick}
                className="w-full h-full flex items-center justify-center text-white active:bg-blue-600 transition-colors"
                aria-label={t.actions.rename}
            >
                <Pencil size={24} />
            </button>
         </div>

         {/* Right Action (Delete) - Revealed when swiping LEFT */}
         <div className="bg-red-500 w-[80px] flex items-center justify-center">
            <button 
                onClick={handleDeleteClick}
                className="w-full h-full flex items-center justify-center text-white active:bg-red-600 transition-colors"
                aria-label={t.actions.delete}
            >
                <Trash2 size={24} />
            </button>
         </div>
      </div>

      {/* Foreground Card */}
      <div 
        className={`bg-ios-card relative z-10 p-4 transition-transform ${isDragging ? '' : 'duration-300 ease-out'} touch-pan-y`}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => {
                if (translateX === 0) setIsExpanded(!isExpanded);
                else setTranslateX(0); // Tap to close swipe
            }}
        >
            <div className="flex-1">
            <h3 className="text-lg font-semibold text-ios-text">{exercise.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
                {currentMax ? (
                <span className="text-2xl font-bold tracking-tight text-ios-text">
                    {currentMax.weight}<span className="text-sm font-normal text-ios-gray ml-0.5">kg</span>
                    <span className="text-gray-300 dark:text-gray-600 mx-2">/</span>
                    {currentMax.reps}<span className="text-sm font-normal text-ios-gray ml-0.5">{t.labels.reps.toLowerCase()}</span>
                </span>
                ) : (
                <span className="text-ios-gray text-sm">{t.labels.noLogs}</span>
                )}
            </div>
            </div>
            
            {progression && (
            <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-ios-gray tracking-wider mb-0.5">{t.labels.progress}</span>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-lg text-xs font-medium">
                {t.labels.ago} {progression}
                </div>
            </div>
            )}
        </div>

        {isExpanded && (
            <div className="mt-6 pt-4 border-t border-ios-separator animate-fadeIn" onTouchStart={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="flex-1">
                <label className="block text-xs font-medium text-ios-gray mb-1 ml-1">{t.labels.weight}</label>
                <input
                    type="number"
                    inputMode="decimal"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder={currentMax?.weight.toString() || "0"}
                    className="w-full bg-ios-bg text-ios-text text-lg p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-ios-blue"
                />
                </div>
                <div className="flex-1">
                <label className="block text-xs font-medium text-ios-gray mb-1 ml-1">{t.labels.reps}</label>
                <input
                    type="number"
                    inputMode="numeric"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    placeholder={currentMax?.reps.toString() || "0"}
                    className="w-full bg-ios-bg text-ios-text text-lg p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-ios-blue"
                />
                </div>
                <div className="flex items-end">
                <button
                    type="submit"
                    className="bg-ios-blue text-white font-semibold h-[52px] px-6 rounded-xl active:opacity-80 transition-opacity"
                >
                    {t.actions.log}
                </button>
                </div>
            </form>
            </div>
        )}
      </div>
    </div>
  );
};
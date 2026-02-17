import React, { useState, useRef } from 'react';
import { Trash2, ChevronRight, Pencil } from 'lucide-react';
import { t, translations } from '../utils/translations';

interface Props {
  group: string;
  count: number;
  onClick: () => void;
  onDelete: () => void;
  onRename: () => void;
}

const SWIPE_ACTIVATION_THRESHOLD = 30;

export const MuscleGroupCard: React.FC<Props> = ({ group, count, onClick, onDelete, onRename }) => {
  // Swipe State
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const startTranslate = useRef<number>(0);

  // Try to find translation for group, otherwise show as is
  const displayName = (translations.es.muscleGroups as any)[group] 
    ? (t.muscleGroups as any)[group] 
    : group;

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    startTranslate.current = translateX;
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diff = currentX - startX.current;
    const diffY = currentY - startY.current;

    if (!isDragging) {
      if (Math.abs(diff) < SWIPE_ACTIVATION_THRESHOLD || Math.abs(diff) < Math.abs(diffY)) {
        return;
      }
      setIsDragging(true);
    }
    
    // Calculate new position
    let newX = startTranslate.current + diff;
    
    // Clamp values
    if (newX < -80) newX = -80; // Left (Delete)
    if (newX > 80) newX = 80;   // Right (Rename)

    setTranslateX(newX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Snap
    if (translateX < -40) {
      setTranslateX(-80); // Snap Delete
    } else if (translateX > 40) {
      setTranslateX(80);  // Snap Rename
    } else {
      setTranslateX(0);   // Snap Close
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t.prompts.deleteGroup.replace('{name}', displayName))) {
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

  const handleCardClick = () => {
    if (translateX !== 0) {
      // If open, close it
      setTranslateX(0);
    } else {
      // If closed, navigate
      onClick();
    }
  };

  return (
    <div className="relative rounded-2xl bg-ios-bg overflow-hidden select-none">
      
      {/* Background Actions Layer */}
      <div className="absolute inset-0 flex justify-between">
         {/* Left Action (Rename) - Revealed when swiping RIGHT */}
         <div className="bg-blue-500 w-[80px] flex items-center justify-center">
            <button 
                onClick={handleRenameClick}
                className="w-full h-full flex items-center justify-center text-white active:bg-blue-600 transition-colors"
            >
                <Pencil size={24} />
            </button>
         </div>

         {/* Right Action (Delete) - Revealed when swiping LEFT */}
         <div className="bg-red-500 w-[80px] flex items-center justify-center">
            <button 
                onClick={handleDeleteClick}
                className="w-full h-full flex items-center justify-center text-white active:bg-red-600 transition-colors"
            >
                <Trash2 size={24} />
            </button>
         </div>
      </div>

      {/* Foreground Card */}
      <div 
        className={`bg-ios-card relative z-10 p-4 transition-transform ${isDragging ? '' : 'duration-300 ease-out'} touch-pan-y flex justify-between items-center active:bg-gray-50 dark:active:bg-gray-800`}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
      >
        <div className="flex items-center gap-4">
            <div className="bg-ios-bg w-10 h-10 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-ios-blue">
                {displayName.charAt(0).toUpperCase()}
                </span>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-ios-text">{displayName}</h3>
                <p className="text-xs text-ios-gray">
                {count} {t.labels.exercises}
                </p>
            </div>
        </div>
        <ChevronRight className="text-ios-gray/50" size={20} />
      </div>
    </div>
  );
};

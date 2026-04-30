import React, { useState } from 'react';
import {Hourglass, Pause, Play, Plus, RotateCcw, Square, ChevronDown, ChevronUp} from 'lucide-react';
import {useRestTimer} from '../hooks/useRestTimer';
import {useTranslations} from '../utils/translations';
import {Button} from './ui/Button';
import {cn} from '../utils/cn';

export const RestTimer: React.FC = () => {
  const { remainingTime, isActive, stopTimer, resetTimer, startTimer, addTime, isMinimized, setMinimized, duration } = useRestTimer();
  const t = useTranslations();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  const displayTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const durationMinutes = Math.floor(duration / 60);
  const durationSeconds = duration % 60;
  const displayDuration = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;

  if (isMinimized) {
    return (
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] left-6 z-40 animate-in fade-in zoom-in duration-300 pointer-events-none">
        <Button
          variant="primary"
          onClick={() => setMinimized(false)}
          className="h-14 w-14 rounded-full shadow-[0_0_20px_rgba(205,255,0,0.3)] border-2 border-app-accent pointer-events-auto flex items-center justify-center p-0"
        >
          <div className="relative">
            <Hourglass className={cn("w-7 h-7", isActive && "animate-pulse")} />
            {remainingTime > 0 && (
              <span className="absolute -top-3 -right-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-app-danger px-1.5 text-[10px] font-black text-white border-2 border-app-bg">
                {remainingTime}
              </span>
            )}
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-[calc(env(safe-area-inset-bottom)+5rem)] left-4 right-4 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none transition-all",
      isCollapsed ? "bottom-[calc(env(safe-area-inset-bottom)+4.5rem)]" : ""
    )}>
      <div className={cn(
        "mx-auto max-w-sm shadow-2xl border border-white/10 bg-app-surface/60 backdrop-blur-xl flex flex-col pointer-events-auto overflow-hidden rounded-[2.5rem] transition-all duration-300",
        isCollapsed ? "gap-0 p-3" : "gap-6 p-6"
      )}>
        <div className="flex flex-col items-center relative">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -top-2 right-0 p-2 text-app-text-muted active:text-app-accent transition-colors"
            aria-label={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          <div 
            className={cn(
              "flex flex-col items-center cursor-pointer active:opacity-70 transition-all",
              isCollapsed ? "flex-row gap-3" : "mt-2"
            )}
            onClick={() => setMinimized(true)}
            role="button"
            aria-label={t.actions.close}
          >
            <Hourglass className={cn(
              "transition-all",
              isCollapsed ? "w-5 h-5" : "w-8 h-8 mb-2",
              isActive ? "text-app-accent animate-spin [animation-duration:3s]" : "text-app-text-muted"
            )} />
            <span className={cn(
              "font-black tracking-tighter text-app-text font-mono leading-none transition-all",
              isCollapsed ? "text-2xl" : "text-6xl"
            )}>
              {remainingTime > 0 ? displayTime : displayDuration}
            </span>
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-center">
              {isActive ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-32 h-12 rounded-full shadow-lg font-black uppercase tracking-widest text-xs"
                  onClick={stopTimer}
                >
                  <Pause className="w-4 h-4 mr-1 fill-current" />
                  {t.labels.restPause}
                </Button>
              ) : remainingTime > 0 ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-32 h-12 rounded-full shadow-lg font-black uppercase tracking-widest text-xs"
                  onClick={() => startTimer(remainingTime)}
                >
                  <Play className="w-4 h-4 mr-1 fill-current" />
                  {t.labels.restResume}
                </Button>
              ) : (
                <div className="flex flex-wrap justify-center gap-2">
                  {[60, 90, 120, 180].map((s) => (
                    <Button
                      key={s}
                      variant={duration === s ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => startTimer(s)}
                      className={cn(
                        "h-9 px-4 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all",
                        duration === s ? "bg-app-accent text-app-accent-foreground" : "bg-app-surface/40 border-white/5"
                      )}
                    >
                      {s}s
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {remainingTime > 0 && (
              <div className="flex items-center justify-center gap-6">
                <Button
                  variant="secondary"
                  size="md"
                  className="h-14 w-14 rounded-full p-0 flex items-center justify-center bg-app-surface/40 border-white/5 shadow-sm active:scale-95"
                  onClick={() => addTime(30)}
                  aria-label="+30s"
                >
                  <span className="text-xs font-black">+30s</span>
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  className="h-14 w-14 rounded-full p-0 flex items-center justify-center bg-app-surface/40 border-white/5 shadow-sm active:scale-95"
                  onClick={resetTimer}
                  aria-label={t.actions.reset}
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>

                <Button
                  variant="destructive"
                  size="md"
                  className="h-14 w-14 rounded-full p-0 flex items-center justify-center shadow-lg active:scale-95"
                  onClick={() => startTimer(0)}
                  aria-label={t.labels.restStop}
                >
                  <Square className="w-5 h-5 fill-current" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

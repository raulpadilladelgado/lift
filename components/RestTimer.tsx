import React from 'react';
import {Hourglass, Pause, Play, Plus, RotateCcw, Square} from 'lucide-react';
import {useRestTimer} from '../hooks/useRestTimer';
import {useTranslations} from '../utils/translations';
import {Surface} from './ui/Surface';
import {Button} from './ui/Button';
import {cn} from '../utils/cn';

export const RestTimer: React.FC = () => {
  const { remainingTime, isActive, stopTimer, resetTimer, startTimer, addTime, isMinimized, setMinimized, duration } = useRestTimer();
  const t = useTranslations();

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  const displayTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const durationMinutes = Math.floor(duration / 60);
  const durationSeconds = duration % 60;
  const displayDuration = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;

  if (isMinimized) {
    return (
      <div className="fixed bottom-28 left-6 z-40 animate-in fade-in zoom-in duration-300 pointer-events-none">
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
    <div className="fixed bottom-28 left-4 right-4 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none">
      <Surface className="mx-auto max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-app-accent/30 flex flex-col gap-6 pointer-events-auto overflow-hidden p-6 rounded-3xl">
        <div className="flex flex-col items-center gap-2">
          <div 
            className="flex flex-col items-center cursor-pointer active:opacity-70 transition-opacity"
            onClick={() => setMinimized(true)}
            role="button"
            aria-label={t.actions.close}
          >
            <Hourglass className={cn("w-8 h-8 mb-2", isActive ? "text-app-accent animate-spin [animation-duration:3s]" : "text-app-text-muted")} />
            <span className="text-6xl font-black tracking-tighter text-app-text font-mono">
              {remainingTime > 0 ? displayTime : displayDuration}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
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
                    className="h-10 px-4 rounded-full font-bold"
                  >
                    {s}s
                  </Button>
                ))}
              </div>
            )}
          </div>

          {remainingTime > 0 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="md"
                className="h-14 w-14 rounded-full p-0 flex items-center justify-center"
                onClick={() => addTime(30)}
                aria-label="+30s"
              >
                <span className="text-xs font-black">+30s</span>
              </Button>

              <Button
                variant="secondary"
                size="md"
                className="h-14 w-14 rounded-full p-0 flex items-center justify-center"
                onClick={resetTimer}
                aria-label={t.actions.reset}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>

              <Button
                variant="destructive"
                size="md"
                className="h-14 w-14 rounded-full p-0 flex items-center justify-center"
                onClick={() => startTimer(0)}
                aria-label={t.labels.restStop}
              >
                <Square className="w-5 h-5 fill-current" />
              </Button>
            </div>
          )}
        </div>
      </Surface>
    </div>
  );
};

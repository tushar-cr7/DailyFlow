import React, { useState, useEffect } from 'react';
import type { Task } from '../../shared/types/task';

interface FocusModeModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteTask: (taskId: string) => Promise<void>;
  onLogFocusSession: (taskId: string | null, durationSeconds: number) => Promise<void>;
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  task,
  isOpen,
  onClose,
  onCompleteTask,
  onLogFocusSession,
}) => {
  const [initialMinutes, setInitialMinutes] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(initialMinutes * 60);
      setIsRunning(false);
      setSessionCompleted(false);
    }
  }, [isOpen, initialMinutes, task]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      setSessionCompleted(true);
      void onLogFocusSession(task ? task.id : null, initialMinutes * 60);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, initialMinutes, task, onLogFocusSession]);

  if (!isOpen || !task) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalSeconds = initialMinutes * 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const handleSelectMinutes = (mins: number) => {
    if (isRunning) return;
    setInitialMinutes(mins);
    setTimeLeft(mins * 60);
    setSessionCompleted(false);
  };

  const handleCompleteAndExit = async () => {
    const elapsed = initialMinutes * 60 - timeLeft;
    if (elapsed >= 60 && !sessionCompleted) {
      await onLogFocusSession(task.id, elapsed);
    }
    await onCompleteTask(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 animate-card-enter">
      <div className="w-full max-w-xl obsidian-card border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative accent-glow-indigo">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800/80 transition-colors"
          title="Exit Focus Mode"
        >
          ✕
        </button>

        {/* Header Task Context */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/15 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
          <span>🎯</span> Focus Sanctuary
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 max-w-md tracking-tight">
          {task.title}
        </h1>

        {task.description && (
          <p className="text-xs text-slate-400 mb-6 max-w-lg line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Timer Duration Presets */}
        <div className="flex items-center gap-2 mb-6">
          {[15, 25, 45, 60].map((mins) => (
            <button
              key={mins}
              type="button"
              disabled={isRunning}
              onClick={() => handleSelectMinutes(mins)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                initialMinutes === mins
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-white/5'
              } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {mins} Mins
            </button>
          ))}
        </div>

        {/* Circular SVG Timer Display */}
        <div className="relative my-4 flex items-center justify-center">
          <svg className="w-64 h-64 transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              className="stroke-slate-800"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              className="stroke-indigo-500 transition-all duration-500 ease-linear"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black font-mono tracking-tight text-white drop-shadow-md">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[11px] text-indigo-300 uppercase tracking-widest mt-1 font-bold">
              {isRunning ? 'Focus Active' : sessionCompleted ? 'Session Complete!' : 'Ready'}
            </span>
          </div>
        </div>

        {sessionCompleted && (
          <div className="mb-4 text-amber-400 text-sm font-bold animate-bounce flex items-center gap-1.5">
            <span>✨</span> Focus session complete! +15 XP earned!
          </div>
        )}

        {/* Timer Controls */}
        <div className="flex items-center gap-4 mt-4">
          {!isRunning ? (
            <button
              type="button"
              onClick={() => setIsRunning(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 text-sm active:scale-95"
            >
              <span>▶️</span> {timeLeft < initialMinutes * 60 ? 'Resume Session' : 'Start Session'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsRunning(false)}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-600/25 transition-all flex items-center gap-2 text-sm active:scale-95"
            >
              <span>⏸️</span> Pause
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(initialMinutes * 60);
              setSessionCompleted(false);
            }}
            className="px-4 py-3 bg-slate-800/90 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-white/10 transition-colors text-sm"
          >
            Reset
          </button>
        </div>

        {/* Bottom Bar Action */}
        <div className="mt-8 pt-5 border-t border-white/10 w-full flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Minimize & Return
          </button>

          <button
            type="button"
            onClick={handleCompleteAndExit}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span>✓</span> Complete Task & Exit
          </button>
        </div>
      </div>
    </div>
  );
};

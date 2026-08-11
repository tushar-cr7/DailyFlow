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
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      setSessionCompleted(true);
      // Automatically log completed session
      onLogFocusSession(task ? task.id : null, initialMinutes * 60);
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

  const progressPercent = Math.round(
    ((initialMinutes * 60 - timeLeft) / (initialMinutes * 60)) * 100,
  );

  const handleSelectMinutes = (mins: number) => {
    if (isRunning) return;
    setInitialMinutes(mins);
    setTimeLeft(mins * 60);
    setSessionCompleted(false);
  };

  const handleCompleteAndExit = async () => {
    // If timer was running and had significant duration, log elapsed time if > 60 seconds
    const elapsed = initialMinutes * 60 - timeLeft;
    if (elapsed >= 60 && !sessionCompleted) {
      await onLogFocusSession(task.id, elapsed);
    }
    await onCompleteTask(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
          title="Exit Focus Mode"
        >
          ✕
        </button>

        {/* Header Task Context */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <span>🎯</span> Active Focus Task
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 max-w-md">
          {task.title}
        </h1>

        {task.description && (
          <p className="text-sm text-slate-400 mb-6 max-w-lg line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Timer Duration Presets */}
        <div className="flex items-center gap-2 mb-6">
          {[15, 25, 45].map((mins) => (
            <button
              key={mins}
              disabled={isRunning}
              onClick={() => handleSelectMinutes(mins)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                initialMinutes === mins
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {mins} Mins
            </button>
          ))}
        </div>

        {/* Timer Display Circle */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-64 h-64 rounded-full border-8 border-slate-800 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
            {/* Simple progress ring background fill */}
            <div
              className="absolute bottom-0 w-full bg-indigo-500/10 transition-all duration-1000"
              style={{ height: `${progressPercent}%` }}
            />
            <span className="text-5xl font-black font-mono tracking-tight text-white z-10">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-widest mt-1 z-10 font-semibold">
              {isRunning ? 'Session Active' : sessionCompleted ? 'Session Complete!' : 'Ready'}
            </span>
          </div>
        </div>

        {sessionCompleted && (
          <div className="mb-4 text-emerald-400 text-sm font-semibold animate-bounce">
            🎉 Focus session completed! +15 XP earned!
          </div>
        )}

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-4 mt-4">
          {!isRunning ? (
            <button
              onClick={() => setIsRunning(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm"
            >
              <span>▶️</span> {timeLeft < initialMinutes * 60 ? 'Resume' : 'Start Focus'}
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(false)}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm"
            >
              <span>⏸️</span> Pause
            </button>
          )}

          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(initialMinutes * 60);
              setSessionCompleted(false);
            }}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition-colors text-sm"
          >
            Reset
          </button>
        </div>

        {/* Task Completion CTA */}
        <div className="mt-8 pt-6 border-t border-slate-800 w-full flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Minimize & Return
          </button>

          <button
            onClick={handleCompleteAndExit}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
          >
            <span>✓</span> Complete Task & Exit
          </button>
        </div>
      </div>
    </div>
  );
};

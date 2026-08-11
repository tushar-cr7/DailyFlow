import React from 'react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSummary: () => void;
  streakCount: number;
  xpEarnedToday: number;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  onOpenSummary,
  streakCount,
  xpEarnedToday,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/40 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
        {/* CSS Sparkle/Confetti Effect Container */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute -top-10 left-1/4 w-32 h-32 bg-amber-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 right-10 w-24 h-24 bg-indigo-500 rounded-full blur-2xl animate-pulse" />
        </div>

        {/* Badge Icon */}
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full flex items-center justify-center text-4xl shadow-lg transform hover:scale-105 transition-transform">
          🏆
        </div>

        <h2 className="text-2xl font-black text-white mb-1">Perfect Day Achieved!</h2>
        <p className="text-sm text-indigo-200 mb-6">
          You've completed every single task scheduled for today!
        </p>

        {/* Stats Highlight Card */}
        <div className="grid grid-cols-2 gap-3 py-3 px-4 bg-slate-800/80 rounded-xl border border-slate-700/60 mb-6">
          <div>
            <div className="text-xs text-slate-400">Streak Maintained</div>
            <div className="text-lg font-bold text-amber-400">🔥 {streakCount} Days</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">XP Gained Today</div>
            <div className="text-lg font-bold text-emerald-400">+{xpEarnedToday} XP</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenSummary();
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
          >
            <span>📝</span> Write Reflection
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

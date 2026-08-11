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
    <div className="fixed inset-0 z-50 flex items-center justify-center glass-modal p-4 animate-card-enter">
      <div className="w-full max-w-md obsidian-card border-amber-500/30 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden accent-glow-amber">
        {/* CSS Glow Container */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute -top-10 left-1/4 w-32 h-32 bg-amber-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 right-10 w-24 h-24 bg-indigo-500 rounded-full blur-2xl animate-pulse" />
        </div>

        {/* Badge Icon */}
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-2xl flex items-center justify-center text-4xl shadow-lg transform hover:scale-105 transition-transform border border-amber-200/40">
          🏆
        </div>

        <h2 className="text-2xl font-black text-white mb-1">Perfect Day Achieved!</h2>
        <p className="text-xs text-indigo-200 mb-6">
          You've completed every single task scheduled for today! Outstanding focus!
        </p>

        {/* Stats Highlight Card */}
        <div className="grid grid-cols-2 gap-3 py-3 px-4 bg-slate-950/80 rounded-2xl border border-white/10 mb-6">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Streak Maintained</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">🔥 {streakCount} Days</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">XP Gained Today</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">+{xpEarnedToday} XP</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSummary();
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>📝</span> Write Reflection
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

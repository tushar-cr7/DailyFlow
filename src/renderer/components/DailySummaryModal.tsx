import React, { useState, useEffect } from 'react';
import type { DailySummary } from '../../shared/types/dailyExperience';

interface DailySummaryModalProps {
  summary: DailySummary | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveReflection: (reflection: string) => Promise<void>;
}

export const DailySummaryModal: React.FC<DailySummaryModalProps> = ({
  summary,
  isOpen,
  onClose,
  onSaveReflection,
}) => {
  const [reflectionText, setReflectionText] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (summary) {
      setReflectionText(summary.reflection || '');
      setSavedSuccess(false);
    }
  }, [summary]);

  if (!isOpen || !summary) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await onSaveReflection(reflectionText);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const percentage =
    summary.totalScheduled > 0
      ? Math.round((summary.completedCount / summary.totalScheduled) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center glass-modal p-4 animate-card-enter">
      <div className="w-full max-w-lg obsidian-card border-white/10 rounded-3xl p-6 shadow-2xl relative accent-glow-indigo">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition-colors"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
          <span>🌙</span> End of Day Review
        </div>

        <h2 className="text-xl font-extrabold text-white mb-4 tracking-tight">
          Daily Summary & Reflection ({summary.date})
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Task Completion</div>
            <div className="text-base font-bold text-white mt-0.5">
              {summary.completedCount} / {summary.totalScheduled}{' '}
              <span className="text-xs text-slate-400 font-normal">({percentage}%)</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Focus Time</div>
            <div className="text-base font-bold text-sky-400 mt-0.5">
              {summary.totalFocusMinutes} mins
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">XP Earned Today</div>
            <div className="text-base font-bold text-amber-400 mt-0.5">+{summary.xpEarned} XP</div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Perfect Day Status</div>
            <div className="text-base font-bold mt-0.5">
              {summary.isPerfectDay ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span>✨</span> Achieved
                </span>
              ) : (
                <span className="text-slate-400 font-normal text-xs">In Progress</span>
              )}
            </div>
          </div>
        </div>

        {/* Reflection Input */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Daily Reflection Note
          </label>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="What went well today? What will you improve tomorrow?"
            rows={4}
            className="w-full bg-slate-950 text-slate-200 text-xs rounded-2xl p-3.5 border border-white/10 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between">
          {savedSuccess ? (
            <span className="text-xs text-emerald-400 font-semibold">✓ Reflection saved!</span>
          ) : (
            <span className="text-xs text-slate-400">Notes are saved locally in SQLite</span>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              {isSaving ? 'Saving...' : 'Save Reflection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

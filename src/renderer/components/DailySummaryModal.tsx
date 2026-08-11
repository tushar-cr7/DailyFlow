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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
          <span>🌙</span> End of Day Review
        </div>

        <h2 className="text-xl font-bold text-white mb-4">
          Daily Summary & Reflection ({summary.date})
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400 mb-1">Task Completion</div>
            <div className="text-lg font-bold text-white">
              {summary.completedCount} / {summary.totalScheduled}{' '}
              <span className="text-xs text-slate-400 font-normal">({percentage}%)</span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400 mb-1">Total Focus Time</div>
            <div className="text-lg font-bold text-sky-400">
              {summary.totalFocusMinutes} minutes
            </div>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400 mb-1">XP Earned Today</div>
            <div className="text-lg font-bold text-amber-400">+{summary.xpEarned} XP</div>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400 mb-1">Perfect Day Status</div>
            <div className="text-lg font-bold">
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
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Daily Reflection Note
          </label>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="What went well today? What will you improve tomorrow?"
            rows={4}
            className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
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
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
            >
              {isSaving ? 'Saving...' : 'Save Reflection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export type ActiveView = 'today' | 'upcoming' | 'overdue';

interface ViewTabsProps {
  activeView: ActiveView;
  overdueCount: number;
  onViewChange: (view: ActiveView) => void;
}

export function ViewTabs({ activeView, overdueCount, onViewChange }: ViewTabsProps) {
  return (
    <div className="flex items-center rounded-xl bg-slate-900/80 p-1.5 border border-slate-800 shadow-inner">
      <button
        type="button"
        onClick={() => onViewChange('today')}
        className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
          activeView === 'today'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
      >
        <span>📅 Today / Date</span>
      </button>

      <button
        type="button"
        onClick={() => onViewChange('upcoming')}
        className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
          activeView === 'upcoming'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
      >
        <span>🚀 Upcoming (7 Days)</span>
      </button>

      <button
        type="button"
        onClick={() => onViewChange('overdue')}
        className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
          activeView === 'overdue'
            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
      >
        <span>⚠️ Overdue</span>
        {overdueCount > 0 && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeView === 'overdue' ? 'bg-white text-rose-700' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {overdueCount}
          </span>
        )}
      </button>
    </div>
  );
}

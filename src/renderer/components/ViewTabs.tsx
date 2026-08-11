export type ActiveView = 'today' | 'upcoming' | 'overdue' | 'analytics';

interface ViewTabsProps {
  activeView: ActiveView;
  overdueCount: number;
  onViewChange: (view: ActiveView) => void;
}

export function ViewTabs({ activeView, overdueCount, onViewChange }: ViewTabsProps) {
  return (
    <div className="flex items-center rounded-2xl bg-slate-950 p-1.5 border border-white/10 shadow-inner">
      <button
        type="button"
        onClick={() => onViewChange('today')}
        className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 ${
          activeView === 'today'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
        }`}
      >
        <span>📅 Today</span>
      </button>

      <button
        type="button"
        onClick={() => onViewChange('upcoming')}
        className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 ${
          activeView === 'upcoming'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
        }`}
      >
        <span>🚀 Upcoming</span>
      </button>

      <button
        type="button"
        onClick={() => onViewChange('overdue')}
        className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 ${
          activeView === 'overdue'
            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
        }`}
      >
        <span>⚠️ Overdue</span>
        {overdueCount > 0 && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
              activeView === 'overdue'
                ? 'bg-white text-rose-700'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {overdueCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onViewChange('analytics')}
        className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 ${
          activeView === 'analytics'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
        }`}
      >
        <span>📊 Analytics</span>
      </button>
    </div>
  );
}

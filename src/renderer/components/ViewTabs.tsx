export type ActiveView = 'today' | 'upcoming' | 'overdue';

interface ViewTabsProps {
  activeView: ActiveView;
  overdueCount: number;
  onViewChange: (view: ActiveView) => void;
}

export function ViewTabs({ activeView, overdueCount, onViewChange }: ViewTabsProps) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
      <button
        type="button"
        onClick={() => onViewChange('today')}
        className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
          activeView === 'today'
            ? 'border-indigo-600 bg-white text-indigo-600 shadow-sm'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
        }`}
      >
        Today / Selected Day
      </button>

      <button
        type="button"
        onClick={() => onViewChange('upcoming')}
        className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
          activeView === 'upcoming'
            ? 'border-indigo-600 bg-white text-indigo-600 shadow-sm'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
        }`}
      >
        Upcoming (Next 7 Days)
      </button>

      <button
        type="button"
        onClick={() => onViewChange('overdue')}
        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
          activeView === 'overdue'
            ? 'border-amber-600 bg-white text-amber-700 shadow-sm'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
        }`}
      >
        <span>Overdue</span>
        {overdueCount > 0 && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
            {overdueCount}
          </span>
        )}
      </button>
    </div>
  );
}

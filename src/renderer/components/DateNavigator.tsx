import { getTodayString, shiftDateString, formatDisplayDate } from '@shared/utils/date';

interface DateNavigatorProps {
  selectedDate: string;
  onDateChange: (newDate: string) => void;
}

export function DateNavigator({ selectedDate, onDateChange }: DateNavigatorProps) {
  const todayStr = getTodayString();
  const isToday = selectedDate === todayStr;

  return (
    <div className="glass-panel rounded-2xl p-4 shadow-xl flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onDateChange(shiftDateString(selectedDate, -1))}
          className="rounded-lg border border-slate-700/60 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all shadow-sm active:scale-95"
          title="Previous day"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={() => onDateChange(todayStr)}
          disabled={isToday}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shadow-sm ${
            isToday
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 cursor-default'
              : 'border border-slate-700/60 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white active:scale-95'
          }`}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onDateChange(shiftDateString(selectedDate, 1))}
          className="rounded-lg border border-slate-700/60 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all shadow-sm active:scale-95"
          title="Next day"
        >
          Next →
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-200 tracking-wide">
          {formatDisplayDate(selectedDate, todayStr)}
        </span>
        <input
          id="active-date-picker"
          type="date"
          aria-label="Select date"
          value={selectedDate}
          onChange={(e) => {
            if (e.target.value) {
              onDateChange(e.target.value);
            }
          }}
          className="rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}

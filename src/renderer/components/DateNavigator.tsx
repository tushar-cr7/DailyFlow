import { getTodayString, shiftDateString, formatDisplayDate } from '@shared/utils/date';

interface DateNavigatorProps {
  selectedDate: string;
  onDateChange: (newDate: string) => void;
}

export function DateNavigator({ selectedDate, onDateChange }: DateNavigatorProps) {
  const todayStr = getTodayString();
  const isToday = selectedDate === todayStr;

  return (
    <div className="glass-surface p-4 flex items-center justify-between flex-wrap gap-4 border-white/15">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onDateChange(shiftDateString(selectedDate, -1))}
          className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/20 hover:text-white transition-all shadow-sm active:scale-95 backdrop-blur-md"
          title="Previous day"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={() => onDateChange(todayStr)}
          disabled={isToday}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm ${
            isToday
              ? 'bg-white/25 text-white border border-white/30 cursor-default backdrop-blur-md font-extrabold'
              : 'border border-white/15 bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white active:scale-95 backdrop-blur-md'
          }`}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onDateChange(shiftDateString(selectedDate, 1))}
          className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/20 hover:text-white transition-all shadow-sm active:scale-95 backdrop-blur-md"
          title="Next day"
        >
          Next →
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-white tracking-wide">
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
          className="rounded-xl border border-white/15 bg-slate-950/60 px-3.5 py-1.5 text-xs font-medium text-slate-100 focus:border-white/40 focus:outline-none backdrop-blur-md cursor-pointer"
        />
      </div>
    </div>
  );
}

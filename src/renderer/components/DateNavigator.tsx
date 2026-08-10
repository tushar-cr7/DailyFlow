import { getTodayString, shiftDateString, formatDisplayDate } from '@shared/utils/date';

interface DateNavigatorProps {
  selectedDate: string;
  onDateChange: (newDate: string) => void;
}

export function DateNavigator({ selectedDate, onDateChange }: DateNavigatorProps) {
  const todayStr = getTodayString();
  const isToday = selectedDate === todayStr;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onDateChange(shiftDateString(selectedDate, -1))}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          title="Previous day"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={() => onDateChange(todayStr)}
          disabled={isToday}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
            isToday
              ? 'border-indigo-200 bg-indigo-50 text-indigo-700 cursor-default'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onDateChange(shiftDateString(selectedDate, 1))}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          title="Next day"
        >
          Next →
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-600">
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
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

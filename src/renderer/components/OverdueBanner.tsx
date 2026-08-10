interface OverdueBannerProps {
  overdueCount: number;
  onViewOverdue: () => void;
}

export function OverdueBanner({ overdueCount, onViewOverdue }: OverdueBannerProps) {
  if (overdueCount === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm text-amber-900">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-200 text-amber-800 text-xs font-bold">
          !
        </span>
        <div>
          <p className="text-xs font-semibold">
            You have {overdueCount} overdue scheduled task{overdueCount > 1 ? 's' : ''}!
          </p>
          <p className="text-[11px] text-amber-700">
            Scheduled tasks whose date or time has passed remain in overdue state until completed or rescheduled.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onViewOverdue}
        className="rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-800"
      >
        View Overdue Tasks
      </button>
    </div>
  );
}

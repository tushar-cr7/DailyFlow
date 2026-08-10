interface OverdueBannerProps {
  overdueCount: number;
  onViewOverdue: () => void;
}

export function OverdueBanner({ overdueCount, onViewOverdue }: OverdueBannerProps) {
  if (overdueCount === 0) return null;

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 backdrop-blur-md p-4 shadow-lg shadow-rose-950/20 flex items-center justify-between flex-wrap gap-3 animate-card-enter">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 font-bold text-sm border border-rose-500/30 animate-pulse-subtle">
          ⚠️
        </span>
        <div>
          <p className="text-xs font-bold text-rose-200">
            {overdueCount} Overdue Task{overdueCount > 1 ? 's' : ''} Require Attention!
          </p>
          <p className="text-[11px] text-rose-300/80">
            Scheduled tasks whose date or time has passed remain highlighted until completed or rescheduled.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onViewOverdue}
        className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-rose-600/30 hover:bg-rose-500 active:scale-95 transition-all"
      >
        Review Overdue Tasks →
      </button>
    </div>
  );
}

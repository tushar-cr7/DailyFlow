import React from 'react';
import type { DailyBriefing as DailyBriefingType, PaceStatus } from '../../shared/types/dailyExperience';

interface DailyBriefingProps {
  briefing: DailyBriefingType | null;
  onOpenSummary: () => void;
  userName?: string;
}

export const DailyBriefing: React.FC<DailyBriefingProps> = ({
  briefing,
  onOpenSummary,
  userName = 'Flow User',
}) => {
  if (!briefing) return null;

  // Determine dynamic time-of-day greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const getPaceBadge = (status: PaceStatus) => {
    switch (status) {
      case 'completed':
        return { text: 'DAY COMPLETE', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' };
      case 'ahead':
        return { text: 'AHEAD OF SCHEDULE', className: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40' };
      case 'on_track':
        return { text: 'ON TRACK', className: 'bg-sky-500/20 text-sky-200 border-sky-400/40' };
      case 'needs_momentum':
        return { text: 'NEEDS MOMENTUM', className: 'bg-amber-500/20 text-amber-200 border-amber-400/40' };
    }
  };

  const paceBadge = getPaceBadge(briefing.paceStatus);
  const dateObj = new Date();
  const dateFormatted = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-4 py-2 animate-card-enter">
      {/* Large Expressive Greeting & Hero Typography */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] px-3 py-0.5 rounded-full font-black tracking-widest border uppercase ${paceBadge.className}`}>
              {paceBadge.text}
            </span>
            <span className="text-xs text-slate-300 font-mono font-bold">{dateFormatted}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
            {timeGreeting}, {userName}
          </h1>

          <p className="text-xs text-slate-200 font-medium italic max-w-lg pt-1">
            "{briefing.quote}"
          </p>
        </div>

        {/* Dynamic Contextual Supporting Progress */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-2xl font-black text-white drop-shadow-sm">
              {briefing.completedCount} / {briefing.totalScheduled}{' '}
              <span className="text-xs font-semibold text-slate-300">Done</span>
            </div>
            <div className="text-xs text-slate-300 font-medium">
              {briefing.estimatedMinutesRemaining} mins focus remaining
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSummary}
            className="px-4 py-2.5 text-xs font-extrabold bg-slate-900/60 hover:bg-slate-800/80 text-white rounded-xl transition-all border border-white/20 shadow-md backdrop-blur-md flex items-center gap-2 active:scale-95"
          >
            <span>📝</span> Review & Reflect
          </button>
        </div>
      </div>
    </div>
  );
};

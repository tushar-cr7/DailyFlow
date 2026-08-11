import React from 'react';
import type { EngagementStats } from '../../shared/types/engagement';

interface ProgressRingModuleProps {
  completedCount: number;
  totalScheduled: number;
  engagementStats: EngagementStats | null;
}

export const ProgressRingModule: React.FC<ProgressRingModuleProps> = ({
  completedCount,
  totalScheduled,
  engagementStats,
}) => {
  const percentage = totalScheduled > 0 ? Math.round((completedCount / totalScheduled) * 100) : 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="glass-surface p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
          PROGRESS & MOMENTUM
        </h3>
        {engagementStats && (
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1 animate-flame-pulse">
            <span>🔥</span> {engagementStats.state.currentStreak}d streak
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Radial SVG Progress Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-slate-800/80"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-indigo-400 transition-all duration-700 ease-out"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-white">{percentage}%</span>
            <span className="text-[9px] text-slate-300 font-bold uppercase">Done</span>
          </div>
        </div>

        <div className="space-y-2 flex-1 min-w-0">
          <div className="text-xs font-bold text-slate-100">
            {completedCount} of {totalScheduled} Tasks Completed
          </div>

          {engagementStats && (
            <div className="space-y-1 pt-1 border-t border-white/10">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-semibold">Level {engagementStats.levelInfo.level}</span>
                <span className="text-indigo-300 font-mono font-bold">
                  {engagementStats.levelInfo.xpInLevel}/{engagementStats.levelInfo.xpRequiredForNext} XP
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-950/60 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${engagementStats.levelInfo.progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

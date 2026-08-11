import React, { useState, useEffect } from 'react';
import type { AnalyticsTimeRange, AnalyticsReport } from '../../shared/types/analytics';

export const AnalyticsView: React.FC = () => {
  const api = window.dailyflow;
  const [range, setRange] = useState<AnalyticsTimeRange>('7d');
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getAnalyticsData({ range });
        if (isMounted) {
          if (res.success && res.data) {
            setReport(res.data);
          } else {
            setError(res.error || 'Failed to load analytics report.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error fetching analytics.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, [api, range]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 text-xs font-semibold">
        <span>⌛ Loading productivity insights...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-300 font-medium">
        {error}
      </div>
    );
  }

  if (!report) return null;

  const { overview, dailySeries, patterns, insights } = report;

  const maxDailyTasks = Math.max(
    1,
    ...dailySeries.map((d) => Math.max(d.tasksCreated, d.tasksCompleted)),
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>📊 Productivity Analytics & Insights</span>
          </h2>
          <p className="text-xs text-slate-400">
            Range: {report.startDate} to {report.endDate}
          </p>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['7d', '30d', 'month'] as AnalyticsTimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                range === r
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Completion Rate</div>
          <div className="text-2xl font-black text-white mt-1">
            {overview.completionRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {overview.tasksCompleted} of {overview.tasksCreated} tasks
          </div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Total Focus Time</div>
          <div className="text-2xl font-black text-sky-400 mt-1">
            {overview.totalFocusMinutes} <span className="text-xs font-normal">mins</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Logged in Focus Mode</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">XP Earned</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            +{overview.xpEarned}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Engagement rewards</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Current Streak</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">
            🔥 {overview.currentStreak}d
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Best: {overview.longestStreak} days
          </div>
        </div>
      </div>

      {/* Pure SVG / CSS Bar Chart */}
      <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
          Daily Task Completion Activity
        </h3>

        <div className="flex items-end justify-between gap-2 h-40 pt-4 px-2 border-b border-slate-800">
          {dailySeries.map((pt) => {
            const heightPercent = Math.round((pt.tasksCompleted / maxDailyTasks) * 100);

            return (
              <div
                key={pt.date}
                className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
              >
                {/* Tooltip */}
                <div className="absolute -top-8 hidden group-hover:flex bg-slate-950 text-slate-200 text-[10px] py-1 px-2 rounded border border-slate-700 whitespace-nowrap z-20 shadow-md">
                  {pt.date}: {pt.tasksCompleted}/{pt.tasksCreated} done
                </div>

                <div
                  className="w-full bg-indigo-500 hover:bg-indigo-400 rounded-t transition-all duration-300 min-h-[4px]"
                  style={{ height: `${Math.max(4, heightPercent)}%` }}
                />
                <span className="text-[10px] text-slate-400 font-mono mt-1">
                  {pt.dayOfWeek}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Patterns & Insights Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Productivity Patterns */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Productivity Patterns
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">Most Productive Day</span>
              <span className="text-xs font-bold text-indigo-300">
                {patterns.mostProductiveDayOfWeek
                  ? `${patterns.mostProductiveDayOfWeek.day} (${patterns.mostProductiveDayOfWeek.count} completed)`
                  : 'Insufficient data'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">Peak Focus Hour</span>
              <span className="text-xs font-bold text-sky-300">
                {patterns.peakFocusHour
                  ? patterns.peakFocusHour.formattedHour
                  : 'Insufficient data (min 3 sessions)'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">Scheduled Completion Rate</span>
              <span className="text-xs font-bold text-emerald-400">
                {patterns.scheduledCompletionRate}%
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">Overdue Task Rate</span>
              <span
                className={`text-xs font-bold ${
                  patterns.overdueRate >= 20 ? 'text-rose-400' : 'text-slate-300'
                }`}
              >
                {patterns.overdueRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Data-Backed Insights */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Smart Productivity Insights
          </h3>

          <div className="space-y-3">
            {insights.map((ins) => (
              <div
                key={ins.id}
                className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{ins.title}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      ins.trend === 'positive'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : ins.trend === 'negative'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {ins.trend}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{ins.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

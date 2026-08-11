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
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-xs font-semibold space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span>Loading productivity analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-300 font-medium">
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
    <div className="space-y-6 animate-card-enter">
      {/* Header & Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 obsidian-card p-5 rounded-2xl border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>📊 Productivity Analytics & Trends</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active Window: {report.startDate} to {report.endDate}
          </p>
        </div>

        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-white/10">
          {(['7d', '30d', 'month'] as AnalyticsTimeRange[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === r
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="obsidian-card p-4 rounded-2xl border-white/10 shadow-sm">
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Completion Rate</div>
          <div className="text-2xl font-black text-white mt-1">
            {overview.completionRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {overview.tasksCompleted} of {overview.tasksCreated} tasks
          </div>
        </div>

        <div className="obsidian-card p-4 rounded-2xl border-white/10 shadow-sm">
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Focus Duration</div>
          <div className="text-2xl font-black text-sky-400 mt-1">
            {overview.totalFocusMinutes} <span className="text-xs font-normal">mins</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Logged in Focus Sanctuary</div>
        </div>

        <div className="obsidian-card p-4 rounded-2xl border-white/10 shadow-sm">
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">XP Earned</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            +{overview.xpEarned}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Gamification rewards</div>
        </div>

        <div className="obsidian-card p-4 rounded-2xl border-white/10 shadow-sm">
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Active Streak</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">
            🔥 {overview.currentStreak}d
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Record: {overview.longestStreak} days
          </div>
        </div>
      </div>

      {/* SVG Bar Chart Visualization */}
      <div className="obsidian-card p-6 rounded-2xl border-white/10">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-5 flex items-center gap-2">
          <span>📈 Daily Completion Breakdown</span>
        </h3>

        <div className="flex items-end justify-between gap-3 h-44 pt-6 px-2 border-b border-white/10">
          {dailySeries.map((pt) => {
            const heightPercent = Math.round((pt.tasksCompleted / maxDailyTasks) * 100);

            return (
              <div
                key={pt.date}
                className="flex-1 flex flex-col items-center gap-1.5 group relative h-full justify-end"
              >
                {/* Custom Tooltip */}
                <div className="absolute -top-10 hidden group-hover:flex bg-slate-950 text-slate-200 text-[10px] py-1.5 px-2.5 rounded-xl border border-white/10 whitespace-nowrap z-20 shadow-lg font-mono">
                  {pt.date}: {pt.tasksCompleted}/{pt.tasksCreated} completed ({pt.focusMinutes}m focus)
                </div>

                <div
                  className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 hover:from-indigo-500 hover:to-purple-400 rounded-t-lg transition-all duration-300 min-h-[6px] shadow-md shadow-indigo-500/20"
                  style={{ height: `${Math.max(6, heightPercent)}%` }}
                />
                <span className="text-[10px] text-slate-400 font-bold mt-1">
                  {pt.dayOfWeek}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Productivity Patterns & Smart Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Productivity Patterns */}
        <div className="obsidian-card p-5 rounded-2xl border-white/10 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Behavioral Patterns
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400 font-semibold">Peak Day of Week</span>
              <span className="text-xs font-bold text-indigo-300">
                {patterns.mostProductiveDayOfWeek
                  ? `${patterns.mostProductiveDayOfWeek.day} (${patterns.mostProductiveDayOfWeek.count} completed)`
                  : 'Insufficient data'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400 font-semibold">Peak Focus Hour</span>
              <span className="text-xs font-bold text-sky-300">
                {patterns.peakFocusHour
                  ? patterns.peakFocusHour.formattedHour
                  : 'Insufficient data (min 3 sessions)'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400 font-semibold">Scheduled Completion</span>
              <span className="text-xs font-bold text-emerald-400">
                {patterns.scheduledCompletionRate}%
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400 font-semibold">Overdue Rate</span>
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

        {/* Smart Insights */}
        <div className="obsidian-card p-5 rounded-2xl border-white/10 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Deterministic Insights
          </h3>

          <div className="space-y-3">
            {insights.map((ins) => (
              <div
                key={ins.id}
                className="p-4 bg-slate-950/60 rounded-xl border border-white/5 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{ins.title}</span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      ins.trend === 'positive'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : ins.trend === 'negative'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {ins.trend}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{ins.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import type { ActiveView } from './ViewTabs';
import type { EngagementStats } from '../../shared/types/engagement';
import { THEME_LABELS, type EnvironmentTheme } from '../utils/backgroundAssets';
import { DailyFlowLogo } from './DailyFlowLogo';

interface SidebarNavProps {
  activeView: ActiveView;
  overdueCount: number;
  engagementStats: EngagementStats | null;
  onViewChange: (view: ActiveView) => void;
  onOpenSettings: () => void;
  onOpenCreateModal: () => void;
  currentEnv?: EnvironmentTheme;
  onEnvChange?: (env: EnvironmentTheme) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeView,
  overdueCount,
  engagementStats,
  onViewChange,
  onOpenSettings,
  onOpenCreateModal,
  currentEnv = 'emerald-forest',
  onEnvChange,
}) => {
  const navItems: { id: ActiveView; label: string; icon: string }[] = [
    { id: 'today', label: 'Today', icon: '🌿' },
    { id: 'upcoming', label: 'Upcoming', icon: '🗓️' },
    { id: 'overdue', label: 'Overdue', icon: '⚠️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];

  const environments: { id: EnvironmentTheme; label: string }[] = [
    { id: 'emerald-forest', label: '🌿 Emerald Forest' },
    { id: 'deep-ocean', label: '🌊 Deep Ocean' },
    { id: 'mountain-lake', label: '🏔️ Mountain Lake' },
    { id: 'night-sky', label: '🌌 Night Sky' },
    { id: 'sunset-horizon', label: '🌅 Sunset Horizon' },
  ];

  return (
    <aside className="w-16 sm:w-64 glass-nav flex flex-col justify-between p-3 sm:p-4 shrink-0 select-none z-30 shadow-2xl">
      <div className="space-y-6">
        {/* Approved DailyFlow Branding Header */}
        <div className="px-1 py-1">
          <div className="hidden sm:block">
            <DailyFlowLogo variant="full" theme={currentEnv} />
          </div>
          <div className="sm:hidden flex justify-center">
            <DailyFlowLogo variant="mark" theme={currentEnv} />
          </div>
        </div>

        {/* Quick Add Command Button */}
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="w-full py-2.5 px-3 bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center sm:justify-start gap-2 active:scale-95 border border-white/20 backdrop-blur-md group"
          title="New Task (Ctrl+N)"
        >
          <span className="text-sm font-bold group-hover:rotate-90 transition-transform duration-200">+</span>
          <span className="hidden sm:inline">New Task</span>
        </button>

        {/* Main Navigation Links */}
        <nav className="space-y-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-white/20 text-white border border-white/30 shadow-md font-black backdrop-blur-md translate-x-1'
                    : 'text-slate-200 hover:text-white hover:bg-white/10 hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </div>

                {item.id === 'overdue' && overdueCount > 0 && (
                  <span className="rounded-full bg-rose-500/30 px-2 py-0.5 text-[10px] font-extrabold text-rose-200 border border-rose-400/40">
                    {overdueCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation: Environment Selector & Settings */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        {/* Environment Quick Switcher */}
        {onEnvChange && (
          <div className="hidden sm:block space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 px-1">
              Environment Atmosphere
            </label>
            <select
              value={currentEnv}
              onChange={(e) => onEnvChange(e.target.value as EnvironmentTheme)}
              className="w-full bg-slate-950/60 text-slate-100 text-[11px] font-bold rounded-xl px-2.5 py-1.5 border border-white/15 focus:outline-none focus:border-white/40 cursor-pointer backdrop-blur-md hover:border-white/30 transition-colors"
            >
              {environments.map((env) => (
                <option key={env.id} value={env.id} className="bg-slate-900 text-slate-200">
                  {THEME_LABELS[env.id]?.label || env.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Engagement Summary */}
        {engagementStats && (
          <div className="hidden sm:block glass-surface p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-300 font-extrabold flex items-center gap-1 animate-flame-pulse">
                <span>🔥</span> {engagementStats.state.currentStreak}d streak
              </span>
              <span className="text-[10px] text-slate-200 font-black">Lvl {engagementStats.levelInfo.level}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950/60 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-indigo-400 to-amber-400 transition-all duration-500"
                style={{ width: `${engagementStats.levelInfo.progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center sm:justify-start gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 transition-all hover:translate-x-0.5"
        >
          <span className="text-sm">⚙️</span>
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </aside>
  );
};

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Task } from '@shared/types/task';
import type { SystemInfoResponse, DatabaseStatus, IpcResult } from '@shared/types/ipc';
import type { EngagementStats } from '@shared/types/engagement';
import type { DailyBriefing as DailyBriefingType, DailySummary } from '@shared/types/dailyExperience';
import { getTodayString, getCurrentTimeString, shiftDateString, classifyTask } from '@shared/utils/date';
import { DateNavigator } from './components/DateNavigator';
import { ViewTabs, type ActiveView } from './components/ViewTabs';
import { OverdueBanner } from './components/OverdueBanner';
import { TaskList } from './components/TaskList';
import { TaskFormModal } from './components/TaskFormModal';
import { DailyBriefing } from './components/DailyBriefing';
import { FocusModeModal } from './components/FocusModeModal';
import { DailySummaryModal } from './components/DailySummaryModal';
import { CelebrationModal } from './components/CelebrationModal';
import { AnalyticsView } from './components/AnalyticsView';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';


function App() {
  const api = window.dailyflow;
  const [activeView, setActiveView] = useState<ActiveView>('today');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allIncompleteTasks, setAllIncompleteTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  // Engagement Engine State
  const [engagementStats, setEngagementStats] = useState<EngagementStats | null>(null);

  // Phase 8 Daily Experience State
  const [dailyBriefing, setDailyBriefing] = useState<DailyBriefingType | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [celebratedDates, setCelebratedDates] = useState<string[]>([]);

  // Phase 10 Notification Settings Modal state
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);


  // Task Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Health check collapsible drawer state
  const [showHealthPanel, setShowHealthPanel] = useState(false);
  const [ipcResult, setIpcResult] = useState<IpcResult<SystemInfoResponse> | null>(null);
  const [dbResult, setDbResult] = useState<IpcResult<DatabaseStatus> | null>(null);
  const [loadingIpc, setLoadingIpc] = useState(false);
  const [loadingDb, setLoadingDb] = useState(false);

  const currentDateStr = getTodayString();
  const currentTimeStr = getCurrentTimeString();

  // Fetch engagement stats
  const fetchEngagementStats = useCallback(async () => {
    try {
      const res = await api.getEngagementStats();
      if (res.success && res.data) {
        setEngagementStats(res.data);
      }
    } catch {
      // Ignore background fetch error
    }
  }, [api]);

  // Fetch daily briefing
  const fetchDailyBriefing = useCallback(async () => {
    try {
      const res = await api.getDailyBriefing(selectedDate);
      if (res.success && res.data) {
        setDailyBriefing(res.data);
      }
    } catch {
      // Ignore background briefing fetch error
    }
  }, [api, selectedDate]);

  // Fetch tasks based on active view
  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true);
    setTaskError(null);
    try {
      if (activeView === 'today') {
        const res = await api.getTasks({ date: selectedDate });
        if (res.success && res.data) {
          setTasks(res.data);
        } else {
          setTaskError(res.error || 'Failed to load tasks for selected date');
        }
      } else if (activeView === 'upcoming') {
        const tomorrowStr = shiftDateString(currentDateStr, 1);
        const sevenDaysEndStr = shiftDateString(currentDateStr, 7);
        const res = await api.getTasks({
          startDate: tomorrowStr,
          endDate: sevenDaysEndStr,
          isCompleted: false,
        });
        if (res.success && res.data) {
          setTasks(res.data);
        } else {
          setTaskError(res.error || 'Failed to load upcoming tasks');
        }
      } else if (activeView === 'overdue') {
        const res = await api.getTasks({ isCompleted: false });
        if (res.success && res.data) {
          const overdueTasks = res.data.filter(
            (t) => classifyTask(t, currentDateStr, currentTimeStr) === 'overdue',
          );
          setTasks(overdueTasks);
        } else {
          setTaskError(res.error || 'Failed to load overdue tasks');
        }
      }
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoadingTasks(false);
    }
  }, [api, activeView, selectedDate, currentDateStr, currentTimeStr]);

  // Fetch all incomplete tasks in background to compute global overdue badge count
  const checkOverdueCount = useCallback(async () => {
    try {
      const res = await api.getTasks({ isCompleted: false });
      if (res.success && res.data) {
        setAllIncompleteTasks(res.data);
      }
    } catch {
      // Ignore background check failure
    }
  }, [api]);

  useEffect(() => {
    void fetchTasks();
    void checkOverdueCount();
    void fetchEngagementStats();
    void fetchDailyBriefing();
  }, [fetchTasks, checkOverdueCount, fetchEngagementStats, fetchDailyBriefing]);

  // Check for 100% completion celebration once per day
  useEffect(() => {
    if (
      activeView === 'today' &&
      selectedDate === currentDateStr &&
      tasks.length > 0 &&
      tasks.every((t) => t.isCompleted) &&
      !celebratedDates.includes(currentDateStr)
    ) {
      setIsCelebrationOpen(true);
      setCelebratedDates((prev) => [...prev, currentDateStr]);
    }
  }, [activeView, selectedDate, currentDateStr, tasks, celebratedDates]);

  const overdueTasksCount = useMemo(() => {
    return allIncompleteTasks.filter(
      (t) => classifyTask(t, currentDateStr, currentTimeStr) === 'overdue',
    ).length;
  }, [allIncompleteTasks, currentDateStr, currentTimeStr]);

  // Active day completion metrics
  const activeDayMetrics = useMemo(() => {
    if (activeView !== 'today') return null;
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [activeView, tasks]);

  const handleToggleComplete = async (task: Task) => {
    try {
      const res = await api.updateTask({
        id: task.id,
        isCompleted: !task.isCompleted,
      });
      if (res.success) {
        await fetchTasks();
        await checkOverdueCount();
        await fetchEngagementStats();
        await fetchDailyBriefing();
      } else {
        setTaskError(res.error || 'Failed to toggle task completion');
      }
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Error updating task');
    }
  };

  const handleSetPrimaryFocus = async (taskId: string | null) => {
    try {
      const res = await api.setPrimaryFocus(taskId, selectedDate);
      if (res.success && res.data) {
        setDailyBriefing(res.data);
      }
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Failed to set primary focus');
    }
  };

  const handleStartFocusMode = (task: Task) => {
    setActiveFocusTask(task);
    setIsFocusModalOpen(true);
  };

  const handleLogFocusSession = async (taskId: string | null, durationSeconds: number) => {
    try {
      await api.logFocusSession({ taskId, durationSeconds, date: selectedDate });
      await fetchEngagementStats();
      await fetchDailyBriefing();
    } catch {
      // Ignore background log error
    }
  };

  const handleOpenSummaryModal = async () => {
    try {
      const res = await api.getDailySummary(selectedDate);
      if (res.success && res.data) {
        setDailySummary(res.data);
        setIsSummaryModalOpen(true);
      }
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Failed to fetch daily summary');
    }
  };

  const handleSaveReflection = async (reflection: string) => {
    try {
      const res = await api.saveDailyReflection(reflection, selectedDate);
      if (res.success && res.data) {
        setDailySummary(res.data);
      }
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Failed to save reflection');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await api.deleteTask(id);
      if (res.success) {
        await fetchTasks();
        await checkOverdueCount();
        await fetchEngagementStats();
        await fetchDailyBriefing();
      } else {
        setTaskError(res.error || 'Failed to delete task');
      }
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Error deleting task');
    }
  };

  const handleSaveTask = async (dto: {
    title: string;
    description?: string | null;
    date: string;
    scheduledTime?: string | null;
  }) => {
    if (editingTask) {
      const res = await api.updateTask({
        id: editingTask.id,
        ...dto,
      });
      if (!res.success) {
        throw new Error(res.error || 'Failed to update task');
      }
    } else {
      const res = await api.createTask(dto);
      if (!res.success) {
        throw new Error(res.error || 'Failed to create task');
      }
    }
    await fetchTasks();
    await checkOverdueCount();
    await fetchEngagementStats();
    await fetchDailyBriefing();
  };

  // Health verification handlers
  const handleTestIpc = async () => {
    setLoadingIpc(true);
    try {
      const res = await api.getSystemInfo({ includeEnv: false });
      setIpcResult(res);
    } catch (err) {
      setIpcResult({
        success: false,
        error: err instanceof Error ? err.message : 'IPC call failed',
      });
    } finally {
      setLoadingIpc(false);
    }
  };

  const handleTestDb = async () => {
    setLoadingDb(true);
    try {
      const res = await api.getDatabaseStatus();
      setDbResult(res);
    } catch (err) {
      setDbResult({
        success: false,
        error: err instanceof Error ? err.message : 'Database status IPC call failed',
      });
    } finally {
      setLoadingDb(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/30 text-sm">
              DF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-slate-100">DailyFlow</h1>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                  Desktop Scheduler
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                Timezone-Safe Core Task Management & Daily Experience Workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Engagement Stats Pill (Level, XP, Streak) */}
            {engagementStats && (
              <div className="hidden sm:flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-1.5 shadow-inner text-xs font-semibold">
                <div className="flex items-center gap-1 text-amber-400 font-bold" title="Current Active Streak">
                  <span>🔥</span>
                  <span>{engagementStats.state.currentStreak}d</span>
                </div>
                <div className="h-4 w-px bg-slate-800" />
                <div className="text-right">
                  <p className="text-[10px] font-bold text-indigo-400">Lvl {engagementStats.levelInfo.level}</p>
                  <p className="text-[9px] text-slate-400">
                    {engagementStats.levelInfo.xpInLevel}/{engagementStats.levelInfo.xpRequiredForNext} XP
                  </p>
                </div>
              </div>
            )}

            {/* Active Day Progress Indicator */}
            {activeDayMetrics && activeDayMetrics.total > 0 && (
              <div className="hidden sm:flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-1.5 shadow-inner">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Progress</p>
                  <p className="text-xs font-bold text-indigo-400">
                    {activeDayMetrics.completed}/{activeDayMetrics.total} Done
                  </p>
                </div>
                <div className="h-2 w-16 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${activeDayMetrics.percent}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsNotifModalOpen(true)}
              className="rounded-xl border border-slate-800 bg-slate-950/80 p-2 text-slate-300 hover:text-white hover:bg-slate-900 transition-all text-xs"
              title="Notification Settings"
            >
              🔔
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
            >
              + New Task
            </button>
          </div>
        </div>
      </header>


      {/* Main Container */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-6 space-y-6">
        {/* Overdue Alert Banner */}
        {activeView !== 'overdue' && (
          <OverdueBanner
            overdueCount={overdueTasksCount}
            onViewOverdue={() => setActiveView('overdue')}
          />
        )}

        {/* View Switcher Tabs */}
        <ViewTabs
          activeView={activeView}
          overdueCount={overdueTasksCount}
          onViewChange={setActiveView}
        />

        {/* Date Navigator - Single Source of Truth */}
        {activeView === 'today' && (
          <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
        )}

        {/* Phase 8 Daily Briefing & Goals Workspace */}
        {activeView === 'today' && (
          <DailyBriefing
            briefing={dailyBriefing}
            allTodayTasks={tasks}
            onStartFocus={handleStartFocusMode}
            onSetPrimaryFocus={handleSetPrimaryFocus}
            onOpenSummary={handleOpenSummaryModal}
          />
        )}

        {/* Phase 9 Analytics View */}
        {activeView === 'analytics' ? (
          <AnalyticsView />
        ) : (
          /* Task List Canvas */
          <section className="space-y-4">
            {taskError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 font-medium">
                {taskError}
              </div>
            )}

            <TaskList
              tasks={tasks}
              loading={loadingTasks}
              viewMode={activeView === 'today' ? 'single-date' : activeView}
              currentDateStr={currentDateStr}
              currentTimeStr={currentTimeStr}
              onToggleComplete={handleToggleComplete}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTask}
              onOpenCreateModal={handleOpenCreateModal}
            />
          </section>
        )}


        {/* Collapsible System Health Verification Drawer */}
        <section className="mt-8 border-t border-slate-900 pt-4">
          <button
            type="button"
            onClick={() => setShowHealthPanel((prev) => !prev)}
            className="flex items-center justify-between w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900/60 transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>🛠️ Phase 2/3 System Health Diagnostics</span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 font-mono">
                IPC & Database
              </span>
            </span>
            <span className="text-xs text-slate-400 font-bold">
              {showHealthPanel ? 'Hide ▲' : 'Show ▼'}
            </span>
          </button>

          {showHealthPanel && (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 animate-card-enter">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Database Status */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">SQLite Database Status</span>
                    <button
                      type="button"
                      onClick={handleTestDb}
                      disabled={loadingDb}
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-all"
                    >
                      {loadingDb ? 'Checking...' : 'Check DB'}
                    </button>
                  </div>
                  {dbResult && (
                    <pre className="mt-2 text-xs font-mono bg-slate-900 text-slate-300 p-3 rounded-lg border border-slate-800 overflow-x-auto">
                      {JSON.stringify(dbResult, null, 2)}
                    </pre>
                  )}
                </div>

                {/* IPC Status */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">Typed IPC Bridge Status</span>
                    <button
                      type="button"
                      onClick={handleTestIpc}
                      disabled={loadingIpc}
                      className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-all"
                    >
                      {loadingIpc ? 'Invoking...' : 'Invoke IPC'}
                    </button>
                  </div>
                  {ipcResult && (
                    <pre className="mt-2 text-xs font-mono bg-slate-900 text-slate-300 p-3 rounded-lg border border-slate-800 overflow-x-auto">
                      {JSON.stringify(ipcResult, null, 2)}
                    </pre>
                  )}
                </div>
              </div>

              <SecurityCheck />
            </div>
          )}
        </section>
      </main>

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        initialTask={editingTask}
        selectedDate={selectedDate}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTask}
      />

      {/* Focus Mode Modal */}
      <FocusModeModal
        task={activeFocusTask}
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        onCompleteTask={async (taskId) => {
          const taskToComplete = tasks.find((t) => t.id === taskId);
          if (taskToComplete && !taskToComplete.isCompleted) {
            await handleToggleComplete(taskToComplete);
          }
        }}
        onLogFocusSession={handleLogFocusSession}
      />

      {/* Daily Summary & Reflection Modal */}
      <DailySummaryModal
        summary={dailySummary}
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        onSaveReflection={handleSaveReflection}
      />

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        onOpenSummary={handleOpenSummaryModal}
        streakCount={engagementStats?.state.currentStreak || 0}
        xpEarnedToday={engagementStats?.todayLog.xpEarned || 0}
      />

      {/* Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
      />
    </div>
  );
}


function SecurityCheck() {
  const nodeAccessible =
    typeof (window as Window & { require?: unknown }).require !== 'undefined';
  const processAccessible =
    typeof (window as Window & { process?: unknown }).process !== 'undefined';
  const ipcRendererAccessible =
    typeof (window as Window & { ipcRenderer?: unknown }).ipcRenderer !== 'undefined';

  return (
    <div className="border-t border-slate-800 pt-3">
      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        Electron Security Boundary Status
      </h3>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <StatusBadge ok={!nodeAccessible} />
          <span className="text-slate-300 text-[11px]">Require Blocked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusBadge ok={!processAccessible} />
          <span className="text-slate-300 text-[11px]">Process Blocked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusBadge ok={!ipcRendererAccessible} />
          <span className="text-slate-300 text-[11px]">ipcRenderer Blocked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusBadge ok={typeof window.dailyflow !== 'undefined'} />
          <span className="text-slate-300 text-[11px]">contextBridge Active</span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
        ok ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
      }`}
    >
      {ok ? '✓' : '✗'}
    </span>
  );
}

export default App;

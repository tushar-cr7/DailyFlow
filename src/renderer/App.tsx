import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Task } from '@shared/types/task';
import type { EngagementStats } from '@shared/types/engagement';
import type { DailyBriefing as DailyBriefingType, DailySummary } from '@shared/types/dailyExperience';
import { getTodayString, getCurrentTimeString, shiftDateString, classifyTask } from '@shared/utils/date';
import { SidebarNav } from './components/SidebarNav';
import { DateNavigator } from './components/DateNavigator';
import { type ActiveView } from './components/ViewTabs';
import { DailyBriefing } from './components/DailyBriefing';
import { NorthStarCard } from './components/NorthStarCard';
import { ProgressRingModule } from './components/ProgressRingModule';
import { QuickCaptureBar } from './components/QuickCaptureBar';
import { TodayFlowTimeline } from './components/TodayFlowTimeline';
import { UpcomingView } from './components/UpcomingView';
import { OverdueView } from './components/OverdueView';
import { FocusModeModal } from './components/FocusModeModal';
import { DailySummaryModal } from './components/DailySummaryModal';
import { CelebrationModal } from './components/CelebrationModal';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsModal } from './components/SettingsModal';
import { TaskFormModal } from './components/TaskFormModal';
import { BackgroundSlideshow } from './components/BackgroundSlideshow';
import { StartupSplash } from './components/StartupSplash';
import { type EnvironmentTheme } from './utils/backgroundAssets';
import type { UserSettings } from '@shared/types/settings';

function App() {
  const api = window.dailyflow;
  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('today');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allIncompleteTasks, setAllIncompleteTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  // Settings & Engagement State
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [engagementStats, setEngagementStats] = useState<EngagementStats | null>(null);

  // Active Environment Theme (persisted via UserSettings in SQLite database)
  const activeEnv: EnvironmentTheme = userSettings?.appearance.environment || 'emerald-forest';

  const handleEnvChange = async (newEnv: string) => {
    try {
      const res = await api.updateSettings({
        appearance: { environment: newEnv as EnvironmentTheme },
      });
      if (res.success && res.data) {
        setUserSettings(res.data);
      }
    } catch {
      // Ignore background update error
    }
  };

  // Daily Experience State
  const [dailyBriefing, setDailyBriefing] = useState<DailyBriefingType | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [celebratedDates, setCelebratedDates] = useState<string[]>([]);

  // Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const currentDateStr = getTodayString();
  const currentTimeStr = getCurrentTimeString();

  // Keyboard Shortcuts (Ctrl+N to create task, Esc to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingTask(null);
        setIsModalOpen(true);
      } else if (e.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false);
        else if (isFocusModalOpen) setIsFocusModalOpen(false);
        else if (isSummaryModalOpen) setIsSummaryModalOpen(false);
        else if (isCelebrationOpen) setIsCelebrationOpen(false);
        else if (isSettingsModalOpen) setIsSettingsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isFocusModalOpen, isSummaryModalOpen, isCelebrationOpen, isSettingsModalOpen]);

  // Fetch User Settings
  const fetchUserSettings = useCallback(async () => {
    try {
      const res = await api.getSettings();
      if (res.success && res.data) {
        setUserSettings(res.data);
      }
    } catch {
      // Ignore background settings fetch error
    }
  }, [api]);

  // Fetch Engagement Stats
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

  // Fetch Daily Briefing
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

  // Fetch Tasks
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

  // Check Overdue Count
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
    void fetchUserSettings();
    void fetchTasks();
    void checkOverdueCount();
    void fetchEngagementStats();
    void fetchDailyBriefing();
  }, [fetchUserSettings, fetchTasks, checkOverdueCount, fetchEngagementStats, fetchDailyBriefing]);

  // Check for 100% completion celebration
  useEffect(() => {
    const showCelebrations = userSettings?.engagement.showCelebrations ?? true;
    if (
      showCelebrations &&
      activeView === 'today' &&
      selectedDate === currentDateStr &&
      tasks.length > 0 &&
      tasks.every((t) => t.isCompleted) &&
      !celebratedDates.includes(currentDateStr)
    ) {
      setIsCelebrationOpen(true);
      setCelebratedDates((prev) => [...prev, currentDateStr]);
    }
  }, [userSettings, activeView, selectedDate, currentDateStr, tasks, celebratedDates]);

  const overdueTasksCount = useMemo(() => {
    return allIncompleteTasks.filter(
      (t) => classifyTask(t, currentDateStr, currentTimeStr) === 'overdue',
    ).length;
  }, [allIncompleteTasks, currentDateStr, currentTimeStr]);

  // Handlers
  const handleToggleComplete = async (task: Task) => {
    try {
      const updatedIsCompleted = !task.isCompleted;
      const res = await api.updateTask({ id: task.id, isCompleted: updatedIsCompleted });
      if (res.success) {
        await fetchTasks();
        void fetchEngagementStats();
        void fetchDailyBriefing();
        void checkOverdueCount();
      }
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Failed to toggle task completion');
    }
  };

  const handleSaveTask = async (dto: {
    title: string;
    description?: string | null;
    date: string;
    scheduledTime?: string | null;
  }) => {
    try {
      if (editingTask) {
        await api.updateTask({ id: editingTask.id, ...dto });
      } else {
        await api.createTask(dto);
      }
      await fetchTasks();
      void fetchEngagementStats();
      void fetchDailyBriefing();
      void checkOverdueCount();
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Failed to save task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      await fetchTasks();
      void fetchEngagementStats();
      void fetchDailyBriefing();
      void checkOverdueCount();
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Failed to delete task');
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

  const handleSetPrimaryFocus = async (taskId: string | null) => {
    try {
      const res = await api.setPrimaryFocus(taskId, selectedDate);
      if (res.success && res.data) {
        setDailyBriefing(res.data);
      }
    } catch {
      // Ignore focus set failure
    }
  };

  const handleStartFocusMode = (task: Task) => {
    setActiveFocusTask(task);
    setIsFocusModalOpen(true);
  };

  const handleLogFocusSession = async (taskId: string | null, durationSeconds: number) => {
    try {
      await api.logFocusSession({ taskId, durationSeconds, date: selectedDate });
      void fetchEngagementStats();
      void fetchDailyBriefing();
    } catch {
      // Ignore focus log error
    }
  };

  const handleOpenSummaryModal = async () => {
    try {
      const res = await api.getDailySummary(selectedDate);
      if (res.success && res.data) {
        setDailySummary(res.data);
        setIsSummaryModalOpen(true);
      }
    } catch {
      // Ignore summary fetch failure
    }
  };

  const handleSaveReflection = async (reflection: string) => {
    try {
      const res = await api.saveDailyReflection(reflection, selectedDate);
      if (res.success && res.data) {
        setDailySummary(res.data);
      }
    } catch {
      // Ignore reflection save error
    }
  };

  const incompleteTodayTasks = useMemo(() => tasks.filter((t) => !t.isCompleted), [tasks]);

  const envAccentClass = activeEnv === 'deep-ocean'
    ? 'theme-ocean'
    : activeEnv === 'mountain-lake'
    ? 'theme-mountain'
    : activeEnv === 'night-sky'
    ? 'theme-night'
    : activeEnv === 'sunset-horizon'
    ? 'theme-sunset'
    : 'theme-emerald';

  return (
    <div className={`relative flex h-screen w-screen overflow-hidden text-slate-100 font-sans ${envAccentClass}`}>
      {/* Startup Splash Screen */}
      {showSplash && (
        <StartupSplash
          theme={activeEnv}
          onComplete={() => setShowSplash(false)}
        />
      )}

      {/* Real Environment Background Photo Slideshow */}
      <BackgroundSlideshow
        theme={activeEnv}
        reducedMotion={userSettings?.appearance.reducedMotion ?? false}
      />

      {/* 1. Compact Desktop Sidebar Navigation */}
      <SidebarNav
        activeView={activeView}
        overdueCount={overdueTasksCount}
        engagementStats={engagementStats}
        onViewChange={setActiveView}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenCreateModal={handleOpenCreateModal}
        currentEnv={activeEnv}
        onEnvChange={handleEnvChange}
      />

      {/* 2. Translucent Glass Workspace Canvas */}
      <main className={`relative z-10 flex-1 flex flex-col h-full overflow-y-auto px-6 py-6 space-y-6 ${!showSplash ? 'animate-dashboard-reveal' : ''}`}>
        {/* Date Navigator Header on Today View */}
        {activeView === 'today' && (
          <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
        )}

        {/* View Routing */}
        {activeView === 'today' && (
          <div className="space-y-6 max-w-5xl mx-auto w-full">
            {/* Today Top Asymmetric Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (Hero Greeting, North Star, Quick Capture) */}
              <div className="lg:col-span-2 space-y-5">
                <DailyBriefing
                  briefing={dailyBriefing}
                  onOpenSummary={handleOpenSummaryModal}
                  userName={userSettings?.general.userName || 'Flow User'}
                />

                <NorthStarCard
                  primaryFocusTask={dailyBriefing?.primaryFocusTask || null}
                  incompleteTasks={incompleteTodayTasks}
                  onStartFocus={handleStartFocusMode}
                  onSetPrimaryFocus={handleSetPrimaryFocus}
                />

                <QuickCaptureBar onOpenCreateModal={handleOpenCreateModal} />
              </div>

              {/* Right Column (Radial Progress & Gamification Module) */}
              <div className="lg:col-span-1">
                <ProgressRingModule
                  completedCount={dailyBriefing?.completedCount || 0}
                  totalScheduled={dailyBriefing?.totalScheduled || 0}
                  engagementStats={engagementStats}
                />
              </div>
            </div>

            {/* Today's Flow Spatial Timeline */}
            <section className="pt-2 space-y-4">
              {taskError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 font-semibold">
                  {taskError}
                </div>
              )}

              {loadingTasks ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-300 text-xs font-semibold space-y-2">
                  <div className="h-6 w-6 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                  <span>Loading workspace flow...</span>
                </div>
              ) : (
                <TodayFlowTimeline
                  tasks={tasks}
                  currentDateStr={currentDateStr}
                  currentTimeStr={currentTimeStr}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteTask}
                  onStartFocus={handleStartFocusMode}
                  onOpenCreateModal={handleOpenCreateModal}
                />
              )}
            </section>
          </div>
        )}

        {activeView === 'upcoming' && (
          <div className="max-w-5xl mx-auto w-full">
            <UpcomingView
              tasks={tasks}
              currentDateStr={currentDateStr}
              onToggleComplete={handleToggleComplete}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTask}
              onOpenCreateModal={handleOpenCreateModal}
            />
          </div>
        )}

        {activeView === 'overdue' && (
          <div className="max-w-4xl mx-auto w-full">
            <OverdueView
              tasks={tasks}
              currentDateStr={currentDateStr}
              onToggleComplete={handleToggleComplete}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTask}
            />
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="max-w-5xl mx-auto w-full">
            <AnalyticsView />
          </div>
        )}
      </main>

      {/* Modals */}
      <TaskFormModal
        isOpen={isModalOpen}
        initialTask={editingTask}
        selectedDate={selectedDate}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTask}
      />

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

      <DailySummaryModal
        summary={dailySummary}
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        onSaveReflection={handleSaveReflection}
      />

      <CelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        onOpenSummary={handleOpenSummaryModal}
        streakCount={engagementStats?.state.currentStreak || 0}
        xpEarnedToday={engagementStats?.todayLog.xpEarned || 0}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSettingsUpdated={(updated) => {
          setUserSettings(updated);
          void fetchTasks();
        }}
      />
    </div>
  );
}

export default App;

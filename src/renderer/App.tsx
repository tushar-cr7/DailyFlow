import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@shared/types/task';
import type { SystemInfoResponse, DatabaseStatus, IpcResult } from '@shared/types/ipc';
import { TaskList } from './components/TaskList';
import { TaskFormModal } from './components/TaskFormModal';

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shiftDate(dateStr: string, days: number): string {
  const parts = dateStr.split('-').map(Number);
  const y = parts[0] ?? 2026;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function App() {
  const api = window.dailyflow;
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Phase 2 / Phase 3 verification state
  const [ipcResult, setIpcResult] = useState<IpcResult<SystemInfoResponse> | null>(null);
  const [dbResult, setDbResult] = useState<IpcResult<DatabaseStatus> | null>(null);
  const [loadingIpc, setLoadingIpc] = useState(false);
  const [loadingDb, setLoadingDb] = useState(false);

  const fetchTasks = useCallback(async (date: string) => {
    setLoadingTasks(true);
    setTaskError(null);
    try {
      const res = await api.getTasks({ date });
      if (res.success && res.data) {
        setTasks(res.data);
      } else {
        setTaskError(res.error || 'Failed to load tasks');
      }
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  }, [api]);

  useEffect(() => {
    void fetchTasks(selectedDate);
  }, [selectedDate, fetchTasks]);

  const handleToggleComplete = async (task: Task) => {
    try {
      const res = await api.updateTask({
        id: task.id,
        isCompleted: !task.isCompleted,
      });
      if (res.success) {
        await fetchTasks(selectedDate);
      } else {
        setTaskError(res.error || 'Failed to toggle task status');
      }
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Error updating task');
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
        await fetchTasks(selectedDate);
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
    await fetchTasks(selectedDate);
  };

  // Verification handlers
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
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* App Header */}
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              DailyFlow
            </p>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">
              Daily Scheduler & Tasks
            </h1>
          </div>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            + New Task
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-8 py-8 space-y-8">
        {/* Date Selector Navigation Bar */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDate((d) => shiftDate(d, -1))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(getTodayString())}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate((d) => shiftDate(d, 1))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Next →
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="active-date-picker" className="text-xs font-medium text-slate-500">
              Date:
            </label>
            <input
              id="active-date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </section>

        {/* Task List Section */}
        <section className="space-y-4">
          {taskError && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100">
              {taskError}
            </div>
          )}

          <TaskList
            tasks={tasks}
            loading={loadingTasks}
            onToggleComplete={handleToggleComplete}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteTask}
            onOpenCreateModal={handleOpenCreateModal}
          />
        </section>

        {/* Phase 2 & 3 System Verification Panel */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider text-slate-400">
            System & Infrastructure Health Verification
          </h2>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phase 3 Database Health Check */}
            <div className="rounded-lg border border-slate-100 p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">SQLite Database Status</span>
                <button
                  type="button"
                  onClick={handleTestDb}
                  disabled={loadingDb}
                  className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {loadingDb ? 'Checking...' : 'Check DB'}
                </button>
              </div>
              {dbResult && (
                <pre className="mt-2 text-xs font-mono bg-slate-900 text-slate-200 p-2.5 rounded overflow-x-auto">
                  {JSON.stringify(dbResult, null, 2)}
                </pre>
              )}
            </div>

            {/* Phase 2 System Info Check */}
            <div className="rounded-lg border border-slate-100 p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">Typed IPC Bridge Status</span>
                <button
                  type="button"
                  onClick={handleTestIpc}
                  disabled={loadingIpc}
                  className="rounded bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {loadingIpc ? 'Invoking...' : 'Invoke IPC'}
                </button>
              </div>
              {ipcResult && (
                <pre className="mt-2 text-xs font-mono bg-slate-900 text-slate-200 p-2.5 rounded overflow-x-auto">
                  {JSON.stringify(ipcResult, null, 2)}
                </pre>
              )}
            </div>
          </div>

          <SecurityCheck />
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
    <div className="mt-6 border-t border-slate-200 pt-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Security Sanity Checks
      </h3>
      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <StatusBadge ok={!nodeAccessible} />
          <span>Require Blocked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusBadge ok={!processAccessible} />
          <span>Process Blocked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusBadge ok={!ipcRendererAccessible} />
          <span>ipcRenderer Blocked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusBadge ok={typeof window.dailyflow !== 'undefined'} />
          <span>contextBridge Active</span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
        ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {ok ? '✓' : '✗'}
    </span>
  );
}

export default App;

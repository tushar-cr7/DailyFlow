import { useState } from 'react';
import type { SystemInfoResponse, DatabaseStatus, IpcResult } from '@shared/types/ipc';

function App() {
  const api = window.dailyflow;
  const [ipcResult, setIpcResult] = useState<IpcResult<SystemInfoResponse> | null>(null);
  const [dbResult, setDbResult] = useState<IpcResult<DatabaseStatus> | null>(null);
  const [loadingIpc, setLoadingIpc] = useState(false);
  const [loadingDb, setLoadingDb] = useState(false);

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
      <header className="border-b border-slate-200 bg-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              DailyFlow
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Phase 3 — SQLite Persistence
            </h1>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            Dev mode
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-8 py-12">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-medium text-slate-800">
            SQLite Database & IPC Bridge Verification
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            SQLite runs exclusively in the Electron Main process using better-sqlite3.
            The renderer communicates via typed IPC and cannot access SQLite or Node.js directly.
          </p>

          <dl className="mt-6 grid gap-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">Platform</dt>
              <dd className="font-mono text-slate-800">{api.platform}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">Electron</dt>
              <dd className="font-mono text-slate-800">{api.versions.electron}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">Chrome</dt>
              <dd className="font-mono text-slate-800">{api.versions.chrome}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Secure context</dt>
              <dd className="font-mono text-emerald-700">
                {api.isSecureContext ? 'Yes' : 'No'}
              </dd>
            </div>
          </dl>

          {/* Phase 3 Database Health Verification */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Check SQLite Database Health (database:get-status)
              </span>
              <button
                type="button"
                onClick={handleTestDb}
                disabled={loadingDb}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
              >
                {loadingDb ? 'Checking DB...' : 'Check Database'}
              </button>
            </div>

            {dbResult && (
              <div className="mt-4 rounded-lg bg-slate-900 p-4 text-xs font-mono text-slate-200">
                <div className="text-emerald-400 font-bold mb-2">
                  Database Status Result: {dbResult.success ? 'INITIALIZED & HEALTHY' : 'FAILED'}
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(dbResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Phase 2 IPC System Info Verification */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Test Typed IPC Bridge (system:get-info)
              </span>
              <button
                type="button"
                onClick={handleTestIpc}
                disabled={loadingIpc}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
              >
                {loadingIpc ? 'Invoking IPC...' : 'Invoke IPC'}
              </button>
            </div>

            {ipcResult && (
              <div className="mt-4 rounded-lg bg-slate-900 p-4 text-xs font-mono text-slate-200">
                <div className="text-emerald-400 font-bold mb-2">
                  IPC Channel Result: {ipcResult.success ? 'SUCCESS' : 'FAILED'}
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(ipcResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <SecurityCheck />
        </div>
      </main>
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
    <div className="mt-8 rounded-lg bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-700">Security checks</h3>
      <ul className="mt-3 space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <StatusBadge ok={!nodeAccessible} />
          <span>Node.js require blocked in renderer</span>
        </li>
        <li className="flex items-center gap-2">
          <StatusBadge ok={!processAccessible} />
          <span>process object blocked in renderer</span>
        </li>
        <li className="flex items-center gap-2">
          <StatusBadge ok={!ipcRendererAccessible} />
          <span>Raw ipcRenderer not exposed to window</span>
        </li>
        <li className="flex items-center gap-2">
          <StatusBadge ok={typeof window.dailyflow !== 'undefined'} />
          <span>Preload contextBridge API available</span>
        </li>
      </ul>
    </div>
  );
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
        ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
      }`}
      aria-hidden="true"
    >
      {ok ? '✓' : '✗'}
    </span>
  );
}

export default App;

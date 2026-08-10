function App() {
  const api = window.dailyflow;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              DailyFlow
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Phase 1 — Project Setup
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
            Electron + React + Vite + Tailwind
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            DailyFlow is running with a secure Electron architecture. The renderer
            has no direct Node.js access — only the preload bridge is exposed.
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

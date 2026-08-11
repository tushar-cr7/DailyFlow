import React from 'react';

interface QuickCaptureBarProps {
  onOpenCreateModal: () => void;
}

export const QuickCaptureBar: React.FC<QuickCaptureBarProps> = ({ onOpenCreateModal }) => {
  return (
    <div
      onClick={onOpenCreateModal}
      className="glass-surface p-3.5 flex items-center justify-between cursor-pointer border-white/15 hover:border-indigo-400/50 transition-all group shadow-md select-none"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 text-sm font-bold border border-indigo-400/30 group-hover:scale-105 transition-transform">
          +
        </span>
        <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
          What do you want to accomplish today? (Click to capture)
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-[10px] font-mono text-slate-300 bg-slate-950/60 px-2 py-1 rounded-lg border border-white/10">
          Ctrl + N
        </span>
        <span className="text-xs text-indigo-300 font-bold group-hover:translate-x-1 transition-transform">
          Capture →
        </span>
      </div>
    </div>
  );
};

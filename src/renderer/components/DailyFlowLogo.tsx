import React from 'react';
import logoImg from '../../../assets/branding/dailyflow-logo.png';
import type { EnvironmentTheme } from '../utils/backgroundAssets';

interface DailyFlowLogoProps {
  variant?: 'full' | 'mark' | 'compact';
  theme?: EnvironmentTheme;
  className?: string;
}

export const DailyFlowLogo: React.FC<DailyFlowLogoProps> = ({
  variant = 'full',
  theme = 'emerald-forest',
  className = '',
}) => {
  const glowStyleMap: Record<EnvironmentTheme, string> = {
    'emerald-forest': 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.45))',
    'deep-ocean': 'drop-shadow(0 0 10px rgba(14, 165, 233, 0.45))',
    'mountain-lake': 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.45))',
    'night-sky': 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.45))',
    'sunset-horizon': 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.45))',
  };

  const currentGlow = glowStyleMap[theme] || glowStyleMap['emerald-forest'];

  if (variant === 'mark') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <img
          src={logoImg}
          alt="DailyFlow Mark"
          className="h-9 w-9 object-contain transition-transform duration-300 hover:scale-105"
          style={{ filter: currentGlow }}
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <img
          src={logoImg}
          alt="DailyFlow"
          className="h-8 w-8 object-contain transition-transform duration-300 hover:scale-105 shrink-0"
          style={{ filter: currentGlow }}
        />
        <div className="flex flex-col">
          <span className="text-sm font-black text-white tracking-tight leading-none">
            Daily<span className="text-emerald-400">Flow</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <img
        src={logoImg}
        alt="DailyFlow Logo"
        className="h-10 w-10 object-contain transition-transform duration-300 hover:scale-105 shrink-0"
        style={{ filter: currentGlow }}
      />
      <div className="flex flex-col">
        <div className="text-base font-black text-white tracking-tight leading-none flex items-center gap-0.5">
          <span>Daily</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-indigo-300">
            Flow
          </span>
        </div>
        <span className="text-[9px] font-black tracking-widest text-slate-300 uppercase mt-0.5 opacity-90">
          FLOW. FOCUS. FINISH.
        </span>
      </div>
    </div>
  );
};

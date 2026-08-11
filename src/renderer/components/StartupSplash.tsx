import React, { useState, useEffect } from 'react';
import logoImg from '../../../assets/branding/dailyflow-logo.png';
import type { EnvironmentTheme } from '../utils/backgroundAssets';

interface StartupSplashProps {
  theme?: EnvironmentTheme;
  onComplete?: () => void;
}

export const StartupSplash: React.FC<StartupSplashProps> = ({
  theme = 'emerald-forest',
  onComplete,
}) => {
  const [stage, setStage] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const themeGlowMap: Record<EnvironmentTheme, string> = {
    'emerald-forest': 'rgba(16, 185, 129, 0.5)',
    'deep-ocean': 'rgba(14, 165, 233, 0.5)',
    'mountain-lake': 'rgba(99, 102, 241, 0.5)',
    'night-sky': 'rgba(139, 92, 246, 0.5)',
    'sunset-horizon': 'rgba(245, 158, 11, 0.5)',
  };

  const glowColor = themeGlowMap[theme] || themeGlowMap['emerald-forest'];

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, 200);
      }, 400);
      return () => clearTimeout(timer);
    }

    // Sequence timelines
    const t1 = setTimeout(() => setStage(1), 300);  // Logo Mark Appears
    const t2 = setTimeout(() => setStage(2), 650);  // Glow & Wordmark
    const t3 = setTimeout(() => setStage(3), 1100); // Tagline FLOW. FOCUS. FINISH.
    const t4 = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 400);
    }, 1750); // Total 1.75s animation

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 200);
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleSkip}
      role="banner"
      aria-label="DailyFlow Startup Screen"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-400 ease-out cursor-pointer select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
      style={{
        background: `radial-gradient(circle at center, rgba(15, 23, 42, 0.98) 0%, rgba(3, 7, 18, 1) 100%)`,
      }}
    >
      {/* Ambient background glow orb */}
      <div
        className="absolute w-[360px] h-[360px] rounded-full blur-[90px] transition-opacity duration-700 pointer-events-none"
        style={{
          background: glowColor,
          opacity: stage >= 1 ? 0.35 : 0,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4 text-center px-4">
        {/* Approved Logo Mark */}
        <div
          className={`transform transition-all duration-500 ease-out ${
            stage >= 1
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-90 translate-y-2'
          }`}
        >
          <img
            src={logoImg}
            alt="DailyFlow"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain transition-all duration-500"
            style={{
              filter:
                stage >= 2
                  ? `drop-shadow(0 0 25px ${glowColor}) drop-shadow(0 0 10px rgba(255, 255, 255, 0.4))`
                  : 'none',
            }}
          />
        </div>

        {/* DailyFlow Wordmark */}
        <div
          className={`transform transition-all duration-500 ease-out ${
            stage >= 2
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-1">
            <span>Daily</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-400 to-indigo-400">
              Flow
            </span>
          </h1>
        </div>

        {/* Tagline */}
        <div
          className={`transform transition-all duration-500 ease-out ${
            stage >= 3
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
          }`}
        >
          <p className="text-[10px] sm:text-xs font-black tracking-[0.25em] text-slate-300 uppercase">
            FLOW. FOCUS. FINISH.
          </p>
        </div>
      </div>
    </div>
  );
};

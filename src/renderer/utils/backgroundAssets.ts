export type EnvironmentTheme =
  | 'emerald-forest'
  | 'deep-ocean'
  | 'mountain-lake'
  | 'night-sky'
  | 'sunset-horizon';

export interface BackgroundImageConfig {
  id: string;
  url: string;
  position?: string;
}

// Dynamically import all 15 local background images from assets/backgrounds at workspace root using Vite's import.meta.glob
const imageGlob = import.meta.glob<string>(
  '../../../assets/backgrounds/**/*.avif',
  { eager: true, import: 'default' }
);

export const THEME_LABELS: Record<EnvironmentTheme, { name: string; icon: string; label: string }> = {
  'deep-ocean': { name: 'Deep Ocean', icon: '🌊', label: '🌊 Deep Ocean' },
  'emerald-forest': { name: 'Emerald Forest', icon: '🌿', label: '🌿 Emerald Forest' },
  'mountain-lake': { name: 'Mountain Lake', icon: '🏔️', label: '🏔️ Mountain Lake' },
  'night-sky': { name: 'Night Sky', icon: '🌌', label: '🌌 Night Sky' },
  'sunset-horizon': { name: 'Sunset Horizon', icon: '🌅', label: '🌅 Sunset Horizon' },
};

export const ENVIRONMENT_THEMES: EnvironmentTheme[] = [
  'emerald-forest',
  'deep-ocean',
  'mountain-lake',
  'night-sky',
  'sunset-horizon',
];

// Helper to extract theme images safely
export function getThemeImages(theme: EnvironmentTheme): BackgroundImageConfig[] {
  const matchingUrls: BackgroundImageConfig[] = [];

  for (const [path, url] of Object.entries(imageGlob)) {
    const normalizedPath = path.replace(/\\/g, '/');
    if (normalizedPath.includes(`/assets/backgrounds/${theme}/`)) {
      const filename = normalizedPath.split('/').pop() || '';
      const resolvedUrl = typeof url === 'string' ? url : String(url);
      matchingUrls.push({
        id: filename,
        url: resolvedUrl,
        position: 'center center',
      });
    }
  }

  return matchingUrls;
}

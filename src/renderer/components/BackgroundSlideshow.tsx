import React, { useState, useEffect, useRef } from 'react';
import { getThemeImages, type EnvironmentTheme } from '../utils/backgroundAssets';

interface BackgroundSlideshowProps {
  theme: EnvironmentTheme;
  reducedMotion?: boolean;
}

export const BackgroundSlideshow: React.FC<BackgroundSlideshowProps> = ({
  theme,
  reducedMotion = false,
}) => {
  const images = getThemeImages(theme);
  const imagesRef = useRef(images);
  imagesRef.current = images;

  // Track active layer index (0 or 1 for double buffering crossfade)
  const [activeLayer, setActiveLayer] = useState<0 | 1>(0);
  const [layer0Url, setLayer0Url] = useState<string>('');
  const [layer1Url, setLayer1Url] = useState<string>('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Select a random index guaranteeing no consecutive duplicate
  const getNextRandomIndex = (currentIdx: number, total: number): number => {
    if (total <= 1) return 0;
    let nextIdx = Math.floor(Math.random() * total);
    while (nextIdx === currentIdx) {
      nextIdx = Math.floor(Math.random() * total);
    }
    return nextIdx;
  };

  // Preload image URL
  const preloadImage = (url: string) => {
    if (!url) return;
    const img = new Image();
    img.src = url;
  };

  // Initialize or handle Theme change
  useEffect(() => {
    const currentImages = getThemeImages(theme);
    if (currentImages.length === 0) return;

    // Pick random initial start image for this theme
    const initialIdx = Math.floor(Math.random() * currentImages.length);
    const initialImage = currentImages[initialIdx];
    if (!initialImage) return;

    let activeIdx = initialIdx;
    setLayer0Url(initialImage.url);
    setActiveLayer(0);

    // Preload next candidate
    const nextIdx = getNextRandomIndex(initialIdx, currentImages.length);
    const nextImageCandidate = currentImages[nextIdx];
    if (nextImageCandidate) {
      preloadImage(nextImageCandidate.url);
    }

    // Reset Slideshow timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      const availableImages = imagesRef.current;
      if (availableImages.length <= 1) return;

      const nextIdx = getNextRandomIndex(activeIdx, availableImages.length);
      const nextImage = availableImages[nextIdx];
      if (!nextImage) return;

      activeIdx = nextIdx;

      // Toggle active layer for crossfade
      setActiveLayer((prevLayer) => {
        if (prevLayer === 0) {
          setLayer1Url(nextImage.url);
          return 1;
        } else {
          setLayer0Url(nextImage.url);
          return 0;
        }
      });

      // Preload upcoming image after next
      const peekIdx = getNextRandomIndex(nextIdx, availableImages.length);
      const peekImage = availableImages[peekIdx];
      if (peekImage) {
        preloadImage(peekImage.url);
      }
    }, 25000); // 25 second interval

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [theme]);

  const transitionStyle = reducedMotion
    ? 'transition-none'
    : 'transition-opacity duration-[1800ms] ease-in-out';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-slate-950">
      {/* Layer 0 Image */}
      {layer0Url && (
        <div
          className={`absolute inset-0 bg-cover bg-center ${transitionStyle} ${
            activeLayer === 0 ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url("${layer0Url}")` }}
        />
      )}

      {/* Layer 1 Image (Crossfade Buffer) */}
      {layer1Url && (
        <div
          className={`absolute inset-0 bg-cover bg-center ${transitionStyle} ${
            activeLayer === 1 ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url("${layer1Url}")` }}
        />
      )}

      {/* Readability Layer 2: Light Dark Overlay (30% for clear photo visibility) */}
      <div className="absolute inset-0 bg-[#04060d]/30" />

      {/* Readability Layer 3: Soft Vignette Radial Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, rgba(4, 6, 13, 0.1) 0%, rgba(4, 6, 13, 0.5) 100%)',
        }}
      />
    </div>
  );
};

import { useState, useEffect } from 'react';

/**
 * useIsMobile
 * Central hook for responsive device classification.
 * Matches all phone and portrait tablet screens (< 900px):
 * 360x800, 390x844, 412x915, 768x1024.
 */
export function useIsMobile(breakpoint = 900) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  const [windowDimensions, setWindowDimensions] = useState(() => {
    if (typeof window === 'undefined') return { width: 1200, height: 800 };
    return { width: window.innerWidth, height: window.innerHeight };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width < breakpoint);
      setWindowDimensions({ width, height });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [breakpoint]);

  return { isMobile, ...windowDimensions };
}

export default useIsMobile;

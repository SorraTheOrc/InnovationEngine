import { useRef, useEffect } from 'react';

/**
 * Hook for managing live regions for screen reader announcements
 * Follows WCAG 2.1 guidelines for dynamic content updates
 */
export const useLiveRegion = () => {
  const politeRegionRef = useRef<HTMLDivElement | null>(null);
  const assertiveRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create live regions if they don't exist
    if (!politeRegionRef.current) {
      const politeRegion = document.createElement('div');
      politeRegion.setAttribute('aria-live', 'polite');
      politeRegion.setAttribute('aria-atomic', 'true');
      politeRegion.className = 'sr-only';
      politeRegion.id = 'live-region-polite';
      document.body.appendChild(politeRegion);
      politeRegionRef.current = politeRegion;
    }

    if (!assertiveRegionRef.current) {
      const assertiveRegion = document.createElement('div');
      assertiveRegion.setAttribute('aria-live', 'assertive');
      assertiveRegion.setAttribute('aria-atomic', 'true');
      assertiveRegion.className = 'sr-only';
      assertiveRegion.id = 'live-region-assertive';
      document.body.appendChild(assertiveRegion);
      assertiveRegionRef.current = assertiveRegion;
    }

    return () => {
      // Cleanup on unmount
      if (politeRegionRef.current && document.body.contains(politeRegionRef.current)) {
        document.body.removeChild(politeRegionRef.current);
      }
      if (assertiveRegionRef.current && document.body.contains(assertiveRegionRef.current)) {
        document.body.removeChild(assertiveRegionRef.current);
      }
    };
  }, []);

  const announcePolite = (message: string) => {
    if (politeRegionRef.current) {
      politeRegionRef.current.textContent = message;
    }
  };

  const announceAssertive = (message: string) => {
    if (assertiveRegionRef.current) {
      assertiveRegionRef.current.textContent = message;
    }
  };

  const clearAnnouncements = () => {
    if (politeRegionRef.current) {
      politeRegionRef.current.textContent = '';
    }
    if (assertiveRegionRef.current) {
      assertiveRegionRef.current.textContent = '';
    }
  };

  return {
    announcePolite,
    announceAssertive,
    clearAnnouncements
  };
};
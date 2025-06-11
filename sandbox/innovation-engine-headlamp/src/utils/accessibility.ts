/**
 * Accessibility utilities and hooks for the ExecDoc Editor
 * Provides WCAG 2.1 AA compliance features and screen reader support
 */
import React, { useEffect, useRef } from 'react';

/**
 * Hook for announcing dynamic content changes to screen readers
 * @param message - The message to announce
 * @param priority - Priority level: 'polite' (default) or 'assertive'
 */
export const useScreenReaderAnnouncement = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!message.trim()) return;

    // Create or update the announcement region
    let announcer = document.getElementById('screen-reader-announcements');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'screen-reader-announcements';
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(announcer);
    } else {
      announcer.setAttribute('aria-live', priority);
    }

    // Clear and set new message
    announcer.textContent = '';
    setTimeout(() => {
      announcer!.textContent = message;
    }, 100);
  }, [message, priority]);
};

/**
 * Hook for managing focus trap within a component
 * @param isActive - Whether the focus trap should be active
 * @param containerRef - Ref to the container element
 */
export const useFocusTrap = (isActive: boolean, containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Allow parent components to handle escape
        e.stopPropagation();
      }
    };

    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscapeKey);

    // Focus the first element when trap becomes active
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isActive, containerRef]);
};

/**
 * Hook for managing skip links navigation
 */
export const useSkipLinks = () => {
  useEffect(() => {
    // Create skip links if they don't exist
    let skipLinks = document.getElementById('skip-links');
    if (!skipLinks) {
      skipLinks = document.createElement('div');
      skipLinks.id = 'skip-links';
      skipLinks.style.position = 'absolute';
      skipLinks.style.top = '-40px';
      skipLinks.style.left = '6px';
      skipLinks.style.zIndex = '9999';
      skipLinks.style.backgroundColor = '#000';
      skipLinks.style.color = '#fff';
      skipLinks.style.padding = '8px';
      skipLinks.style.borderRadius = '4px';
      skipLinks.style.transition = 'top 0.3s';

      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      skipLink.style.color = '#fff';
      skipLink.style.textDecoration = 'none';

      skipLink.addEventListener('focus', () => {
        skipLinks!.style.top = '6px';
      });

      skipLink.addEventListener('blur', () => {
        skipLinks!.style.top = '-40px';
      });

      skipLinks.appendChild(skipLink);
      document.body.insertBefore(skipLinks, document.body.firstChild);
    }
  }, []);
};

/**
 * Utility function to generate accessible IDs
 * @param prefix - Prefix for the ID
 * @param suffix - Optional suffix
 */
export const generateAccessibleId = (prefix: string, suffix?: string) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${timestamp}-${random}${suffix ? `-${suffix}` : ''}`;
};

/**
 * Common ARIA attributes for different component types
 */
export const ariaAttributes = {
  button: {
    role: 'button',
    'aria-pressed': false,
  },
  textbox: {
    role: 'textbox',
    'aria-multiline': false,
  },
  combobox: {
    role: 'combobox',
    'aria-expanded': false,
    'aria-haspopup': 'listbox',
  },
  dialog: {
    role: 'dialog',
    'aria-modal': true,
  },
  tablist: {
    role: 'tablist',
  },
  tab: {
    role: 'tab',
    'aria-selected': false,
  },
  tabpanel: {
    role: 'tabpanel',
  },
  region: {
    role: 'region',
  },
  banner: {
    role: 'banner',
  },
  main: {
    role: 'main',
  },
  navigation: {
    role: 'navigation',
  },
  search: {
    role: 'search',
  },
  form: {
    role: 'form',
  },
  alert: {
    role: 'alert',
    'aria-live': 'assertive',
  },
  status: {
    role: 'status',
    'aria-live': 'polite',
  },
};

/**
 * Color contrast utilities for WCAG AA compliance
 */
export const colorContrast = {
  // Minimum contrast ratios for WCAG AA
  normalText: 4.5,
  largeText: 3,
  
  // High contrast color scheme
  highContrast: {
    background: '#ffffff',
    text: '#000000',
    primary: '#0066cc',
    primaryText: '#ffffff',
    secondary: '#666666',
    success: '#008000',
    error: '#cc0000',
    warning: '#ff8c00',
    border: '#000000',
    focus: '#005fcc',
  },
  
  // Regular color scheme (already WCAG AA compliant)
  regular: {
    background: '#ffffff',
    text: '#212121',
    primary: '#1976d2',
    primaryText: '#ffffff',
    secondary: '#757575',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    border: '#e0e0e0',
    focus: '#1976d2',
  }
};

/**
 * Hook for managing high contrast mode
 */
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  React.useEffect(() => {
    // Check for user preference or system high contrast mode
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
  };

  const currentColors = isHighContrast ? colorContrast.highContrast : colorContrast.regular;

  return {
    isHighContrast,
    toggleHighContrast,
    colors: currentColors,
  };
};

/**
 * Hook for managing reduced motion preferences
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

/**
 * Focus management utilities
 */
export const focusUtils = {
  /**
   * Set focus to element with announcement
   */
  focusWithAnnouncement: (element: HTMLElement, announcement: string) => {
    element.focus();
    // Use screen reader announcement hook or direct announcement
    const announcer = document.getElementById('screen-reader-announcements');
    if (announcer) {
      announcer.textContent = announcement;
    }
  },

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  },

  /**
   * Move focus to next/previous focusable element
   */
  moveFocus: (direction: 'next' | 'previous', container?: HTMLElement) => {
    const focusableElements = focusUtils.getFocusableElements(container || document.body);
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (currentIndex === -1) return;

    const nextIndex = direction === 'next' 
      ? (currentIndex + 1) % focusableElements.length
      : (currentIndex - 1 + focusableElements.length) % focusableElements.length;

    focusableElements[nextIndex]?.focus();
  }
};

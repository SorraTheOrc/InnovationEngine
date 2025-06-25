import { useState, useEffect, useCallback } from 'react';

export interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  prefersColorScheme: 'light' | 'dark' | 'no-preference';
  textSize: 'small' | 'medium' | 'large' | 'extra-large';
  focusVisible: boolean;
}

/**
 * Hook for detecting and responding to user accessibility preferences
 * Implements responsive accessibility based on system settings
 */
export const useAccessibilityPreferences = (): AccessibilityPreferences => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reduceMotion: false,
    highContrast: false,
    prefersColorScheme: 'no-preference',
    textSize: 'medium',
    focusVisible: true
  });

  const updatePreferences = useCallback(() => {
    const newPreferences: AccessibilityPreferences = {
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : window.matchMedia('(prefers-color-scheme: light)').matches 
        ? 'light' 
        : 'no-preference',
      textSize: 'medium', // Default, could be enhanced to detect actual text size preferences
      focusVisible: !window.matchMedia('(pointer: coarse)').matches // Assume focus visible needed for non-touch devices
    };

    setPreferences(newPreferences);
  }, []);

  useEffect(() => {
    // Initial check
    updatePreferences();

    // Set up media query listeners
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(prefers-color-scheme: light)'),
      window.matchMedia('(pointer: coarse)')
    ];

    const handleChange = () => {
      updatePreferences();
    };

    mediaQueries.forEach(mq => {
      if (mq.addEventListener) {
        mq.addEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mq.addListener(handleChange);
      }
    });

    return () => {
      mediaQueries.forEach(mq => {
        if (mq.removeEventListener) {
          mq.removeEventListener('change', handleChange);
        } else {
          // Fallback for older browsers
          mq.removeListener(handleChange);
        }
      });
    };
  }, [updatePreferences]);

  return preferences;
};

/**
 * Hook for applying accessibility preferences to the document
 */
export const useApplyAccessibilityPreferences = (preferences: AccessibilityPreferences) => {
  useEffect(() => {
    const root = document.documentElement;

    // Apply reduce motion preference
    if (preferences.reduceMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // Apply high contrast preference
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply color scheme preference
    root.setAttribute('data-color-scheme', preferences.prefersColorScheme);

    // Apply text size preference
    root.setAttribute('data-text-size', preferences.textSize);

    // Apply focus visible preference
    if (preferences.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

  }, [preferences]);
};

/**
 * Combined hook that detects preferences and applies them
 */
export const useAccessibility = () => {
  const preferences = useAccessibilityPreferences();
  useApplyAccessibilityPreferences(preferences);
  
  return preferences;
};
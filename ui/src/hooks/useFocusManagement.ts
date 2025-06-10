import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook for managing focus in accessible components
 * Implements WCAG 2.1 focus management guidelines
 */
export const useFocusManagement = () => {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const restoreFocusRef = useRef<boolean>(true);

  /**
   * Save the currently focused element
   */
  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  /**
   * Restore focus to the previously saved element
   */
  const restoreFocus = useCallback(() => {
    if (restoreFocusRef.current && previousFocusRef.current) {
      // Use a timeout to ensure the element is still in the DOM
      setTimeout(() => {
        if (document.body.contains(previousFocusRef.current!)) {
          previousFocusRef.current!.focus();
        }
      }, 0);
    }
  }, []);

  /**
   * Set whether focus should be restored when component unmounts
   */
  const setRestoreFocus = useCallback((shouldRestore: boolean) => {
    restoreFocusRef.current = shouldRestore;
  }, []);

  /**
   * Focus an element with error handling
   */
  const focusElement = useCallback((element: HTMLElement | null, options?: FocusOptions) => {
    if (element && typeof element.focus === 'function') {
      try {
        element.focus(options);
      } catch (error) {
        console.warn('Failed to focus element:', error);
      }
    }
  }, []);

  /**
   * Get the next focusable element in tab order
   */
  const getNextFocusableElement = useCallback((currentElement: HTMLElement): HTMLElement | null => {
    const focusableElements = Array.from(
      document.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
      )
    ) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(currentElement);
    if (currentIndex === -1) return null;

    return focusableElements[currentIndex + 1] || focusableElements[0];
  }, []);

  /**
   * Get the previous focusable element in tab order
   */
  const getPreviousFocusableElement = useCallback((currentElement: HTMLElement): HTMLElement | null => {
    const focusableElements = Array.from(
      document.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
      )
    ) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(currentElement);
    if (currentIndex === -1) return null;

    return focusableElements[currentIndex - 1] || focusableElements[focusableElements.length - 1];
  }, []);

  /**
   * Check if an element is currently visible and focusable
   */
  const isFocusable = useCallback((element: HTMLElement): boolean => {
    if (!element) return false;

    // Check if element is disabled
    if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
      return false;
    }

    // Check if element is hidden
    if (element.hidden || element.style.display === 'none' || element.style.visibility === 'hidden') {
      return false;
    }

    // Check if element has tabindex="-1"
    if (element.getAttribute('tabindex') === '-1') {
      return false;
    }

    // Check if element is visible (not zero size and not outside viewport)
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      return false;
    }

    return true;
  }, []);

  /**
   * Find the first focusable element within a container
   */
  const findFirstFocusable = useCallback((container: HTMLElement): HTMLElement | null => {
    const candidates = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    for (const candidate of Array.from(candidates)) {
      if (isFocusable(candidate as HTMLElement)) {
        return candidate as HTMLElement;
      }
    }

    return null;
  }, [isFocusable]);

  /**
   * Find the last focusable element within a container
   */
  const findLastFocusable = useCallback((container: HTMLElement): HTMLElement | null => {
    const candidates = Array.from(
      container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).reverse();

    for (const candidate of candidates) {
      if (isFocusable(candidate as HTMLElement)) {
        return candidate as HTMLElement;
      }
    }

    return null;
  }, [isFocusable]);

  /**
   * Create a focus trap within a container
   */
  const createFocusTrap = useCallback((container: HTMLElement) => {
    const firstFocusable = findFirstFocusable(container);
    const lastFocusable = findLastFocusable(container);

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const isTabPressed = event.key === 'Tab';
      const isShiftPressed = event.shiftKey;

      if (!isTabPressed) return;

      if (isShiftPressed) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          focusElement(lastFocusable);
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          focusElement(firstFocusable);
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Focus the first element
    if (firstFocusable) {
      focusElement(firstFocusable);
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [findFirstFocusable, findLastFocusable, focusElement]);

  /**
   * Automatically restore focus when component unmounts
   */
  useEffect(() => {
    return () => {
      if (restoreFocusRef.current) {
        restoreFocus();
      }
    };
  }, [restoreFocus]);

  return {
    saveFocus,
    restoreFocus,
    setRestoreFocus,
    focusElement,
    getNextFocusableElement,
    getPreviousFocusableElement,
    isFocusable,
    findFirstFocusable,
    findLastFocusable,
    createFocusTrap
  };
};
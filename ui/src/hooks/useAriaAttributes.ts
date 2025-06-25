import { useState, useCallback, useRef, useEffect } from 'react';

export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-controls'?: string;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-pressed'?: boolean;
  'aria-readonly'?: boolean;
  'aria-required'?: boolean;
  'aria-valuemax'?: number;
  'aria-valuemin'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  role?: string;
  tabIndex?: number;
}

/**
 * Hook for managing ARIA attributes and accessibility state
 * Provides utilities for creating accessible component interfaces
 */
export const useAriaAttributes = () => {
  const idCounterRef = useRef(0);

  /**
   * Generate a unique ID for accessibility attributes
   */
  const generateId = useCallback((prefix: string = 'aria'): string => {
    idCounterRef.current += 1;
    return `${prefix}-${idCounterRef.current}-${Date.now()}`;
  }, []);

  /**
   * Create ARIA attributes for a button component
   */
  const createButtonAria = useCallback((
    label: string,
    options: {
      pressed?: boolean;
      expanded?: boolean;
      controls?: string;
      describedBy?: string;
      disabled?: boolean;
      haspopup?: AriaAttributes['aria-haspopup'];
    } = {}
  ): AriaAttributes => {
    const aria: AriaAttributes = {
      'aria-label': label,
      role: 'button'
    };

    if (options.pressed !== undefined) {
      aria['aria-pressed'] = options.pressed;
    }

    if (options.expanded !== undefined) {
      aria['aria-expanded'] = options.expanded;
    }

    if (options.controls) {
      aria['aria-controls'] = options.controls;
    }

    if (options.describedBy) {
      aria['aria-describedby'] = options.describedBy;
    }

    if (options.disabled) {
      aria['aria-disabled'] = true;
    }

    if (options.haspopup) {
      aria['aria-haspopup'] = options.haspopup;
    }

    return aria;
  }, []);

  /**
   * Create ARIA attributes for an input component
   */
  const createInputAria = useCallback((
    label: string,
    options: {
      required?: boolean;
      invalid?: boolean;
      describedBy?: string;
      readonly?: boolean;
      placeholder?: string;
      type?: string;
    } = {}
  ): AriaAttributes => {
    const aria: AriaAttributes = {
      'aria-label': label
    };

    if (options.required) {
      aria['aria-required'] = true;
    }

    if (options.invalid) {
      aria['aria-invalid'] = true;
    }

    if (options.describedBy) {
      aria['aria-describedby'] = options.describedBy;
    }

    if (options.readonly) {
      aria['aria-readonly'] = true;
    }

    return aria;
  }, []);

  /**
   * Create ARIA attributes for a tab component
   */
  const createTabAria = useCallback((
    label: string,
    options: {
      selected?: boolean;
      controls?: string;
      setsize?: number;
      posinset?: number;
    } = {}
  ): AriaAttributes => {
    const aria: AriaAttributes = {
      'aria-label': label,
      role: 'tab',
      tabIndex: options.selected ? 0 : -1
    };

    if (options.selected !== undefined) {
      aria['aria-selected'] = options.selected;
    }

    if (options.controls) {
      aria['aria-controls'] = options.controls;
    }

    return aria;
  }, []);

  /**
   * Create ARIA attributes for a tabpanel component
   */
  const createTabPanelAria = useCallback((
    label: string,
    options: {
      labelledBy?: string;
      hidden?: boolean;
    } = {}
  ): AriaAttributes => {
    const aria: AriaAttributes = {
      'aria-label': label,
      role: 'tabpanel',
      tabIndex: 0
    };

    if (options.labelledBy) {
      aria['aria-labelledby'] = options.labelledBy;
    }

    if (options.hidden) {
      aria['aria-hidden'] = true;
      aria.tabIndex = -1;
    }

    return aria;
  }, []);

  /**
   * Create ARIA attributes for a listbox/option component
   */
  const createListboxAria = useCallback((
    label: string,
    options: {
      multiselectable?: boolean;
      orientation?: 'horizontal' | 'vertical';
      activedescendant?: string;
      expanded?: boolean;
    } = {}
  ): AriaAttributes => {
    const aria: AriaAttributes = {
      'aria-label': label,
      role: 'listbox'
    };

    if (options.multiselectable) {
      aria['aria-multiselectable'] = options.multiselectable;
    }

    if (options.orientation) {
      aria['aria-orientation'] = options.orientation;
    }

    if (options.activedescendant) {
      aria['aria-activedescendant'] = options.activedescendant;
    }

    if (options.expanded !== undefined) {
      aria['aria-expanded'] = options.expanded;
    }

    return aria;
  }, []);

  /**
   * Create ARIA attributes for an option component
   */
  const createOptionAria = useCallback((
    label: string,
    options: {
      selected?: boolean;
      disabled?: boolean;
      setsize?: number;
      posinset?: number;
    } = {}
  ): AriaAttributes => {
    const aria: AriaAttributes = {
      'aria-label': label,
      role: 'option'
    };

    if (options.selected !== undefined) {
      aria['aria-selected'] = options.selected;
    }

    if (options.disabled) {
      aria['aria-disabled'] = true;
    }

    return aria;
  }, []);

  /**
   * Create ARIA attributes for a dialog/modal component
   */
  const createDialogAria = useCallback((
    label: string,
    options: {
      describedBy?: string;
      modal?: boolean;
    } = {}
  ): AriaAttributes => {
    const aria: AriaAttributes = {
      'aria-label': label,
      role: options.modal ? 'dialog' : 'dialog',
      'aria-modal': options.modal
    };

    if (options.describedBy) {
      aria['aria-describedby'] = options.describedBy;
    }

    return aria;
  }, []);

  /**
   * Create ARIA attributes for a progress indicator
   */
  const createProgressAria = useCallback((
    label: string,
    options: {
      valuemin?: number;
      valuemax?: number;
      valuenow?: number;
      valuetext?: string;
    } = {}
  ): AriaAttributes => {
    const aria: AriaAttributes = {
      'aria-label': label,
      role: 'progressbar'
    };

    if (options.valuemin !== undefined) {
      aria['aria-valuemin'] = options.valuemin;
    }

    if (options.valuemax !== undefined) {
      aria['aria-valuemax'] = options.valuemax;
    }

    if (options.valuenow !== undefined) {
      aria['aria-valuenow'] = options.valuenow;
    }

    if (options.valuetext) {
      aria['aria-valuetext'] = options.valuetext;
    }

    return aria;
  }, []);

  /**
   * Create ARIA attributes for a live region
   */
  const createLiveRegionAria = useCallback((
    options: {
      politeness?: 'polite' | 'assertive';
      atomic?: boolean;
      relevant?: string;
    } = {}
  ): AriaAttributes => {
    const aria: AriaAttributes = {
      'aria-live': options.politeness || 'polite'
    };

    if (options.atomic !== undefined) {
      aria['aria-atomic'] = options.atomic;
    }

    return aria;
  }, []);

  return {
    generateId,
    createButtonAria,
    createInputAria,
    createTabAria,
    createTabPanelAria,
    createListboxAria,
    createOptionAria,
    createDialogAria,
    createProgressAria,
    createLiveRegionAria
  };
};
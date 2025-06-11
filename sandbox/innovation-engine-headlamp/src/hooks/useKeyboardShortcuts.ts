/**
 * Custom hook for managing keyboard shortcuts in the ExecDoc Editor
 * Implements common editing shortcuts for improved user experience
 */
import { useEffect, useCallback } from 'react';

export interface KeyboardShortcutHandlers {
  onSave?: () => void;
  onNew?: () => void;
  onOpen?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onCut?: () => void;
  onFind?: () => void;
  onToggleEdit?: () => void;
  onRunCurrent?: () => void;
  onNewStep?: () => void;
  onDeleteStep?: () => void;
  onMoveStepUp?: () => void;
  onMoveStepDown?: () => void;
  onToggleAssistant?: () => void;
  onFocusNextStep?: () => void;
  onFocusPrevStep?: () => void;
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Hook that provides keyboard shortcut functionality
 * @param handlers Object containing callback functions for various shortcuts
 * @param options Configuration options for the shortcuts
 */
export const useKeyboardShortcuts = (
  handlers: KeyboardShortcutHandlers,
  options: UseKeyboardShortcutsOptions = {}
) => {
  const { enabled = true, preventDefault = true } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const { ctrlKey, metaKey, shiftKey, altKey, key } = event;
    const cmdKey = ctrlKey || metaKey; // Support both Ctrl (Windows/Linux) and Cmd (Mac)

    // File operations
    if (cmdKey && !shiftKey && !altKey) {
      switch (key.toLowerCase()) {
        case 's':
          if (handlers.onSave) {
            if (preventDefault) event.preventDefault();
            handlers.onSave();
            return;
          }
          break;
        case 'n':
          if (handlers.onNew) {
            if (preventDefault) event.preventDefault();
            handlers.onNew();
            return;
          }
          break;
        case 'o':
          if (handlers.onOpen) {
            if (preventDefault) event.preventDefault();
            handlers.onOpen();
            return;
          }
          break;
        case 'z':
          if (handlers.onUndo) {
            if (preventDefault) event.preventDefault();
            handlers.onUndo();
            return;
          }
          break;
        case 'y':
          if (handlers.onRedo) {
            if (preventDefault) event.preventDefault();
            handlers.onRedo();
            return;
          }
          break;
        case 'c':
          if (handlers.onCopy) {
            // Only prevent default if we're not in an input field
            const target = event.target as HTMLElement;
            if (!['INPUT', 'TEXTAREA'].includes(target.tagName)) {
              if (preventDefault) event.preventDefault();
              handlers.onCopy();
              return;
            }
          }
          break;
        case 'v':
          if (handlers.onPaste) {
            // Only prevent default if we're not in an input field
            const target = event.target as HTMLElement;
            if (!['INPUT', 'TEXTAREA'].includes(target.tagName)) {
              if (preventDefault) event.preventDefault();
              handlers.onPaste();
              return;
            }
          }
          break;
        case 'x':
          if (handlers.onCut) {
            // Only prevent default if we're not in an input field
            const target = event.target as HTMLElement;
            if (!['INPUT', 'TEXTAREA'].includes(target.tagName)) {
              if (preventDefault) event.preventDefault();
              handlers.onCut();
              return;
            }
          }
          break;
        case 'f':
          if (handlers.onFind) {
            if (preventDefault) event.preventDefault();
            handlers.onFind();
            return;
          }
          break;
      }
    }

    // Redo with Ctrl+Shift+Z
    if (cmdKey && shiftKey && !altKey && key.toLowerCase() === 'z') {
      if (handlers.onRedo) {
        if (preventDefault) event.preventDefault();
        handlers.onRedo();
        return;
      }
    }

    // Editor-specific shortcuts
    if (!cmdKey && !shiftKey && !altKey) {
      switch (key) {
        case 'F2':
          if (handlers.onToggleEdit) {
            if (preventDefault) event.preventDefault();
            handlers.onToggleEdit();
            return;
          }
          break;
        case 'F5':
          if (handlers.onRunCurrent) {
            if (preventDefault) event.preventDefault();
            handlers.onRunCurrent();
            return;
          }
          break;
        case 'F1':
          if (handlers.onToggleAssistant) {
            if (preventDefault) event.preventDefault();
            handlers.onToggleAssistant();
            return;
          }
          break;
      }
    }

    // Step navigation
    if (altKey && !cmdKey && !shiftKey) {
      switch (key) {
        case 'ArrowUp':
          if (handlers.onFocusPrevStep) {
            if (preventDefault) event.preventDefault();
            handlers.onFocusPrevStep();
            return;
          }
          break;
        case 'ArrowDown':
          if (handlers.onFocusNextStep) {
            if (preventDefault) event.preventDefault();
            handlers.onFocusNextStep();
            return;
          }
          break;
      }
    }

    // Step management with Ctrl+Alt
    if (cmdKey && altKey && !shiftKey) {
      switch (key.toLowerCase()) {
        case 'n':
          if (handlers.onNewStep) {
            if (preventDefault) event.preventDefault();
            handlers.onNewStep();
            return;
          }
          break;
        case 'delete':
        case 'backspace':
          if (handlers.onDeleteStep) {
            if (preventDefault) event.preventDefault();
            handlers.onDeleteStep();
            return;
          }
          break;
        case 'arrowup':
          if (handlers.onMoveStepUp) {
            if (preventDefault) event.preventDefault();
            handlers.onMoveStepUp();
            return;
          }
          break;
        case 'arrowdown':
          if (handlers.onMoveStepDown) {
            if (preventDefault) event.preventDefault();
            handlers.onMoveStepDown();
            return;
          }
          break;
      }
    }
  }, [handlers, enabled, preventDefault]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, enabled]);

  // Return object with shortcut information for help/documentation
  return {
    shortcuts: {
      'Ctrl+S / Cmd+S': 'Save document',
      'Ctrl+N / Cmd+N': 'Create new document',
      'Ctrl+O / Cmd+O': 'Open document',
      'Ctrl+Z / Cmd+Z': 'Undo',
      'Ctrl+Y / Cmd+Y': 'Redo',
      'Ctrl+Shift+Z / Cmd+Shift+Z': 'Redo (alternative)',
      'Ctrl+C / Cmd+C': 'Copy (when not in input field)',
      'Ctrl+V / Cmd+V': 'Paste (when not in input field)',
      'Ctrl+X / Cmd+X': 'Cut (when not in input field)',
      'Ctrl+F / Cmd+F': 'Find',
      'F1': 'Toggle AI Assistant',
      'F2': 'Toggle edit mode',
      'F5': 'Run current step',
      'Alt+↑': 'Focus previous step',
      'Alt+↓': 'Focus next step',
      'Ctrl+Alt+N / Cmd+Alt+N': 'Add new step',
      'Ctrl+Alt+Delete / Cmd+Alt+Delete': 'Delete current step',
      'Ctrl+Alt+↑ / Cmd+Alt+↑': 'Move step up',
      'Ctrl+Alt+↓ / Cmd+Alt+↓': 'Move step down',
    }
  };
};

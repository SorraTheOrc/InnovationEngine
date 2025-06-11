import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Grid,
  Chip
} from '@mui/material';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Component that displays a help dialog with all available keyboard shortcuts
 */
export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  open,
  onClose
}) => {
  const { shortcuts } = useKeyboardShortcuts({}, { enabled: false });

  const shortcutCategories = {
    'File Operations': {
      'Ctrl+S / Cmd+S': 'Save document',
      'Ctrl+N / Cmd+N': 'Create new document',
      'Ctrl+O / Cmd+O': 'Open document',
    },
    'Edit Operations': {
      'Ctrl+Z / Cmd+Z': 'Undo',
      'Ctrl+Y / Cmd+Y': 'Redo',
      'Ctrl+Shift+Z / Cmd+Shift+Z': 'Redo (alternative)',
      'Ctrl+C / Cmd+C': 'Copy (when not in input field)',
      'Ctrl+V / Cmd+V': 'Paste (when not in input field)',
      'Ctrl+X / Cmd+X': 'Cut (when not in input field)',
      'Ctrl+F / Cmd+F': 'Find',
    },
    'Editor Functions': {
      'F1': 'Toggle AI Assistant',
      'F2': 'Toggle edit mode',
      'F5': 'Run current step',
    },
    'Navigation': {
      'Alt+↑': 'Focus previous step',
      'Alt+↓': 'Focus next step',
    },
    'Step Management': {
      'Ctrl+Alt+N / Cmd+Alt+N': 'Add new step',
      'Ctrl+Alt+Delete / Cmd+Alt+Delete': 'Delete current step',
      'Ctrl+Alt+↑ / Cmd+Alt+↑': 'Move step up',
      'Ctrl+Alt+↓ / Cmd+Alt+↓': 'Move step down',
    }
  };

  const renderShortcutCategory = (categoryName: string, shortcuts: Record<string, string>) => (
    <Box key={categoryName} sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        {categoryName}
      </Typography>
      <Grid container spacing={1}>
        {Object.entries(shortcuts).map(([shortcut, description]) => (
          <Grid item xs={12} key={shortcut}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
              <Chip 
                label={shortcut} 
                variant="outlined" 
                size="small" 
                sx={{ 
                  fontFamily: 'monospace', 
                  minWidth: '140px',
                  '& .MuiChip-label': {
                    fontSize: '0.75rem'
                  }
                }}
              />
              <Typography variant="body2" sx={{ ml: 2, flex: 1 }}>
                {description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      {categoryName !== 'Step Management' && <Divider sx={{ mt: 2 }} />}
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '400px',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h5">Keyboard Shortcuts</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Available keyboard shortcuts for the ExecDoc Editor
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {Object.entries(shortcutCategories).map(([categoryName, shortcuts]) =>
            renderShortcutCategory(categoryName, shortcuts)
          )}
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> Copy, Cut, and Paste shortcuts work when focus is not in input fields. 
              Use standard browser shortcuts when editing text in input fields.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

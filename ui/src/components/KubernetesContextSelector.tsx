import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  CloudQueue as CloudIcon,
  AccountCircle as UserIcon,
  Folder as NamespaceIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useLiveRegion } from '../hooks/useLiveRegion';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useFocusManagement } from '../hooks/useFocusManagement';
import { useAriaAttributes } from '../hooks/useAriaAttributes';
import { KubernetesContext } from '../types';

interface KubernetesContextSelectorProps {
  contexts: KubernetesContext[];
  currentContext?: KubernetesContext;
  onContextChange: (context: KubernetesContext) => void;
  onNamespaceChange: (namespace: string) => void;
  onRefresh: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

interface ContextValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * KubernetesContextSelector Component
 * 
 * Context/namespace selection with full keyboard support
 * Features:
 * - Dropdown accessibility with listbox/option roles
 * - Arrow key navigation and Enter/Space activation
 * - Escape key closing and proper focus management
 * - Screen reader announcements for selections
 */
export const KubernetesContextSelector: React.FC<KubernetesContextSelectorProps> = ({
  contexts,
  currentContext,
  onContextChange,
  onNamespaceChange,
  onRefresh,
  loading = false,
  error = null
}) => {
  const [selectedContextName, setSelectedContextName] = useState(currentContext?.name || '');
  const [selectedNamespace, setSelectedNamespace] = useState(currentContext?.namespace || 'default');
  const [availableNamespaces, setAvailableNamespaces] = useState(['default', 'kube-system', 'kube-public']);
  const [validation, setValidation] = useState<ContextValidationResult | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customNamespace, setCustomNamespace] = useState('');

  // Accessibility hooks
  const { announcePolite, announceAssertive } = useLiveRegion();
  const { saveFocus, restoreFocus, focusElement } = useFocusManagement();
  const { generateId, createButtonAria, createListboxAria, createOptionAria } = useAriaAttributes();

  // Refs for focus management
  const contextSelectRef = useRef<HTMLSelectElement>(null);
  const namespaceSelectRef = useRef<HTMLSelectElement>(null);
  const refreshButtonRef = useRef<HTMLButtonElement>(null);

  // Generate stable IDs
  const contextSelectId = generateId('context-select');
  const namespaceSelectId = generateId('namespace-select');
  const contextListId = generateId('context-list');

  // Keyboard shortcuts
  const keyboardShortcuts = [
    {
      key: 'r',
      ctrlKey: true,
      description: 'Refresh contexts',
      handler: (event: KeyboardEvent) => {
        event.preventDefault();
        handleRefresh();
      }
    },
    {
      key: 'Escape',
      description: 'Close settings dialog',
      handler: (event: KeyboardEvent) => {
        if (settingsOpen) {
          event.preventDefault();
          handleCloseSettings();
        }
      }
    }
  ];

  useKeyboardNavigation(keyboardShortcuts);

  // Mock validation function
  const validateContext = (context: KubernetesContext): ContextValidationResult => {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (!context.cluster) {
      errors.push('Cluster information is missing');
    }

    if (!context.user) {
      errors.push('User information is missing');
    }

    if (context.namespace === 'kube-system') {
      warnings.push('Using kube-system namespace requires elevated permissions');
    }

    if (!context.isActive) {
      warnings.push('This context is not currently active');
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors
    };
  };

  // Mock function to fetch namespaces
  const fetchNamespaces = async (contextName: string): Promise<string[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockNamespaces = [
      'default',
      'kube-system',
      'kube-public',
      'ingress-nginx',
      'monitoring',
      'cert-manager',
      'apps',
      'development',
      'staging',
      'production'
    ];

    return mockNamespaces;
  };

  const handleContextChange = async (contextName: string) => {
    const context = contexts.find(ctx => ctx.name === contextName);
    if (!context) return;

    setSelectedContextName(contextName);
    
    try {
      announcePolite(`Switching to context: ${contextName}`);
      
      // Validate context
      const validationResult = validateContext(context);
      setValidation(validationResult);

      // Fetch available namespaces for this context
      const namespaces = await fetchNamespaces(contextName);
      setAvailableNamespaces(namespaces);
      
      // Reset namespace to default if current one is not available
      const defaultNamespace = namespaces.includes(selectedNamespace) ? selectedNamespace : 'default';
      setSelectedNamespace(defaultNamespace);
      
      // Update context
      const updatedContext: KubernetesContext = {
        ...context,
        namespace: defaultNamespace
      };
      
      onContextChange(updatedContext);
      
      if (validationResult.valid) {
        announcePolite(`Successfully switched to context ${contextName} in namespace ${defaultNamespace}`);
      } else {
        announceAssertive(`Context ${contextName} selected but has validation errors`);
      }
      
    } catch (err) {
      announceAssertive(`Failed to switch context: ${contextName}`);
    }
  };

  const handleNamespaceChange = (namespace: string) => {
    setSelectedNamespace(namespace);
    onNamespaceChange(namespace);
    announcePolite(`Namespace changed to: ${namespace}`);
  };

  const handleRefresh = async () => {
    try {
      announcePolite('Refreshing Kubernetes contexts...');
      await onRefresh();
      announcePolite('Contexts refreshed successfully');
    } catch (err) {
      announceAssertive('Failed to refresh contexts');
    }
  };

  const handleOpenSettings = () => {
    saveFocus();
    setSettingsOpen(true);
    announcePolite('Context settings dialog opened');
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
    setCustomNamespace('');
    restoreFocus();
    announcePolite('Context settings dialog closed');
  };

  const handleAddCustomNamespace = () => {
    if (customNamespace.trim() && !availableNamespaces.includes(customNamespace.trim())) {
      const newNamespaces = [...availableNamespaces, customNamespace.trim()];
      setAvailableNamespaces(newNamespaces);
      setSelectedNamespace(customNamespace.trim());
      onNamespaceChange(customNamespace.trim());
      announcePolite(`Custom namespace ${customNamespace.trim()} added and selected`);
      handleCloseSettings();
    }
  };

  const getContextStatusColor = (context: KubernetesContext) => {
    if (!context.isActive) return 'default';
    
    const validation = validateContext(context);
    if (!validation.valid) return 'error';
    if (validation.warnings.length > 0) return 'warning';
    return 'success';
  };

  const getContextStatusIcon = (context: KubernetesContext) => {
    if (!context.isActive) return null;
    
    const validation = validateContext(context);
    if (!validation.valid) return <ErrorIcon />;
    if (validation.warnings.length > 0) return <WarningIcon />;
    return <CheckCircleIcon />;
  };

  // Button aria attributes
  const refreshButtonAria = createButtonAria('Refresh Kubernetes contexts', {
    disabled: loading
  });

  const settingsButtonAria = createButtonAria('Open context settings');

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: '2rem', fontWeight: 'bold' }}>
          <CloudIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Kubernetes Context & Namespace
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select your Kubernetes context and namespace for executing commands. 
          Use Ctrl+R to refresh available contexts.
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} role="alert">
          {error}
        </Alert>
      )}

      {/* Validation Results */}
      {validation && (
        <Box sx={{ mb: 3 }}>
          {validation.errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 1 }}>
              <Typography variant="body2" component="div">
                <strong>Errors:</strong>
                <ul style={{ margin: '4px 0', paddingLeft: '1.5rem' }}>
                  {validation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Typography>
            </Alert>
          )}
          
          {validation.warnings.length > 0 && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              <Typography variant="body2" component="div">
                <strong>Warnings:</strong>
                <ul style={{ margin: '4px 0', paddingLeft: '1.5rem' }}>
                  {validation.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      {/* Context Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant="h2" component="h2" sx={{ fontSize: '1.5rem', flex: 1 }}>
              Context Selection
            </Typography>
            
            <Tooltip title="Refresh contexts (Ctrl+R)">
              <IconButton
                {...refreshButtonAria}
                ref={refreshButtonRef}
                onClick={handleRefresh}
                disabled={loading}
                color="primary"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Context settings">
              <IconButton
                {...settingsButtonAria}
                onClick={handleOpenSettings}
                color="primary"
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            {/* Context Selector */}
            <FormControl fullWidth>
              <InputLabel id={`${contextSelectId}-label`}>Kubernetes Context</InputLabel>
              <Select
                ref={contextSelectRef}
                labelId={`${contextSelectId}-label`}
                id={contextSelectId}
                value={selectedContextName}
                label="Kubernetes Context"
                onChange={(e) => handleContextChange(e.target.value)}
                disabled={loading || contexts.length === 0}
                aria-describedby={`${contextSelectId}-help`}
              >
                {contexts.map((context) => (
                  <MenuItem 
                    key={context.name} 
                    value={context.name}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <Typography>{context.name}</Typography>
                      {context.isActive && (
                        <Chip
                          icon={getContextStatusIcon(context)}
                          label="Active"
                          size="small"
                          color={getContextStatusColor(context)}
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              <Typography id={`${contextSelectId}-help`} variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Select the Kubernetes context to use for command execution
              </Typography>
            </FormControl>

            {/* Namespace Selector */}
            <FormControl fullWidth>
              <InputLabel id={`${namespaceSelectId}-label`}>Namespace</InputLabel>
              <Select
                ref={namespaceSelectRef}
                labelId={`${namespaceSelectId}-label`}
                id={namespaceSelectId}
                value={selectedNamespace}
                label="Namespace"
                onChange={(e) => handleNamespaceChange(e.target.value)}
                disabled={loading || !selectedContextName}
                aria-describedby={`${namespaceSelectId}-help`}
              >
                {availableNamespaces.map((namespace) => (
                  <MenuItem key={namespace} value={namespace}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NamespaceIcon fontSize="small" />
                      <Typography>{namespace}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              <Typography id={`${namespaceSelectId}-help`} variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Select the namespace for resource operations
              </Typography>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Current Context Details */}
      {currentContext && (
        <Card>
          <CardContent>
            <Typography variant="h3" component="h3" gutterBottom sx={{ fontSize: '1.25rem' }}>
              Current Context Details
            </Typography>

            <List id={contextListId} aria-label="Current context information">
              <ListItem>
                <ListItemIcon>
                  <CloudIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Cluster" 
                  secondary={currentContext.cluster || 'Not specified'}
                />
              </ListItem>

              <Divider variant="inset" component="li" />

              <ListItem>
                <ListItemIcon>
                  <UserIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="User" 
                  secondary={currentContext.user || 'Not specified'}
                />
              </ListItem>

              <Divider variant="inset" component="li" />

              <ListItem>
                <ListItemIcon>
                  <NamespaceIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Namespace" 
                  secondary={currentContext.namespace}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      )}

      {/* Settings Dialog */}
      <Dialog 
        open={settingsOpen} 
        onClose={handleCloseSettings}
        maxWidth="sm"
        fullWidth
        aria-labelledby="settings-dialog-title"
        aria-describedby="settings-dialog-description"
      >
        <DialogTitle id="settings-dialog-title">
          Context Settings
        </DialogTitle>
        <DialogContent id="settings-dialog-description">
          <Typography variant="body2" color="text.secondary" paragraph>
            Add custom namespaces or configure context-specific settings.
          </Typography>

          <TextField
            fullWidth
            label="Custom Namespace"
            value={customNamespace}
            onChange={(e) => setCustomNamespace(e.target.value)}
            placeholder="Enter namespace name"
            helperText="Add a custom namespace to the available list"
            sx={{ mt: 2 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customNamespace.trim()) {
                handleAddCustomNamespace();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddCustomNamespace}
            variant="contained"
            disabled={!customNamespace.trim()}
          >
            Add Namespace
          </Button>
        </DialogActions>
      </Dialog>

      {/* Keyboard Shortcuts Help */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="h4" component="h4" gutterBottom sx={{ fontSize: '1.125rem' }}>
          Keyboard Shortcuts
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li><strong>Ctrl+R:</strong> Refresh contexts</li>
            <li><strong>Tab:</strong> Navigate between controls</li>
            <li><strong>Space/Enter:</strong> Open dropdowns</li>
            <li><strong>Arrow keys:</strong> Navigate dropdown options</li>
            <li><strong>Escape:</strong> Close dialogs and dropdowns</li>
          </ul>
        </Typography>
      </Box>
    </Container>
  );
};
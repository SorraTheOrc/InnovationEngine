import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Chip,
  Alert,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  Help as HelpIcon,
  Code as CodeIcon,
  Terminal as TerminalIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useLiveRegion } from '../hooks/useLiveRegion';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useFocusManagement } from '../hooks/useFocusManagement';
import { useAriaAttributes } from '../hooks/useAriaAttributes';
import { ExecDocStep } from '../types';

interface ExecDocStepEditorProps {
  steps: ExecDocStep[];
  onStepsChange: (steps: ExecDocStep[]) => void;
  onStepExecute: (stepId: string) => Promise<void>;
  onStepStop: (stepId: string) => void;
  readOnly?: boolean;
  aiEnabled?: boolean;
}

interface StepCardProps {
  step: ExecDocStep;
  index: number;
  onUpdate: (step: ExecDocStep) => void;
  onDelete: (stepId: string) => void;
  onExecute: (stepId: string) => Promise<void>;
  onStop: (stepId: string) => void;
  onGetHelp: (stepId: string) => void;
  readOnly?: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  index,
  onUpdate,
  onDelete,
  onExecute,
  onStop,
  onGetHelp,
  readOnly = false,
  expanded,
  onExpandedChange
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { announcePolite, announceAssertive } = useLiveRegion();
  const { generateId, createButtonAria } = useAriaAttributes();

  // Refs for focus management
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const codeInputRef = useRef<HTMLTextAreaElement>(null);

  // Generate stable IDs
  const stepId = `step-${step.id}`;
  const titleId = generateId(`step-title-${index}`);
  const descriptionId = generateId(`step-description-${index}`);
  const codeId = generateId(`step-code-${index}`);
  const outputId = generateId(`step-output-${index}`);

  const handleTitleChange = (title: string) => {
    onUpdate({ ...step, title });
    announcePolite(`Step ${index + 1} title updated`);
  };

  const handleDescriptionChange = (description: string) => {
    onUpdate({ ...step, description });
  };

  const handleCodeChange = (code: string) => {
    onUpdate({ ...step, code });
  };

  const handleExecute = async () => {
    try {
      announcePolite(`Executing step ${index + 1}: ${step.title}`);
      await onExecute(step.id);
      announcePolite(`Step ${index + 1} execution completed`);
    } catch (error) {
      announceAssertive(`Step ${index + 1} execution failed`);
    }
  };

  const handleStop = () => {
    onStop(step.id);
    announceAssertive(`Step ${index + 1} execution stopped`);
  };

  const handleDelete = () => {
    onDelete(step.id);
    announceAssertive(`Step ${index + 1} deleted`);
    setAnchorEl(null);
  };

  const handleGetHelp = () => {
    onGetHelp(step.id);
    announcePolite(`Getting AI assistance for step ${index + 1}`);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status: ExecDocStep['status']) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'running': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: ExecDocStep['status']) => {
    switch (status) {
      case 'success': return <CheckCircleIcon />;
      case 'error': return <ErrorIcon />;
      case 'running': return <LinearProgress />;
      default: return null;
    }
  };

  // Button aria attributes
  const executeButtonAria = createButtonAria(`Execute step ${index + 1}`, {
    disabled: !step.code.trim() || step.status === 'running'
  });

  const stopButtonAria = createButtonAria(`Stop step ${index + 1} execution`, {
    disabled: step.status !== 'running'
  });

  const deleteButtonAria = createButtonAria(`Delete step ${index + 1}`);

  const helpButtonAria = createButtonAria(`Get AI help for step ${index + 1}`);

  return (
    <Accordion 
      expanded={expanded} 
      onChange={(_, isExpanded) => onExpandedChange(isExpanded)}
      sx={{ mb: 2 }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${stepId}-content`}
        id={`${stepId}-header`}
        sx={{ 
          '& .MuiAccordionSummary-content': { 
            alignItems: 'center',
            gap: 2
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Typography variant="h6" component="h3" sx={{ minWidth: 100 }}>
            Step {index + 1}
          </Typography>
          
          <Typography variant="body1" sx={{ flex: 1, color: 'text.secondary' }}>
            {step.title || 'Untitled Step'}
          </Typography>

          <Chip
            icon={getStatusIcon(step.status)}
            label={step.status}
            color={getStatusColor(step.status)}
            size="small"
            variant="outlined"
          />

          {/* Action buttons in header */}
          <Box sx={{ display: 'flex', gap: 1 }} onClick={(e) => e.stopPropagation()}>
            {step.status === 'running' ? (
              <Tooltip title="Stop execution">
                <IconButton
                  {...stopButtonAria}
                  onClick={handleStop}
                  size="small"
                  color="error"
                >
                  <StopIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Execute step">
                <IconButton
                  {...executeButtonAria}
                  onClick={handleExecute}
                  size="small"
                  color="primary"
                  disabled={!step.code.trim() || readOnly}
                >
                  <PlayArrowIcon />
                </IconButton>
              </Tooltip>
            )}

            {!readOnly && (
              <Tooltip title="More actions">
                <IconButton
                  aria-label={`More actions for step ${index + 1}`}
                  onClick={handleMenuOpen}
                  size="small"
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails id={`${stepId}-content`}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Step Title */}
          <TextField
            ref={titleInputRef}
            id={titleId}
            label="Step Title"
            fullWidth
            variant="outlined"
            value={step.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            disabled={readOnly}
            placeholder="Enter a descriptive title for this step"
            aria-describedby={`${titleId}-help`}
          />
          <Typography id={`${titleId}-help`} variant="caption" color="text.secondary">
            Provide a clear, descriptive title that explains what this step accomplishes.
          </Typography>

          {/* Step Description */}
          <TextField
            ref={descriptionInputRef}
            id={descriptionId}
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={step.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            disabled={readOnly}
            placeholder="Describe what this step does, its purpose, and any important notes..."
            aria-describedby={`${descriptionId}-help`}
          />
          <Typography id={`${descriptionId}-help`} variant="caption" color="text.secondary">
            Explain the purpose of this step and any prerequisites or important considerations.
          </Typography>

          {/* Step Code */}
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CodeIcon />
              Executable Code
            </Typography>
            <TextField
              ref={codeInputRef}
              id={codeId}
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              value={step.code}
              onChange={(e) => handleCodeChange(e.target.value)}
              disabled={readOnly}
              placeholder="Enter the commands to execute..."
              sx={{ 
                fontFamily: 'monospace',
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }
              }}
              aria-describedby={`${codeId}-help`}
            />
            <Typography id={`${codeId}-help`} variant="caption" color="text.secondary">
              Enter shell commands, kubectl commands, or scripts. Use Ctrl+Enter to save changes.
            </Typography>
          </Box>

          {/* Step Output */}
          {step.output && (
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TerminalIcon />
                Execution Output
              </Typography>
              <TextField
                id={outputId}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={step.output}
                disabled
                sx={{ 
                  fontFamily: 'monospace',
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    backgroundColor: 'grey.50'
                  }
                }}
                aria-label="Step execution output"
              />
            </Box>
          )}

          {/* Execution Progress */}
          {step.status === 'running' && (
            <Alert severity="info" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LinearProgress sx={{ flex: 1 }} />
              <Typography variant="body2">
                Executing step...
              </Typography>
            </Alert>
          )}

          {/* Error Display */}
          {step.status === 'error' && (
            <Alert severity="error">
              <Typography variant="body2">
                Step execution failed. Check the output above for error details.
              </Typography>
            </Alert>
          )}

          {/* Success Display */}
          {step.status === 'success' && (
            <Alert severity="success">
              <Typography variant="body2">
                Step executed successfully!
              </Typography>
            </Alert>
          )}
        </Box>
      </AccordionDetails>

      {!readOnly && (
        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
          <Button
            startIcon={<SaveIcon />}
            variant="outlined"
            size="small"
            aria-label={`Save changes to step ${index + 1}`}
          >
            Save Changes
          </Button>
        </CardActions>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleGetHelp}>
          <HelpIcon sx={{ mr: 1 }} />
          Get AI Help
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Step
        </MenuItem>
      </Menu>
    </Accordion>
  );
};

/**
 * ExecDocStepEditor Component
 * 
 * Step-by-step execution editor with comprehensive accessibility
 * Features:
 * - Collapsible panels with ARIA expansion states
 * - CTRL+ENTER shortcuts for saving changes
 * - Keyboard navigation through step lists
 * - Screen reader announcements for status changes
 * - Accessible code and output display areas
 */
export const ExecDocStepEditor: React.FC<ExecDocStepEditorProps> = ({
  steps,
  onStepsChange,
  onStepExecute,
  onStepStop,
  readOnly = false,
  aiEnabled = true
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const { announcePolite, announceAssertive } = useLiveRegion();
  const { createButtonAria } = useAriaAttributes();

  // Keyboard shortcuts
  const keyboardShortcuts = [
    {
      key: 'Enter',
      ctrlKey: true,
      description: 'Save step changes',
      handler: (event: KeyboardEvent) => {
        event.preventDefault();
        announcePolite('Step changes saved');
      }
    }
  ];

  useKeyboardNavigation(keyboardShortcuts);

  const handleStepUpdate = useCallback((updatedStep: ExecDocStep) => {
    const newSteps = steps.map(step => 
      step.id === updatedStep.id ? updatedStep : step
    );
    onStepsChange(newSteps);
  }, [steps, onStepsChange]);

  const handleStepDelete = useCallback((stepId: string) => {
    const newSteps = steps.filter(step => step.id !== stepId);
    onStepsChange(newSteps);
    
    // Remove from expanded set
    const newExpanded = new Set(expandedSteps);
    newExpanded.delete(stepId);
    setExpandedSteps(newExpanded);
  }, [steps, onStepsChange, expandedSteps]);

  const handleAddStep = () => {
    const newStep: ExecDocStep = {
      id: `step-${Date.now()}`,
      title: '',
      description: '',
      code: '',
      status: 'pending',
      order: steps.length
    };
    
    onStepsChange([...steps, newStep]);
    
    // Expand the new step
    const newExpanded = new Set(expandedSteps);
    newExpanded.add(newStep.id);
    setExpandedSteps(newExpanded);
    
    announcePolite(`New step added. Step ${steps.length + 1} is now ready for editing.`);
  };

  const handleStepExpansion = (stepId: string, expanded: boolean) => {
    const newExpanded = new Set(expandedSteps);
    if (expanded) {
      newExpanded.add(stepId);
    } else {
      newExpanded.delete(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const handleStepHelp = (stepId: string) => {
    // Mock AI help function
    announcePolite('AI assistance is being prepared for this step.');
  };

  const addButtonAria = createButtonAria('Add new step', {
    disabled: readOnly
  });

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: '2rem', fontWeight: 'bold' }}>
          Execution Steps Editor
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Define the executable steps for your document. Each step can contain commands, scripts, 
          or instructions that users can execute interactively.
        </Typography>
      </Box>

      {/* Steps List */}
      <Box sx={{ mb: 3 }}>
        {steps.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body1">
              No steps have been added yet. Click "Add Step" to create your first executable step.
            </Typography>
          </Alert>
        ) : (
          <Box>
            <Typography variant="h2" component="h2" gutterBottom sx={{ fontSize: '1.5rem' }}>
              Steps ({steps.length})
            </Typography>
            
            {steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                index={index}
                onUpdate={handleStepUpdate}
                onDelete={handleStepDelete}
                onExecute={onStepExecute}
                onStop={onStepStop}
                onGetHelp={handleStepHelp}
                readOnly={readOnly}
                expanded={expandedSteps.has(step.id)}
                onExpandedChange={(expanded) => handleStepExpansion(step.id, expanded)}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Add Step Button */}
      {!readOnly && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            {...addButtonAria}
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddStep}
            size="large"
            sx={{ minWidth: 160 }}
          >
            Add Step
          </Button>
        </Box>
      )}

      {/* Keyboard Shortcuts Help */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="h3" component="h3" gutterBottom sx={{ fontSize: '1.25rem' }}>
          Keyboard Shortcuts
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li><strong>Ctrl+Enter:</strong> Save step changes</li>
            <li><strong>Tab:</strong> Navigate between form fields</li>
            <li><strong>Space/Enter:</strong> Expand/collapse step panels</li>
            <li><strong>Arrow keys:</strong> Navigate through steps</li>
          </ul>
        </Typography>
      </Box>
    </Container>
  );
};
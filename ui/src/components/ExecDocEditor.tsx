import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Card,
  CardContent,
  Alert,
  Fab,
  Toolbar,
  AppBar,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Visibility as PreviewIcon,
  Accessibility as AccessibilityIcon,
  Help as HelpIcon,
  Home as HomeIcon
} from '@mui/icons-material';

import { OverviewAuthoring } from './OverviewAuthoring';
import { ExecDocStepEditor } from './ExecDocStepEditor';
import { KubernetesContextSelector } from './KubernetesContextSelector';
import { FileOperations } from './FileOperations';

import { useLiveRegion } from '../hooks/useLiveRegion';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useFocusManagement } from '../hooks/useFocusManagement';
import { useAriaAttributes } from '../hooks/useAriaAttributes';
import { useAccessibility } from '../hooks/useAccessibilityPreferences';

import { 
  ExecDoc, 
  ExecDocStep, 
  KubernetesContext, 
  AuthoringPhase, 
  FileOperationResult,
  EditorPhase
} from '../types';

interface ExecDocEditorProps {
  initialDoc?: Partial<ExecDoc>;
  onDocumentChange?: (doc: ExecDoc) => void;
  onSave?: (doc: ExecDoc) => Promise<void>;
  readOnly?: boolean;
  aiEnabled?: boolean;
}

/**
 * ExecDocEditor Component
 * 
 * Main editor with phase-based workflow and comprehensive accessibility
 * Features:
 * - Phase navigation with proper tab/tabpanel structure
 * - Skip-to-content links for efficient navigation
 * - Screen reader announcements for phase transitions
 * - Proper landmark regions (main, navigation)
 * - Focus management between workflow phases
 */
export const ExecDocEditor: React.FC<ExecDocEditorProps> = ({
  initialDoc,
  onDocumentChange,
  onSave,
  readOnly = false,
  aiEnabled = true
}) => {
  // Document state
  const [document, setDocument] = useState<ExecDoc>(() => ({
    id: initialDoc?.id || `doc-${Date.now()}`,
    title: initialDoc?.title || '',
    description: initialDoc?.description || '',
    overview: initialDoc?.overview || '',
    steps: initialDoc?.steps || [],
    metadata: initialDoc?.metadata || {
      author: '',
      version: '1.0.0',
      tags: [],
      difficulty: 'beginner',
      estimatedTime: 30,
      prerequisites: [],
      requiredPermissions: []
    },
    createdAt: initialDoc?.createdAt || new Date(),
    updatedAt: new Date()
  }));

  // Editor state
  const [currentPhase, setCurrentPhase] = useState<AuthoringPhase>('overview');
  const [completedPhases, setCompletedPhases] = useState<Set<AuthoringPhase>>(new Set());
  const [saving, setSaving] = useState(false);
  const [kubernetesContext, setKubernetesContext] = useState<KubernetesContext | null>(null);
  const [kubernetesContexts, setKubernetesContexts] = useState<KubernetesContext[]>([]);

  // Accessibility hooks
  const { announcePolite, announceAssertive } = useLiveRegion();
  const { saveFocus, restoreFocus, focusElement } = useFocusManagement();
  const { generateId, createButtonAria } = useAriaAttributes();
  const preferences = useAccessibility();

  // Generate stable IDs
  const mainContentId = generateId('main-content');
  const navigationId = generateId('navigation');
  const phaseStepperId = generateId('phase-stepper');

  // Define editor phases
  const phases: EditorPhase[] = [
    {
      id: 'overview',
      name: 'Overview',
      description: 'Create document overview and description',
      completed: completedPhases.has('overview'),
      current: currentPhase === 'overview',
      enabled: true
    },
    {
      id: 'steps',
      name: 'Steps',
      description: 'Define executable steps',
      completed: completedPhases.has('steps'),
      current: currentPhase === 'steps',
      enabled: completedPhases.has('overview') || currentPhase === 'steps'
    },
    {
      id: 'review',
      name: 'Review',
      description: 'Review and validate document',
      completed: completedPhases.has('review'),
      current: currentPhase === 'review',
      enabled: completedPhases.has('steps') || currentPhase === 'review'
    },
    {
      id: 'save',
      name: 'Save',
      description: 'Save and export document',
      completed: completedPhases.has('save'),
      current: currentPhase === 'save',
      enabled: completedPhases.has('review') || currentPhase === 'save'
    }
  ];

  // Keyboard shortcuts
  const keyboardShortcuts = [
    {
      key: 's',
      ctrlKey: true,
      description: 'Save document',
      handler: (event: KeyboardEvent) => {
        event.preventDefault();
        if (!readOnly) {
          handleSaveDocument();
        }
      }
    },
    {
      key: 'ArrowRight',
      ctrlKey: true,
      description: 'Next phase',
      handler: (event: KeyboardEvent) => {
        event.preventDefault();
        handleNextPhase();
      }
    },
    {
      key: 'ArrowLeft',
      ctrlKey: true,
      description: 'Previous phase',
      handler: (event: KeyboardEvent) => {
        event.preventDefault();
        handlePreviousPhase();
      }
    }
  ];

  useKeyboardNavigation(keyboardShortcuts);

  // Mock Kubernetes contexts
  useEffect(() => {
    const mockContexts: KubernetesContext[] = [
      {
        name: 'development',
        cluster: 'dev-cluster',
        user: 'dev-user',
        namespace: 'default',
        isActive: true
      },
      {
        name: 'staging',
        cluster: 'staging-cluster',
        user: 'staging-user',
        namespace: 'staging',
        isActive: false
      },
      {
        name: 'production',
        cluster: 'prod-cluster',
        user: 'prod-user',
        namespace: 'production',
        isActive: false
      }
    ];
    
    setKubernetesContexts(mockContexts);
    setKubernetesContext(mockContexts[0]);
  }, []);

  // Document change handler
  useEffect(() => {
    if (onDocumentChange) {
      onDocumentChange(document);
    }
  }, [document, onDocumentChange]);

  const handleOverviewChange = useCallback((overview: string) => {
    setDocument(prev => ({
      ...prev,
      overview,
      updatedAt: new Date()
    }));
  }, []);

  const handleStepsChange = useCallback((steps: ExecDocStep[]) => {
    setDocument(prev => ({
      ...prev,
      steps,
      updatedAt: new Date()
    }));
  }, []);

  const handleSaveOverview = useCallback(() => {
    const newCompleted = new Set(completedPhases);
    newCompleted.add('overview');
    setCompletedPhases(newCompleted);
    announcePolite('Overview completed. You can now proceed to define steps.');
  }, [completedPhases]);

  const handleStepExecute = useCallback(async (stepId: string) => {
    // Mock step execution
    const stepIndex = document.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    const updatedSteps = [...document.steps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      status: 'running'
    };
    
    setDocument(prev => ({
      ...prev,
      steps: updatedSteps
    }));

    // Simulate execution
    setTimeout(() => {
      const finalSteps = [...updatedSteps];
      finalSteps[stepIndex] = {
        ...finalSteps[stepIndex],
        status: 'success',
        output: 'Command executed successfully\nOutput: Operation completed'
      };
      
      setDocument(prev => ({
        ...prev,
        steps: finalSteps
      }));
      
      announcePolite(`Step ${stepIndex + 1} executed successfully`);
    }, 3000);
  }, [document.steps]);

  const handleStepStop = useCallback((stepId: string) => {
    const stepIndex = document.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    const updatedSteps = [...document.steps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      status: 'pending'
    };
    
    setDocument(prev => ({
      ...prev,
      steps: updatedSteps
    }));
    
    announceAssertive(`Step ${stepIndex + 1} execution stopped`);
  }, [document.steps]);

  const handlePhaseChange = (phase: AuthoringPhase) => {
    const phaseObj = phases.find(p => p.id === phase);
    if (!phaseObj?.enabled) return;

    setCurrentPhase(phase);
    announcePolite(`Switched to ${phaseObj.name} phase: ${phaseObj.description}`);
  };

  const handleNextPhase = () => {
    const currentIndex = phases.findIndex(p => p.id === currentPhase);
    const nextPhase = phases[currentIndex + 1];
    
    if (nextPhase && nextPhase.enabled) {
      handlePhaseChange(nextPhase.id as AuthoringPhase);
    }
  };

  const handlePreviousPhase = () => {
    const currentIndex = phases.findIndex(p => p.id === currentPhase);
    const prevPhase = phases[currentIndex - 1];
    
    if (prevPhase) {
      handlePhaseChange(prevPhase.id as AuthoringPhase);
    }
  };

  const handleSaveDocument = async () => {
    if (!onSave || readOnly) return;

    setSaving(true);
    try {
      await onSave(document);
      const newCompleted = new Set(completedPhases);
      newCompleted.add('save');
      setCompletedPhases(newCompleted);
      announcePolite('Document saved successfully');
    } catch (error) {
      announceAssertive('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleFileOperationSave = async (filename: string, format: string): Promise<FileOperationResult> => {
    // Mock file save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: `Document saved as ${filename}.${format}`,
      fileName: `${filename}.${format}`,
      filePath: `/documents/${filename}.${format}`
    };
  };

  const handleFileOperationLoad = async (file: File): Promise<FileOperationResult> => {
    // Mock file load operation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      message: `File ${file.name} loaded successfully`,
      fileName: file.name
    };
  };

  const handleFileOperationExport = async (format: string): Promise<FileOperationResult> => {
    // Mock export operation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      message: `Document exported in ${format} format`,
      fileName: `${document.title || 'document'}.${format}`
    };
  };

  const handleFileOperationImport = async (): Promise<FileOperationResult> => {
    // Mock import operation
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      success: true,
      message: 'Document imported successfully'
    };
  };

  const handleKubernetesContextsRefresh = async () => {
    // Mock refresh operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    announcePolite('Kubernetes contexts refreshed');
  };

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 'overview':
        return (
          <OverviewAuthoring
            onOverviewChange={handleOverviewChange}
            onSave={handleSaveOverview}
            initialOverview={document.overview}
            aiEnabled={aiEnabled}
          />
        );
      
      case 'steps':
        return (
          <ExecDocStepEditor
            steps={document.steps}
            onStepsChange={handleStepsChange}
            onStepExecute={handleStepExecute}
            onStepStop={handleStepStop}
            readOnly={readOnly}
            aiEnabled={aiEnabled}
          />
        );
      
      case 'review':
        return (
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <Typography variant="h2" component="h2" gutterBottom sx={{ fontSize: '1.5rem' }}>
              Document Review
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h3" component="h3" gutterBottom sx={{ fontSize: '1.25rem' }}>
                  Document Summary
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Title:</strong> {document.title || 'Untitled Document'}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Overview Length:</strong> {document.overview.length} characters
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Number of Steps:</strong> {document.steps.length}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Estimated Time:</strong> {document.metadata.estimatedTime} minutes
                </Typography>
              </CardContent>
            </Card>

            <KubernetesContextSelector
              contexts={kubernetesContexts}
              currentContext={kubernetesContext}
              onContextChange={setKubernetesContext}
              onNamespaceChange={(namespace) => {
                if (kubernetesContext) {
                  setKubernetesContext({
                    ...kubernetesContext,
                    namespace
                  });
                }
              }}
              onRefresh={handleKubernetesContextsRefresh}
            />
          </Container>
        );
      
      case 'save':
        return (
          <FileOperations
            currentDoc={document}
            onSave={handleFileOperationSave}
            onLoad={handleFileOperationLoad}
            onExport={handleFileOperationExport}
            onImport={handleFileOperationImport}
            readOnly={readOnly}
          />
        );
      
      default:
        return null;
    }
  };

  const currentPhaseIndex = phases.findIndex(p => p.id === currentPhase);
  const canGoNext = currentPhaseIndex < phases.length - 1 && phases[currentPhaseIndex + 1]?.enabled;
  const canGoPrevious = currentPhaseIndex > 0;

  // Button aria attributes
  const nextButtonAria = createButtonAria('Go to next phase (Ctrl+Right Arrow)', {
    disabled: !canGoNext
  });

  const previousButtonAria = createButtonAria('Go to previous phase (Ctrl+Left Arrow)', {
    disabled: !canGoPrevious
  });

  const saveButtonAria = createButtonAria('Save document (Ctrl+S)', {
    disabled: readOnly || saving
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Skip to content link */}
      <a href={`#${mainContentId}`} className="skip-link">
        Skip to main content
      </a>

      {/* Top App Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <AccessibilityIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="h1">
              Innovation Engine - Exec Doc Editor
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Accessibility features active">
              <Chip
                icon={<AccessibilityIcon />}
                label="WCAG AA"
                size="small"
                color="primary"
                variant="outlined"
              />
            </Tooltip>

            <Tooltip title="Get help">
              <IconButton
                aria-label="Get help"
                color="inherit"
              >
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Breadcrumbs Navigation */}
      <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Breadcrumbs aria-label="Document editing navigation">
            <Link
              color="inherit"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                announcePolite('Navigation: Home');
              }}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Home
            </Link>
            <Typography color="text.primary">
              {phases.find(p => p.id === currentPhase)?.name}
            </Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      {/* Phase Navigation */}
      <Box 
        component="nav" 
        id={navigationId}
        sx={{ p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
        role="navigation"
        aria-label="Editor phases"
      >
        <Container maxWidth="lg">
          <Stepper 
            activeStep={currentPhaseIndex} 
            id={phaseStepperId}
            sx={{ flexWrap: 'wrap' }}
          >
            {phases.map((phase, index) => (
              <Step 
                key={phase.id} 
                completed={phase.completed}
                disabled={!phase.enabled}
              >
                <StepLabel
                  onClick={() => phase.enabled && handlePhaseChange(phase.id as AuthoringPhase)}
                  sx={{ 
                    cursor: phase.enabled ? 'pointer' : 'default',
                    '& .MuiStepLabel-label': {
                      fontSize: '1rem',
                      fontWeight: phase.current ? 600 : 400
                    }
                  }}
                  aria-current={phase.current ? 'step' : undefined}
                >
                  <Box>
                    <Typography variant="body1" component="span">
                      {phase.name}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {phase.description}
                    </Typography>
                  </Box>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Container>
      </Box>

      {/* Main Content */}
      <Box 
        component="main" 
        id={mainContentId}
        sx={{ flex: 1, bgcolor: 'background.default' }}
        role="main"
        aria-label="Main editor content"
      >
        {renderPhaseContent()}
      </Box>

      {/* Phase Navigation Controls */}
      <Box 
        sx={{ 
          position: 'sticky', 
          bottom: 0, 
          bgcolor: 'background.paper', 
          borderTop: 1, 
          borderColor: 'divider',
          p: 2
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              {...previousButtonAria}
              startIcon={<BackIcon />}
              onClick={handlePreviousPhase}
              disabled={!canGoPrevious}
              variant="outlined"
            >
              Previous
            </Button>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Phase {currentPhaseIndex + 1} of {phases.length}
              </Typography>
              
              {!readOnly && (
                <Button
                  {...saveButtonAria}
                  startIcon={saving ? undefined : <SaveIcon />}
                  onClick={handleSaveDocument}
                  disabled={saving}
                  variant="contained"
                  color="primary"
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              )}
            </Box>

            <Button
              {...nextButtonAria}
              endIcon={<NextIcon />}
              onClick={handleNextPhase}
              disabled={!canGoNext}
              variant="contained"
            >
              {currentPhaseIndex === phases.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Accessibility Status Indicator */}
      {preferences.reduceMotion && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            zIndex: 1300
          }}
        >
          <Chip
            icon={<AccessibilityIcon />}
            label="Reduced Motion"
            size="small"
            color="info"
            variant="filled"
          />
        </Box>
      )}
    </Box>
  );
};
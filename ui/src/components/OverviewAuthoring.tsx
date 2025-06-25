import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Help as HelpIcon,
  Accessibility as AccessibilityIcon
} from '@mui/icons-material';
import { useLiveRegion } from '../hooks/useLiveRegion';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useFocusManagement } from '../hooks/useFocusManagement';
import { useAriaAttributes } from '../hooks/useAriaAttributes';
import { AIResponse } from '../types';

interface OverviewAuthoringProps {
  onOverviewChange: (overview: string) => void;
  onSave: () => void;
  initialOverview?: string;
  loading?: boolean;
  aiEnabled?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  id: string;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, id, ...other }) => {
  const { createTabPanelAria } = useAriaAttributes();
  const tabPanelAria = createTabPanelAria(`Tab panel ${index + 1}`, {
    labelledBy: `tab-${index}`,
    hidden: value !== index
  });

  return (
    <div
      {...tabPanelAria}
      id={id}
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

/**
 * OverviewAuthoring Component
 * 
 * AI-powered overview creation with full accessibility support
 * Features:
 * - ARIA labels for all interactive elements
 * - CTRL+ENTER keyboard shortcut for prompt submission
 * - Screen reader announcements for Azure OpenAI responses
 * - Tab-based interface with proper roles
 * - Skip-to-content link and focus management
 */
export const OverviewAuthoring: React.FC<OverviewAuthoringProps> = ({
  onOverviewChange,
  onSave,
  initialOverview = '',
  loading = false,
  aiEnabled = true
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [overview, setOverview] = useState(initialOverview);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Accessibility hooks
  const { announcePolite, announceAssertive } = useLiveRegion();
  const { saveFocus, restoreFocus } = useFocusManagement();
  const { generateId, createTabAria, createButtonAria, createInputAria } = useAriaAttributes();

  // Refs for focus management
  const promptInputRef = useRef<HTMLInputElement>(null);
  const overviewTextareaRef = useRef<HTMLTextAreaElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Generate stable IDs
  const promptInputId = generateId('prompt-input');
  const overviewTextareaId = generateId('overview-textarea');
  const tabsId = generateId('overview-tabs');
  const promptTabPanelId = generateId('prompt-tab-panel');
  const editTabPanelId = generateId('edit-tab-panel');

  // Keyboard shortcuts
  const keyboardShortcuts = [
    {
      key: 'Enter',
      ctrlKey: true,
      description: 'Submit prompt or save overview',
      handler: (event: KeyboardEvent) => {
        event.preventDefault();
        if (currentTab === 0 && prompt.trim()) {
          handleSubmitPrompt();
        } else if (currentTab === 1 && overview.trim()) {
          handleSaveOverview();
        }
      }
    },
    {
      key: 's',
      ctrlKey: true,
      description: 'Save overview',
      handler: (event: KeyboardEvent) => {
        event.preventDefault();
        handleSaveOverview();
      }
    }
  ];

  useKeyboardNavigation(keyboardShortcuts);

  // Mock AI service call
  const callAIService = async (userPrompt: string): Promise<AIResponse> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      content: `# Kubernetes Deployment Overview

Based on your prompt: "${userPrompt}"

This executable document will guide you through creating a robust Kubernetes deployment. The following steps will cover:

## Objectives
- Set up the application environment
- Configure deployment specifications
- Implement health checks and monitoring
- Ensure proper resource allocation
- Validate deployment success

## Prerequisites
- kubectl installed and configured
- Access to a Kubernetes cluster
- Basic understanding of Kubernetes concepts

## Expected Outcomes
After completing this guide, you will have:
- A fully deployed application in Kubernetes
- Health monitoring and readiness checks
- Proper resource management
- Validation of deployment status

This overview provides the foundation for the step-by-step implementation that follows.`,
      suggestions: [
        'Add specific resource requirements',
        'Include security considerations',
        'Specify monitoring requirements',
        'Add troubleshooting section'
      ],
      confidence: 0.92,
      tokens: 156,
      timestamp: new Date()
    };
  };

  const handleSubmitPrompt = async () => {
    if (!prompt.trim() || aiLoading) return;

    setAiLoading(true);
    setError(null);
    
    try {
      announcePolite('Generating overview with AI assistance. Please wait...');
      
      const response = await callAIService(prompt);
      setAiResponse(response);
      setOverview(response.content);
      onOverviewChange(response.content);
      
      announcePolite(`Overview generated successfully. ${response.content.length} characters of content created.`);
      
      // Automatically switch to edit tab
      setCurrentTab(1);
      
      // Focus the overview textarea after a brief delay
      setTimeout(() => {
        overviewTextareaRef.current?.focus();
      }, 100);
      
    } catch (err) {
      const errorMessage = 'Failed to generate overview. Please try again.';
      setError(errorMessage);
      announceAssertive(errorMessage);
    } finally {
      setAiLoading(false);
    }
  };

  const handleOverviewChange = (value: string) => {
    setOverview(value);
    onOverviewChange(value);
  };

  const handleSaveOverview = () => {
    if (overview.trim()) {
      onSave();
      announcePolite('Overview saved successfully.');
    } else {
      announceAssertive('Cannot save empty overview. Please add content first.');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    announcePolite(`Switched to ${newValue === 0 ? 'AI Prompt' : 'Edit Overview'} tab`);
  };

  const handleRefreshSuggestions = () => {
    if (aiResponse) {
      announcePolite('AI suggestions refreshed');
    }
  };

  // Tab aria attributes
  const promptTabAria = createTabAria('AI Prompt Tab', {
    selected: currentTab === 0,
    controls: promptTabPanelId
  });

  const editTabAria = createTabAria('Edit Overview Tab', {
    selected: currentTab === 1,
    controls: editTabPanelId
  });

  // Button aria attributes
  const submitButtonAria = createButtonAria('Submit prompt to generate overview', {
    disabled: !prompt.trim() || aiLoading
  });

  const saveButtonAria = createButtonAria('Save overview', {
    disabled: !overview.trim()
  });

  const refreshButtonAria = createButtonAria('Refresh AI suggestions');

  // Input aria attributes
  const promptInputAria = createInputAria('Enter your prompt for AI overview generation', {
    required: true,
    describedBy: aiEnabled ? 'prompt-help-text' : undefined
  });

  const overviewTextareaAria = createInputAria('Edit the generated overview content', {
    required: true,
    describedBy: 'overview-help-text'
  });

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Skip to content link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Main heading */}
      <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: '2rem', fontWeight: 'bold' }}>
        <AccessibilityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Create Executive Document Overview
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Use AI assistance to generate a comprehensive overview for your executable document, 
        or create one manually. Use Ctrl+Enter to submit prompts or save content.
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} role="alert">
          {error}
        </Alert>
      )}

      {/* Main content */}
      <Card id="main-content" sx={{ mt: 3 }}>
        <CardContent>
          {/* Tab Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              id={tabsId}
              aria-label="Overview authoring options"
            >
              <Tab 
                {...promptTabAria}
                label="AI Prompt"
                id="tab-0"
                disabled={!aiEnabled}
              />
              <Tab 
                {...editTabAria}
                label="Edit Overview"
                id="tab-1"
              />
            </Tabs>
          </Box>

          {/* AI Prompt Tab */}
          <TabPanel value={currentTab} index={0} id={promptTabPanelId}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h2" component="h2" gutterBottom sx={{ fontSize: '1.5rem' }}>
                Generate Overview with AI
              </Typography>
              
              <TextField
                {...promptInputAria}
                ref={promptInputRef}
                id={promptInputId}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Describe what you want to create... (e.g., 'Create a Kubernetes deployment for a Node.js application with health checks')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={aiLoading}
                sx={{ mb: 2 }}
              />

              {aiEnabled && (
                <Typography id="prompt-help-text" variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Press Ctrl+Enter to submit your prompt for AI generation.
                  The AI will create a comprehensive overview based on your requirements.
                </Typography>
              )}

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  {...submitButtonAria}
                  ref={submitButtonRef}
                  variant="contained"
                  startIcon={aiLoading ? <CircularProgress size={20} /> : <SendIcon />}
                  onClick={handleSubmitPrompt}
                  disabled={!prompt.trim() || aiLoading}
                  sx={{ minWidth: 140 }}
                >
                  {aiLoading ? 'Generating...' : 'Generate Overview'}
                </Button>

                {aiResponse && (
                  <Tooltip title="Refresh AI suggestions">
                    <IconButton 
                      {...refreshButtonAria}
                      onClick={handleRefreshSuggestions}
                      size="medium"
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {/* AI Response Preview */}
              {aiResponse && (
                <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="h3" component="h3" gutterBottom sx={{ fontSize: '1.25rem' }}>
                    AI Suggestions
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Confidence: {Math.round(aiResponse.confidence * 100)}% | 
                    Tokens: {aiResponse.tokens} | 
                    Generated: {aiResponse.timestamp.toLocaleTimeString()}
                  </Typography>
                  
                  {aiResponse.suggestions.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Suggestions for improvement:
                      </Typography>
                      <ul>
                        {aiResponse.suggestions.map((suggestion, index) => (
                          <li key={index}>
                            <Typography variant="body2">{suggestion}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </TabPanel>

          {/* Edit Overview Tab */}
          <TabPanel value={currentTab} index={1} id={editTabPanelId}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h2" component="h2" gutterBottom sx={{ fontSize: '1.5rem' }}>
                Edit Overview Content
              </Typography>
              
              <TextField
                {...overviewTextareaAria}
                ref={overviewTextareaRef}
                id={overviewTextareaId}
                fullWidth
                multiline
                rows={12}
                variant="outlined"
                placeholder="Write or edit your executable document overview here..."
                value={overview}
                onChange={(e) => handleOverviewChange(e.target.value)}
                sx={{ mb: 2, fontFamily: 'monospace' }}
              />

              <Typography id="overview-help-text" variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use Markdown formatting for headings, lists, and code blocks. 
                Press Ctrl+S or Ctrl+Enter to save your changes.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  {...saveButtonAria}
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveOverview}
                  disabled={!overview.trim()}
                  sx={{ minWidth: 120 }}
                >
                  Save Overview
                </Button>

                <Tooltip title="Get help with Markdown formatting">
                  <IconButton 
                    aria-label="Get help with Markdown formatting"
                    size="medium"
                  >
                    <HelpIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Content Statistics */}
              {overview && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Content Statistics: {overview.length} characters, {overview.split('\n').length} lines, {overview.split(/\s+/).filter(word => word.length > 0).length} words
                  </Typography>
                </Box>
              )}
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
    </Container>
  );
};
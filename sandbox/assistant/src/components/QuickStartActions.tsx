import React from 'react';
import {
  Box,
  Typography,
  Paper,
} from '@mui/material';
import {
  Rocket as RocketIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface QuickStartActionsProps {
  onActionClick: (prompt: string) => void;
}

const QuickStartActions: React.FC<QuickStartActionsProps> = ({ onActionClick }) => {
  const quickStartActions = [
    {
      title: 'Create Deployment',
      description: 'Create a new Kubernetes deployment',
      icon: <RocketIcon />,
      prompt: 'Create a deployment for my application with nginx image',
      color: 'primary' as const,
    },
    {
      title: 'Add Service',
      description: 'Expose your deployment with a service',
      icon: <NetworkIcon />,
      prompt: 'Create a service to expose my deployment',
      color: 'secondary' as const,
    },
    {
      title: 'Persistent Storage',
      description: 'Add persistent volume claims',
      icon: <StorageIcon />,
      prompt: 'How do I add persistent storage to my pods?',
      color: 'info' as const,
    },
    {
      title: 'Configuration',
      description: 'Manage ConfigMaps and Secrets',
      icon: <SettingsIcon />,
      prompt: 'Help me create ConfigMaps and Secrets for my application',
      color: 'warning' as const,
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>
        Quick Start Actions
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {quickStartActions.map((action, index) => (
          <Paper
            key={index}
            elevation={1}
            data-testid="quick-action-paper"
            sx={{
              p: 2,
              minWidth: 200,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                elevation: 3,
                transform: 'translateY(-2px)',
              },
            }}
            onClick={() => onActionClick(action.prompt)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ color: `${action.color}.main`, mr: 1 }}>
                {action.icon}
              </Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {action.title}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {action.description}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default QuickStartActions;
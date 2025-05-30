import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  PlayArrow as RunIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/themes/prism.css';

interface ResponseDisplayProps {
  content: string;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ content }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopySuccess(true);
    });
  };

  const renderContent = () => {
    const parts = content.split(/```(\w*)\n([\s\S]*?)```/g);
    const elements = [];

    for (let i = 0; i < parts.length; i++) {
      if (i % 3 === 0) {
        // Regular text
        if (parts[i].trim()) {
          elements.push(
            <Typography key={i} variant="body1" paragraph>
              {parts[i].trim()}
            </Typography>
          );
        }
      } else if (i % 3 === 1) {
        // Language identifier (skip)
        continue;
      } else {
        // Code block
        const language = parts[i - 1] || 'bash';
        const code = parts[i];
        
        elements.push(
          <Box key={i} sx={{ mb: 2 }}>
            <Box
              sx={{
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: 1,
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#eee',
                  px: 2,
                  py: 1,
                  borderBottom: '1px solid #ddd',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {language || 'bash'}
                </Typography>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleCopyCode(code)}
                    title="Copy code"
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    title="Run with Innovation Engine"
                    onClick={() => {
                      // In a real implementation, this would integrate with Innovation Engine
                      console.log('Run code:', code);
                    }}
                  >
                    <RunIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  m: 0,
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                }}
              >
                <code>{code}</code>
              </Box>
            </Box>
          </Box>
        );
      }
    }

    return elements;
  };

  return (
    <Box>
      {renderContent()}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setCopySuccess(false)}>
          Code copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResponseDisplay;
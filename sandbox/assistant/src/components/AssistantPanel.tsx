import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  ContentCopy as CopyIcon,
  PlayArrow as RunIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import ResponseDisplay from './ResponseDisplay';
import QuickStartActions from './QuickStartActions';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AssistantPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulate Copilot response for now
      // In a real implementation, this would integrate with GitHub Copilot API
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateMockResponse(inputValue),
        timestamp: new Date(),
      };

      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      console.error('Error sending message:', error);
    }
  };

  const generateMockResponse = (input: string): string => {
    if (input.toLowerCase().includes('deployment')) {
      return `Here's an executable document for creating a Kubernetes deployment:

\`\`\`bash
# Create a deployment for your application
kubectl create deployment my-app --image=nginx:latest

# Verify the deployment was created
kubectl get deployments

# Check the pods
kubectl get pods
\`\`\`

This creates a basic nginx deployment. You can customize the image and other parameters as needed.

Would you like me to help you:
- Scale this deployment
- Add a service to expose it
- Configure resource limits`;
    }

    if (input.toLowerCase().includes('service')) {
      return `Here's how to create a Kubernetes service:

\`\`\`bash
# Create a service to expose your deployment
kubectl expose deployment my-app --port=80 --target-port=80 --type=ClusterIP

# For external access, use LoadBalancer or NodePort
kubectl expose deployment my-app --port=80 --target-port=80 --type=LoadBalancer

# Verify the service
kubectl get services
\`\`\`

This exposes your application within the cluster or externally depending on the service type.`;
    }

    return `I understand you want help with: "${input}"

Here's a general approach using Innovation Engine executable documentation:

\`\`\`bash
# Check your current Kubernetes context
kubectl config current-context

# List available resources
kubectl get all

# Get cluster information
kubectl cluster-info
\`\`\`

Could you provide more specific details about what you'd like to accomplish?`;
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
        Assistant
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Get help authoring Executable Documents with GitHub Copilot. Ask questions about Kubernetes deployments, 
        services, and best practices.
      </Typography>

      <QuickStartActions onActionClick={setInputValue} />

      <Paper 
        elevation={2} 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          mb: 2, 
          overflow: 'hidden' 
        }}
      >
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {messages.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Welcome to the Assistant!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Ask me anything about Kubernetes or use the quick start actions above.
              </Typography>
            </Box>
          ) : (
            messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  mb: 2,
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    backgroundColor: message.type === 'user' ? 'primary.main' : 'grey.100',
                    color: message.type === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  {message.type === 'assistant' ? (
                    <ResponseDisplay content={message.content} />
                  ) : (
                    <Typography variant="body1">{message.content}</Typography>
                  )}
                </Paper>
              </Box>
            ))
          )}
          
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.100' }}>
                <Typography variant="body2" color="text.secondary">
                  Assistant is typing...
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Ask about Kubernetes deployments, services, or any other questions..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              variant="outlined"
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AssistantPanel;
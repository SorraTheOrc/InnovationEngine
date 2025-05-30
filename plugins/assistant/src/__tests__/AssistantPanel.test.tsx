import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssistantPanel from '../components/AssistantPanel';

// Mock Prism
jest.mock('prismjs', () => ({}));
jest.mock('prismjs/components/prism-bash', () => ({}));
jest.mock('prismjs/themes/prism.css', () => ({}));

// Set up a global Prism mock to avoid errors
(global as any).Prism = {
  highlightElement: jest.fn(),
  highlightAll: jest.fn(),
};

// Mock Material-UI components for testing
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Container: ({ children }: any) => <div data-testid="container">{children}</div>,
  Typography: ({ children }: any) => <div>{children}</div>,
  TextField: ({ onChange, onKeyPress, value, ...props }: any) => (
    <input
      data-testid="message-input"
      value={value || ''}
      onChange={(e) => onChange?.(e)}
      onKeyPress={(e) => onKeyPress?.(e)}
      {...props}
    />
  ),
  Button: ({ onClick, children, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="send-button">
      {children}
    </button>
  ),
  Paper: ({ children }: any) => <div data-testid="paper">{children}</div>,
  Box: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@mui/icons-material', () => ({
  Send: () => <span>Send</span>,
  ContentCopy: () => <span>Copy</span>,
  PlayArrow: () => <span>Run</span>,
  Help: () => <span>Help</span>,
  Rocket: () => <span>Rocket</span>,
  Storage: () => <span>Storage</span>,
  NetworkCheck: () => <span>Network</span>,
  Settings: () => <span>Settings</span>,
  Smart_toy: () => <span>SmartToy</span>,
}));

describe('AssistantPanel', () => {
  beforeEach(() => {
    // Clear any previous renders
    document.body.innerHTML = '';
  });

  test('renders AssistantPanel with welcome message', () => {
    render(<AssistantPanel />);
    
    expect(screen.getByText('Assistant')).toBeInTheDocument();
    expect(screen.getByText('Welcome to the Assistant!')).toBeInTheDocument();
    expect(screen.getByText(/Ask me anything about Kubernetes/)).toBeInTheDocument();
  });

  test('accepts user input', () => {
    render(<AssistantPanel />);
    
    const input = screen.getByTestId('message-input');
    expect(input).toBeInTheDocument();
    
    fireEvent.change(input, { target: { value: 'Create a deployment' } });
    expect(input).toHaveValue('Create a deployment');
  });

  test('sends message on button click', async () => {
    render(<AssistantPanel />);
    
    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: 'Create a deployment' } });
    fireEvent.click(sendButton);
    
    // Check that the input is cleared
    expect(input).toHaveValue('');
    
    // Wait for the response to appear
    await waitFor(() => {
      expect(screen.getByText('Create a deployment')).toBeInTheDocument();
    });
  });

  test('sends message on Enter key press', async () => {
    render(<AssistantPanel />);
    
    const input = screen.getByTestId('message-input');
    
    fireEvent.change(input, { target: { value: 'Help with service' } });
    
    // Simulate Enter key press with the correct event structure
    fireEvent.keyPress(input, { 
      key: 'Enter', 
      code: 'Enter', 
      charCode: 13,
      shiftKey: false 
    });
    
    // Wait for some processing time before checking if message appears
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // The message should appear in the conversation as text content
    expect(screen.getByText('Help with service')).toBeInTheDocument();
  });

  test('displays quick start actions', () => {
    render(<AssistantPanel />);
    
    expect(screen.getByText('Quick Start Actions')).toBeInTheDocument();
    expect(screen.getByText('Create Deployment')).toBeInTheDocument();
    expect(screen.getByText('Add Service')).toBeInTheDocument();
    expect(screen.getByText('Persistent Storage')).toBeInTheDocument();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  test('disables send button when input is empty', () => {
    render(<AssistantPanel />);
    
    const sendButton = screen.getByTestId('send-button');
    expect(sendButton).toBeDisabled();
  });

  test('enables send button when input has content', () => {
    render(<AssistantPanel />);
    
    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: 'test message' } });
    expect(sendButton).not.toBeDisabled();
  });
});
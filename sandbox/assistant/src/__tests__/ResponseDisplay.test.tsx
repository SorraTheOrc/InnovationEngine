import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponseDisplay from '../components/ResponseDisplay';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  Box: ({ children }: any) => <div data-testid="response-box">{children}</div>,
  Typography: ({ children }: any) => <div>{children}</div>,
  IconButton: ({ onClick, title, children }: any) => (
    <button onClick={onClick} title={title}>
      {children}
    </button>
  ),
  Snackbar: ({ children }: any) => <div data-testid="snackbar">{children}</div>,
  Alert: ({ children }: any) => <div data-testid="alert">{children}</div>,
}));

jest.mock('@mui/icons-material', () => ({
  ContentCopy: () => <span>Copy</span>,
  PlayArrow: () => <span>Run</span>,
  Help: () => <span>Help</span>,
}));

// Mock Prism
jest.mock('prismjs', () => ({}));
jest.mock('prismjs/components/prism-bash', () => ({}));
jest.mock('prismjs/themes/prism.css', () => ({}));

// Set up a global Prism mock to avoid errors
(global as any).Prism = {
  highlightElement: jest.fn(),
  highlightAll: jest.fn(),
};

describe('ResponseDisplay', () => {
  test('renders plain text content', () => {
    const content = 'This is a simple text response.';
    render(<ResponseDisplay content={content} />);
    
    expect(screen.getByText(content)).toBeInTheDocument();
  });

  test('renders content with code blocks', () => {
    const content = `Here's some code:

\`\`\`bash
kubectl get pods
kubectl get services
\`\`\`

This shows your pods and services.`;

    render(<ResponseDisplay content={content} />);
    
    expect(screen.getByText("Here's some code:")).toBeInTheDocument();
    expect(screen.getByText(/kubectl get pods/)).toBeInTheDocument();
    expect(screen.getByText(/kubectl get services/)).toBeInTheDocument();
    expect(screen.getByText('This shows your pods and services.')).toBeInTheDocument();
  });

  test('renders copy and run buttons for code blocks', () => {
    const content = `\`\`\`bash
kubectl create deployment test --image=nginx
\`\`\``;

    render(<ResponseDisplay content={content} />);
    
    expect(screen.getByTitle('Copy code')).toBeInTheDocument();
    expect(screen.getByTitle('Run with Innovation Engine')).toBeInTheDocument();
  });

  test('shows language label for code blocks', () => {
    const content = `\`\`\`yaml
apiVersion: v1
kind: Pod
\`\`\``;

    render(<ResponseDisplay content={content} />);
    
    expect(screen.getByText('yaml')).toBeInTheDocument();
  });

  test('defaults to bash language when not specified', () => {
    const content = `\`\`\`
echo "Hello World"
\`\`\``;

    render(<ResponseDisplay content={content} />);
    
    expect(screen.getByText('bash')).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuickStartActions from '../components/QuickStartActions';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  Box: ({ children, onClick }: any) => (
    <div onClick={onClick} data-testid="quick-action-box">
      {children}
    </div>
  ),
  Typography: ({ children }: any) => <div>{children}</div>,
  Button: ({ onClick, children }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  Paper: ({ children, onClick }: any) => (
    <div onClick={onClick} data-testid="quick-action-paper">
      {children}
    </div>
  ),
}));

jest.mock('@mui/icons-material', () => ({
  Rocket: () => <span>Rocket</span>,
  Storage: () => <span>Storage</span>,
  NetworkCheck: () => <span>Network</span>,
  Settings: () => <span>Settings</span>,
}));

describe('QuickStartActions', () => {
  const mockOnActionClick = jest.fn();

  beforeEach(() => {
    mockOnActionClick.mockClear();
  });

  test('renders all quick start actions', () => {
    render(<QuickStartActions onActionClick={mockOnActionClick} />);
    
    expect(screen.getByText('Quick Start Actions')).toBeInTheDocument();
    expect(screen.getByText('Create Deployment')).toBeInTheDocument();
    expect(screen.getByText('Add Service')).toBeInTheDocument();
    expect(screen.getByText('Persistent Storage')).toBeInTheDocument();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  test('displays action descriptions', () => {
    render(<QuickStartActions onActionClick={mockOnActionClick} />);
    
    expect(screen.getByText('Create a new Kubernetes deployment')).toBeInTheDocument();
    expect(screen.getByText('Expose your deployment with a service')).toBeInTheDocument();
    expect(screen.getByText('Add persistent volume claims')).toBeInTheDocument();
    expect(screen.getByText('Manage ConfigMaps and Secrets')).toBeInTheDocument();
  });

  test('calls onActionClick with correct prompt when action is clicked', () => {
    render(<QuickStartActions onActionClick={mockOnActionClick} />);
    
    const deploymentAction = screen.getByText('Create Deployment').closest('[data-testid="quick-action-paper"]');
    fireEvent.click(deploymentAction!);
    
    expect(mockOnActionClick).toHaveBeenCalledWith(
      'Create a deployment for my application with nginx image'
    );
  });

  test('displays action icons', () => {
    render(<QuickStartActions onActionClick={mockOnActionClick} />);
    
    expect(screen.getByText('Rocket')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByText('Storage')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
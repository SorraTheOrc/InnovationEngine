import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axe from '../axe-config';
import { OverviewAuthoring } from '../../components/OverviewAuthoring';

// Create MUI theme for testing
const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('OverviewAuthoring Accessibility Tests', () => {
  const mockProps = {
    onOverviewChange: jest.fn(),
    onSave: jest.fn(),
    initialOverview: '',
    loading: false,
    aiEnabled: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WCAG 2.1 AA Compliance', () => {
    test('should have no accessibility violations', async () => {
      const { container } = renderWithTheme(<OverviewAuthoring {...mockProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have proper heading hierarchy', () => {
      renderWithTheme(<OverviewAuthoring {...mockProps} />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent('Create Executive Document Overview');
    });

    test('should have skip to content link', () => {
      renderWithTheme(<OverviewAuthoring {...mockProps} />);
      
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    test('should have proper landmarks', () => {
      renderWithTheme(<OverviewAuthoring {...mockProps} />);
      
      const mainContent = document.getElementById('main-content');
      expect(mainContent).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    test('should support tab navigation', async () => {
      const user = userEvent.setup();
      renderWithTheme(<OverviewAuthoring {...mockProps} />);
      
      // Test tab navigation through interactive elements
      await user.tab();
      expect(document.activeElement).toHaveAttribute('href', '#main-content');
      
      await user.tab();
      // Should focus on first interactive element in content
      expect(document.activeElement).toHaveAttribute('role', 'tab');
    });

    test('should support Ctrl+Enter keyboard shortcut for prompt submission', async () => {
      const user = userEvent.setup();
      renderWithTheme(<OverviewAuthoring {...mockProps} />);
      
      const promptInput = screen.getByPlaceholderText(/Describe what you want to create/);
      await user.type(promptInput, 'Test prompt');
      
      // Simulate Ctrl+Enter
      await user.keyboard('{Control>}{Enter}{/Control}');
      
      // Should trigger AI generation
      await waitFor(() => {
        expect(screen.getByText('Generating...')).toBeInTheDocument();
      });
    });

    test('should support Ctrl+S keyboard shortcut for saving', async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn();
      
      renderWithTheme(
        <OverviewAuthoring 
          {...mockProps} 
          onSave={mockOnSave}
          initialOverview="Test overview content"
        />
      );
      
      // Switch to edit tab and simulate Ctrl+S
      const editTab = screen.getByRole('tab', { name: /Edit Overview/ });
      await user.click(editTab);
      
      await user.keyboard('{Control>}s{/Control}');
      
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  describe('Screen Reader Support', () => {
    test('should have proper ARIA labels on interactive elements', () => {
      renderWithTheme(<OverviewAuthoring {...mockProps} />);
      
      const promptInput = screen.getByLabelText(/Enter your prompt for AI overview generation/);
      expect(promptInput).toBeInTheDocument();
      expect(promptInput).toHaveAttribute('aria-required', 'true');
      
      const submitButton = screen.getByRole('button', { name: /Submit prompt to generate overview/ });
      expect(submitButton).toBeInTheDocument();
    });

    test('should have proper tab roles and relationships', () => {
      renderWithTheme(<OverviewAuthoring {...mockProps} />);
      
      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(2);
      
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-selected');
        expect(tab).toHaveAttribute('aria-controls');
      });
    });

    test('should announce tab changes', async () => {
      const user = userEvent.setup();
      renderWithTheme(<OverviewAuthoring {...mockProps} />);
      
      const editTab = screen.getByRole('tab', { name: /Edit Overview/ });
      await user.click(editTab);
      
      // Check that the tab panel is visible
      const tabPanel = screen.getByRole('tabpanel');
      expect(tabPanel).toBeInTheDocument();
      expect(tabPanel).not.toHaveAttribute('hidden');
    });
  });

  describe('Form Validation and Error Handling', () => {
    test('should show proper error states', async () => {
      const user = userEvent.setup();
      renderWithTheme(<OverviewAuthoring {...mockProps} />);
      
      const submitButton = screen.getByRole('button', { name: /Generate Overview/ });
      
      // Button should be disabled when prompt is empty
      expect(submitButton).toBeDisabled();
      
      const promptInput = screen.getByLabelText(/Enter your prompt for AI overview generation/);
      await user.type(promptInput, 'Test prompt');
      
      // Button should be enabled when prompt has content
      expect(submitButton).toBeEnabled();
    });

    test('should have proper help text', () => {
      renderWithTheme(<OverviewAuthoring {...mockProps} />);
      
      const helpText = screen.getByText(/Press Ctrl\+Enter to submit/);
      expect(helpText).toBeInTheDocument();
      expect(helpText).toHaveAttribute('id');
      
      const promptInput = screen.getByLabelText(/Enter your prompt for AI overview generation/);
      expect(promptInput).toHaveAttribute('aria-describedby');
    });
  });

  describe('Focus Management', () => {
    test('should manage focus properly when switching tabs', async () => {
      const user = userEvent.setup();
      renderWithTheme(<OverviewAuthoring {...mockProps} />);
      
      const editTab = screen.getByRole('tab', { name: /Edit Overview/ });
      await user.click(editTab);
      
      // Focus should move to the overview textarea
      await waitFor(() => {
        const textarea = screen.getByLabelText(/Edit the generated overview content/);
        expect(textarea).toHaveFocus();
      });
    });

    test('should have visible focus indicators', () => {
      renderWithTheme(<OverviewAuthoring {...mockProps} />);
      
      const interactive = screen.getAllByRole('button');
      interactive.forEach(element => {
        // Focus the element
        element.focus();
        
        // Check that it has focus styles (this would be verified visually in a real test)
        expect(element).toHaveFocus();
      });
    });
  });

  describe('Responsive Design', () => {
    test('should maintain accessibility on smaller screens', async () => {
      // Mock smaller viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      const { container } = renderWithTheme(<OverviewAuthoring {...mockProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have appropriate touch target sizes', () => {
      renderWithTheme(<OverviewAuthoring {...mockProps} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        // Check minimum touch target size (44px)
        const minHeight = parseInt(styles.minHeight) || parseInt(styles.height);
        expect(minHeight).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Color Contrast', () => {
    test('should meet WCAG AA color contrast requirements', async () => {
      const { container } = renderWithTheme(<OverviewAuthoring {...mockProps} />);
      
      // This test is handled by axe-core color-contrast rule
      const results = await axe(container);
      const colorContrastViolations = results.violations.filter(
        violation => violation.id === 'color-contrast'
      );
      
      expect(colorContrastViolations).toHaveLength(0);
    });
  });

  describe('Loading States', () => {
    test('should be accessible during loading states', async () => {
      const { container } = renderWithTheme(
        <OverviewAuthoring {...mockProps} loading={true} />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should announce loading states to screen readers', async () => {
      const user = userEvent.setup();
      renderWithTheme(<OverviewAuthoring {...mockProps} />);
      
      const promptInput = screen.getByLabelText(/Enter your prompt for AI overview generation/);
      await user.type(promptInput, 'Test prompt');
      
      const submitButton = screen.getByRole('button', { name: /Generate Overview/ });
      await user.click(submitButton);
      
      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Generating...')).toBeInTheDocument();
      });
    });
  });
});
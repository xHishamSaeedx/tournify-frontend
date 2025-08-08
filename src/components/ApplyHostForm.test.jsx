import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApplyHostForm from './ApplyHostForm';

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      access_token: 'test-token'
    }
  })
}));

// Mock the Button component
jest.mock('./Button', () => {
  return function MockButton({ children, onClick, disabled, type, variant, className }) {
    return (
      <button 
        onClick={onClick} 
        disabled={disabled}
        type={type}
        className={className}
        data-testid={className}
      >
        {children}
      </button>
    );
  };
});

// Mock fetch
global.fetch = jest.fn();

describe('ApplyHostForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with all required fields', () => {
    render(<ApplyHostForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    expect(screen.getByText('Apply to Become a Host')).toBeInTheDocument();
    expect(screen.getByLabelText(/YouTube Channel/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hosting Experience \*/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Why do you want to become a host\? \*/)).toBeInTheDocument();
  });

  it('shows validation error when required fields are empty', async () => {
    render(<ApplyHostForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    // The button should be disabled when required fields are empty
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when required fields are filled', () => {
    render(<ApplyHostForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const experienceField = screen.getByLabelText(/Hosting Experience \*/);
    const motivationField = screen.getByLabelText(/Why do you want to become a host\? \*/);
    const submitButton = screen.getByTestId('submit-button');
    
    fireEvent.change(experienceField, { target: { value: 'I have hosted tournaments for 2 years' } });
    fireEvent.change(motivationField, { target: { value: 'I want to grow the community' } });
    
    expect(submitButton).not.toBeDisabled();
  });

  it('submits form successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        id: 'test-id',
        user_email: 'test@example.com',
        experience: 'I have hosted tournaments for 2 years',
        motivation: 'I want to grow the community'
      }
    };

    global.fetch.mockResolvedValueOnce({
      json: async () => mockResponse
    });

    render(<ApplyHostForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const experienceField = screen.getByLabelText(/Hosting Experience \*/);
    const motivationField = screen.getByLabelText(/Why do you want to become a host\? \*/);
    const submitButton = screen.getByTestId('submit-button');
    
    fireEvent.change(experienceField, { target: { value: 'I have hosted tournaments for 2 years' } });
    fireEvent.change(motivationField, { target: { value: 'I want to grow the community' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/apply-host', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          youtube_channel: '',
          experience: 'I have hosted tournaments for 2 years',
          motivation: 'I want to grow the community'
        })
      });
    });
  });

  it('shows error message on submission failure', async () => {
    const mockResponse = {
      success: false,
      message: 'Failed to submit application'
    };

    global.fetch.mockResolvedValueOnce({
      json: async () => mockResponse
    });

    render(<ApplyHostForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const experienceField = screen.getByLabelText(/Hosting Experience \*/);
    const motivationField = screen.getByLabelText(/Why do you want to become a host\? \*/);
    const submitButton = screen.getByTestId('submit-button');
    
    fireEvent.change(experienceField, { target: { value: 'I have hosted tournaments for 2 years' } });
    fireEvent.change(motivationField, { target: { value: 'I want to grow the community' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to submit application')).toBeInTheDocument();
    });
  });

  it('closes form when cancel button is clicked', () => {
    render(<ApplyHostForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('resets form when reset button is clicked', () => {
    render(<ApplyHostForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const experienceField = screen.getByLabelText(/Hosting Experience \*/);
    const motivationField = screen.getByLabelText(/Why do you want to become a host\? \*/);
    const resetButton = screen.getByTestId('reset-button');
    
    fireEvent.change(experienceField, { target: { value: 'Test experience' } });
    fireEvent.change(motivationField, { target: { value: 'Test motivation' } });
    
    fireEvent.click(resetButton);
    
    expect(experienceField.value).toBe('');
    expect(motivationField.value).toBe('');
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationModal from './ConfirmationModal';

describe('ConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Test Title',
    message: 'Test message',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders when isOpen is true', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  test('calls onClose when cancel button is clicked', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when close button (×) is clicked', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('×'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onConfirm and onClose when confirm button is clicked', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Confirm'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when backdrop is clicked', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    const overlay = screen.getByRole('presentation');
    fireEvent.click(overlay);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('does not call onClose when modal content is clicked', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    const modal = screen.getByRole('dialog');
    fireEvent.click(modal);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  test('uses custom button text when provided', () => {
    render(
      <ConfirmationModal
        {...defaultProps}
        confirmText="Join Tournament"
        cancelText="Go Back"
      />
    );
    
    expect(screen.getByText('Join Tournament')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  test('applies custom CSS classes when provided', () => {
    render(
      <ConfirmationModal
        {...defaultProps}
        confirmButtonClass="custom-confirm-btn"
        cancelButtonClass="custom-cancel-btn"
      />
    );
    
    const confirmButton = screen.getByText('Confirm');
    const cancelButton = screen.getByText('Cancel');
    
    expect(confirmButton).toHaveClass('custom-confirm-btn');
    expect(cancelButton).toHaveClass('custom-cancel-btn');
  });
});

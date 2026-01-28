import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { ConfirmDialog } from '../shared/ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    onConfirm: vi.fn(),
  };

  it('renders when open', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    
    await waitFor(() => {
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onOpenChange when cancel clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows loading state', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);
    
    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();
  });

  it('applies destructive variant', () => {
    render(<ConfirmDialog {...defaultProps} variant="destructive" />);
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toHaveClass('bg-destructive');
  });
});

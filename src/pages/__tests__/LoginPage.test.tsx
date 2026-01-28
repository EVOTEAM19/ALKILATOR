import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '../auth/LoginPage';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock GuestGuard para que renderice el formulario (evita spinner por isInitialized/isLoading)
vi.mock('@/components/auth/GuestGuard', () => ({
  GuestGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock useAuth hook
const mockSignIn = vi.fn();
const defaultAuthState = {
  signIn: mockSignIn,
  isLoading: false,
  isInitialized: true,
  isAuthenticated: false,
  isAdmin: false,
  isStaff: false,
  isCustomer: false,
  error: null,
};
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => defaultAuthState),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const form = screen.getByRole('button', { name: /iniciar sesión/i }).closest('form')!;

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it('calls signIn on valid submission', async () => {
    mockSignIn.mockResolvedValue(undefined);

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({ 
        email: 'admin@test.com', 
        password: 'password123' 
      });
    });
  });

  it('shows loading state', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...defaultAuthState,
      isLoading: true,
    } as any);

    render(<LoginPage />);

    expect(screen.getByRole('button', { name: /iniciando/i })).toBeDisabled();
  });
});

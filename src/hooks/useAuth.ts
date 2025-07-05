import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, getCurrentUser, isAuthenticated } from '@/services/api';
import { User } from '@/types/database';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get current user query
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    enabled: isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Inicio de sesión exitoso');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al iniciar sesión';
      toast.error(message);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
      toast.success('Sesión cerrada exitosamente');
      navigate('/login');
    },
    onError: (error: any) => {
      // Even if logout fails on server, clear local data
      queryClient.clear();
      navigate('/login');
    },
  });

  // Refresh token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: authService.refreshToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  // Get current user from localStorage as fallback
  const currentUser = user || getCurrentUser();
  const authenticated = isAuthenticated();

  return {
    user: currentUser,
    isAuthenticated: authenticated,
    isLoading: isLoadingUser,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    refreshToken: refreshTokenMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}; 
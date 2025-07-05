import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, CreateUserData, UpdateUserData, User } from '@/services/api';
import { toast } from 'sonner';

export const useUsers = () => {
  const queryClient = useQueryClient();

  // Get all users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getAll,
  });

  // Create user mutation
  const createUser = useMutation({
    mutationFn: usersService.create,
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Usuario ${newUser.full_name} creado exitosamente`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al crear usuario';
      toast.error(message);
    },
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UpdateUserData }) =>
      usersService.update(id, userData),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Usuario ${updatedUser.full_name} actualizado exitosamente`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al actualizar usuario';
      toast.error(message);
    },
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: usersService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al eliminar usuario';
      toast.error(message);
    },
  });

  // Get users by role
  const getUsersByRole = (role: string) => {
    return users?.filter(user => user.role === role) || [];
  };

  // Get active users
  const getActiveUsers = () => {
    return users?.filter(user => user.is_active) || [];
  };

  // Get user statistics
  const getStatistics = () => {
    if (!users) return null;

    return {
      total: users.length,
      active: users.filter(u => u.is_active).length,
      inactive: users.filter(u => !u.is_active).length,
      byRole: {
        superadmin: users.filter(u => u.role === 'superadmin').length,
        admin: users.filter(u => u.role === 'admin').length,
        judge: users.filter(u => u.role === 'judge').length,
        notary: users.filter(u => u.role === 'notary').length,
        user: users.filter(u => u.role === 'user').length,
      },
    };
  };

  return {
    users,
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    getUsersByRole,
    getActiveUsers,
    getStatistics,
  };
}; 
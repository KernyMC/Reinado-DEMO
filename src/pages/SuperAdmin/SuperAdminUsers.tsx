import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { DrawerForm } from '../../components/DrawerForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { UserRole, User } from '../../features/auth/AuthContext';
import { useUsers } from '../../hooks/useUsers';
import { CreateUserData, UpdateUserData } from '../../services/api';
import { Plus, Search, Edit, UserPlus, Mail, Eye, EyeOff, Pencil, Trash2, Key, Power, PowerOff } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { useTheme } from '../../contexts/ThemeContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';

interface UserWithStatus extends User {
  name: string;
  active: boolean;
  lastLogin?: Date;
  createdAt: Date;
  // API properties for compatibility
  full_name: string;
  is_active: boolean;
}

const SuperAdminUsers = () => {
  const { users, isLoading, createUser, updateUser, deleteUser } = useUsers();
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [createForm, setCreateForm] = useState<CreateUserData>({
    email: '',
    role: 'user',
    full_name: '',
    password: ''
  });

  const [editForm, setEditForm] = useState<UpdateUserData>({});
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Convert API users to UserWithStatus format
  const usersWithStatus: UserWithStatus[] = users?.map(user => ({
    ...user,
    name: user.full_name,
    active: user.is_active,
    createdAt: new Date(user.created_at),
    lastLogin: undefined, // API doesn't provide this yet
    // Keep original properties for API compatibility
    full_name: user.full_name,
    is_active: user.is_active
  })) || [];

  const filteredUsers = usersWithStatus.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForms = () => {
    setCreateForm({ email: '', role: 'user', full_name: '', password: '' });
    setEditForm({});
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setEditingUser(null);
    setPasswordUser(null);
  };

  const openEditForm = (user: UserWithStatus) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active
    });
    setIsEditOpen(true);
  };

  const openPasswordForm = (user: UserWithStatus) => {
    setPasswordUser(user);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setIsPasswordOpen(true);
  };

  const toggleUserStatus = async (userId: string, active: boolean) => {
    try {
      const user = users?.find(u => u.id === userId);
      if (!user) return;
      
      await updateUser.mutateAsync({
        id: userId,
        userData: {
          ...user,
          is_active: active
        }
      });
      
      toast({
        title: active ? "Usuario activado" : "Usuario desactivado",
        description: "El estado del usuario ha sido actualizado.",
        className: active ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del usuario.",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const user = users?.find(u => u.id === userId);
      if (!user) return;
      
      await updateUser.mutateAsync({
        id: userId,
        userData: {
          ...user,
          role: newRole
        }
      });
      
      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado exitosamente.",
        className: "bg-blue-50 border-blue-200",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del usuario.",
        variant: "destructive",
      });
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.email || !createForm.full_name || !createForm.password) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await createUser.mutateAsync(createForm);
      
      setIsCreateOpen(false);
      resetForms();
      
      toast({
        title: "Usuario creado",
        description: `Se ha creado el usuario ${createForm.full_name} exitosamente`,
        className: "bg-green-50 border-green-200",
      });
    } catch (error: any) {
      const message = error.response?.data?.error || "No se pudo crear el usuario. Intenta nuevamente.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser || !editForm.email || !editForm.full_name) {
      toast({
        title: "Error",
        description: "Email y nombre completo son obligatorios.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      await updateUser.mutateAsync({
        id: editingUser.id,
        userData: editForm
      });
      
      setIsEditOpen(false);
      resetForms();
      
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados exitosamente.",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Ambos campos de contraseña son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordUser) return;

    try {
      setSubmitting(true);
      await updateUser.mutateAsync({
        id: passwordUser.id,
        userData: {
          ...passwordUser,
          password: passwordForm.newPassword
        }
      });
      
      setIsPasswordOpen(false);
      resetForms();
      
      toast({
        title: "Contraseña actualizada",
        description: "La contraseña ha sido cambiada exitosamente.",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar la contraseña.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser.mutateAsync(userId);
      
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente.",
        className: "bg-red-50 border-red-200",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const colors = {
      user: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700',
      judge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700',
      notary: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700',
      admin: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700',
      superadmin: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700'
    };
    
    const labels = {
      user: 'Usuario',
      judge: 'Juez',
      notary: 'Notario',
      admin: 'Admin',
      superadmin: 'Super Admin'
    };
    
    return (
      <Badge className={colors[role]}>
        {labels[role]}
      </Badge>
    );
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 animate-pulse ${isDark ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen p-6`}>
        <div className={`h-16 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-20 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 animate-fade-in ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen p-6`}>
      <div className="text-center">
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Gestión de Usuarios
        </h1>
        <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
          Administra usuarios, roles y permisos del sistema
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'border-purple-200 focus:border-purple-400'}`}
          />
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Crear Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className={isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white"}>
              <DialogHeader>
                <DialogTitle className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Crear Nuevo Usuario
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="create-name" className={isDark ? 'text-gray-200' : ''}>Nombre Completo</Label>
                  <Input
                    id="create-name"
                    value={createForm.full_name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Nombre del usuario"
                    className={isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200 focus:border-purple-400'}
                  />
                </div>
                
                <div>
                  <Label htmlFor="create-email" className={isDark ? 'text-gray-200' : ''}>Correo Electrónico</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="usuario@espe.edu.ec"
                    className={isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200 focus:border-purple-400'}
                  />
                </div>

                <div>
                  <Label htmlFor="create-password" className={isDark ? 'text-gray-200' : ''}>Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="create-password"
                      type={showPassword ? 'text' : 'password'}
                      value={createForm.password}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Contraseña inicial"
                      className={`${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200 focus:border-purple-400'} pr-10`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="create-role" className={isDark ? 'text-gray-200' : ''}>Rol</Label>
                  <Select value={createForm.role} onValueChange={(value: UserRole) => setCreateForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className={isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200 focus:border-purple-400'}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isDark ? "bg-gray-800 border-gray-700" : "bg-white"}>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="judge">Juez</SelectItem>
                      <SelectItem value="notary">Notario</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="superadmin">Super Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForms(); }} className={isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateUser} 
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {submitting ? "Creando..." : "Crear Usuario"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users Table */}
      <Card className={`shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'border-purple-200'}`}>
        <CardHeader>
          <CardTitle className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Lista de Usuarios ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Usuario</th>
                  <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Rol</th>
                  <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Estado</th>
                  <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Fecha Creación</th>
                  <th className={`text-right py-3 px-4 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-purple-50/50'} transition-colors`}>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          user.active ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{user.name}</p>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={(checked) => toggleUserStatus(user.id, checked)}
                        />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {user.createdAt.toLocaleDateString('es-ES')}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditForm(user)}
                          className={isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
                          title="Editar usuario"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPasswordForm(user)}
                          className={isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
                          title="Cambiar contraseña"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className={isDark ? "bg-gray-800 border-gray-700" : ""}>
                            <AlertDialogHeader>
                              <AlertDialogTitle className={isDark ? "text-white" : ""}>¿Eliminar usuario?</AlertDialogTitle>
                              <AlertDialogDescription className={isDark ? "text-gray-300" : ""}>
                                Esta acción no se puede deshacer. El usuario {user.name} será eliminado permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className={isDark ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600" : ""}>
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No se encontraron usuarios que coincidan con la búsqueda.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Usuarios', value: usersWithStatus.length, color: 'blue' },
          { label: 'Activos', value: usersWithStatus.filter(u => u.active).length, color: 'green' },
          { label: 'Jueces', value: usersWithStatus.filter(u => u.role === 'judge').length, color: 'purple' },
          { label: 'Admins', value: usersWithStatus.filter(u => u.role === 'admin' || u.role === 'superadmin').length, color: 'orange' },
          { label: 'Inactivos', value: usersWithStatus.filter(u => !u.active).length, color: 'red' },
        ].map((stat, index) => (
          <Card key={index} className={`text-center p-4 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
            <div className={`text-2xl font-bold text-${stat.color}-600 ${isDark ? `dark:text-${stat.color}-400` : ''}`}>
              {stat.value}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className={isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white"}>
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Editar Usuario
            </DialogTitle>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className={isDark ? 'text-gray-200' : ''}>Nombre Completo</Label>
                <Input
                  id="edit-name"
                  value={editForm.full_name || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className={isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200 focus:border-purple-400'}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-email" className={isDark ? 'text-gray-200' : ''}>Correo Electrónico</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className={isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200 focus:border-purple-400'}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-role" className={isDark ? 'text-gray-200' : ''}>Rol</Label>
                <Select value={editForm.role || ''} onValueChange={(value: UserRole) => setEditForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className={isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200 focus:border-purple-400'}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={isDark ? "bg-gray-800 border-gray-700" : "bg-white"}>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="judge">Juez</SelectItem>
                    <SelectItem value="notary">Notario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="superadmin">Super Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={editForm.is_active !== undefined ? editForm.is_active : true}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="edit-active" className={isDark ? 'text-gray-200' : ''}>Usuario Activo</Label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => { setIsEditOpen(false); resetForms(); }} className={isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleEditUser}
                  disabled={submitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {submitting ? 'Actualizando...' : 'Actualizar Usuario'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className={isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white"}>
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Cambiar Contraseña
            </DialogTitle>
          </DialogHeader>
          
          {passwordUser && (
            <div className="space-y-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Cambiando contraseña para: <strong className={isDark ? 'text-white' : 'text-gray-800'}>{passwordUser.full_name}</strong>
                </p>
              </div>

              <div>
                <Label htmlFor="new-password" className={isDark ? 'text-gray-200' : ''}>Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Nueva contraseña"
                    className={`${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200 focus:border-purple-400'} pr-10`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password" className={isDark ? 'text-gray-200' : ''}>Confirmar Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirmar nueva contraseña"
                  className={isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-purple-200 focus:border-purple-400'}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => { setIsPasswordOpen(false); resetForms(); }} className={isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handlePasswordChange}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submitting ? 'Cambiando...' : 'Cambiar Contraseña'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminUsers;

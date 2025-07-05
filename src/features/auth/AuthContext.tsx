import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/api'; // Correct import path

export type UserRole = 'user' | 'judge' | 'notary' | 'admin' | 'superadmin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// USUARIOS DEMO HARDCODEADOS
const DEMO_USERS: User[] = [
  {
    id: '1',
    email: 'admin@demo.com',
    full_name: 'Admin Demo',
    role: 'admin',
    is_active: true,
  },
  {
    id: '2',
    email: 'juez@demo.com',
    full_name: 'Juez Demo',
    role: 'judge',
    is_active: true,
  },
  {
    id: '3',
    email: 'notario@demo.com',
    full_name: 'Notario Demo',
    role: 'notary',
    is_active: true,
  },
  {
    id: '4',
    email: 'superadmin@demo.com',
    full_name: 'SuperAdmin Demo',
    role: 'superadmin',
    is_active: true,
  },
  {
    id: '5',
    email: 'usuario@demo.com',
    full_name: 'Usuario Demo',
    role: 'user',
    is_active: true,
  },
];

const DEMO_PASSWORD = 'demo123'; // Todos usan la misma clave demo

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
        console.log('🔄 Restored user session:', userData.email, userData.role);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, remember: boolean = false) => {
    setIsLoading(true);
    try {
      await queryClient.clear();
      // Buscar usuario demo
      const userData = DEMO_USERS.find(u => u.email === email && u.is_active);
      if (!userData || password !== DEMO_PASSWORD) {
        throw new Error('Credenciales inválidas');
      }
      setUser(userData);
      setToken('demo-token');
      if (remember) {
        localStorage.setItem('auth_user', JSON.stringify(userData));
        localStorage.setItem('auth_token', 'demo-token');
      }
      await queryClient.invalidateQueries();
    } catch (error) {
      setUser(null);
      setToken(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simular registro solo si el email no existe
      const exists = DEMO_USERS.some(u => u.email === email);
      if (exists) throw new Error('El usuario ya existe');
      // No se agrega realmente, solo simula éxito
      await login(email, DEMO_PASSWORD);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await queryClient.clear();
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

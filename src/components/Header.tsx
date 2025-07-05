import React, { useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { useI18n } from '../app/I18nProvider';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Menu, 
  Globe, 
  LogOut, 
  User,
  ChevronDown
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const { isDark } = useTheme();

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'superadmin':
        return 'Super Administrador';
      case 'judge':
        return 'Juez';
      case 'notary':
        return 'Notario';
      case 'user':
        return 'Participante';
      default:
        return 'Usuario';
    }
  };

  return (
    <header className={`border-b px-4 py-3 shadow-sm ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-green-100'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className={`lg:hidden ${
              isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : ''
            }`}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className={`text-xl font-semibold ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Sistema Reina ESPE 2025
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className={`flex items-center space-x-2 ${
                isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : ''
              }`}>
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
            }>
              <DropdownMenuItem 
                onClick={() => setLanguage('es')} 
                className={`cursor-pointer ${
                  isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : ''
                }`}
              >
                Español
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage('en')} 
                className={`cursor-pointer ${
                  isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : ''
                }`}
              >
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`flex items-center space-x-2 px-2 ${
                isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : ''
              }`}>
                {/* Icono de usuario por defecto */}
                <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center ${
                  isDark ? 'border-gray-600 bg-gray-700' : 'border-green-200 bg-green-100'
                }`}>
                  <User className={`h-5 w-5 ${
                    isDark ? 'text-gray-300' : 'text-green-600'
                  }`} />
                </div>
                <div className="hidden md:block text-left">
                  <p className={`text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>{user?.full_name || user?.name || 'Usuario'}</p>
                  <p className={`text-xs capitalize ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>{getRoleDisplay(user?.role || '')}</p>
                </div>
                <ChevronDown className={`h-3 w-3 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`w-56 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
            }`}>
              <DropdownMenuItem disabled className="cursor-default">
                <User className="mr-2 h-4 w-4" />
                <div>
                  <p className={`font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}>{user?.full_name || user?.name || 'Usuario'}</p>
                  <p className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>{user?.email}</p>
                  <p className={`text-xs font-medium ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`}>{getRoleDisplay(user?.role || '')}</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout} 
                className={`cursor-pointer text-red-600 ${
                  isDark ? 'hover:bg-gray-700' : ''
                }`}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('nav.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

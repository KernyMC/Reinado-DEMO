import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../app/I18nProvider';
import { 
  Home, 
  Crown, 
  Scale, 
  Settings, 
  Users, 
  FileText, 
  BarChart, 
  LogOut, 
  Moon, 
  Sun,
  UserCog,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;

  const getMenuItems = () => {
    const baseItems = [
      // Dashboard para todos los usuarios
      { path: '/dashboard', icon: Home, label: 'Inicio' }
    ];

    // Only regular users can vote
    if (user?.role === 'user') {
      baseItems.push({ path: '/votes', icon: Crown, label: t('nav.votes') });
    }

    // Solo los jueces pueden calificar (quitamos admin y superadmin)
    if (user?.role === 'judge') {
      baseItems.push({ path: '/judge', icon: Scale, label: t('nav.judge') });
    }

    // Notarios, admins y superadmins pueden acceder a notaría
    if (user?.role === 'notary' || user?.role === 'admin' || user?.role === 'superadmin') {
      baseItems.push(
        { path: '/notary/dashboard', icon: Settings, label: t('nav.notary') }
      );
    }

    if (user?.role === 'admin' || user?.role === 'superadmin') {
      baseItems.push(
        { path: '/admin/candidates', icon: UserCog, label: 'Candidatas' },
        { path: '/admin/events', icon: Crown, label: 'Eventos' },
        { path: '/admin/reports', icon: FileText, label: 'Reportes' }
      );
    }

    // Solo superadmin puede gestionar usuarios
    if (user?.role === 'superadmin') {
      baseItems.push(
        { path: '/admin/users', icon: Users, label: 'Usuarios' }
      );
    }

    return baseItems;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} min-h-screen transition-all duration-300 ${
      isDark 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-white border-gray-200'
    } border-r shadow-lg relative`}>
      {/* Toggle Button */}
      <Button
        onClick={toggleSidebar}
        className={`absolute -right-3 top-8 z-10 w-6 h-6 rounded-full p-0 ${
          isDark 
            ? 'bg-gray-800 hover:bg-gray-700 border-gray-600' 
            : 'bg-white hover:bg-gray-50 border-gray-300'
        } border-2 shadow-md`}
        variant="outline"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </Button>

      <div className="p-6">
        <div className={`text-center mb-8 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {!isCollapsed ? (
            <>
              <h1 className="text-2xl font-bold text-green-600">Reina ESPE</h1>
              <p className="text-sm mt-1 opacity-75">2025</p>
            </>
          ) : (
            <div className="w-10 h-10 mx-auto bg-green-600 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className={`mb-6 p-4 rounded-lg ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-green-50 border-green-200'
          } border`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDark 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-600 text-white'
              }`}>
                {user.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  {user.full_name}
                </p>
                <p className={`text-sm capitalize ${
                  isDark ? 'text-gray-300' : 'text-green-600'
                }`}>
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}

        <nav className="space-y-2">
          {getMenuItems().map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? isDark
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-green-600 text-white shadow-lg'
                    : isDark
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 space-y-2">
          {/* Theme Toggle */}
          <Button
            onClick={toggleTheme}
            variant="ghost"
            className={`w-full ${isCollapsed ? 'justify-center' : 'justify-start space-x-3'} ${
              isDark 
                ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
            }`}
            title={isCollapsed ? (isDark ? 'Modo Claro' : 'Modo Oscuro') : undefined}
          >
            {isDark ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
            {!isCollapsed && (
              <span className="font-medium">
                {isDark ? 'Modo Claro' : 'Modo Oscuro'}
              </span>
            )}
          </Button>

          {/* Logout */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={`w-full ${isCollapsed ? 'justify-center' : 'justify-start space-x-3'} ${
              isDark 
                ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300' 
                : 'text-red-600 hover:bg-red-50 hover:text-red-700'
            }`}
            title={isCollapsed ? t('nav.logout') : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-medium">{t('nav.logout')}</span>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
};

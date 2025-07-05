import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';

interface CoreLayoutProps {
  children: React.ReactNode;
}

export const CoreLayout: React.FC<CoreLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex w-full ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-green-50 via-white to-emerald-50'
    }`}>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`flex-1 overflow-auto ${
          isDark ? 'bg-gray-900' : 'bg-transparent'
        }`}>
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

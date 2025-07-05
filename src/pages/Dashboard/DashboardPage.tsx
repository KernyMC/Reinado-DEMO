import React from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Calendar, Users, Trophy, Star, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const getMainAction = () => {
    switch (user?.role) {
      case 'admin':
      case 'superadmin':
        return { path: '/admin/events', label: 'Administrar Eventos', icon: Crown };
      case 'judge':
        return { path: '/judge', label: 'Evaluar Candidatas', icon: Star };
      case 'notary':
        return { path: '/notary/dashboard', label: 'Panel de Control', icon: Trophy };
      case 'user':
        return { path: '/votes', label: 'Votar Ahora', icon: Crown };
      default:
        return { path: '/votes', label: 'Explorar', icon: Crown };
    }
  };

  const mainAction = getMainAction();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header de Bienvenida */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 rounded-full shadow-2xl">
                <Crown className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
            ¡Bienvenido{user?.full_name?.includes('a') ? 'a' : ''}, {user?.full_name}!
          </h1>
          
          <p className="text-xl text-green-600 dark:text-green-400 max-w-2xl mx-auto">
            Al <span className="font-semibold text-green-700 dark:text-green-400">Sistema de Votación Reina ESPE 2025</span>
          </p>
          
          <div className="flex justify-center">
            <div className="bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-full px-6 py-2">
              <span className="text-green-800 dark:text-green-300 font-medium">
                {getRoleDisplay(user?.role || '')}
              </span>
            </div>
          </div>
        </div>

        {/* Tarjetas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Información del Evento */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-green-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-green-800 dark:text-green-300">Evento 2025</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-green-600 dark:text-green-300">
                Concurso Oficial de Reina de la Universidad de las Fuerzas Armadas ESPE
              </p>
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  🗓️ Período de Votación Activo
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-green-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-green-800 dark:text-green-300">Participación</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">🏆</p>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Candidatas Participantes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acción Principal */}
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-white/20 dark:bg-white/30 rounded-full flex items-center justify-center mb-3">
                <mainAction.icon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Tu Misión</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-green-50 dark:text-green-100">
                {user?.role === 'judge' && 'Evalúa el desempeño de las candidatas en cada categoría'}
                {user?.role === 'admin' && 'Gestiona eventos, candidatas y supervisa el proceso'}
                {user?.role === 'superadmin' && 'Controla todo el sistema y los usuarios'}
                {user?.role === 'notary' && 'Supervisa la transparencia del proceso electoral'}
                {user?.role === 'user' && 'Participa votando por tu candidata favorita'}
              </p>
              <Button 
                onClick={() => navigate(mainAction.path)}
                className="w-full bg-white text-green-600 hover:bg-green-50 dark:bg-gray-100 dark:text-green-700 dark:hover:bg-gray-200 font-semibold"
              >
                {mainAction.label}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Información Adicional */}
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-green-200 dark:border-gray-700">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center items-center space-x-2">
                <Trophy className="h-8 w-8 text-purple-500 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">
                  Reina ESPE 2025
                </h2>
                <Trophy className="h-8 w-8 text-purple-500 dark:text-purple-400" />
              </div>
              
              <p className="text-green-600 dark:text-green-300 max-w-3xl mx-auto leading-relaxed">
                Un evento que celebra la excelencia académica, la belleza interior y exterior, 
                y el compromiso con los valores institucionales de la Universidad de las Fuerzas Armadas ESPE. 
                Cada participante representa lo mejor de nuestra comunidad universitaria.
              </p>
              
              <div className="flex justify-center space-x-8 pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Excelencia</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Comunidad</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Crown className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Liderazgo</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage; 
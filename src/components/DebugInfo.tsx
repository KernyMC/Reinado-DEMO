import React from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface DebugInfoProps {
  errors?: {
    events?: any;
    candidates?: any;
    scores?: any;
  };
}

const DebugInfo: React.FC<DebugInfoProps> = ({ errors }) => {
  const { user, token, logout } = useAuth();
  
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const authToken = localStorage.getItem('auth_token');
  const authUser = localStorage.getItem('auth_user');
  
  // Parse user from localStorage for comparison
  let parsedUser = null;
  try {
    parsedUser = authUser ? JSON.parse(authUser) : null;
  } catch (e) {
    parsedUser = 'Invalid JSON';
  }

  const clearAll = () => {
    localStorage.clear();
    logout();
    window.location.reload();
  };

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800 flex justify-between items-center">
          🐛 Debug Info (Solo en desarrollo)
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={clearAll}
            className="text-xs"
          >
            🗑️ Limpiar Todo
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs">
        <div className="space-y-2 text-yellow-700">
          <div>
            <strong>📍 Ubicación:</strong> {window.location.pathname}
          </div>
          <div>
            <strong>👤 Usuario Context:</strong> {user ? `${user.email} (${user.role})` : 'null'}
          </div>
          <div>
            <strong>🎫 Token Context:</strong> {token ? token.substring(0, 20) + '...' : 'null'}
          </div>
          <div>
            <strong>💾 LocalStorage Token:</strong> {authToken ? authToken.substring(0, 20) + '...' : 'null'}
          </div>
          <div>
            <strong>💾 LocalStorage User:</strong> {authUser ? 'Existe' : 'null'}
          </div>
          {parsedUser && typeof parsedUser === 'object' && (
            <div>
              <strong>📋 Usuario Guardado:</strong> {parsedUser.email} ({parsedUser.role})
            </div>
          )}
          <div>
            <strong>🔒 Estado Activo:</strong> {user?.is_active ? 'Activo' : 'Inactivo'}
          </div>
          <div>
            <strong>🎯 ID Usuario:</strong> {user?.id || 'null'}
          </div>
          
          {/* Token consistency check */}
          <div className="border-t border-yellow-300 pt-2 mt-2">
            <strong>✅ Verificaciones:</strong>
            <div className="ml-2">
              <div>• Context y localStorage token coinciden: {token === authToken ? '✅' : '❌'}</div>
              <div>• Usuario en Context existe: {user ? '✅' : '❌'}</div>
              <div>• Usuario en localStorage existe: {authUser ? '✅' : '❌'}</div>
              <div>• Header Authorization se enviará: {authToken ? '✅' : '❌'}</div>
            </div>
          </div>
          
          {errors && (
            <div className="mt-2 border-t border-yellow-300 pt-2">
              <strong>❌ Errores de API:</strong>
              {errors.events && (
                <div className="text-red-600">- Events: {errors.events.message || 'Error desconocido'}</div>
              )}
              {errors.candidates && (
                <div className="text-red-600">- Candidates: {errors.candidates.message || 'Error desconocido'}</div>
              )}
              {errors.scores && (
                <div className="text-red-600">- Scores: {errors.scores.message || JSON.stringify(errors.scores)}</div>
              )}
              {!errors.events && !errors.candidates && !errors.scores && (
                <div className="text-green-600">- Sin errores</div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugInfo; 

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Shield, ArrowLeft, Home } from 'lucide-react';

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full shadow-lg border-red-200 bg-red-50/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            Acceso Denegado
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-700">
            No tienes permisos para acceder a esta página. 
            Tu rol actual no incluye los privilegios necesarios.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <Button
              onClick={() => navigate('/votes')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir al Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForbiddenPage;

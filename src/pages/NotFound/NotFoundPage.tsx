
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full shadow-lg border-gray-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <AlertCircle className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Página No Encontrada
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
          <p className="text-gray-600">
            La página que buscas no existe o ha sido movida.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <Button
              onClick={() => navigate('/votes')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
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

export default NotFoundPage;

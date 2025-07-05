
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Play, Square, RotateCcw, Settings } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface EventStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'closed';
  startTime?: Date;
  endTime?: Date;
}

const AdminEvents = () => {
  const [stages, setStages] = useState<EventStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO call API - Load event stages
    const loadStages = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockStages: EventStage[] = [
        {
          id: '1',
          name: 'Votación Pública',
          description: 'Votación abierta para todos los usuarios registrados',
          status: 'active',
          startTime: new Date(Date.now() - 3600000) // 1 hour ago
        },
        {
          id: '2',
          name: 'Traje Típico',
          description: 'Calificación del evento de traje típico por jueces',
          status: 'pending'
        },
        {
          id: '3',
          name: 'Vestido de Gala',
          description: 'Calificación del evento de vestido de gala por jueces',
          status: 'pending'
        },
        {
          id: '4',
          name: 'Preguntas y Respuestas',
          description: 'Calificación final de preguntas y respuestas',
          status: 'pending'
        }
      ];
      
      setStages(mockStages);
      setLoading(false);
    };

    loadStages();
  }, []);

  const startStage = async (stageId: string) => {
    // TODO call API - Start stage
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, status: 'active', startTime: new Date() }
        : stage
    ));
    
    toast({
      title: "Etapa iniciada",
      description: "La etapa ha sido iniciada exitosamente.",
      className: "bg-green-50 border-green-200",
    });
  };

  const closeStage = async (stageId: string) => {
    // TODO call API - Close stage
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, status: 'closed', endTime: new Date() }
        : stage
    ));
    
    toast({
      title: "Etapa cerrada",
      description: "La etapa ha sido cerrada exitosamente.",
      className: "bg-blue-50 border-blue-200",
    });
  };

  const resetStage = async (stageId: string) => {
    // TODO call API - Reset stage
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, status: 'pending', startTime: undefined, endTime: undefined }
        : stage
    ));
    
    toast({
      title: "Etapa reiniciada",
      description: "La etapa ha sido reiniciada exitosamente.",
      className: "bg-yellow-50 border-yellow-200",
    });
  };

  const getStatusBadge = (status: EventStage['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>;
      case 'closed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cerrado</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Pendiente</Badge>;
    }
  };

  const formatDateTime = (date?: Date) => {
    if (!date) return '-';
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-gray-200 rounded-lg"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Gestión de Eventos
        </h1>
        <p className="text-gray-600">
          Controla las etapas del certamen de belleza
        </p>
      </div>

      <div className="space-y-4">
        {stages.map((stage) => (
          <Card key={stage.id} className="shadow-lg border-purple-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-800 flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-purple-600" />
                    <span>{stage.name}</span>
                    {getStatusBadge(stage.status)}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">{stage.description}</p>
                </div>
                <div className="flex space-x-2">
                  {stage.status === 'pending' && (
                    <Button
                      onClick={() => startStage(stage.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar
                    </Button>
                  )}
                  {stage.status === 'active' && (
                    <Button
                      onClick={() => closeStage(stage.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Cerrar
                    </Button>
                  )}
                  {stage.status === 'closed' && (
                    <Button
                      onClick={() => resetStage(stage.id)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reiniciar
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha de Inicio</p>
                  <p className="font-medium">{formatDateTime(stage.startTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de Cierre</p>
                  <p className="font-medium">{formatDateTime(stage.endTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="font-medium capitalize">{stage.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Global Actions */}
      <Card className="shadow-lg border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-red-800">
            Acciones Globales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant="destructive"
              onClick={() => {
                // TODO call API - Close all stages
                toast({
                  title: "Votación cerrada",
                  description: "Todas las etapas de votación han sido cerradas.",
                  variant: "destructive",
                });
              }}
            >
              <Square className="w-4 h-4 mr-2" />
              Cerrar Toda la Votación
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // TODO call API - Reset all stages
                toast({
                  title: "Sistema reiniciado",
                  description: "Todas las etapas han sido reiniciadas.",
                  className: "bg-yellow-50 border-yellow-200",
                });
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar Todo el Sistema
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEvents;

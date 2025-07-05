import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Users, 
  BarChart3, 
  Play, 
  Square,
  AlertTriangle,
  Trophy,
  Shuffle,
  RotateCcw
} from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { useAuth } from '../../features/auth/AuthContext';
import { adminService, eventsService } from '../../services/api';
import { io, Socket } from 'socket.io-client';
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

interface Event {
  id: number;
  name: string;
  description?: string;
  weight: number;
  is_mandatory: boolean;
  bonus_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  event_type?: string;
  status?: string;
}

interface EventSummary {
  id: number;
  name: string;
  weight?: number;
  bonus_percentage?: number;
}

interface WeightsValidation {
  mandatory: {
    isValid: boolean;
    totalWeight: number;
    events: EventSummary[];
  };
  optional: {
    events: EventSummary[];
  };
}

interface TieGroup {
  score: number;
  position: number;
  candidates: Array<{
    id: number;
    name: string;
    career: string;
    photo_url: string;
  }>;
  candidateCount: number;
  tieId?: string;
  description?: string;
  bonusPoints?: number;
}

interface TieData {
  ties: TieGroup[];
  hasActiveTies: boolean;
  totalCandidatesInTies: number;
}

const EventsAdmin = () => {
  const { token } = useAuth();
  const { isDark } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [ties, setTies] = useState<TieData | null>(null);
  const [showTieModal, setShowTieModal] = useState(false);
  const [weightsValidation, setWeightsValidation] = useState<WeightsValidation | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [eventTogglingState, setEventTogglingState] = useState<Record<number, 'loading' | 'success' | null>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weight: 0,
    is_mandatory: true,
    bonus_percentage: 0,
    is_active: true
  });

  useEffect(() => {
    fetchEvents();
    fetchTies();
    fetchWeightsValidation();
  }, []);

  // ============ NUEVO: WebSocket para actualizaciones en tiempo real ============
  useEffect(() => {
    if (!token) return;

    console.log('🔌 Setting up admin WebSocket for events...');
    
    const newSocket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✅ Admin events WebSocket connected');
    });

    // Escuchar actualizaciones de eventos
    newSocket.on('event_updated', (notification) => {
      console.log('📅 Admin - Event updated notification received:', notification);
      
      const updatedEvent = notification.data.event;
      
      // Actualizar el estado local inmediatamente
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
      
      // Mostrar notificación solo si no fue actualizado por el mismo admin
      if (notification.data.updatedBy !== 'Sistema') {
        toast({
          title: "Evento Actualizado",
          description: `${notification.data.message}`,
          className: "bg-blue-50 border-blue-200",
        });
      }
      
      console.log(`✅ Admin - Event updated in real-time: ${updatedEvent.name}`);
    });

    // Escuchar notificaciones del sistema
    newSocket.on('system_notification', (notification) => {
      if (notification.message.includes('Evento')) {
        toast({
          title: "📅 Actualización del Sistema",
          description: notification.message,
          className: notification.type === 'success' 
            ? "bg-green-50 border-green-200" 
            : "bg-orange-50 border-orange-200",
        });
      }
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      console.log('🔌 Disconnecting admin events WebSocket...');
      newSocket.disconnect();
    };
  }, [token]);
  // =========================================================================

  const fetchEvents = async () => {
    try {
      const result = await eventsService.getAll();
      setEvents(result);
    } catch (error) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTies = async () => {
    try {
      console.log('🔍 Fetching ties...');
      const response = await fetch('http://localhost:3000/api/admin/ties/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('🎯 Ties result:', result);
        setTies(result.data);
        
        // Mostrar modal automáticamente si hay empates
        if (result.data && result.data.hasActiveTies) {
          setShowTieModal(true);
          toast({
            title: "Empates Detectados",
            description: `Se encontraron ${result.data.ties.length} empate(s) que requieren resolución.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sin Empates",
            description: "No se detectaron empates en las posiciones finales.",
            className: "bg-green-50 border-green-200",
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al verificar empates');
      }
    } catch (error) {
      console.error('❌ Error fetching ties:', error);
      toast({
        title: "Error",
        description: "No se pudieron verificar los empates. Revisa la conexión.",
        variant: "destructive",
      });
    }
  };

  const fetchWeightsValidation = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/events/validate-weights', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setWeightsValidation(result.data);
      }
    } catch (error) {
      console.error('Error fetching weights validation:', error);
    }
  };

  const activateTieBreaking = async (tieGroup: TieGroup) => {
    try {
      console.log('🎯 Activando desempate:', {
        position: tieGroup.position,
        description: tieGroup.description,
        candidates: tieGroup.candidates.length,
        tieId: tieGroup.tieId || `position_${tieGroup.position}_${Date.now()}`
      });

      const response = await fetch('http://localhost:3000/api/admin/ties/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tieId: tieGroup.tieId || `position_${tieGroup.position}_${Date.now()}`,
          candidates: tieGroup.candidates,
          position: tieGroup.position,
          description: tieGroup.description
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Desempate activado:', result.data);
        
        toast({
          title: "🚨 Desempate Activado",
          description: `Se ha activado el desempate para ${tieGroup.description}. Bonificación: +${result.data.bonusPoints} puntos. ${result.data.judgesNotified} jueces notificados.`,
          className: "bg-orange-50 border-orange-200",
        });
        
        setShowTieModal(false);
        
        // Opcional: Actualizar estado de empates
        setTimeout(() => {
          fetchTies();
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al activar desempate');
      }
    } catch (error) {
      console.error('❌ Error activating tiebreaker:', error);
      toast({
        title: "❌ Error",
        description: `No se pudo activar el desempate: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Demo', description: 'Solo demo, no se puede crear.', className: 'bg-blue-50 border-blue-200' });
  };

  const updateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Demo', description: 'Solo demo, no se puede editar.', className: 'bg-blue-50 border-blue-200' });
  };

  const deleteEvent = async (id: number) => {
    toast({ title: 'Demo', description: 'Solo demo, no se puede eliminar.', className: 'bg-blue-50 border-blue-200' });
  };

  const toggleEventStatus = async (event: Event) => {
    toast({ title: 'Demo', description: 'Solo demo, no se puede cambiar estado.', className: 'bg-blue-50 border-blue-200' });
  };

  const startEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || '',
      weight: event.weight || 0,
      is_mandatory: event.is_mandatory !== undefined ? event.is_mandatory : true,
      bonus_percentage: event.bonus_percentage || 0,
      is_active: event.is_active
    });
  };

  const getEventTypeLabel = (name: string) => {
    // Simplificado: solo mostrar el nombre del evento
    return name;
  };

  const resetAllVotes = async () => {
    try {
      console.log('🗑️ Resetting all votes and scores...');
      const result = await adminService.resetVotes();
      
      toast({
        title: "Sistema Reiniciado",
        description: `Se eliminaron ${result.deletedScores} calificaciones y ${result.deletedVotes} votos públicos.`,
        className: "bg-red-50 border-red-200",
      });
      
      console.log('✅ Reset completed:', result);
    } catch (error) {
      console.error('❌ Error resetting votes:', error);
      toast({
        title: "Error",
        description: "No se pudo reiniciar el sistema. Verifica la conexión.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${
        isDark ? 'text-white' : 'text-gray-600'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Cargando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 animate-fade-in ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    } min-h-screen p-6`}>
      <div className="text-center">
        <h1 className={`text-3xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          Gestión de Eventos
        </h1>
        <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
          Administra los eventos del concurso y maneja empates
        </p>
      </div>

      {/* Weights Validation Alert */}
      {weightsValidation && !weightsValidation.mandatory.isValid && (
        <Card className={`border-yellow-400 ${
          isDark ? 'bg-yellow-900/20 border-yellow-500' : 'bg-yellow-50'
        }`}>
          <CardHeader>
            <CardTitle className={`flex items-center text-yellow-600 ${
              isDark ? 'text-yellow-400' : ''
            }`}>
              <AlertTriangle className="w-5 h-5 mr-2" />
              ¡Atención en Pesos de Eventos!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`mb-4 ${
              isDark ? 'text-yellow-300' : 'text-yellow-700'
            }`}>
              Los pesos de eventos obligatorios suman {weightsValidation.mandatory.totalWeight.toFixed(1)}% (debe ser 100%).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Eventos Obligatorios:</h4>
                {weightsValidation.mandatory.events.map((event: EventSummary) => (
                  <div key={event.id} className="flex justify-between">
                    <span>{event.name}</span>
                    <span className="font-medium">{event.weight}%</span>
                  </div>
                ))}
              </div>
              {weightsValidation.optional.events.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Eventos Opcionales:</h4>
                  {weightsValidation.optional.events.map((event: EventSummary) => (
                    <div key={event.id} className="flex justify-between">
                      <span>{event.name}</span>
                      <span className="font-medium">+{event.bonus_percentage}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tie Breaking Alert */}
      {ties?.hasActiveTies && (
        <Card className={`border-orange-400 ${
          isDark ? 'bg-orange-900/20 border-orange-500' : 'bg-orange-50'
        }`}>
          <CardHeader>
            <CardTitle className={`flex items-center text-orange-600 ${
              isDark ? 'text-orange-400' : ''
            }`}>
              <AlertTriangle className="w-5 h-5 mr-2" />
              ¡Empates Detectados!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`mb-4 ${
              isDark ? 'text-orange-300' : 'text-orange-700'
            }`}>
              Se han detectado {ties.ties.length} empates con un total de {ties.totalCandidatesInTies} candidatas.
            </p>
            <Button
              onClick={() => setShowTieModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Gestionar Empates
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Evento
          </Button>
          <Button 
            onClick={fetchWeightsValidation}
            variant="outline"
            className={isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : ''}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Validar Pesos
          </Button>
          <Button 
            onClick={fetchTies}
            variant="outline"
            className={isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : ''}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Verificar Empates
          </Button>
          
          {/* Reset Votes Button with Confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reiniciar Votaciones
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className={isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white"}>
              <AlertDialogHeader>
                <AlertDialogTitle className={`flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                  ¿Reiniciar Todo el Sistema?
                </AlertDialogTitle>
                <AlertDialogDescription className={isDark ? "text-gray-300" : "text-gray-600"}>
                  <div className="space-y-3">
                    <p className="font-semibold text-red-600">⚠️ ACCIÓN IRREVERSIBLE</p>
                    <p>Esta acción eliminará permanentemente:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>✖️ Todas las calificaciones de jueces</li>
                      <li>✖️ Todos los votos públicos</li>
                      <li>✖️ Todo el historial de puntuaciones</li>
                    </ul>
                    <p className="font-semibold">Esta operación NO se puede deshacer.</p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className={isDark ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600" : ""}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={resetAllVotes}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Sí, Reiniciar Todo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => (
          <Card key={event.id} className={`shadow-lg ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className={`text-lg ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    {event.name}
                  </CardTitle>
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {getEventTypeLabel(event.name)}
                  </p>
                  {event.description && (
                    <p className={`text-xs mt-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {event.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge 
                    variant={event.is_active ? "default" : "secondary"}
                    className={event.is_active 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                    }
                  >
                    {event.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={event.is_mandatory
                      ? 'border-purple-300 text-purple-700 bg-purple-50'
                      : 'border-orange-300 text-orange-700 bg-orange-50'
                    }
                  >
                    {event.is_mandatory ? `Obligatorio ${event.weight}%` : `Opcional +${event.bonus_percentage}%`}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center space-x-2">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(event)}
                    className={isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
                    title="Editar evento"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleEventStatus(event)}
                    disabled={eventTogglingState[event.id] === 'loading'}
                    className={`transition-all duration-500 ${
                      eventTogglingState[event.id] === 'loading'
                        ? 'opacity-70 cursor-not-allowed animate-pulse bg-yellow-50 border-yellow-300'
                        : eventTogglingState[event.id] === 'success'
                        ? 'bg-green-50 border-green-400 text-green-700'
                        : event.is_active 
                        ? 'text-red-600 border-red-300 hover:bg-red-50' 
                        : 'text-green-600 border-green-300 hover:bg-green-50'
                    } ${isDark ? 'hover:bg-opacity-20' : ''}`}
                    title={
                      eventTogglingState[event.id] === 'loading' 
                        ? 'Procesando cambio...'
                        : eventTogglingState[event.id] === 'success'
                        ? '¡Cambio aplicado!'
                        : event.is_active 
                        ? 'Desactivar evento' 
                        : 'Activar evento'
                    }
                  >
                    {eventTogglingState[event.id] === 'loading' ? (
                      <>
                        <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent"></div>
                        Procesando...
                      </>
                    ) : eventTogglingState[event.id] === 'success' ? (
                      <>
                        <div className="w-4 h-4 mr-1 text-green-600">✓</div>
                        ¡Aplicado!
                      </>
                    ) : event.is_active ? (
                      <>
                        <Square className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteEvent(event.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    title="Eliminar evento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Creado: {new Date(event.created_at).toLocaleDateString('es-ES')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Event Dialog */}
      <Dialog open={isCreateOpen || !!editingEvent} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setEditingEvent(null);
          setFormData({ name: '', description: '', weight: 0, is_mandatory: true, bonus_percentage: 0, is_active: true });
        }
      }}>
        <DialogContent className={`max-w-2xl ${
          isDark 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : 'text-gray-800'}>
              {editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={editingEvent ? updateEvent : createEvent} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className={isDark ? 'text-gray-200' : ''}>
                  Nombre del Evento
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Traje Típico 2025"
                  className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className={isDark ? 'text-gray-200' : ''}>
                  Descripción (Opcional)
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del evento"
                  className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label className={isDark ? 'text-gray-200' : ''}>Tipo de Evaluación:</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="is_mandatory"
                      checked={formData.is_mandatory === true}
                      onChange={() => setFormData(prev => ({ ...prev, is_mandatory: true, bonus_percentage: 0 }))}
                      className="text-purple-600"
                    />
                    <span className={isDark ? 'text-gray-200' : ''}>Obligatorio</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="is_mandatory"
                      checked={formData.is_mandatory === false}
                      onChange={() => setFormData(prev => ({ ...prev, is_mandatory: false, weight: 0 }))}
                      className="text-purple-600"
                    />
                    <span className={isDark ? 'text-gray-200' : ''}>Opcional</span>
                  </label>
                </div>
              </div>

              {formData.is_mandatory ? (
                <div className="space-y-2">
                  <Label htmlFor="weight" className={isDark ? 'text-gray-200' : ''}>
                    Peso del Evento (%)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="weight"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                      placeholder="30"
                      className={`flex-1 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                      required
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>%</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    El total de todos los eventos obligatorios debe sumar 100%
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="bonus_percentage" className={isDark ? 'text-gray-200' : ''}>
                    Porcentaje de Bonus (%)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="bonus_percentage"
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={formData.bonus_percentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, bonus_percentage: parseFloat(e.target.value) || 0 }))}
                      placeholder="5"
                      className={`flex-1 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>%</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Porcentaje adicional que se suma al puntaje final
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingEvent(null);
                  setFormData({ name: '', description: '', weight: 0, is_mandatory: true, bonus_percentage: 0, is_active: true });
                }}
                className={isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                {editingEvent ? 'Actualizar' : 'Crear'} Evento
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tie Breaking Modal */}
      <Dialog open={showTieModal} onOpenChange={setShowTieModal}>
        <DialogContent className={`max-w-4xl ${
          isDark 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
              <Shuffle className="w-5 h-5 mr-2 text-orange-600" />
              Gestión de Empates
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {ties?.ties.map((tieGroup, index) => (
              <Card key={index} className={`border-orange-200 ${
                isDark ? 'bg-gray-700 border-orange-600' : 'bg-orange-50'
              }`}>
                <CardHeader>
                  <CardTitle className={`text-lg flex items-center ${
                    isDark ? 'text-orange-300' : 'text-orange-800'
                  }`}>
                    {tieGroup.position === 1 && <span className="text-yellow-500 mr-2">👑</span>}
                    {tieGroup.position === 2 && <span className="text-gray-400 mr-2">🥈</span>}
                    {tieGroup.position === 3 && <span className="text-amber-600 mr-2">🥉</span>}
                    {tieGroup.description || `Empate en Posición #${tieGroup.position}`}
                  </CardTitle>
                  <div className={`text-sm space-y-1 ${
                    isDark ? 'text-orange-200' : 'text-orange-600'
                  }`}>
                    <p>
                      🎯 {tieGroup.candidateCount} candidatas empatadas con {tieGroup.score.toFixed(2)} puntos
                    </p>
                    <p>
                      ⚡ Bonificación automática: +{tieGroup.bonusPoints || (tieGroup.position === 1 ? 5 : tieGroup.position === 2 ? 3 : 1)} puntos
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {tieGroup.candidates.map((candidate) => (
                      <div key={candidate.id} className={`p-3 rounded-lg border text-center transition-all hover:shadow-md ${
                        isDark ? 'bg-gray-600 border-gray-500 hover:border-orange-400' : 'bg-white border-orange-200 hover:border-orange-400'
                      }`}>
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-2 border-orange-400">
                          <img 
                            src={candidate.photo_url ? `http://localhost:3000${candidate.photo_url}` : '/api/placeholder/100/100'} 
                            alt={candidate.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/api/placeholder/100/100';
                            }}
                          />
                        </div>
                        <h4 className={`font-semibold text-sm ${
                          isDark ? 'text-white' : 'text-gray-800'
                        }`}>
                          {candidate.name}
                        </h4>
                        <p className={`text-xs ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {candidate.career}
                        </p>
                        <div className={`mt-1 text-xs font-bold ${
                          isDark ? 'text-orange-300' : 'text-orange-700'
                        }`}>
                          {tieGroup.score.toFixed(2)}/10.0
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className={`mb-4 p-3 rounded-lg ${
                    isDark ? 'bg-red-900/20 border border-red-600' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className={`text-sm ${
                      isDark ? 'text-red-300' : 'text-red-700'
                    }`}>
                      <strong>⚠️ ADVERTENCIA:</strong> Al activar este desempate:
                      <ul className="mt-1 ml-4 list-disc">
                        <li>Aparecerá un modal OBLIGATORIO en todos los paneles de jueces</li>
                        <li>Los jueces NO podrán cerrar el modal hasta votar</li>
                        <li>Se añadirán {tieGroup.bonusPoints || (tieGroup.position === 1 ? 5 : tieGroup.position === 2 ? 3 : 1)} puntos extra automáticamente</li>
                        <li>Se notificará vía WebSocket en tiempo real</li>
                      </ul>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => activateTieBreaking(tieGroup)}
                    className={`w-full py-3 text-lg font-semibold ${
                      tieGroup.position === 1 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-orange-600 hover:bg-orange-700'
                    } text-white shadow-lg`}
                  >
                    <Shuffle className="w-5 h-5 mr-2" />
                    🚨 Activar Desempate para {tieGroup.position === 1 ? 'Reina ESPE' : tieGroup.position === 2 ? 'Srta. Confraternidad' : 'Srta. Simpatía'}
                    <span className="ml-2 text-sm opacity-90">
                      (+{tieGroup.bonusPoints || (tieGroup.position === 1 ? 5 : tieGroup.position === 2 ? 3 : 1)} pts)
                    </span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsAdmin; 
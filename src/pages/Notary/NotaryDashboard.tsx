import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Event, Candidate } from '../../types/database';
import { JudgeMonitoring } from '../../components/notary/JudgeMonitoring';
import { Play, Square, Activity, Users, BarChart3, Trophy, UserCheck, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../features/auth/AuthContext';
import { toast } from '../../hooks/use-toast';
import { io } from 'socket.io-client';
import { eventsService, candidatesService } from '../../services/api';

const NotaryDashboard = () => {
  const { token } = useAuth();
  const { isDark } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventUpdatingState, setEventUpdatingState] = useState<Record<number, 'updating' | 'updated' | null>>({});

  useEffect(() => {
    fetchEvents();
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (!token) return;

    console.log('🔌 Setting up notary WebSocket for event status updates...');
    
    const socket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ Notary events WebSocket connected');
    });

    socket.on('event_updating_start', (notification) => {
      console.log('⏳ Notary - Event updating start notification:', notification);
      
      const eventId = notification.data.eventId;
      const eventName = notification.data.eventName;
      
      setEventUpdatingState(prev => ({ ...prev, [eventId]: 'updating' }));
      
      toast({
        title: `⏳ Administrador modificando evento`,
        description: `"${eventName}" está siendo ${notification.data.action === 'changing_status' ? 'activado/desactivado' : 'actualizado'}...`,
        className: "bg-blue-50 border-blue-200",
      });
    });

    socket.on('event_updated', (notification) => {
      console.log('📅 Notary - Event updated notification received:', notification);
      
      const updatedEvent = notification.data.event;
      
      setEventUpdatingState(prev => ({ ...prev, [updatedEvent.id]: 'updating' }));
      
      toast({
        title: `📅 ${notification.data.updatedBy === 'Sistema' ? 'Sistema' : 'Administrador'} cambió evento`,
        description: `"${updatedEvent.name}" ahora está ${updatedEvent.is_active ? '✅ ACTIVO' : '❌ INACTIVO'}`,
        className: updatedEvent.is_active 
          ? "bg-green-50 border-green-200" 
          : "bg-red-50 border-red-200",
      });
      
      setTimeout(() => {
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === updatedEvent.id ? updatedEvent : event
          )
        );
        
        setEventUpdatingState(prev => ({ ...prev, [updatedEvent.id]: 'updated' }));
        
        setTimeout(() => {
          setEventUpdatingState(prev => ({ ...prev, [updatedEvent.id]: null }));
        }, 2000);
      }, 500);
      
      console.log(`✅ Notary - Event updated in real-time: ${updatedEvent.name}`);
    });

    socket.on('system_notification', (notification) => {
      if (notification.message.includes('Evento')) {
        console.log('📢 System notification for events:', notification.message);
      }
    });

    return () => {
      console.log('🔌 Disconnecting notary events WebSocket...');
      socket.disconnect();
    };
  }, [token]);

  const fetchEvents = async () => {
    try {
      const result = await eventsService.getAll();
      setEvents(result);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los eventos.",
        variant: "destructive",
      });
    }
  };

  const fetchCandidates = async () => {
    try {
      const result = await candidatesService.getAll();
      setCandidates(result);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEventStatus = async (event: Event) => {
    try {
      const newStatus = !event.is_active;
      
      const response = await fetch(`http://localhost:3000/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: event.name,
          event_type: event.event_type || 'general',
          description: event.description,
          status: event.status || 'active',
          weight: event.weight,
          is_mandatory: event.is_mandatory,
          bonus_percentage: event.bonus_percentage,
          is_active: newStatus
        })
      });

      if (response.ok) {
        toast({
          title: newStatus ? "Evento activado" : "Evento desactivado",
          description: `El evento ha sido ${newStatus ? 'activado' : 'desactivado'} exitosamente.`,
          className: newStatus ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
        });
        
        setEvents(prevEvents => 
          prevEvents.map(e => 
            e.id === event.id 
              ? { ...e, is_active: newStatus }
              : e
          )
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cambiar estado del evento');
      }
    } catch (error) {
      console.error('❌ Error toggling event status:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del evento.",
        variant: "destructive",
      });
    }
  };

  const calculateTotalWeight = () => {
    try {
      if (!events || !Array.isArray(events) || events.length === 0) {
        return 0;
      }
      
      const total = events
        .filter(e => e && e.is_mandatory === true)
        .reduce((sum, e) => {
          const weight = e.weight;
          if (weight === null || weight === undefined || isNaN(Number(weight))) {
            return sum;
          }
          return sum + Number(weight);
        }, 0);
      
      return total;
    } catch (error) {
      console.error('Error calculating total weight:', error);
      return 0;
    }
  };

  const totalWeight = calculateTotalWeight();
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;

  const EventCard: React.FC<{ event: Event }> = ({ event }) => (
    <Card className={`shadow-lg transition-all duration-500 ${
      eventUpdatingState[event.id] === 'updating'
        ? isDark 
          ? 'bg-yellow-900/30 border-yellow-600 animate-pulse' 
          : 'bg-yellow-50 border-yellow-300 animate-pulse'
        : eventUpdatingState[event.id] === 'updated'
        ? isDark 
          ? 'bg-green-900/30 border-green-600' 
          : 'bg-green-50 border-green-300'
        : isDark 
        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
        : 'bg-white border-gray-200 hover:shadow-xl'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className={`text-lg mb-1 flex items-center space-x-2 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              <span>{event.name}</span>
              {eventUpdatingState[event.id] === 'updating' && (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent"></div>
              )}
              {eventUpdatingState[event.id] === 'updated' && (
                <div className="w-4 h-4 text-green-600">✓</div>
              )}
            </CardTitle>
            {event.description && (
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {event.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge 
              variant={event.is_active ? "default" : "secondary"}
              className={`transition-all duration-300 ${
                eventUpdatingState[event.id] === 'updating'
                  ? 'animate-pulse bg-yellow-100 text-yellow-800 border-yellow-200'
                  : event.is_active 
                  ? `bg-green-100 text-green-800 border-green-200 ${isDark ? 'dark:bg-green-900/50 dark:text-green-300 dark:border-green-700' : ''}` 
                  : `bg-gray-100 text-gray-800 border-gray-200 ${isDark ? 'dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600' : ''}`
              }`}
            >
              {eventUpdatingState[event.id] === 'updating' 
                ? '⏳ Actualizando...' 
                : event.is_active 
                ? 'Activo' 
                : 'Inactivo'
              }
            </Badge>
            <Badge 
              variant="outline"
              className={event.is_mandatory
                ? `border-purple-300 text-purple-700 bg-purple-50 ${isDark ? 'dark:border-purple-600 dark:text-purple-400 dark:bg-purple-900/30' : ''}`
                : `border-orange-300 text-orange-700 bg-orange-50 ${isDark ? 'dark:border-orange-600 dark:text-orange-400 dark:bg-orange-900/30' : ''}`
              }
            >
              {event.is_mandatory ? `Obligatorio ${event.weight}%` : `Opcional +${event.bonus_percentage}%`}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className={`text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Creado: {new Date(event.created_at).toLocaleDateString('es-ES')}
            {eventUpdatingState[event.id] === 'updating' && (
              <div className="mt-1 text-yellow-600 font-semibold">
                📡 Sincronizando cambios...
              </div>
            )}
            {eventUpdatingState[event.id] === 'updated' && (
              <div className="mt-1 text-green-600 font-semibold">
                ✅ ¡Actualizado exitosamente!
              </div>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleEventStatus(event)}
            disabled={eventUpdatingState[event.id] === 'updating'}
            className={`transition-all duration-300 ${
              eventUpdatingState[event.id] === 'updating'
                ? 'opacity-50 cursor-not-allowed'
                : event.is_active 
                ? `text-red-600 border-red-300 hover:bg-red-50 ${isDark ? 'dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/30' : ''}` 
                : `text-green-600 border-green-300 hover:bg-green-50 ${isDark ? 'dark:text-green-400 dark:border-green-600 dark:hover:bg-green-900/30' : ''}`
            }`}
            title={
              eventUpdatingState[event.id] === 'updating'
                ? 'Procesando cambios...'
                : event.is_active 
                ? 'Desactivar evento' 
                : 'Activar evento'
            }
          >
            {eventUpdatingState[event.id] === 'updating' ? (
              <>
                <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent"></div>
                Sincronizando...
              </>
            ) : event.is_active ? (
              <>
                <Square className="w-4 h-4 mr-1" />
                Desactivar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Activar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={`space-y-6 animate-pulse ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      } min-h-screen p-6`}>
        <div className={`h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/3`}></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`h-48 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}></div>
          ))}
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
          Panel de Notaría
        </h1>
        <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
          Control de eventos y supervisión del concurso
        </p>
      </div>

      {!isWeightValid && (
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
            <p className={`${
              isDark ? 'text-yellow-300' : 'text-yellow-700'
            }`}>
              Los pesos de eventos obligatorios suman {isNaN(totalWeight) ? '0.0' : totalWeight.toFixed(1)}% (debe ser 100%).
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={`shadow-lg ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-gradient-to-br from-green-50 to-white border-green-200'
        }`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Total Eventos
              </CardTitle>
              <Activity className={`h-5 w-5 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              {events?.length || 0}
            </div>
            <Badge className={`mt-2 ${
              isDark 
                ? 'bg-green-900/30 text-green-300 border-green-700' 
                : 'bg-green-100 text-green-800 border-green-200'
            }`}>
              {events?.filter(e => e.is_active)?.length || 0} activos
            </Badge>
          </CardContent>
        </Card>

        <Card className={`shadow-lg ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-gradient-to-br from-blue-50 to-white border-blue-200'
        }`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Total Candidatas
              </CardTitle>
              <Users className={`h-5 w-5 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              {candidates?.length || 0}
            </div>
            <Badge className={`mt-2 ${
              isDark 
                ? 'bg-blue-900/30 text-blue-300 border-blue-700' 
                : 'bg-blue-100 text-blue-800 border-blue-200'
            }`}>
              Activas
            </Badge>
          </CardContent>
        </Card>

        <Card className={`shadow-lg ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-gradient-to-br from-purple-50 to-white border-purple-200'
        }`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Peso Total
              </CardTitle>
              <BarChart3 className={`h-5 w-5 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              {isNaN(totalWeight) ? '0.0' : totalWeight.toFixed(1)}%
            </div>
            <Badge className={`mt-2 ${
              isWeightValid
                ? isDark 
                  ? 'bg-purple-900/30 text-purple-300 border-purple-700' 
                  : 'bg-purple-100 text-purple-800 border-purple-200'
                : 'bg-red-100 text-red-800 border-red-200'
            }`}>
              {isWeightValid ? 'Válido' : 'Inválido'}
            </Badge>
          </CardContent>
        </Card>

        <Card className={`shadow-lg ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-gradient-to-br from-orange-50 to-white border-orange-200'
        }`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Estado General
              </CardTitle>
              <Trophy className={`h-5 w-5 ${
                isDark ? 'text-orange-400' : 'text-orange-600'
              }`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-bold ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              {(events?.filter(e => e.is_active)?.length || 0) > 0 ? 'ACTIVO' : 'STANDBY'}
            </div>
            <Badge className={`mt-2 ${
              (events?.filter(e => e.is_active)?.length || 0) > 0
                ? isDark 
                  ? 'bg-green-900/30 text-green-300 border-green-700' 
                  : 'bg-green-100 text-green-800 border-green-200'
                : isDark 
                  ? 'bg-gray-700 text-gray-300 border-gray-600' 
                  : 'bg-gray-100 text-gray-800 border-gray-200'
            }`}>
              Concurso
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className={`grid w-full grid-cols-2 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
        }`}>
          <TabsTrigger 
            value="events" 
            className={`flex items-center space-x-2 ${
              isDark ? 'data-[state=active]:bg-gray-700 text-gray-300' : ''
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Control de Eventos</span>
          </TabsTrigger>
          <TabsTrigger 
            value="judges" 
            className={`flex items-center space-x-2 ${
              isDark ? 'data-[state=active]:bg-gray-700 text-gray-300' : ''
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Monitoreo de Jueces</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(events || []).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="judges">
          <JudgeMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotaryDashboard;

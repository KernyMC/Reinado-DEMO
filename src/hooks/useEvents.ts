import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsService, Event } from '@/services/api';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export interface CreateEventData {
  name: string;
  event_type: 'typical_costume' | 'evening_gown' | 'qa';
  description?: string;
  weight: number;
  is_mandatory: boolean;
  bonus_percentage: number;
}

export interface UpdateEventData {
  name?: string;
  event_type?: 'typical_costume' | 'evening_gown' | 'qa';
  description?: string;
  status?: 'pending' | 'active' | 'closed';
  weight?: number;
  is_mandatory?: boolean;
  bonus_percentage?: number;
}

export const useEvents = () => {
  const queryClient = useQueryClient();

  // Get all events
  const events = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      console.log('🔄 Fetching events...');
      try {
        const result = await eventsService.getAll();
        console.log('✅ Events fetched:', result.length, result);
        return result;
      } catch (error) {
        console.error('❌ Error fetching events:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // ============ NUEVO: WebSocket listener para actualizaciones de eventos ============
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    console.log('🔌 Setting up WebSocket for events...');
    
    const socket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ Events WebSocket connected');
    });

    // Escuchar actualizaciones de eventos
    socket.on('event_updated', (notification) => {
      console.log('📅 Event updated notification received:', notification);
      
      const updatedEvent = notification.data.event;
      
      // Actualizar la query cache inmediatamente
      queryClient.setQueryData(['events'], (oldEvents: Event[] | undefined) => {
        if (!oldEvents) return oldEvents;
        
        return oldEvents.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        );
      });
      
      // También invalidar para refrescar desde el servidor
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      // Mostrar notificación
      toast.success(`Evento "${updatedEvent.name}" actualizado en tiempo real`, {
        description: notification.data.message,
      });
      
      console.log(`✅ Event cache updated for: ${updatedEvent.name}`);
    });

    // Cleanup
    return () => {
      console.log('🔌 Disconnecting events WebSocket...');
      socket.disconnect();
    };
  }, [queryClient]);
  // =========================================================================

  // Get event by ID
  const useEvent = (id: string) => {
    return useQuery({
      queryKey: ['events', id],
      queryFn: () => eventsService.getById(id),
      enabled: !!id,
    });
  };

  // Create event mutation
  const createEvent = useMutation({
    mutationFn: (data: CreateEventData) => {
      console.log('📝 Creating event:', data);
      return eventsService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Evento creado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al crear evento';
      toast.error(message);
    },
  });

  // Update event mutation
  const updateEvent = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventData }) => {
      console.log('📝 Updating event:', id, data);
      return eventsService.update(id, data);
    },
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.setQueryData(['events', updatedEvent.id], updatedEvent);
      toast.success('Evento actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al actualizar evento';
      toast.error(message);
    },
  });

  // Update event status mutation
  const updateEventStatus = useMutation({
    mutationFn: ({ id, status, start_time, end_time }: { 
      id: string; 
      status: 'pending' | 'active' | 'closed';
      start_time?: string;
      end_time?: string;
    }) => {
      console.log('🔄 Updating event status:', id, status);
      return eventsService.updateStatus(id, { status, start_time, end_time });
    },
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.setQueryData(['events', updatedEvent.id], updatedEvent);
      toast.success('Estado del evento actualizado');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al actualizar estado del evento';
      toast.error(message);
    },
  });

  // Delete event mutation
  const deleteEvent = useMutation({
    mutationFn: (id: string) => {
      console.log('🗑️ Deleting event:', id);
      return eventsService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Evento eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al eliminar evento';
      toast.error(message);
    },
  });

  return {
    events: events.data || [],
    isLoading: events.isLoading,
    error: events.error,
    refetch: events.refetch,
    useEvent,
    createEvent,
    updateEvent,
    updateEventStatus,
    deleteEvent,
  };
}; 
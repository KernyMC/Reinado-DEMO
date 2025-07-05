import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService, candidatesService, scoresService, Event, Candidate } from '@/services/api';
import { useAuth } from '@/features/auth/AuthContext';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

interface ScoreEntry {
  candidateId: string;
  score: number;
  saved: boolean;
}

export const useJudgeVotes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [scores, setScores] = useState<Record<string, Record<string, ScoreEntry>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Load events from API
  const { data: events = [], isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useQuery({
    queryKey: ['events', user?.id],
    queryFn: async () => {
      console.log('🔄 Loading all events for judge:', user?.email);
      const result = await eventsService.getAll();
      return result;
    },
    enabled: !!user,
    retry: 1,
    retryDelay: 1000,
  });

  // Load candidates from API
  const { data: candidates = [], isLoading: candidatesLoading, error: candidatesError } = useQuery({
    queryKey: ['candidates', user?.id],
    queryFn: async () => {
      console.log('🔄 Loading candidates for judge:', user?.email);
      const result = await candidatesService.getAll();
      console.log('✅ Candidates loaded for judge:', user?.email, result.length, 'candidates');
      return result;
    },
    enabled: !!user,
    retry: 1,
    retryDelay: 1000,
  });

  // Load existing scores for current judge
  const { data: existingScores = [], isLoading: scoresLoading, error: scoresError } = useQuery({
    queryKey: ['judge-scores', user?.id, user?.email],
    queryFn: async () => {
      console.log('🔄 Loading existing scores for judge:', user?.email, 'ID:', user?.id);
      try {
        const result = await scoresService.getMyScores();
        console.log('✅ Existing scores loaded for:', user?.email, result.length, 'scores');
        return result;
      } catch (error) {
        console.log('ℹ️ No existing scores found for:', user?.email);
        return [];
      }
    },
    enabled: !!user && user.role === 'judge',
    retry: 1,
    retryDelay: 1000,
  });

  // ============ MOVIDO: WebSocket para actualizaciones de eventos en tiempo real ============
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;

    console.log('🔌 Setting up judge WebSocket for real-time events...');
    
    const socket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ Judge WebSocket connected for events');
      
      // Join judge-specific room
      socket.emit('join_room', `judge_${user.id}`);
    });

    // Escuchar actualizaciones de eventos
    socket.on('event_updated', (notification) => {
      console.log('📅 Judge - Event updated notification received:', notification);
      
      const updatedEvent = notification.data.event;
      
      // ============ FIX MEJORADO: Actualización más agresiva del cache ============
      const queryKey = ['events', user?.id];
      
      // 1. Forzar invalidación inmediata con múltiples estrategias
      queryClient.invalidateQueries({ queryKey: queryKey });
      queryClient.refetchQueries({ queryKey: queryKey });
      
      // 2. Actualizar cache con setQueryData DE INMEDIATO
      queryClient.setQueryData(queryKey, (oldEvents: Event[] | undefined) => {
        if (!oldEvents) return oldEvents;
        
        console.log(`🔄 FORCE UPDATE: Updating cache for event ${updatedEvent.name}`);
        console.log(`   Evento ${updatedEvent.id}: is_active = ${updatedEvent.is_active}`);
        
        const newEvents = oldEvents.map(event => 
          event.id === updatedEvent.id ? { ...updatedEvent } : event
        );
        
        console.log(`✅ Cache updated - Event status changed to: ${updatedEvent.is_active}`);
        return newEvents;
      });
      
      // 3. FORZAR RE-RENDER del hook completo con múltiples triggers
      setForceUpdate(prev => {
        const newValue = prev + 1;
        console.log(`🚀 FORCING HOOK UPDATE: ${prev} -> ${newValue}`);
        return newValue;
      });
      
      // 4. Refetch para asegurar datos frescos (con delay mínimo)
      setTimeout(() => {
        refetchEvents();
      }, 100);
      
      // ============ NOTIFICACIONES OPTIMIZADAS ============
      // Solo mostrar UNA notificación clara
      if (!updatedEvent.is_active) {
        toast.warning(`⏸️ "${updatedEvent.name}" DESACTIVADO`, {
          description: 'Ya no puedes enviar calificaciones para este evento.',
          duration: 4000,
        });
      } else if (updatedEvent.is_active) {
        toast.success(`▶️ "${updatedEvent.name}" ACTIVADO`, {
          description: 'Ahora puedes enviar calificaciones.',
          duration: 4000,
        });
      }
      
      console.log(`✅ Judge - Event ${updatedEvent.name} updated to: ${updatedEvent.is_active ? 'ACTIVE' : 'INACTIVE'}`);
    });

    // Limpiar notificaciones del sistema (solo las importantes)
    socket.on('system_notification', (notification) => {
      // Solo mostrar notificaciones críticas, no duplicadas
      if (notification.message.includes('activado') || notification.message.includes('desactivado')) {
        console.log('📢 System notification:', notification);
        // No mostrar toast aquí para evitar duplicados
      }
    });

    // Cleanup
    return () => {
      console.log('🔌 Disconnecting judge events WebSocket...');
      socket.disconnect();
    };
  }, [user, queryClient, refetchEvents]);
  // ===============================================================================================

  // Initialize scores when data is loaded
  useEffect(() => {
    if (events.length > 0 && candidates.length > 0 && user) {
      console.log('🔄 Initializing scores for judge:', user.email);
      console.log('📊 Data loaded - Events:', events.length, 'Candidates:', candidates.length, 'ExistingScores:', existingScores.length);
      
      const initialScores: Record<string, Record<string, ScoreEntry>> = {};
      
      events.forEach(event => {
        initialScores[event.id] = {};
        candidates.forEach(candidate => {
          // Check if there's an existing score
          const existingScore = existingScores.find(
            score => score.event_id === event.id && score.candidate_id === candidate.id
          );
          
          const scoreValue = existingScore ? Number(existingScore.score) : 0;
          const isValidScore = typeof scoreValue === 'number' && !isNaN(scoreValue);
          
          initialScores[event.id][candidate.id] = {
            candidateId: candidate.id,
            score: isValidScore ? scoreValue : 0,
            saved: !!existingScore
          };
          
          if (existingScore) {
            console.log(`🎯 ${user.email} - ${candidate.name} in ${event.name}: ${scoreValue} (saved)`);
          }
        });
      });
      
      setScores(initialScores);
      console.log('✅ Scores initialized for:', user.email);
    }
  }, [events, candidates, existingScores, user]);

  // Submit score mutation
  const submitScoreMutation = useMutation({
    mutationFn: async ({ eventId, candidateId, score }: { 
      eventId: string; 
      candidateId: string; 
      score: number; 
    }) => {
      console.log('📝 Judge', user?.email, 'submitting score:', JSON.stringify({ eventId, candidateId, score }, null, 2));
      return await scoresService.submit({
        event_id: eventId,
        candidate_id: candidateId,
        score
      });
    },
    onSuccess: (data, variables) => {
      console.log('✅ Score submitted successfully by:', user?.email, data);
      
      // Update local scores state
      setScores(prev => ({
        ...prev,
        [variables.eventId]: {
          ...prev[variables.eventId],
          [variables.candidateId]: {
            ...prev[variables.eventId][variables.candidateId],
            saved: true
          }
        }
      }));
      
      // Invalidate queries to refresh data with user context
      queryClient.invalidateQueries({ queryKey: ['judge-scores', user?.id] });
      
      toast.success('Calificación guardada exitosamente');
    },
    onError: (error: any) => {
      console.error('❌ Error submitting score for:', user?.email, error);
      const message = error.response?.data?.error || 'Error al guardar calificación';
      toast.error(message);
    },
  });

  const handleScoreChange = (eventId: string, candidateId: string, score: number) => {
    // ============ NUEVA: Validación de evento activo ============
    if (!canVoteInEvent(eventId)) {
      const event = events.find(e => e.id.toString() === eventId);
      console.log(`🚫 Blocked score change - Event "${event?.name}" is not active`);
      
      toast.error(`❌ No puedes calificar en "${event?.name}"`, {
        description: 'El evento está desactivado por el administrador.',
        duration: 3000,
      });
      
      return; // Bloquear cambio de calificación
    }
    // ============================================================
    
    const safeScore = typeof score === 'number' && !isNaN(score) ? score : 0;
    console.log('🔄 Score changed:', JSON.stringify({ eventId, candidateId, originalScore: score, safeScore }, null, 2));
    
    setScores(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId] || {},
        [candidateId]: {
          ...(prev[eventId]?.[candidateId] || {}),
          candidateId,
          score: safeScore,
          saved: false
        }
      }
    }));
  };

  const saveScore = async (eventId: string, candidateId: string) => {
    // ============ NUEVA: Validación de evento activo ============
    if (!canVoteInEvent(eventId)) {
      const event = events.find(e => e.id.toString() === eventId);
      toast.error(`❌ No puedes guardar calificaciones en "${event?.name}"`, {
        description: 'El evento está desactivado por el administrador.',
        duration: 3000,
      });
      return;
    }
    // ============================================================
    
    const scoreEntry = scores[eventId]?.[candidateId];
    if (!scoreEntry || scoreEntry.saved) return;

    console.log('💾 Saving individual score:', JSON.stringify({ eventId, candidateId, score: scoreEntry.score }, null, 2));
    
    await submitScoreMutation.mutateAsync({
      eventId,
      candidateId,
      score: scoreEntry.score
    });
  };

  const saveAllScores = async (eventId: string) => {
    // ============ NUEVA: Validación de evento activo ============
    if (!canVoteInEvent(eventId)) {
      const event = events.find(e => e.id.toString() === eventId);
      toast.error(`❌ No puedes enviar calificaciones para "${event?.name}"`, {
        description: 'El evento está desactivado por el administrador.',
        duration: 3000,
      });
      return;
    }
    // ============================================================
    
    console.log('💾 Saving all scores for event:', eventId);
    setSaving(eventId);
    
    try {
      const eventScores = scores[eventId] || {};
      
      // ============ NUEVA: Validación estricta ============
      // Verificar que todas las candidatas tengan calificación
      const totalCandidates = candidates.length;
      const scoredCandidates = Object.keys(eventScores).length;
      
      if (scoredCandidates < totalCandidates) {
        const missingCount = totalCandidates - scoredCandidates;
        toast.error(`❌ Debes calificar a TODAS las candidatas antes de enviar. Faltan ${missingCount} candidata(s) por calificar.`);
        setSaving(null);
        return;
      }

      // Verificar que todas las calificaciones sean válidas (> 0)
      const invalidScores = Object.values(eventScores).filter(score => score.score <= 0);
      if (invalidScores.length > 0) {
        toast.error(`❌ Todas las calificaciones deben ser mayores a 0. Revisa tus puntuaciones.`);
        setSaving(null);
        return;
      }
      // ===================================================
      
      const unsavedScores = Object.entries(eventScores).filter(
        ([_, scoreEntry]) => !scoreEntry.saved && scoreEntry.score > 0
      );

      if (unsavedScores.length === 0) {
        toast.info('No hay calificaciones nuevas para guardar');
        setSaving(null);
        return;
      }

      // Submit all unsaved scores
      for (const [candidateId, scoreEntry] of unsavedScores) {
        await submitScoreMutation.mutateAsync({
          eventId,
          candidateId,
          score: scoreEntry.score
        });
      }

      toast.success(`✅ Se enviaron ${unsavedScores.length} calificaciones exitosamente para todas las candidatas`);
      
    } catch (error) {
      console.error('❌ Error saving all scores:', error);
      toast.error('Error al guardar las calificaciones');
    } finally {
      setSaving(null);
    }
  };

  const isAllScoresSaved = (eventId: string) => {
    const eventScores = scores[eventId] || {};
    const scoresWithValues = Object.values(eventScores).filter(score => score.score > 0);
    
    if (scoresWithValues.length === 0) return true;
    
    return scoresWithValues.every(score => score.saved);
  };

  const getEventStatus = (event: Event): 'active' | 'closed' | 'pending' => {
    console.log(`🔍 Getting status for event ${event.name}: is_active=${event.is_active}`);
    if (event.is_active) {
      return 'active';
    } else {
      return 'closed';
    }
  };

  // ============ MEJORADO: useMemo más reactivo para recalcular automáticamente ============
  // Create event status object que se recalcula cuando events cambie
  const eventStatus = useMemo(() => {
    console.log('🔄 RECALCULATING eventStatus for', events.length, 'events (forceUpdate:', forceUpdate, ')');
    
    const statusMap = events.reduce((acc, event) => {
      const status = getEventStatus(event);
      acc[event.id] = status;
      
      // Log más claro para debugging
      console.log(`📊 Event "${event.name}": ${status} (is_active: ${event.is_active ? '✅' : '❌'})`);
      return acc;
    }, {} as Record<string, 'active' | 'closed' | 'pending'>);
    
    // Forzar un log del mapa completo para verificar
    console.log('🎯 Complete EventStatus Map:', statusMap);
    console.log('🎯 Events array hash:', events.map(e => `${e.id}:${e.is_active}`).join(','));
    
    return statusMap;
  }, [events, events.length, forceUpdate, 
      // Añadir dependencias más específicas para forzar recálculo
      events.map(e => e.is_active).join(','),
      events.map(e => e.id).join(',')
  ]); // Agregar forceUpdate y status hash para forzar recálculo con WebSocket
  // ====================================================================================

  // ============ NUEVA: Validación para bloquear votación en eventos deshabilitados ============
  const canVoteInEvent = (eventId: string): boolean => {
    const event = events.find(e => e.id.toString() === eventId);
    const status = eventStatus[eventId];
    
    console.log(`🔒 canVoteInEvent check for ${eventId}:`, {
      event: event?.name,
      is_active: event?.is_active,
      status,
      canVote: event?.is_active && status === 'active'
    });
    
    return event?.is_active === true && status === 'active';
  };
  // ==========================================================================================

  const loading = eventsLoading || candidatesLoading || scoresLoading;
  
  // Log errors for debugging
  if (eventsError) {
    console.error('❌ Events loading error:', eventsError);
  }
  if (candidatesError) {
    console.error('❌ Candidates loading error:', candidatesError);
  }
  if (scoresError) {
    console.error('❌ Scores loading error:', scoresError);
  }

  return {
    events,
    candidates,
    eventStatus,
    scores,
    loading,
    saving,
    handleScoreChange,
    saveScore,
    saveAllScores,
    isAllScoresSaved,
    getEventStatus,
    canVoteInEvent,
    // Debug information
    errors: {
      events: eventsError,
      candidates: candidatesError,
      scores: scoresError
    }
  };
};

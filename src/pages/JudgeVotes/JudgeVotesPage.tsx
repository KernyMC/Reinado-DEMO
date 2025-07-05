import React, { useEffect, useState } from 'react';
import { useJudgeVotes } from '../../hooks/useJudgeVotes';
import { ScoringTabs } from '../../components/JudgeVotes/ScoringTabs';
import { ScoringSummary } from '../../components/JudgeVotes/ScoringSummary';
import TiebreakerModal from '../../components/JudgeVotes/TiebreakerModal';
import DebugInfo from '../../components/DebugInfo';
import { useAuth } from '../../features/auth/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { io, Socket } from 'socket.io-client';

interface TiebreakerData {
  id: string;
  candidates: Array<{
    id: number;
    name: string;
    career: string;
    photo_url: string;
  }>;
  status: string;
  created_at: string;
  activatedBy: string;
  hasVoted: boolean;
  votedCandidates: number[];
  position: number;
  description: string;
  bonusPoints?: number;
}

const JudgeVotesPage = () => {
  const { token, user } = useAuth();
  const {
    events,
    candidates,
    eventStatus,
    scores,
    loading,
    saving,
    handleScoreChange,
    saveAllScores,
    isAllScoresSaved,
    errors
  } = useJudgeVotes();

  // Tiebreaker state
  const [activeTiebreaker, setActiveTiebreaker] = useState<TiebreakerData | null>(null);
  const [showTiebreakerModal, setShowTiebreakerModal] = useState(false);
  const [checkingTiebreaker, setCheckingTiebreaker] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!token || !user) return;

    console.log('🔌 Inicializando conexión WebSocket...');
    
    const newSocket = io('http://localhost:3000', {
      auth: {
        token: token
      },
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket conectado:', newSocket.id);
      
      // Join judge-specific room for targeted notifications
      if (user.id) {
        newSocket.emit('join_room', `judge_${user.id}`);
        console.log(`📡 Unido a sala: judge_${user.id}`);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket desconectado:', reason);
    });

    // Listen for tiebreaker activation
    newSocket.on('tiebreaker_activated', (notification) => {
      console.log('🚨 Tiebreaker activated notification received:', notification);
      
      toast({
        title: "🚨 Desempate Activado",
        description: notification.data.message,
        variant: "destructive",
      });
      
      // Force check for tiebreaker immediately ONLY if no modal is open
      if (!showTiebreakerModal) {
        console.log('📡 WebSocket: Checking for new tiebreaker...');
        setTimeout(() => {
          checkForActiveTiebreaker();
        }, 1000);
      } else {
        console.log('📡 WebSocket: Modal already open, skipping check');
      }
    });

    // Listen for tiebreaker completion
    newSocket.on('tiebreaker_completed', (notification) => {
      console.log('🎉 Tiebreaker completed notification received:', notification);
      
      toast({
        title: "🎉 Desempate Finalizado",
        description: notification.data.message,
        className: "bg-green-50 border-green-200",
      });
      
      // Cerrar modal inmediatamente cuando se complete
      setActiveTiebreaker(null);
      setShowTiebreakerModal(false);
      
      // Mostrar información del ganador
      setTimeout(() => {
        toast({
          title: `🏆 Ganador: ${notification.data.winner.candidate_name}`,
          description: `Puntuación final: ${parseFloat(notification.data.winner.average_score).toFixed(2)} puntos`,
          className: "bg-yellow-50 border-yellow-200",
        });
      }, 2000);
    });

    // ============ NUEVO: Escuchar cuando se eliminen tiebreakers ============
    newSocket.on('tiebreaker_cleared', (notification) => {
      console.log('🧹 Tiebreaker cleared notification received:', notification);
      
      toast({
        title: "🧹 Desempates Eliminados",
        description: notification.message || 'Los desempates han sido eliminados del sistema',
        className: "bg-blue-50 border-blue-200",
      });
      
      // Cerrar modal inmediatamente y limpiar estado
      setActiveTiebreaker(null);
      setShowTiebreakerModal(false);
      console.log('✅ Tiebreaker modal closed due to system reset');
    });
    // =========================================================================

    // Listen for system notifications
    newSocket.on('system_notification', (notification) => {
      console.log('📢 System notification:', notification);
      
      if (notification.type === 'warning') {
        toast({
          title: "📢 Notificación del Sistema",
          description: notification.message,
          className: "bg-orange-50 border-orange-200",
        });
      } else if (notification.type === 'success') {
        toast({
          title: "✅ Sistema",
          description: notification.message,
          className: "bg-green-50 border-green-200",
        });
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
    });

    newSocket.on('connected', (data) => {
      console.log('🎉 WebSocket welcome message:', data.message);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Cerrando conexión WebSocket...');
      newSocket.disconnect();
    };
  }, [token, user?.id]);

  // Check for active tiebreakers on component mount and periodically
  useEffect(() => {
    checkForActiveTiebreaker();
    
    // Check every 60 seconds for new tiebreakers (menos frecuente)
    const interval = setInterval(checkForActiveTiebreaker, 60000);
    
    return () => clearInterval(interval);
  }, [token]);

  const checkForActiveTiebreaker = async () => {
    if (!token || checkingTiebreaker) return;
    
    setCheckingTiebreaker(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/judge/tiebreaker/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.data.hasActiveTiebreaker && !result.data.tiebreaker.hasVoted) {
          console.log('🎯 Active tiebreaker found:', result.data.tiebreaker);
          
          // Solo actualizar si es un nuevo desempate Y no hay modal abierto
          const newTiebreakerId = result.data.tiebreaker.id;
          const isNewTiebreaker = !activeTiebreaker || activeTiebreaker.id !== newTiebreakerId;
          
          if (isNewTiebreaker && !showTiebreakerModal) {
            console.log('🆕 New tiebreaker detected, opening modal');
            setActiveTiebreaker(result.data.tiebreaker);
            setShowTiebreakerModal(true);
          } else if (isNewTiebreaker && showTiebreakerModal) {
            console.log('🔄 Updating existing modal with new tiebreaker data');
            setActiveTiebreaker(result.data.tiebreaker);
            // No cambiar showTiebreakerModal si ya está abierto
          } else {
            console.log('📌 Same tiebreaker, modal state preserved');
          }
        } else if (result.data.hasActiveTiebreaker && result.data.tiebreaker.hasVoted) {
          console.log('✅ Tiebreaker found but already voted, closing modal');
          setActiveTiebreaker(null);
          setShowTiebreakerModal(false);
        } else {
          console.log('🚫 No active tiebreaker found');
          // Solo cerrar modal si no hay desempate activo
          if (!result.data.hasActiveTiebreaker && showTiebreakerModal) {
            console.log('🔚 Closing modal - no active tiebreaker');
            setActiveTiebreaker(null);
            setShowTiebreakerModal(false);
          }
        }
      } else {
        console.log('❌ Error fetching tiebreaker:', response.status);
      }
    } catch (error) {
      console.error('Error checking for tiebreaker:', error);
    } finally {
      setCheckingTiebreaker(false);
    }
  };

  const handleTiebreakerVoteSubmitted = () => {
    console.log('✅ Tiebreaker vote submitted, closing modal');
    setActiveTiebreaker(null);
    setShowTiebreakerModal(false);
    
    // Show success message
    toast({
      title: "Voto de Desempate Enviado",
      description: "Tu voto de desempate ha sido registrado exitosamente.",
      className: "bg-green-50 border-green-200",
    });
    
    // Stop checking for a while to prevent immediate reopening
    setTimeout(() => {
      checkForActiveTiebreaker();
    }, 10000); // Aumentar a 10 segundos
  };

  const handleTiebreakerModalClose = () => {
    // Only allow closing if the judge has already voted
    if (activeTiebreaker && !activeTiebreaker.hasVoted) {
      toast({
        title: "Acción Requerida",
        description: "Debes completar la votación de desempate antes de continuar.",
        variant: "destructive",
      });
      return false;
    }
    
    console.log('🔒 Modal closed by user');
    setShowTiebreakerModal(false);
    return true;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        
        
        <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-green-200 dark:border-gray-600">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Panel de Calificaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Evalúa a las candidatas en cada modalidad del certamen
          </p>
          {events.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {events.length} evento{events.length !== 1 ? 's' : ''} disponible{events.length !== 1 ? 's' : ''}
              {' • '}
              {candidates.length} candidata{candidates.length !== 1 ? 's' : ''} registrada{candidates.length !== 1 ? 's' : ''}
            </p>
          )}
          

          
          {/* Tiebreaker Status Indicator */}
          {activeTiebreaker && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-600 rounded-lg">
              <p className="text-red-800 dark:text-red-300 font-semibold">
                🚨 Desempate Activo: {activeTiebreaker.description}
              </p>
              <p className="text-red-600 dark:text-red-400 text-sm">
                Bonificación: +{activeTiebreaker.bonusPoints} puntos • Se requiere tu votación
              </p>
            </div>
          )}
        </div>

        <ScoringTabs
          events={events}
          candidates={candidates}
          eventStatus={eventStatus}
          scores={scores}
          saving={saving}
          onScoreChange={handleScoreChange}
          onSaveAllScores={saveAllScores}
          isAllScoresSaved={isAllScoresSaved}
        />

        <ScoringSummary
          events={events}
          candidates={candidates}
          eventStatus={eventStatus}
          scores={scores}
        />
      </div>

      {/* Tiebreaker Modal - Mandatory when active */}
      <TiebreakerModal
        isOpen={showTiebreakerModal}
        tiebreaker={activeTiebreaker}
        onClose={handleTiebreakerModalClose}
        onVoteSubmitted={handleTiebreakerVoteSubmitted}
      />
    </>
  );
};

export default JudgeVotesPage;

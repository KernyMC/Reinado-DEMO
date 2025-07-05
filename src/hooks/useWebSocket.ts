import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { webSocketService } from '@/services/api';
import { toast } from 'sonner';

interface WebSocketMessage {
  type: string;
  payload: any;
}

export const useWebSocket = () => {
  const queryClient = useQueryClient();
  const isConnectedRef = useRef(false);

  // Handle WebSocket messages
  const handleMessage = useCallback((event: CustomEvent<WebSocketMessage>) => {
    const { type, payload } = event.detail;

    switch (type) {
      case 'score_update':
        // Invalidate score-related queries
        queryClient.invalidateQueries({ queryKey: ['scores'] });
        queryClient.invalidateQueries({ queryKey: ['candidates', 'results'] });
        toast.info('Nueva puntuación recibida');
        break;

      case 'vote_update':
        // Invalidate vote-related queries
        queryClient.invalidateQueries({ queryKey: ['votes'] });
        queryClient.invalidateQueries({ queryKey: ['candidates', 'results'] });
        break;

      case 'event_status_change':
        // Invalidate event queries
        queryClient.invalidateQueries({ queryKey: ['events'] });
        toast.info(`Estado del evento actualizado: ${payload.status}`);
        break;

      case 'candidate_update':
        // Invalidate candidate queries
        queryClient.invalidateQueries({ queryKey: ['candidates'] });
        toast.info('Información de candidata actualizada');
        break;

      case 'user_update':
        // Invalidate user queries
        queryClient.invalidateQueries({ queryKey: ['users'] });
        break;

      case 'system_notification':
        toast.info(payload.message);
        break;

      default:
        console.log('Unknown WebSocket message type:', type);
    }
  }, [queryClient]);

  // Handle score updates
  const handleScoreUpdate = useCallback((event: CustomEvent) => {
    queryClient.invalidateQueries({ queryKey: ['scores'] });
    queryClient.invalidateQueries({ queryKey: ['candidates', 'results'] });
  }, [queryClient]);

  // Handle vote updates
  const handleVoteUpdate = useCallback((event: CustomEvent) => {
    queryClient.invalidateQueries({ queryKey: ['votes'] });
    queryClient.invalidateQueries({ queryKey: ['candidates', 'results'] });
  }, [queryClient]);

  // Handle event status changes
  const handleEventStatusChange = useCallback((event: CustomEvent) => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
  }, [queryClient]);

  // Handle candidate updates
  const handleCandidateUpdate = useCallback((event: CustomEvent) => {
    queryClient.invalidateQueries({ queryKey: ['candidates'] });
  }, [queryClient]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!isConnectedRef.current) {
      webSocketService.connect();
      isConnectedRef.current = true;
    }
  }, []);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (isConnectedRef.current) {
      webSocketService.disconnect();
      isConnectedRef.current = false;
    }
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((message: any) => {
    webSocketService.send(message);
  }, []);

  // Setup event listeners
  useEffect(() => {
    // Add event listeners
    window.addEventListener('websocket-message', handleMessage as EventListener);
    window.addEventListener('score-update', handleScoreUpdate as EventListener);
    window.addEventListener('vote-update', handleVoteUpdate as EventListener);
    window.addEventListener('event-status-change', handleEventStatusChange as EventListener);
    window.addEventListener('candidate-update', handleCandidateUpdate as EventListener);

    // Connect to WebSocket
    connect();

    // Cleanup
    return () => {
      window.removeEventListener('websocket-message', handleMessage as EventListener);
      window.removeEventListener('score-update', handleScoreUpdate as EventListener);
      window.removeEventListener('vote-update', handleVoteUpdate as EventListener);
      window.removeEventListener('event-status-change', handleEventStatusChange as EventListener);
      window.removeEventListener('candidate-update', handleCandidateUpdate as EventListener);
      
      disconnect();
    };
  }, [
    handleMessage,
    handleScoreUpdate,
    handleVoteUpdate,
    handleEventStatusChange,
    handleCandidateUpdate,
    connect,
    disconnect,
  ]);

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected: isConnectedRef.current,
  };
}; 
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { scoresService } from '@/services/api';
import { JudgeScore, SubmitScoreRequest } from '@/types/database';
import { useAuth } from '@/features/auth/AuthContext';
import { toast } from 'sonner';

export const useScores = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get scores by event
  const useScoresByEvent = (eventId: string) => {
    return useQuery({
      queryKey: ['scores', 'event', eventId, user?.id],
      queryFn: () => scoresService.getByEvent(eventId),
      enabled: !!eventId && !!user,
      staleTime: 30 * 1000, // 30 seconds
    });
  };

  // Get scores by candidate
  const useScoresByCandidate = (candidateId: string) => {
    return useQuery({
      queryKey: ['scores', 'candidate', candidateId, user?.id],
      queryFn: () => scoresService.getByCandidate(candidateId),
      enabled: !!candidateId && !!user,
      staleTime: 30 * 1000, // 30 seconds
    });
  };

  // Get my scores (for judges) - MOST IMPORTANT ONE
  const { data: myScores = [], isLoading: isLoadingMyScores } = useQuery({
    queryKey: ['scores', 'my-scores', user?.id, user?.email],
    queryFn: () => {
      console.log('🔄 Fetching my-scores for user:', user?.email, 'ID:', user?.id);
      return scoresService.getMyScores();
    },
    enabled: !!user && user.role === 'judge',
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Submit score mutation
  const submitScoreMutation = useMutation({
    mutationFn: (data: SubmitScoreRequest) => {
      console.log('📝 Submitting score for user:', user?.email, 'Data:', data);
      return scoresService.submit(data);
    },
    onSuccess: (newScore) => {
      console.log('✅ Score submitted successfully by:', user?.email, 'Score:', newScore);
      
      // Invalidate related queries with user context
      queryClient.invalidateQueries({ queryKey: ['scores', 'my-scores', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['scores', 'event', newScore.event_id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['scores', 'candidate', newScore.candidate_id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['candidates', 'results'] });
      
      toast.success('Puntuación enviada exitosamente');
    },
    onError: (error: any) => {
      console.error('❌ Error submitting score for user:', user?.email, 'Error:', error);
      const message = error.response?.data?.error || 'Error al enviar puntuación';
      toast.error(message);
    },
  });

  // Helper function to check if judge has scored a candidate in an event
  const hasScored = (candidateId: string, eventId: string): boolean => {
    const scored = myScores.some(
      score => score.candidate_id === candidateId && score.event_id === eventId
    );
    console.log(`🔍 User ${user?.email} hasScored candidate ${candidateId} in event ${eventId}:`, scored);
    return scored;
  };

  // Helper function to get score for a specific candidate and event
  const getScore = (candidateId: string, eventId: string): JudgeScore | undefined => {
    const score = myScores.find(
      score => score.candidate_id === candidateId && score.event_id === eventId
    );
    console.log(`🔍 User ${user?.email} getScore for candidate ${candidateId} in event ${eventId}:`, score?.score || 'none');
    return score;
  };

  // Helper function to calculate average score for a candidate in an event
  const calculateAverageScore = (scores: JudgeScore[]): number => {
    if (scores.length === 0) return 0;
    const total = scores.reduce((sum, score) => sum + score.score, 0);
    return Number((total / scores.length).toFixed(1));
  };

  return {
    myScores,
    isLoadingMyScores,
    useScoresByEvent,
    useScoresByCandidate,
    submitScore: submitScoreMutation.mutate,
    isSubmittingScore: submitScoreMutation.isPending,
    hasScored,
    getScore,
    calculateAverageScore,
  };
}; 
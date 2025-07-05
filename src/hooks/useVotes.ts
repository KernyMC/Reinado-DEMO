import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { votesService } from '@/services/api';
import { SubmitVoteRequest } from '@/types/database';
import { toast } from 'sonner';

export const useVotes = () => {
  const queryClient = useQueryClient();

  // Get voting results
  const { data: results = [], isLoading: isLoadingResults } = useQuery({
    queryKey: ['votes', 'results'],
    queryFn: votesService.getResults,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for live updates
  });

  // Check if user has voted
  const { data: voteStatus, isLoading: isCheckingVote } = useQuery({
    queryKey: ['votes', 'check'],
    queryFn: votesService.checkVoted,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Submit vote mutation
  const submitVoteMutation = useMutation({
    mutationFn: (data: SubmitVoteRequest) => votesService.submit(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['votes'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', 'results'] });
      
      toast.success('¡Voto enviado exitosamente!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al enviar voto';
      toast.error(message);
    },
  });

  // Helper function to get vote count for a specific candidate
  const getVoteCount = (candidateId: string): number => {
    const result = results.find(r => r.candidate_id === candidateId);
    return result ? result.vote_count : 0;
  };

  // Helper function to get total votes
  const getTotalVotes = (): number => {
    return results.reduce((total, result) => total + result.vote_count, 0);
  };

  // Helper function to get vote percentage for a candidate
  const getVotePercentage = (candidateId: string): number => {
    const totalVotes = getTotalVotes();
    if (totalVotes === 0) return 0;
    
    const candidateVotes = getVoteCount(candidateId);
    return Number(((candidateVotes / totalVotes) * 100).toFixed(1));
  };

  // Helper function to get sorted results by vote count
  const getSortedResults = () => {
    return [...results].sort((a, b) => b.vote_count - a.vote_count);
  };

  // Helper function to get top candidates
  const getTopCandidates = (limit: number = 3) => {
    return getSortedResults().slice(0, limit);
  };

  return {
    results,
    voteStatus,
    isLoadingResults,
    isCheckingVote,
    submitVote: submitVoteMutation.mutate,
    isSubmittingVote: submitVoteMutation.isPending,
    hasVoted: voteStatus?.hasVoted || false,
    votedCandidateId: voteStatus?.candidateId,
    getVoteCount,
    getTotalVotes,
    getVotePercentage,
    getSortedResults,
    getTopCandidates,
  };
}; 
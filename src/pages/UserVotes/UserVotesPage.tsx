import React, { useState, useEffect } from 'react';
import { StatusBanner } from '../../components/StatusBanner';
import { CandidateCarousel, Candidate } from '../../components/CandidateCarousel';
import { useI18n } from '../../app/I18nProvider';
import { toast } from '../../hooks/use-toast';
import { candidatesService } from '../../services/api';

const UserVotesPage = () => {
  const { t } = useI18n();
  const [votingStatus, setVotingStatus] = useState<'open' | 'closed' | 'coming'>('open');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votedCandidateId, setVotedCandidateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCandidates = async () => {
      const result = await candidatesService.getAll();
      setCandidates(result);
    };
    loadCandidates();
  }, []);

  const handleVote = async (candidateId: string) => {
    if (votedCandidateId) return;
    
    try {
      // TODO call API - Submit vote
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVotedCandidateId(candidateId);
      localStorage.setItem('user_vote', candidateId);
      
      toast({
        title: "¡Voto registrado!",
        description: t('vote.success'),
        className: "bg-green-50 border-green-200",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el voto. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-gray-200 rounded-lg"></div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {t('vote.title')}
        </h1>
        <p className="text-gray-600">
          Conoce a nuestras candidatas y emite tu voto
        </p>
      </div>

      <StatusBanner status={votingStatus} />

      <CandidateCarousel
        candidates={candidates}
        onVote={votingStatus === 'open' ? handleVote : undefined}
        votedCandidateId={votedCandidateId || undefined}
        votingEnabled={votingStatus === 'open'}
      />

      {votedCandidateId && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-green-800 font-medium">
                Tu voto ha sido registrado exitosamente
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserVotesPage;

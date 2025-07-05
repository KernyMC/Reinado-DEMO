
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export interface Candidate {
  id: string;
  name: string;
  major: string;
  department: string;
  image: string;
  votes?: number;
}

interface CandidateCarouselProps {
  candidates: Candidate[];
  onVote?: (candidateId: string) => void;
  votedCandidateId?: string;
  votingEnabled?: boolean;
}

export const CandidateCarousel: React.FC<CandidateCarouselProps> = ({
  candidates,
  onVote,
  votedCandidateId,
  votingEnabled = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextCandidate = () => {
    setCurrentIndex((prev) => (prev + 1) % candidates.length);
  };

  const prevCandidate = () => {
    setCurrentIndex((prev) => (prev - 1 + candidates.length) % candidates.length);
  };

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay candidatas disponibles</p>
      </div>
    );
  }

  const currentCandidate = candidates[currentIndex];
  const hasVoted = votedCandidateId === currentCandidate.id;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        {/* Navigation buttons */}
        {candidates.length > 1 && (
          <>
            <Button
              onClick={prevCandidate}
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-purple-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={nextCandidate}
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-purple-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Candidate card */}
        <Card className="overflow-hidden shadow-xl border-purple-200 animate-fade-in">
          <div className="relative">
            <img
              src={currentCandidate.image}
              alt={currentCandidate.name}
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-2xl font-bold mb-1">{currentCandidate.name}</h3>
              <p className="text-purple-200 font-medium">{currentCandidate.major}</p>
              <p className="text-purple-200">{currentCandidate.department}</p>
            </div>
          </div>
          
          <CardContent className="p-6">
            {votingEnabled && onVote && (
              <Button
                onClick={() => onVote(currentCandidate.id)}
                disabled={!!votedCandidateId}
                className={`w-full py-3 text-lg font-semibold transition-all duration-200 ${
                  hasVoted
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                } text-white rounded-lg transform hover:scale-105`}
              >
                <Heart className={`mr-2 h-5 w-5 ${hasVoted ? 'fill-current' : ''}`} />
                {hasVoted ? '✓ Votado' : 'Votar'}
              </Button>
            )}
            
            {/* Vote count (for results view) */}
            {currentCandidate.votes !== undefined && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Votos recibidos</p>
                <p className="text-2xl font-bold text-purple-600">{currentCandidate.votes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Indicators */}
      {candidates.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {candidates.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-purple-600'
                  : 'bg-purple-200 hover:bg-purple-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

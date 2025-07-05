import React from 'react';
import { Card, CardContent } from './ui/card';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Candidate, getImageUrl } from '@/services/api';

interface CandidateScoreCardProps {
  candidate: Candidate;
  score: number;
  onScoreChange: (score: number) => void;
  editable: boolean;
  saved: boolean;
}

export const CandidateScoreCard: React.FC<CandidateScoreCardProps> = ({
  candidate,
  score,
  onScoreChange,
  editable,
  saved
}) => {
  console.log('🎯 Rendering candidate score card:', candidate.name, 'with image_url:', candidate.image_url, 'score:', score, 'type:', typeof score);
  console.log(`🔍 CandidateScoreCard - ${candidate.name}: editable=${editable}, saved=${saved}`);
  
  const imageUrl = getImageUrl(candidate.image_url);
  console.log('🎯 Final image URL for scoring:', candidate.name, ':', imageUrl);
  
  // Ensure score is a valid number
  const safeScore = typeof score === 'number' && !isNaN(score) ? score : 0;
  console.log('🔢 Safe score for', candidate.name, ':', safeScore);
  
  return (
    <Card className={`shadow-lg border-green-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 ${
      editable 
        ? 'bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-700' 
        : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 opacity-60'
    }`}>
      <CardContent className="p-6">
        {!editable && (
          <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-center">
            <p className="text-xs text-red-700 dark:text-red-300 font-medium">
              🔒 Evento Desactivado - No Editable
            </p>
          </div>
        )}
        
        <div className="flex flex-col items-center space-y-4">
          {/* Candidate Image */}
          <div className="relative">
            <img
              src={imageUrl}
              alt={candidate.name}
              className={`w-24 h-24 rounded-[10px] object-cover border-4 shadow-md transition-all ${
                editable 
                  ? 'border-green-200 dark:border-green-600'
                  : 'border-gray-300 dark:border-gray-500 filter grayscale'
              }`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.log('❌ Image failed to load for scoring', candidate.name, ', src was:', target.src);
                target.src = '/placeholder-candidate.svg';
                console.log('🔄 Fallback image set for scoring', candidate.name);
              }}
              onLoad={() => {
                console.log('✅ Image loaded successfully for scoring', candidate.name);
              }}
            />
            {saved && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700 px-2 py-1">
                  ✓
                </Badge>
              </div>
            )}
          </div>

          {/* Candidate Info */}
          <div className="text-center">
            <h4 className={`font-bold text-lg ${
              editable 
                ? 'text-gray-800 dark:text-gray-200' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {candidate.name}
            </h4>
            <p className={`text-sm font-medium ${
              editable 
                ? 'text-gray-600 dark:text-gray-300' 
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              {candidate.major}
            </p>
            <p className={`text-xs ${
              editable 
                ? 'text-gray-500 dark:text-gray-400' 
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              {candidate.department}
            </p>
          </div>

          {/* Score Display */}
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${
              editable 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              {safeScore.toFixed(1)}
            </div>
            <p className={`text-xs ${
              editable 
                ? 'text-gray-500 dark:text-gray-400' 
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              / 10.0
            </p>
          </div>

          {/* Score Slider */}
          <div className="w-full space-y-2">
            <Slider
              value={[safeScore]}
              onValueChange={([value]) => onScoreChange(value)}
              max={10}
              min={0}
              step={0.1}
              disabled={!editable}
              className={`w-full ${!editable ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <div className={`flex justify-between text-xs ${
              editable 
                ? 'text-gray-400 dark:text-gray-500' 
                : 'text-gray-300 dark:text-gray-600'
            }`}>
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
            {!editable && (
              <p className="text-center text-xs text-red-600 dark:text-red-400 font-medium">
                ⚠️ Calificaciones deshabilitadas
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

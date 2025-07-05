
import React, { useState } from 'react';
import { Candidate } from './CandidateCarousel';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Save, Check } from 'lucide-react';

interface ScoreEntry {
  candidateId: string;
  score: number;
  saved: boolean;
}

interface ScoreTableProps {
  candidates: Candidate[];
  eventType: 'typical_costume' | 'evening_gown' | 'qa';
  editable?: boolean;
  onScoreChange?: (candidateId: string, score: number) => void;
  savedScores?: Record<string, number>;
}

export const ScoreTable: React.FC<ScoreTableProps> = ({
  candidates,
  eventType,
  editable = true,
  onScoreChange,
  savedScores = {}
}) => {
  const [scores, setScores] = useState<Record<string, ScoreEntry>>(
    candidates.reduce((acc, candidate) => {
      acc[candidate.id] = {
        candidateId: candidate.id,
        score: savedScores[candidate.id] || 0,
        saved: !!savedScores[candidate.id]
      };
      return acc;
    }, {} as Record<string, ScoreEntry>)
  );

  const handleScoreChange = (candidateId: string, newScore: number) => {
    if (!editable) return;
    
    setScores(prev => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        score: newScore,
        saved: false
      }
    }));
  };

  const saveScore = async (candidateId: string) => {
    const score = scores[candidateId].score;
    
    // TODO call API - Save score
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setScores(prev => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        saved: true
      }
    }));

    onScoreChange?.(candidateId, score);
  };

  const getEventTitle = () => {
    switch (eventType) {
      case 'typical_costume': return 'Traje Típico';
      case 'evening_gown': return 'Vestido de Gala';
      case 'qa': return 'Preguntas y Respuestas';
    }
  };

  return (
    <Card className="shadow-lg border-purple-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center justify-between">
          {getEventTitle()}
          {!editable && (
            <Badge variant="secondary" className="bg-gray-100">
              Solo Lectura
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {candidates.map((candidate) => {
            const scoreEntry = scores[candidate.id];
            return (
              <div key={candidate.id} className="p-4 bg-purple-50/50 rounded-lg border border-purple-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={candidate.image}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800">{candidate.name}</h4>
                      <p className="text-sm text-gray-600">{candidate.major}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">
                        {scoreEntry.score.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500">/ 10.0</p>
                    </div>
                    
                    {scoreEntry.saved ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Check className="w-3 h-3 mr-1" />
                        Guardado
                      </Badge>
                    ) : editable ? (
                      <Button
                        size="sm"
                        onClick={() => saveScore(candidate.id)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Guardar
                      </Button>
                    ) : null}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Calificación</span>
                    <span>{scoreEntry.score.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[scoreEntry.score]}
                    onValueChange={([value]) => handleScoreChange(candidate.id, value)}
                    max={10}
                    min={0}
                    step={0.1}
                    disabled={!editable}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

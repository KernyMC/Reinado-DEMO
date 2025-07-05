import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Clock, AlertTriangle, CheckCircle, Crown, Medal, Award, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '../../features/auth/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface TiebreakerCandidate {
  id: number;
  name: string;
  career: string;
  photo_url: string;
  position?: number;
}

interface TiebreakerData {
  id: string;
  candidates: TiebreakerCandidate[];
  status: string;
  created_at: string;
  activatedBy: string;
  hasVoted: boolean;
  votedCandidates: number[];
  position: number;
  description: string;
  bonusPoints?: number;
}

interface TiebreakerModalProps {
  isOpen: boolean;
  tiebreaker: TiebreakerData | null;
  onClose: () => void;
  onVoteSubmitted: () => void;
}

const TiebreakerModal: React.FC<TiebreakerModalProps> = ({
  isOpen,
  tiebreaker,
  onClose,
  onVoteSubmitted
}) => {
  const { token } = useAuth();
  const { isDark } = useTheme();
  
  const [scores, setScores] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes default

  // Calcular bonificación por posición de desempate
  const getBonusPointsForPosition = (position: number): number => {
    switch (position) {
      case 1: return 5; // Primer lugar (Reina): +5 puntos
      case 2: return 3; // Segundo lugar (Confraternidad): +3 puntos  
      case 3: return 1; // Tercer lugar (Simpatía): +1 punto
      default: return 0;
    }
  };

  // Obtener icono y color por posición
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return { icon: Crown, color: 'text-yellow-500', title: 'Reina ESPE 2025' };
      case 2: return { icon: Medal, color: 'text-gray-400', title: 'Srta. Confraternidad' };
      case 3: return { icon: Award, color: 'text-amber-600', title: 'Srta. Simpatía' };
      default: return { icon: Shuffle, color: 'text-blue-500', title: 'Posición' };
    }
  };

  // Initialize scores when tiebreaker data loads
  useEffect(() => {
    if (tiebreaker && tiebreaker.candidates) {
      const initialScores: Record<number, number> = {};
      tiebreaker.candidates.forEach(candidate => {
        initialScores[candidate.id] = 0;
      });
      setScores(initialScores);
    }
  }, [tiebreaker]);

  // Countdown timer - más urgente con sonido de alerta
  useEffect(() => {
    if (!isOpen || !tiebreaker) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          toast({
            title: "⏰ Tiempo Agotado",
            description: "Se ha agotado el tiempo para votar en el desempate.",
            variant: "destructive",
          });
          return 0;
        }
        
        // Alertas de tiempo crítico
        if (prev === 60) {
          toast({
            title: "⚠️ 1 Minuto Restante",
            description: "Quedan 60 segundos para completar la votación.",
            className: "bg-orange-50 border-orange-200",
          });
        } else if (prev === 30) {
          toast({
            title: "🚨 30 Segundos",
            description: "¡Tiempo crítico! Completa tu votación ahora.",
            variant: "destructive",
          });
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, tiebreaker]);

  const handleScoreChange = (candidateId: number, score: number) => {
    if (score < 1 || score > 10) return;
    
    setScores(prev => ({
      ...prev,
      [candidateId]: score
    }));
  };

  const isFormValid = () => {
    if (!tiebreaker) return false;
    
    return tiebreaker.candidates.every(candidate => {
      const score = scores[candidate.id];
      return score && score >= 1 && score <= 10;
    });
  };

  const submitTiebreakerVotes = async () => {
    if (!isFormValid() || !tiebreaker) return;

    setSubmitting(true);
    
    try {
      // Aplicar bonificación por posición
      const bonusPoints = getBonusPointsForPosition(tiebreaker.position);
      
      const tiebreakerVotes = tiebreaker.candidates.map(candidate => ({
        candidateId: candidate.id,
        score: scores[candidate.id] + bonusPoints, // Aplicar bonificación
        originalScore: scores[candidate.id],
        bonusApplied: bonusPoints
      }));

      console.log(`🎯 Aplicando bonificación de +${bonusPoints} puntos por posición ${tiebreaker.position}`);

      const response = await fetch('http://localhost:3000/api/judge/tiebreaker/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          tiebreakerVotes: tiebreakerVotes.map(v => ({
            candidateId: v.candidateId,
            score: v.score // Score ya incluye bonificación
          }))
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        toast({
          title: "✅ Votos de Desempate Enviados",
          description: `Se enviaron ${result.data.votesSubmitted} votos con bonificación de +${bonusPoints} puntos.`,
          className: "bg-green-50 border-green-200",
        });

        // Mostrar detalle de bonificación
        tiebreakerVotes.forEach(vote => {
          const candidate = tiebreaker.candidates.find(c => c.id === vote.candidateId);
          console.log(`📊 ${candidate?.name}: ${vote.originalScore} + ${vote.bonusApplied} = ${vote.score} puntos`);
        });

        onVoteSubmitted();
        onClose();

        if (result.data.allJudgesVoted) {
          toast({
            title: "🎉 Desempate Completado",
            description: "Todos los jueces han votado. Los resultados han sido calculados automáticamente.",
            className: "bg-blue-50 border-blue-200",
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar votos');
      }
    } catch (error) {
      console.error('Error submitting tiebreaker votes:', error);
      toast({
        title: "❌ Error",
        description: `No se pudieron enviar los votos: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!tiebreaker) return null;

  const positionInfo = getPositionIcon(tiebreaker.position);
  const PositionIcon = positionInfo.icon;
  const bonusPoints = getBonusPointsForPosition(tiebreaker.position);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent 
        className={`max-w-5xl max-h-[95vh] overflow-y-auto ${
          isDark 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}
        hideCloseButton={true}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className={`flex items-center justify-between ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-full mr-3 ${
                tiebreaker.position === 1 ? 'bg-yellow-100' :
                tiebreaker.position === 2 ? 'bg-gray-100' : 'bg-amber-100'
              }`}>
                <PositionIcon className={`w-6 h-6 ${positionInfo.color}`} />
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  🚨 DESEMPATE OBLIGATORIO ACTIVADO
                </div>
                <div className="text-sm font-normal text-gray-600 dark:text-gray-300">
                  {tiebreaker.description} • Bonificación: +{bonusPoints} puntos
                </div>
              </div>
            </div>
            <Badge className={`${
              timeRemaining > 60 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : timeRemaining > 30
                ? 'bg-orange-100 text-orange-800 border-orange-200'
                : 'bg-red-100 text-red-800 border-red-200'
            }`}>
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(timeRemaining)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning Notice with Position Info */}
          <Card className={`border-red-200 ${
            isDark ? 'bg-red-900/20 border-red-600' : 'bg-red-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className={`font-semibold ${
                    isDark ? 'text-red-300' : 'text-red-800'
                  }`}>
                    Atención: Calificación de Desempate para {positionInfo.title}
                  </p>
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-red-200' : 'text-red-700'
                  }`}>
                    Se ha detectado un empate que requiere tu evaluación urgente. 
                    Debes calificar a todas las candidatas antes de continuar.
                    <strong> Esta pantalla no se puede cerrar hasta completar la votación.</strong>
                  </p>
                  <div className={`text-xs mt-2 p-2 rounded ${
                    isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
                  }`}>
                    <strong>Bonificación automática:</strong> Se añadirán {bonusPoints} puntos extra 
                    a cada calificación por ser desempate de {positionInfo.title.toLowerCase()}.
                  </div>
                  <p className={`text-xs mt-2 ${
                    isDark ? 'text-red-300' : 'text-red-600'
                  }`}>
                    Activado por: {tiebreaker.activatedBy} • {new Date(tiebreaker.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className={isDark ? 'bg-gray-700' : 'bg-blue-50 border-blue-200'}>
            <CardHeader>
              <CardTitle className={`text-lg ${
                isDark ? 'text-blue-300' : 'text-blue-800'
              }`}>
                Instrucciones de Calificación de Desempate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className={`space-y-2 text-sm ${
                isDark ? 'text-blue-200' : 'text-blue-700'
              }`}>
                <li>• Califica a cada candidata de 1.0 a 10.0 puntos</li>
                <li>• Puedes usar decimales (ej: 8.5, 9.2, etc.)</li>
                <li>• <strong>Se aplicará automáticamente +{bonusPoints} puntos de bonificación</strong></li>
                <li>• Considera todos los aspectos del certamen para el desempate</li>
                <li>• Todas las candidatas deben tener una puntuación</li>
                <li>• Los votos se guardan automáticamente al enviar</li>
              </ul>
            </CardContent>
          </Card>

          {/* Candidates Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {tiebreaker.candidates.map((candidate) => (
              <Card key={candidate.id} className={`${
                isDark 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-white border-gray-300'
              } hover:shadow-lg transition-shadow`}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col items-center space-y-3">
                    {/* Foto de la candidata */}
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-purple-200">
                      {candidate.photo_url ? (
                        <img 
                          src={`http://localhost:3000${candidate.photo_url}`}
                          alt={candidate.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log('❌ Error cargando foto:', candidate.photo_url);
                            e.currentTarget.src = '/placeholder-avatar.png';
                          }}
                          onLoad={() => {
                            console.log('✅ Foto cargada:', candidate.photo_url);
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${
                          isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-500'
                        }`}>
                          <User className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    
                    {/* Información de la candidata */}
                    <div className="text-center">
                      <h3 className={`font-bold text-base ${
                        isDark ? 'text-white' : 'text-gray-800'
                      }`}>
                        {candidate.name}
                      </h3>
                      <p className={`text-xs ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {candidate.career}
                      </p>
                      {scores[candidate.id] > 0 && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 mt-1 text-xs">
                          <CheckCircle className="w-2 h-2 mr-1" />
                          Calificada
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <label className={`text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Puntuación (1.0 - 10.0):
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={scores[candidate.id] || ''}
                      onChange={(e) => handleScoreChange(candidate.id, parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 text-base font-bold text-center rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        scores[candidate.id] > 0 
                          ? 'border-green-300 bg-green-50 text-green-800 dark:bg-green-900/50 dark:border-green-600 dark:text-green-300'
                          : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                      }`}
                      placeholder="0.0"
                    />
                    {scores[candidate.id] > 0 && (
                      <div className={`text-xs text-center p-1 rounded ${
                        isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}>
                        Final: {(scores[candidate.id] + bonusPoints).toFixed(1)} pts
                        <br />
                        <span className="text-xs opacity-75">
                          ({scores[candidate.id]} + {bonusPoints} bonus)
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={submitTiebreakerVotes}
              disabled={!isFormValid() || submitting || timeRemaining <= 0}
              className={`px-8 py-4 text-lg font-semibold min-w-[300px] ${
                isFormValid() && timeRemaining > 0
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Enviando Votos...
                </>
              ) : (
                <>
                  <PositionIcon className="w-5 h-5 mr-2" />
                  Enviar Votos de Desempate (+{bonusPoints} pts)
                </>
              )}
            </Button>
          </div>

          {/* Status Messages */}
          {!isFormValid() && (
            <p className="text-center text-red-600 dark:text-red-400 text-sm font-medium">
              ⚠️ Debes calificar a todas las candidatas antes de enviar
            </p>
          )}
          
          {timeRemaining <= 0 && (
            <p className="text-center text-red-600 dark:text-red-400 font-semibold">
              ⏰ Tiempo agotado para la votación de desempate
            </p>
          )}

          {timeRemaining <= 30 && timeRemaining > 0 && (
            <p className="text-center text-orange-600 dark:text-orange-400 font-medium animate-pulse">
              🚨 ¡Tiempo crítico! Quedan {timeRemaining} segundos
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TiebreakerModal; 
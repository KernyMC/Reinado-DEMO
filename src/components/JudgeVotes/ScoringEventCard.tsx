import React, { useState } from 'react';
import { StatusBanner } from '../StatusBanner';
import { CandidateScoreCard } from '../CandidateScoreCard';
import { Event, Candidate } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Crown, Shirt, Star, Save, Check, Calendar, AlertTriangle } from 'lucide-react';

interface ScoreEntry {
  candidateId: string;
  score: number;
  saved: boolean;
}

interface ScoringEventCardProps {
  event: Event;
  candidates: Candidate[];
  eventStatus: 'active' | 'closed' | 'pending';
  scores: Record<string, ScoreEntry>;
  saving: boolean;
  onScoreChange: (candidateId: string, score: number) => void;
  onSaveAllScores: () => void;
  isAllScoresSaved: boolean;
}

export const ScoringEventCard: React.FC<ScoringEventCardProps> = ({
  event,
  candidates,
  eventStatus,
  scores,
  saving,
  onScoreChange,
  onSaveAllScores,
  isAllScoresSaved
}) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // ============ MEJORADO: Debug logging más claro ============
  console.log(`🎯 ScoringEventCard RENDER - Event: "${event.name}"`);
  console.log(`   📊 Status received: ${eventStatus}`);
  console.log(`   ⚡ is_active from event: ${event.is_active}`);
  console.log(`   🎨 Component will render as: ${eventStatus === 'active' ? 'ENABLED' : 'DISABLED'}`);
  console.log(`   🔒 Event object:`, event);
  // ============================================================

  const getStatusBanner = () => {
    console.log(`🎨 StatusBanner - eventStatus: ${eventStatus}, is_active: ${event.is_active}`);
    
    switch (eventStatus) {
      case 'active':
        return <StatusBanner status="open" message="🟢 Evento Activo - Calificaciones Habilitadas" />;
      case 'closed':
        return <StatusBanner status="closed" message="🔴 Evento Cerrado - Calificaciones Deshabilitadas" />;
      case 'pending':
        return <StatusBanner status="coming" message="🟡 Evento Pendiente" />;
      default: {
        // Fallback en caso de status undefined
        const isActive = event.is_active;
        console.log(`⚠️ Unknown status "${eventStatus}", using fallback with is_active: ${isActive}`);
        return isActive 
          ? <StatusBanner status="open" message="🟢 Evento Activo - Calificaciones Habilitadas" />
          : <StatusBanner status="closed" message="🔴 Evento Cerrado - Calificaciones Deshabilitadas" />;
      }
    }
  };

  const getEventTitle = () => {
    const labels: Record<string, string> = {
      typical_costume: 'Traje Típico',
      evening_gown: 'Vestido de Gala',
      qa: 'Preguntas',
    };
    return labels[event.event_type] || event.name;
  };

  const getEventIcon = () => {
    switch (event.event_type) {
      case 'typical_costume': return <Shirt className="w-6 h-6 mr-3" />;
      case 'evening_gown': return <Crown className="w-6 h-6 mr-3" />;
      case 'qa': return <Star className="w-6 h-6 mr-3" />;
      default: return <Calendar className="w-6 h-6 mr-3" />;
    }
  };

  // Calcular estadísticas de calificaciones
  const getScoresSummary = () => {
    const totalCandidates = candidates.length;
    const allScores = Object.values(scores);
    const savedScores = allScores.filter(score => score.saved).length;
    const unsavedScores = allScores.filter(score => !score.saved && score.score > 0).length;
    const unscored = totalCandidates - allScores.length;
    
    return {
      total: totalCandidates,
      saved: savedScores,
      unsaved: unsavedScores,
      unscored: unscored
    };
  };

  // ============ NUEVA: Validación completa para envío ============
  const canSubmitScores = () => {
    const summary = getScoresSummary();
    
    // Todas las candidatas deben estar calificadas (tener score > 0)
    const allCandidatesScored = summary.unscored === 0;
    
    // Debe haber al menos una calificación pendiente de guardar
    const hasUnsavedScores = summary.unsaved > 0;
    
    console.log('🔍 Validation check:', {
      totalCandidates: summary.total,
      unscored: summary.unscored,
      unsaved: summary.unsaved,
      allCandidatesScored,
      hasUnsavedScores,
      canSubmit: allCandidatesScored && hasUnsavedScores
    });
    
    return allCandidatesScored && hasUnsavedScores;
  };
  // ============================================================

  const handleConfirmSave = () => {
    setConfirmDialogOpen(false);
    onSaveAllScores();
  };

  const scoresSummary = getScoresSummary();

  return (
    <>
      {getStatusBanner()}
      
      <Card className="shadow-lg border-green-200 dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center text-white">
                {getEventIcon()}
                {getEventTitle()}
              </CardTitle>
              {event.description && (
                <p className="text-green-100 dark:text-green-200 text-sm mt-1">{event.description}</p>
              )}
            </div>
            
            {eventStatus === 'active' && (
              <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={saving || isAllScoresSaved || !canSubmitScores()}
                    className={`font-semibold ${
                      canSubmitScores() && !saving && !isAllScoresSaved
                        ? 'bg-white text-green-600 hover:bg-green-50 dark:bg-gray-100 dark:text-green-700 dark:hover:bg-gray-200'
                        : 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 dark:border-green-700 mr-2"></div>
                        Enviando...
                      </div>
                    ) : isAllScoresSaved ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Calificaciones Enviadas
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Enviar Calificaciones
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center text-orange-600 dark:text-orange-400">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Confirmar Envío de Calificaciones
                    </AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-300">
                      <div className="space-y-3">
                        <p className="font-medium">
                          ¿Estás seguro de que quieres enviar estas calificaciones para <strong>{getEventTitle()}</strong>?
                        </p>
                        
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <h4 className="font-semibold mb-2 dark:text-gray-200">Resumen de calificaciones:</h4>
                          <ul className="text-sm space-y-1 dark:text-gray-300">
                            <li>• <strong>{scoresSummary.total}</strong> candidatas en total</li>
                            <li>• <strong className="text-green-600 dark:text-green-400">{scoresSummary.saved}</strong> ya guardadas</li>
                            <li>• <strong className="text-blue-600 dark:text-blue-400">{scoresSummary.unsaved}</strong> pendientes por guardar</li>
                            {scoresSummary.unscored > 0 && (
                              <li>• <strong className="text-red-600 dark:text-red-400">{scoresSummary.unscored}</strong> sin calificar</li>
                            )}
                          </ul>
                        </div>

                        {/* ============ NUEVA: Validación visual ============ */}
                        {scoresSummary.unscored > 0 && (
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-3 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-300">
                              <strong>❌ Error:</strong> Debes calificar a TODAS las candidatas antes de enviar. 
                              Faltan {scoresSummary.unscored} candidata(s) por calificar.
                            </p>
                          </div>
                        )}
                        {/* ================================================== */}

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-3 rounded-lg">
                          <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            <strong>⚠️ Importante:</strong> Una vez enviadas, estas calificaciones quedarán registradas permanentemente. Asegúrate de que son correctas.
                          </p>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleConfirmSave}
                      disabled={!canSubmitScores()}
                      className={`${
                        canSubmitScores()
                          ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Sí, Enviar Calificaciones
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* ============ NUEVA: Indicador de estado debajo del header ============ */}
          {eventStatus === 'active' && (
            <div className="px-6 py-2 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-700 dark:text-green-300">
                  Progreso: {scoresSummary.total - scoresSummary.unscored} / {scoresSummary.total} candidatas calificadas
                </span>
                {scoresSummary.unscored > 0 && (
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    ⚠️ Faltan {scoresSummary.unscored} candidata(s)
                  </span>
                )}
                {scoresSummary.unscored === 0 && scoresSummary.unsaved > 0 && (
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    ✅ Listo para enviar
                  </span>
                )}
              </div>
            </div>
          )}
          {/* ==================================================================== */}
        </CardHeader>
        <CardContent className={`p-6 dark:bg-gray-800 ${eventStatus === 'closed' ? 'relative' : ''}`}>
          {/* ============ NUEVA: Mensaje prominente para evento desactivado ============ */}
          {eventStatus === 'closed' && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg">
              <div className="flex items-center text-red-800 dark:text-red-300">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <div>
                  <h3 className="font-bold text-lg">⛔ Evento Desactivado</h3>
                  <p className="text-sm mt-1">
                    El administrador ha desactivado este evento. No puedes calificar candidatas en este momento.
                  </p>
                  <p className="text-xs mt-2 text-red-600 dark:text-red-400 font-medium">
                    ⚠️ Todas las acciones de votación están bloqueadas hasta que se reactive el evento.
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* ====================================================================== */}
          
          {candidates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No hay candidatas disponibles para calificar</p>
            </div>
          ) : (
            <>
              {/* Grid responsivo de candidatas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                {candidates.map((candidate) => {
                  const scoreEntry = scores[candidate.id];
                  const candidateScore = scoreEntry?.score ?? 0;
                  const isSaved = scoreEntry?.saved ?? false;
                  
                  console.log('🎯 Candidate:', candidate.name, 'scoreEntry:', scoreEntry, 'finalScore:', candidateScore, 'type:', typeof candidateScore);
                  
                  return (
                    <CandidateScoreCard
                      key={candidate.id}
                      candidate={candidate}
                      score={candidateScore}
                      onScoreChange={(score) => onScoreChange(candidate.id, score)}
                      editable={eventStatus === 'active'}
                      saved={isSaved}
                    />
                  );
                })}
              </div>
              
              {/* ============ NUEVA: Overlay de bloqueo para evento desactivado ============ */}
              {eventStatus === 'closed' && (
                <div className="absolute inset-0 bg-gray-900/50 dark:bg-gray-900/70 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-red-300 dark:border-red-600">
                    <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">Evento Desactivado</h3>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Las calificaciones están bloqueadas por el administrador
                    </p>
                  </div>
                </div>
              )}
              {/* ========================================================================== */}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};

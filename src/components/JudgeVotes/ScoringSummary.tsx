import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Event, Candidate } from '@/services/api';

interface ScoreEntry {
  candidateId: string;
  score: number;
  saved: boolean;
}

interface ScoringSummaryProps {
  events: Event[];
  candidates: Candidate[];
  eventStatus: Record<string, 'active' | 'closed' | 'pending'>;
  scores: Record<string, Record<string, ScoreEntry>>;
}

export const ScoringSummary: React.FC<ScoringSummaryProps> = ({
  events,
  candidates,
  eventStatus,
  scores
}) => {
  const getEventTitle = (event: Event) => {
    const labels: Record<string, string> = {
      typical_costume: 'Traje Típico',
      evening_gown: 'Vestido de Gala',
      qa: 'Preguntas y Respuestas',
    };
    return labels[event.event_type] || event.name;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'closed': return 'Cerrado';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  if (!events.length) {
    return (
      <Card className="border-green-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200">
            Resumen de Calificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No hay eventos para mostrar resumen</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200">
          Resumen de Calificaciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${events.length <= 3 ? `grid-cols-1 md:grid-cols-${events.length}` : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {events.map((event) => {
            const eventScores = scores[event.id] || {};
            const scoresCount = Object.values(eventScores).filter(score => score.saved).length;
            const totalCandidates = candidates.length;
            const status = eventStatus[event.id];
            
            return (
              <div key={event.id} className="text-center p-4 bg-green-50 dark:bg-gray-700 rounded-lg border border-green-200 dark:border-gray-600">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {getEventTitle(event)}
                </h4>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {scoresCount}/{totalCandidates}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Calificadas</p>
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                  status === 'active' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
                  status === 'closed' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' :
                  'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
                }`}>
                  {getStatusLabel(status)}
                </div>
                {event.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate" title={event.description}>
                    {event.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

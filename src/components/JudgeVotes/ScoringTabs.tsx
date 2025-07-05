import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScoringEventCard } from './ScoringEventCard';
import { Event, Candidate } from '@/services/api';
import { Shirt, Crown, Star, Calendar } from 'lucide-react';

interface ScoreEntry {
  candidateId: string;
  score: number;
  saved: boolean;
}

interface ScoringTabsProps {
  events: Event[];
  candidates: Candidate[];
  eventStatus: Record<string, 'active' | 'closed' | 'pending'>;
  scores: Record<string, Record<string, ScoreEntry>>;
  saving: string | null;
  onScoreChange: (eventId: string, candidateId: string, score: number) => void;
  onSaveAllScores: (eventId: string) => void;
  isAllScoresSaved: (eventId: string) => boolean;
}

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'typical_costume':
      return <Shirt className="w-4 h-4" />;
    case 'evening_gown':
      return <Crown className="w-4 h-4" />;
    case 'qa':
      return <Star className="w-4 h-4" />;
    default:
      return <Calendar className="w-4 h-4" />;
  }
};

const getEventLabel = (event: Event) => {
  const labels: Record<string, string> = {
    typical_costume: 'Traje Típico',
    evening_gown: 'Vestido de Gala',
    qa: 'Preguntas y Respuestas',
  };
  return labels[event.event_type] || event.name;
};

export const ScoringTabs: React.FC<ScoringTabsProps> = ({
  events,
  candidates,
  eventStatus,
  scores,
  saving,
  onScoreChange,
  onSaveAllScores,
  isAllScoresSaved
}) => {
  // ============ NUEVO: Logging para debugging de tabs en tiempo real ============
  console.log('🎨 ScoringTabs RENDER');
  console.log('   📊 Events:', events.map(e => `${e.name}:${e.is_active}`).join(', '));
  console.log('   🎯 EventStatus:', eventStatus);
  events.forEach(event => {
    console.log(`   📋 Tab "${event.name}": status=${eventStatus[event.id]}, is_active=${event.is_active}`);
  });
  // =============================================================================

  if (!events.length) {
    return (
      <div className="text-center p-8">
        <Calendar className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No hay eventos disponibles</h3>
        <p className="text-gray-500 dark:text-gray-400">El administrador debe crear eventos para poder calificar.</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={events[0]?.id} className="w-full">
      <TabsList className={`grid w-full bg-green-100 dark:bg-gray-800 p-1 ${events.length <= 3 ? `grid-cols-${events.length}` : 'grid-cols-3'}`}>
        {events.map((event, index) => (
          <TabsTrigger 
            key={event.id}
            value={event.id}
            className="flex items-center space-x-2 data-[state=active]:bg-green-600 dark:data-[state=active]:bg-green-700 data-[state=active]:text-white dark:text-gray-300"
            disabled={eventStatus[event.id] === 'pending'}
          >
            {getEventIcon(event.event_type)}
            <span className="truncate">{getEventLabel(event)}</span>
            {eventStatus[event.id] === 'pending' && (
              <span className="text-xs bg-yellow-500 dark:bg-yellow-600 text-white px-1 rounded">Pendiente</span>
            )}
            {eventStatus[event.id] === 'closed' && (
              <span className="text-xs bg-red-500 dark:bg-red-600 text-white px-1 rounded">Cerrado</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {events.map(event => (
        <TabsContent key={event.id} value={event.id} className="space-y-6">
          <ScoringEventCard
            event={event}
            candidates={candidates}
            eventStatus={eventStatus[event.id]}
            scores={scores[event.id] || {}}
            saving={saving === event.id}
            onScoreChange={(candidateId, score) => onScoreChange(event.id, candidateId, score)}
            onSaveAllScores={() => onSaveAllScores(event.id)}
            isAllScoresSaved={isAllScoresSaved(event.id)}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

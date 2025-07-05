import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { judgesService, JudgeProgress, EventProgress } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Award, Check, Clock, AlertTriangle } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '@/features/auth/AuthContext';
import { toast } from 'sonner';

// MOCK DE DATOS DE JUECES PARA DEMO
const DEMO_JUDGE_VOTING_STATUS = {
  judges: [
    {
      judge: { id: '2', name: 'Juez Demo', email: 'juez@demo.com' },
      events: [
        {
          event: { id: 'e1', name: 'Talento', type: 'talent' },
          candidates: [
            { candidate: { id: 'c1', name: 'María Pérez' }, hasVoted: true, score: 9.5, votedAt: '2024-01-01' },
            { candidate: { id: 'c2', name: 'Ana Gómez' }, hasVoted: true, score: 8.7, votedAt: '2024-01-01' },
            { candidate: { id: 'c3', name: 'Luisa Torres' }, hasVoted: true, score: 9.0, votedAt: '2024-01-01' },
          ],
          progress: { voted: 3, total: 3, percentage: 100 },
        },
      ],
      overallProgress: { voted: 3, total: 3, percentage: 100 },
    },
  ],
  summary: {
    totalJudges: 1,
    totalEvents: 1,
    totalCandidates: 3,
    totalPossibleVotes: 3,
    completedVotes: 3,
  },
};

// Mock del servicio
const judgesServiceMock = {
  getVotingStatus: async () => DEMO_JUDGE_VOTING_STATUS,
};

export const JudgeMonitoring: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { data: votingStatus, isLoading, error } = useQuery({
    queryKey: ['judge-voting-status', lastUpdate],
    queryFn: judgesServiceMock.getVotingStatus,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // ============ NUEVO: WebSocket para actualizaciones en tiempo real ============
  useEffect(() => {
    if (!token) return;

    console.log('🔌 Setting up notary WebSocket for judge monitoring...');
    
    const socket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ Notary WebSocket connected for judge monitoring');
    });

    // Escuchar cuando los jueces voten
    socket.on('judge_vote_update', (notification) => {
      console.log('📊 Judge vote update received:', notification);
      
      const { judge, candidate, event, score, action } = notification.data;
      
      // Mostrar notificación visual
      toast.success(`🎯 ${judge.name} ${action === 'created' ? 'calificó' : 'actualizó'} a ${candidate.name}`, {
        description: `${event.name}: ${score}/10 puntos`,
        duration: 3000,
      });
      
      // Forzar actualización de datos
      setLastUpdate(new Date());
      queryClient.invalidateQueries({ queryKey: ['judge-voting-status'] });
      
      console.log(`✅ Notary - Judge ${judge.name} vote registered in real-time`);
    });

    // Escuchar notificaciones del sistema
    socket.on('system_notification', (notification) => {
      console.log('📢 System notification in notary:', notification);
    });

    // Cleanup
    return () => {
      console.log('🔌 Disconnecting notary judge monitoring WebSocket...');
      socket.disconnect();
    };
  }, [token, queryClient]);
  // ============================================================================

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'typical_costume': return '👗';
      case 'evening_gown': return '👑';
      case 'qa': return '❓';
      default: return '📋';
    }
  };

  const getEventName = (eventType: string) => {
    switch (eventType) {
      case 'typical_costume': return 'Traje Típico';
      case 'evening_gown': return 'Vestido de Gala';
      case 'qa': return 'Preguntas y Respuestas';
      default: return 'Evento';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (hasVoted: boolean) => {
    if (hasVoted) {
      return (
        <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700">
          <Check className="w-3 h-3 mr-1" />
          Votado
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700">
        <Clock className="w-3 h-3 mr-1" />
        Pendiente
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center dark:text-gray-200">
            <Users className="w-5 h-5 mr-2" />
            Monitoreo de Jueces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400"></div>
            <span className="ml-3 dark:text-gray-300">Cargando estado de votación...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !votingStatus) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center dark:text-gray-200">
            <Users className="w-5 h-5 mr-2" />
            Monitoreo de Jueces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Error al cargar el estado de votación
          </div>
        </CardContent>
      </Card>
    );
  }

  const { judges, summary } = votingStatus;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jueces</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.totalJudges}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Eventos Activos</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{summary.totalEvents}</p>
              </div>
              <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Votos Completados</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.completedVotes}</p>
              </div>
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progreso General</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.round((summary.completedVotes / summary.totalPossibleVotes) * 100)}%
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                <span className="text-orange-600 dark:text-orange-400 text-sm font-bold">%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Judge Details */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center dark:text-gray-200">
              <Users className="w-5 h-5 mr-2" />
              Estado Detallado por Juez
            </CardTitle>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Tiempo real
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {judges.map((judgeProgress: JudgeProgress) => (
              <div key={judgeProgress.judge.id} className="border dark:border-gray-700 rounded-lg p-4 dark:bg-gray-700/50">
                {/* Judge Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg dark:text-gray-200">{judgeProgress.judge.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{judgeProgress.judge.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium dark:text-gray-300">
                        {judgeProgress.overallProgress.voted} / {judgeProgress.overallProgress.total}
                      </span>
                      <Badge className={`${getProgressColor(judgeProgress.overallProgress.percentage)} text-white`}>
                        {judgeProgress.overallProgress.percentage}%
                      </Badge>
                    </div>
                    <Progress 
                      value={judgeProgress.overallProgress.percentage} 
                      className="w-24 mt-1"
                    />
                  </div>
                </div>

                {/* Events Progress */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {judgeProgress.events.map((eventProgress: EventProgress) => (
                    <div key={eventProgress.event.id} className="border dark:border-gray-600 rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{getEventIcon(eventProgress.event.type)}</span>
                          <div>
                            <h4 className="font-medium text-sm dark:text-gray-200">{getEventName(eventProgress.event.type)}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {eventProgress.progress.voted} / {eventProgress.progress.total} candidatas
                            </p>
                          </div>
                        </div>
                        <Badge className={`${getProgressColor(eventProgress.progress.percentage)} text-white text-xs`}>
                          {eventProgress.progress.percentage}%
                        </Badge>
                      </div>

                      {/* Candidates Status */}
                      <div className="space-y-1">
                        {eventProgress.candidates.map((candidateStatus) => (
                          <div key={candidateStatus.candidate.id} className="flex items-center justify-between text-xs">
                            <span className="truncate flex-1">{candidateStatus.candidate.name}</span>
                            <div className="ml-2">
                              {getStatusBadge(candidateStatus.hasVoted)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
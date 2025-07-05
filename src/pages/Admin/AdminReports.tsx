import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Badge } from '../../components/ui/badge';
import { FileText, Download, Calendar as CalendarIcon, Filter, Trophy, Medal, Award, Star } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '../../hooks/use-toast';
import { useAuth } from '../../features/auth/AuthContext';

interface ReportFilter {
  event: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  format: 'pdf' | 'csv';
}

interface Event {
  id: number;
  name: string;
  event_type: string;
  description?: string;
  status: string;
  weight: number;
  is_mandatory: boolean;
  bonus_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface Candidate {
  id: number;
  name: string;
  career: string;
  photo_url: string;
  faculty: string;
}

interface TopCandidate {
  rank: number;
  candidate: Candidate;
  finalScore: number;
  judgeCount: number;
}

interface Stats {
  totalVotes: number;
  totalScores: number;
  activeUsers: number;
  participationRate: string;
  reportsGenerated: number;
}

interface ReportData {
  generatedAt: string;
  generatedBy: string;
  filters: {
    event: string;
    dateFrom?: string;
    dateTo?: string;
  };
  events: Array<{ id: number; name: string; event_type: string }>;
  totalCandidates: number;
  totalScores: number;
  top3Rankings: TopCandidate[];
  allRankings: TopCandidate[];
  eventBreakdown: Array<{
    event: { id: number; name: string; event_type: string };
    candidates: Array<Candidate & { scores: Array<{ score: number; judge: string; date: string }>; averageForEvent: number }>;
  }>;
}

const AdminReports = () => {
  const { token } = useAuth();
  const { isDark } = useTheme();
  const [filters, setFilters] = useState<ReportFilter>({
    event: '',
    dateFrom: undefined,
    dateTo: undefined,
    format: 'pdf'
  });
  
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Fetch events and stats on component mount
  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setEvents(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los eventos.",
        variant: "destructive",
      });
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/reports/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'public_voting': 'Votación Pública',
      'typical_costume': 'Traje Típico',
      'evening_gown': 'Vestido de Gala',
      'qa': 'Preguntas y Respuestas'
    };
    return types[type] || type;
  };

  const generateReport = async () => {
    setGenerating(true);
    
    try {
      console.log('🔄 Frontend generating report for event:', filters.event);
      
      // Determinar si es reporte general o por evento específico
      const eventId = filters.event === 'all' || filters.event === '' ? 'all' : filters.event;
      const eventName = eventId === 'all' ? 'Completo' : events.find(e => e.id.toString() === eventId)?.name || 'Desconocido';
      
      const response = await fetch('http://localhost:3000/api/admin/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          event: eventId,
          format: filters.format,
          dateFrom: filters.dateFrom?.toISOString(),
          dateTo: filters.dateTo?.toISOString(),
          includeCareer: true, // Asegurar que se incluya la carrera
          eventName: eventName
        })
      });

      console.log('📄 Frontend report response status:', response.status);

      if (response.ok) {
        if (filters.format === 'pdf') {
          // Handle PDF download
          const blob = await response.blob();
          console.log('📄 Frontend PDF blob size:', blob.size);
          
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Reporte_${eventName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          
          toast({
            title: "PDF Descargado",
            description: `Reporte ${eventName} generado exitosamente (${Math.round(blob.size / 1024)} KB).`,
            className: "bg-green-50 border-green-200",
          });
        } else {
          // Handle JSON response for other formats
          const result = await response.json();
          setReportData(result.data);
          
          toast({
            title: "Reporte generado",
            description: `Reporte ${eventName} generado exitosamente.`,
            className: "bg-green-50 border-green-200",
          });
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Frontend report error:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
    } catch (error) {
      console.error('❌ Frontend error:', error);
      toast({
        title: "Error",
        description: `No se pudo generar el reporte: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const exportQuickReport = async (type: string) => {
    setGenerating(true);
    
    try {
      if (type.includes('pdf')) {
        // Use the dedicated PDF download endpoint
        const response = await fetch('http://localhost:3000/api/admin/reports/download-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({})
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Reporte_${type}_${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          
          toast({
            title: "PDF Descargado",
            description: `Reporte de ${type.replace('_pdf', '').replace('_csv', '')} descargado exitosamente.`,
            className: "bg-green-50 border-green-200",
          });
        } else {
          throw new Error('Error al descargar el reporte');
        }
      } else {
        // For CSV and other formats, use the original generate endpoint
        const response = await fetch('http://localhost:3000/api/admin/reports/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            event: 'all',
            format: 'csv'
          })
        });

        if (response.ok) {
          const result = await response.json();
          
          toast({
            title: "Exportación completada",
            description: `Reporte de ${type} exportado exitosamente.`,
            className: "bg-green-50 border-green-200",
          });
        } else {
          throw new Error('Error al exportar el reporte');
        }
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar el reporte. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 2: return <Medal className="w-8 h-8 text-gray-400" />;
      case 3: return <Award className="w-8 h-8 text-amber-600" />;
      default: return <Star className="w-6 h-6 text-purple-500" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default: return 'bg-gradient-to-r from-purple-400 to-purple-600 text-white';
    }
  };

  return (
    <div className={`space-y-6 animate-fade-in ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    } min-h-screen p-6`}>
      <div className="text-center">
        <h1 className={`text-3xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          Reportes y Exportaciones
        </h1>
        <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
          Genera reportes detallados de los eventos y votaciones
        </p>
      </div>

      {/* Report Generator */}
      <Card className={`shadow-lg ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-purple-200'
      }`}>
        <CardHeader>
          <CardTitle className={`text-lg font-bold flex items-center ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            <FileText className="w-5 h-5 mr-2 text-purple-600" />
            Generador de Reportes Personalizados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="event" className={isDark ? 'text-gray-200' : ''}>Evento</Label>
                <Select value={filters.event} onValueChange={(value) => setFilters(prev => ({ ...prev, event: value }))}>
                  <SelectTrigger className={`${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-purple-200 focus:border-purple-400'
                  }`}>
                    <SelectValue placeholder={loadingEvents ? "Cargando eventos..." : "Seleccionar evento"} />
                  </SelectTrigger>
                  <SelectContent className={isDark ? 'bg-gray-700 border-gray-600' : 'bg-white'}>
                    <SelectItem value="all">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">Todos los Eventos (Promedio General)</span>
                      </div>
                    </SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <span>{getEventTypeLabel(event.event_type)}</span>
                          {event.description && (
                            <span className="text-xs text-gray-500">- {event.description}</span>
                          )}
                          {event.is_mandatory && (
                            <Badge variant="outline" className="text-xs">
                              {event.weight}%
                            </Badge>
                          )}
                          {!event.is_mandatory && (
                            <Badge variant="outline" className="text-xs text-orange-600">
                              +{event.bonus_percentage}%
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filters.event === 'all' && (
                  <p className={`text-xs mt-1 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>
                    📊 Se calculará el promedio ponderado de todos los eventos y se presentará sobre 10 puntos
                  </p>
                )}
              </div>

              <div>
                <Label className={isDark ? 'text-gray-200' : ''}>Fecha de Inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'border-purple-200 focus:border-purple-400'
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className={`w-auto p-0 ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white'
                  }`} align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className={isDark ? 'text-gray-200' : ''}>Fecha de Fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'border-purple-200 focus:border-purple-400'
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className={`w-auto p-0 ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white'
                  }`} align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className={isDark ? 'text-gray-200' : ''}>Formato de Exportación</Label>
                <Select value={filters.format} onValueChange={(value: 'pdf' | 'csv') => setFilters(prev => ({ ...prev, format: value }))}>
                  <SelectTrigger className={`${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-purple-200 focus:border-purple-400'
                  }`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={isDark ? 'bg-gray-700 border-gray-600' : 'bg-white'}>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            onClick={generateReport}
            disabled={generating}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {filters.format === 'pdf' ? 'Generando PDF...' : 'Generando reporte...'}
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {filters.format === 'pdf' ? 'Descargar PDF' : 'Generar Reporte'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Top 3 Rankings Display */}
      {reportData && reportData.top3Rankings && reportData.top3Rankings.length > 0 && (
        <Card className={`shadow-lg ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-purple-200'
        }`}>
          <CardHeader>
            <CardTitle className={`text-lg font-bold ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              🏆 Top 3 Candidatas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reportData.top3Rankings.map((candidate: TopCandidate) => (
                <div 
                  key={candidate.candidate.id}
                  className={`relative p-6 rounded-lg border-2 text-center ${
                    candidate.rank === 1 ? 'border-yellow-400 bg-gradient-to-b from-yellow-50 to-yellow-100' :
                    candidate.rank === 2 ? 'border-gray-400 bg-gradient-to-b from-gray-50 to-gray-100' :
                    candidate.rank === 3 ? 'border-amber-400 bg-gradient-to-b from-amber-50 to-amber-100' :
                    'border-purple-400 bg-gradient-to-b from-purple-50 to-purple-100'
                  } ${isDark ? 'dark:from-gray-800 dark:to-gray-900' : ''}`}
                >
                  {/* Rank Badge */}
                  <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold ${getRankBadgeColor(candidate.rank)}`}>
                    #{candidate.rank}
                  </div>
                  
                  {/* Rank Icon */}
                  <div className="flex justify-center mb-4 mt-2">
                    {getRankIcon(candidate.rank)}
                  </div>
                  
                  {/* Candidate Photo */}
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src={candidate.candidate.photo_url ? `http://localhost:3000${candidate.candidate.photo_url}` : '/api/placeholder/150/150'} 
                      alt={candidate.candidate.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/150/150';
                      }}
                    />
                  </div>
                  
                  {/* Candidate Info */}
                  <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {candidate.candidate.name}
                  </h3>
                  <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {candidate.candidate.career}
                  </p>
                  <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {candidate.candidate.faculty}
                  </p>
                  
                  {/* Score */}
                  <div className={`p-3 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-white'
                  } shadow-md`}>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {candidate.finalScore.toFixed(2)}/10
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {candidate.judgeCount} calificaciones
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Reports */}
      <Card className={`shadow-lg ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-blue-200'
      }`}>
        <CardHeader>
          <CardTitle className={`text-lg font-bold ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Reportes Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                isDark ? 'text-blue-300' : 'text-blue-800'
              }`}>Resultados Actuales</h4>
              <p className={`text-sm mb-3 ${
                isDark ? 'text-gray-300' : 'text-blue-600'
              }`}>
                Exporta los resultados actuales de votación con estadísticas completas.
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => exportQuickReport('resultados_pdf')}
                  disabled={generating}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportQuickReport('resultados_csv')}
                  disabled={generating}
                  className={`border-blue-300 hover:bg-blue-50 ${
                    isDark ? 'text-blue-300 border-blue-500' : 'text-blue-700'
                  }`}
                >
                  CSV
                </Button>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-green-50 border-green-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                isDark ? 'text-green-300' : 'text-green-800'
              }`}>Actividad de Usuarios</h4>
              <p className={`text-sm mb-3 ${
                isDark ? 'text-gray-300' : 'text-green-600'
              }`}>
                Reporte de actividad de usuarios, conexiones y participación.
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => exportQuickReport('actividad_pdf')}
                  disabled={generating}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportQuickReport('actividad_csv')}
                  disabled={generating}
                  className={`border-green-300 hover:bg-green-50 ${
                    isDark ? 'text-green-300 border-green-500' : 'text-green-700'
                  }`}
                >
                  CSV
                </Button>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-purple-50 border-purple-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                isDark ? 'text-purple-300' : 'text-purple-800'
              }`}>Calificaciones de Jueces</h4>
              <p className={`text-sm mb-3 ${
                isDark ? 'text-gray-300' : 'text-purple-600'
              }`}>
                Detalle completo de todas las calificaciones otorgadas por los jueces.
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => exportQuickReport('calificaciones_pdf')}
                  disabled={generating}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportQuickReport('calificaciones_csv')}
                  disabled={generating}
                  className={`border-purple-300 hover:bg-purple-50 ${
                    isDark ? 'text-purple-300 border-purple-500' : 'text-purple-700'
                  }`}
                >
                  CSV
                </Button>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                isDark ? 'text-amber-300' : 'text-amber-800'
              }`}>Auditoria del Sistema</h4>
              <p className={`text-sm mb-3 ${
                isDark ? 'text-gray-300' : 'text-amber-600'
              }`}>
                Log completo de todas las acciones realizadas en el sistema.
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => exportQuickReport('auditoria_pdf')}
                  disabled={generating}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportQuickReport('auditoria_csv')}
                  disabled={generating}
                  className={`border-amber-300 hover:bg-amber-50 ${
                    isDark ? 'text-amber-300 border-amber-500' : 'text-amber-700'
                  }`}
                >
                  CSV
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Summary */}
      <Card className={`shadow-lg ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <CardHeader>
          <CardTitle className={`text-lg font-bold ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Resumen de Estadísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats?.totalScores || 0}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Calificaciones de Jueces
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats?.totalVotes || 0}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Votos Públicos
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats?.activeUsers || 0}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Usuarios Activos
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats?.participationRate || '0%'}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Tasa de Participación
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {stats?.reportsGenerated || 0}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Reportes Generados
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Candidate } from './CandidateCarousel';
import { Trophy, Medal, Award, RefreshCw } from 'lucide-react';

interface ResultData extends Candidate {
  votes: number;
  percentage: number;
  position: number;
}

interface LiveResultsTableProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const LiveResultsTable: React.FC<LiveResultsTableProps> = ({ 
  autoRefresh = true, 
  refreshInterval = 10000 
}) => {
  const [results, setResults] = useState<ResultData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    
    // TODO call API - Fetch live results
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockResults: ResultData[] = [
      {
        id: '1',
        name: 'María Fernanda González',
        major: 'Ingeniería de Sistemas',
        department: 'DECC',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b9a2?w=600&h=800&fit=crop&crop=face',
        votes: 1247,
        percentage: 28.5,
        position: 1
      },
      {
        id: '2',
        name: 'Ana Sofía Rodríguez',
        major: 'Ingeniería Civil',
        department: 'DECI',
        image: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=600&h=800&fit=crop&crop=face',
        votes: 1089,
        percentage: 24.9,
        position: 2
      },
      {
        id: '3',
        name: 'Valentina Castro',
        major: 'Administración de Empresas',
        department: 'DEAD',
        image: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=600&h=800&fit=crop&crop=face',
        votes: 956,
        percentage: 21.8,
        position: 3
      },
      {
        id: '4',
        name: 'Isabella Morales',
        major: 'Ingeniería Electrónica',
        department: 'DEEL',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face',
        votes: 734,
        percentage: 16.8,
        position: 4
      },
      {
        id: '5',
        name: 'Camila Herrera',
        major: 'Medicina Veterinaria',
        department: 'DEVT',
        image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop&crop=face',
        votes: 348,
        percentage: 8.0,
        position: 5
      }
    ];

    setResults(mockResults);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
    
    if (autoRefresh) {
      const interval = setInterval(fetchResults, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">{position}</span>;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} segundos`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutos`;
    const hours = Math.floor(minutes / 60);
    return `${hours} horas`;
  };

  return (
    <Card className="shadow-lg border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-800">
            Tabla de Resultados en Vivo
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Actualizado hace {formatTimeAgo(lastUpdate)}
            </div>
            <button
              onClick={fetchResults}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Posición</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Candidata</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Carrera</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Votos</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id} className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      {getPositionIcon(result.position)}
                      <span className="font-medium text-gray-700">#{result.position}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={result.image}
                        alt={result.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{result.name}</p>
                        <p className="text-sm text-gray-500">{result.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-600">{result.major}</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      {result.votes.toLocaleString()}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${result.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-12">
                        {result.percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

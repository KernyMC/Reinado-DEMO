
import React from 'react';
import { LiveResultsTable } from '../../components/LiveResultsTable';
import { StatusBanner } from '../../components/StatusBanner';

const NotaryVotes = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Monitoreo de Votaciones
        </h1>
        <p className="text-gray-600">
          Control en tiempo real de los resultados de votación
        </p>
      </div>

      <StatusBanner status="open" message="Sistema de Votación Activo - Monitoreo en Tiempo Real" />

      <LiveResultsTable autoRefresh={true} refreshInterval={10000} />
    </div>
  );
};

export default NotaryVotes;

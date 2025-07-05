
import React from 'react';
import { useI18n } from '../app/I18nProvider';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export type VotingStatus = 'open' | 'closed' | 'coming';

interface StatusBannerProps {
  status: VotingStatus;
  message?: string;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ status, message }) => {
  const { t } = useI18n();

  const getStatusConfig = () => {
    switch (status) {
      case 'open':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
          icon: CheckCircle,
          text: message || t('vote.status_open'),
          textColor: 'text-white'
        };
      case 'closed':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-rose-500',
          icon: XCircle,
          text: message || t('vote.status_closed'),
          textColor: 'text-white'
        };
      case 'coming':
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-slate-500',
          icon: Clock,
          text: message || t('vote.status_coming'),
          textColor: 'text-white'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`${config.bg} rounded-lg p-4 shadow-lg animate-fade-in`}>
      <div className="flex items-center justify-center space-x-3">
        <Icon className={`h-6 w-6 ${config.textColor}`} />
        <p className={`text-lg font-semibold ${config.textColor}`}>
          {config.text}
        </p>
      </div>
    </div>
  );
};

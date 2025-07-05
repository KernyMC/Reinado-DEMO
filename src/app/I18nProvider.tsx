
import React, { createContext, useContext, useState } from 'react';

type Language = 'es' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations = {
  es: {
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.votes': 'Votaciones',
    'nav.judge': 'Calificaciones',
    'nav.notary': 'Notaría',
    'nav.admin': 'Administración',
    'nav.superadmin': 'Super Admin',
    'nav.logout': 'Cerrar Sesión',
    
    // Auth
    'auth.login': 'Iniciar Sesión',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.remember': 'Recordarme',
    'auth.create_account': 'Crear Cuenta',
    'auth.register': 'Registrarse',
    'auth.name': 'Nombre',
    'auth.confirm_password': 'Confirmar Contraseña',
    
    // Voting
    'vote.title': 'Sistema de Votación ESPE',
    'vote.status_open': 'Votación Abierta',
    'vote.status_closed': 'Votación Cerrada',
    'vote.status_coming': 'Próximamente',
    'vote.button': 'Votar',
    'vote.voted': '✓ Votado',
    'vote.success': 'Voto registrado exitosamente',
    
    // Judge
    'judge.typical_costume': 'Traje Típico',
    'judge.evening_gown': 'Vestido de Gala',
    'judge.qa': 'Preguntas y Respuestas',
    'judge.score': 'Calificación',
    'judge.saved': 'Guardado ✓',
    'judge.event_closed': 'Evento Cerrado',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.add': 'Agregar',
    'common.search': 'Buscar',
    'common.export': 'Exportar',
    'common.pdf': 'PDF',
    'common.csv': 'CSV',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.votes': 'Votes',
    'nav.judge': 'Judging',
    'nav.notary': 'Notary',
    'nav.admin': 'Admin',
    'nav.superadmin': 'Super Admin',
    'nav.logout': 'Logout',
    
    // Auth
    'auth.login': 'Sign In',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.remember': 'Remember me',
    'auth.create_account': 'Create Account',
    'auth.register': 'Register',
    'auth.name': 'Name',
    'auth.confirm_password': 'Confirm Password',
    
    // Voting
    'vote.title': 'ESPE Reinas Voting System',
    'vote.status_open': 'Voting Open',
    'vote.status_closed': 'Voting Closed',
    'vote.status_coming': 'Coming Soon',
    'vote.button': 'Vote',
    'vote.voted': '✓ Voted',
    'vote.success': 'Vote registered successfully',
    
    // Judge
    'judge.typical_costume': 'Typical Costume',
    'judge.evening_gown': 'Evening Gown',
    'judge.qa': 'Q&A',
    'judge.score': 'Score',
    'judge.saved': 'Saved ✓',
    'judge.event_closed': 'Event Closed',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.export': 'Export',
    'common.pdf': 'PDF',
    'common.csv': 'CSV',
  }
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['es']] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

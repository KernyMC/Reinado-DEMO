import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Candidate, 
  Event, 
  JudgeScore, 
  PublicVote, 
  SystemSetting, 
  Report,
  CandidateResult,
  GeneralRanking,
  ApiResponse,
  PaginatedResponse,
  LoginRequest,
  CreateCandidateRequest,
  UpdateCandidateRequest,
  SubmitScoreRequest,
  SubmitVoteRequest,
  UpdateEventStatusRequest,
  CreateUserRequest,
  UpdateUserRequest,
  GenerateReportRequest
} from '@/types/database';

// Re-export types that are used in components
export type { Event, Candidate, User, JudgeScore } from '@/types/database';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error('📡 API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on the login page
      // and if it's a real authentication error
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/') {
        console.warn('🚪 Authentication failed, redirecting to login...');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await apiClient.post<ApiResponse<{ token: string; user: User }>>('/auth/login', {
      email,
      password,
    });
    
    const { token, user } = response.data.data;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    
    return { token, user };
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh');
    const { token } = response.data.data;
    localStorage.setItem('auth_token', token);
    return { token };
  },
};

// Image utility function
export const getImageUrl = (imagePath?: string | null): string => {
  console.log('🖼️ getImageUrl called with:', imagePath);
  
  if (!imagePath) {
    console.log('🖼️ No imagePath provided, using placeholder');
    return '/placeholder-candidate.svg'; // Imagen por defecto
  }
  
  // Si ya es una URL completa, retornarla tal como está
  if (imagePath.startsWith('http')) {
    console.log('🖼️ External URL detected:', imagePath);
    return imagePath;
  }
  
  // Si es una ruta local del servidor, construir la URL completa
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const fullUrl = `${baseUrl}${imagePath}`;
  console.log('🖼️ Local image URL constructed:', fullUrl);
  return fullUrl;
};

// File upload utilities
export const uploadFile = async (file: File, endpoint: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.data.filePath;
};

// DATOS DEMO HARDCODEADOS
const DEMO_CANDIDATES = [
  { id: 'c1', name: 'María Pérez', major: 'Ingeniería', department: 'Quito', biography: 'Candidata destacada.', image: 'https://i.pinimg.com/236x/1e/ea/28/1eea28748ad221dfd9bb41ef568e540e.jpg' },
  { id: 'c2', name: 'Ana Gómez', major: 'Medicina', department: 'Guayaquil', biography: 'Apasionada por la ciencia.', image: 'https://i.pinimg.com/236x/f2/e1/01/f2e1017558c62756d2fed6f4d64b8e13.jpg' },
  { id: 'c3', name: 'Luisa Torres', major: 'Derecho', department: 'Cuenca', biography: 'Líder estudiantil.', image: 'https://i.pinimg.com/236x/6f/37/42/6f37425a7b8bdc754708ab4b73959a21.jpg' },
];

const DEMO_EVENTS = [
  { id: 'e1', name: 'Talento', type: 'talent', status: 'open', weight: 0.3, is_active: true },
  { id: 'e2', name: 'Traje Típico', type: 'typical', status: 'open', weight: 0.3, is_active: true },
  { id: 'e3', name: 'Gala', type: 'gala', status: 'open', weight: 0.4, is_active: true },
];

const DEMO_VOTES = [
  { id: 'v1', candidateId: 'c1', eventId: 'e1', score: 9.5, judgeId: '2' },
  { id: 'v2', candidateId: 'c2', eventId: 'e1', score: 8.7, judgeId: '2' },
  { id: 'v3', candidateId: 'c3', eventId: 'e1', score: 9.0, judgeId: '2' },
];

// MOCK SERVICES
export const candidatesService = {
  getAll: async () => DEMO_CANDIDATES,
  getById: async (id: string) => DEMO_CANDIDATES.find(c => c.id === id),
  create: async () => { throw new Error('Solo demo'); },
  update: async () => { throw new Error('Solo demo'); },
  delete: async () => { throw new Error('Solo demo'); },
  getResults: async () => DEMO_CANDIDATES.map(c => ({ candidate: c, totalScore: 9, rank: 1 })),
};

export const eventsService = {
  getAll: async () => DEMO_EVENTS,
  getById: async (id: string) => DEMO_EVENTS.find(e => e.id === id),
  create: async () => { throw new Error('Solo demo'); },
  update: async () => { throw new Error('Solo demo'); },
  delete: async () => { throw new Error('Solo demo'); },
};

export const votesService = {
  getAll: async () => DEMO_VOTES,
  getByEvent: async (eventId: string) => DEMO_VOTES.filter(v => v.eventId === eventId),
  submit: async () => { throw new Error('Solo demo'); },
};

// Scores Service
export const scoresService = {
  submit: async (scoreData: SubmitScoreRequest): Promise<JudgeScore> => {
    const response = await apiClient.post<ApiResponse<JudgeScore>>('/scores', scoreData);
    return response.data.data;
  },

  getByEvent: async (eventId: string): Promise<JudgeScore[]> => {
    const response = await apiClient.get<ApiResponse<JudgeScore[]>>(`/scores/event/${eventId}`);
    return response.data.data;
  },

  getByCandidate: async (candidateId: string): Promise<JudgeScore[]> => {
    const response = await apiClient.get<ApiResponse<JudgeScore[]>>(`/scores/candidate/${candidateId}`);
    return response.data.data;
  },

  getMyScores: async (): Promise<JudgeScore[]> => {
    console.log('📡 API: Getting my scores...');
    try {
      const response = await apiClient.get<ApiResponse<JudgeScore[]>>('/scores/my-scores');
      console.log('📡 API: My scores response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('📡 API Error getting my scores:', error);
      throw error;
    }
  },
};

// USUARIOS DEMO (igual que en AuthContext)
const DEMO_USERS = [
  { id: '1', email: 'admin@demo.com', full_name: 'Admin Demo', role: 'admin', is_active: true },
  { id: '2', email: 'juez@demo.com', full_name: 'Juez Demo', role: 'judge', is_active: true },
  { id: '3', email: 'notario@demo.com', full_name: 'Notario Demo', role: 'notary', is_active: true },
  { id: '4', email: 'superadmin@demo.com', full_name: 'SuperAdmin Demo', role: 'superadmin', is_active: true },
  { id: '5', email: 'usuario@demo.com', full_name: 'Usuario Demo', role: 'user', is_active: true },
];

// REPORTES DEMO
const DEMO_REPORTS = [
  { id: 'r1', name: 'Reporte General', created_at: '2024-01-01', url: '#' },
  { id: 'r2', name: 'Reporte de Votos', created_at: '2024-01-02', url: '#' },
];

export const usersService = {
  getAll: async () => DEMO_USERS,
  getById: async (id: string) => DEMO_USERS.find(u => u.id === id),
  create: async () => { throw new Error('Solo demo'); },
  update: async () => { throw new Error('Solo demo'); },
  delete: async () => { throw new Error('Solo demo'); },
};

export const reportsService = {
  getAll: async () => DEMO_REPORTS,
  generate: async () => { throw new Error('Solo demo'); },
  download: async () => { throw new Error('Solo demo'); },
};

// Settings Service
export const settingsService = {
  get: async (): Promise<SystemSetting[]> => {
    const response = await apiClient.get<ApiResponse<SystemSetting[]>>('/settings');
    return response.data.data;
  },

  update: async (settings: Record<string, string>): Promise<SystemSetting[]> => {
    const response = await apiClient.put<ApiResponse<SystemSetting[]>>('/settings', settings);
    return response.data.data;
  },

  getSetting: async (key: string): Promise<SystemSetting> => {
    const response = await apiClient.get<ApiResponse<SystemSetting>>(`/settings/${key}`);
    return response.data.data;
  },
};

// WebSocket Service for real-time updates
export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;

  connect(): void {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleMessage(data: any): void {
    // Emit custom events for different message types
    const event = new CustomEvent('websocket-message', { detail: data });
    window.dispatchEvent(event);

    // Handle specific message types
    switch (data.type) {
      case 'score_update':
        window.dispatchEvent(new CustomEvent('score-update', { detail: data.payload }));
        break;
      case 'vote_update':
        window.dispatchEvent(new CustomEvent('vote-update', { detail: data.payload }));
        break;
      case 'event_status_change':
        window.dispatchEvent(new CustomEvent('event-status-change', { detail: data.payload }));
        break;
      case 'candidate_update':
        window.dispatchEvent(new CustomEvent('candidate-update', { detail: data.payload }));
        break;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectInterval);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();

// Utility function to get current user from localStorage
export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem('auth_user');
  return userData ? JSON.parse(userData) : null;
};

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};

// Export types for forms
export interface CreateCandidateData {
  name: string;
  major: string;
  department: string;
  biography: string;
  image?: File;
}

export interface UpdateCandidateData {
  name?: string;
  major?: string;
  department?: string;
  biography?: string;
  image?: File;
}

// Judges Service for monitoring
export const judgesService = {
  getAll: async (): Promise<Judge[]> => {
    const response = await apiClient.get<ApiResponse<Judge[]>>('/judges');
    return response.data.data;
  },

  getVotingStatus: async (): Promise<JudgeVotingStatus> => {
    const response = await apiClient.get<ApiResponse<JudgeVotingStatus>>('/judges/voting-status');
    return response.data.data;
  },
};

// Export types for judges monitoring
export interface Judge {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface JudgeProgress {
  judge: {
    id: string;
    name: string;
    email: string;
  };
  events: EventProgress[];
  overallProgress: {
    voted: number;
    total: number;
    percentage: number;
  };
}

export interface EventProgress {
  event: {
    id: string;
    name: string;
    type: string;
  };
  candidates: CandidateVoteStatus[];
  progress: {
    voted: number;
    total: number;
    percentage: number;
  };
}

export interface CandidateVoteStatus {
  candidate: {
    id: string;
    name: string;
  };
  hasVoted: boolean;
  score: number | null;
  votedAt: string | null;
}

export interface JudgeVotingStatus {
  judges: JudgeProgress[];
  summary: {
    totalJudges: number;
    totalEvents: number;
    totalCandidates: number;
    totalPossibleVotes: number;
    completedVotes: number;
  };
}

// Export types for user management
export interface CreateUserData {
  email: string;
  full_name: string;
  role: 'judge' | 'admin' | 'superadmin' | 'notary' | 'user';
  password?: string;
}

export interface UpdateUserData {
  email?: string;
  full_name?: string;
  role?: 'judge' | 'admin' | 'superadmin' | 'notary' | 'user';
  is_active?: boolean;
  password?: string;
}

// Admin Service
export const adminService = {
  resetVotes: async (): Promise<{ deletedScores: number; deletedVotes: number; resetBy: string; resetAt: string }> => {
    console.log('🗑️ API: Resetting all votes...');
    try {
      const response = await apiClient.delete<ApiResponse<{ deletedScores: number; deletedVotes: number; resetBy: string; resetAt: string }>>('/admin/reset-votes');
      console.log('✅ API: Votes reset successful:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ API Error resetting votes:', error);
      throw error;
    }
  },
};

// Database types based on PostgreSQL schema

export interface User {
  id: string;
  email: string;
  password_hash?: string; // Only for backend
  full_name: string;
  role: 'judge' | 'admin' | 'superadmin' | 'notary' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  name: string;
  major: string;
  department: string;
  image_url?: string;
  biography?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  name: string;
  event_type?: string; // typical_costume, evening_gown, qa, etc.
  description?: string;
  status?: string; // pending, active, closed, etc.
  weight: number; // 0-100 percentage
  is_mandatory: boolean; // true for mandatory, false for optional
  bonus_percentage: number; // 0-100 bonus percentage for optional events
  is_active: boolean; // true if event is active for voting
  created_at: string;
  updated_at: string;
}

export interface JudgeScore {
  id: string;
  judge_id: string;
  candidate_id: string;
  event_id: string;
  score: number; // 0-10 with 1 decimal
  created_at: string;
  updated_at: string;
}

export interface PublicVote {
  id: string;
  voter_ip?: string;
  voter_session?: string;
  candidate_id: string;
  created_at: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  report_type: string;
  file_url?: string;
  generated_by?: string;
  created_at: string;
}

// View types for complex queries
export interface CandidateResult {
  id: string;
  name: string;
  major: string;
  department: string;
  image_url?: string;
  event_type?: string;
  average_score?: number;
  judge_count: number;
  public_votes: number;
}

export interface GeneralRanking {
  id: string;
  name: string;
  major: string;
  department: string;
  image_url?: string;
  overall_average?: number;
  judge_count: number;
  public_votes: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateCandidateRequest {
  name: string;
  major: string;
  department: string;
  image_url?: string;
  biography?: string;
}

export interface UpdateCandidateRequest extends Partial<CreateCandidateRequest> {
  is_active?: boolean;
}

export interface SubmitScoreRequest {
  candidate_id: string;
  event_id: string;
  score: number;
}

export interface SubmitVoteRequest {
  candidate_id: string;
  voter_session?: string;
}

export interface UpdateEventStatusRequest {
  status: 'pending' | 'active' | 'closed';
  start_time?: string;
  end_time?: string;
}

export interface CreateUserRequest {
  email: string;
  full_name: string;
  role: User['role'];
  password?: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  is_active?: boolean;
}

export interface GenerateReportRequest {
  report_type: string;
  filters?: {
    start_date?: string;
    end_date?: string;
    event_type?: string;
    candidate_ids?: string[];
  };
} 
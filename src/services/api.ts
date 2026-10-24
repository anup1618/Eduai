import { UnifiedStudent } from '../types/student';
import { InterventionItem, InterventionStatus } from '../types/intervention';
import { ScoreWeights } from '../types/scoring';
import { AcademicRiskThresholds, PlacementRiskThresholds } from '../types/risk';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'edupulse_auth_token_v1';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {}
}

export interface AuthUserProfile {
  id: string;
  name: string;
  role: 'admin' | 'faculty' | 'student' | 'tpo';
  student_id?: string;
  email?: string;
  department?: string;
}

export interface DatabaseHealth {
  isConnected: boolean;
  state: 'connected' | 'connecting' | 'disconnected' | 'error';
  mode?: 'embedded-persistent' | 'external';
  host?: string;
  name?: string;
  uriPreview?: string;
  error?: string;
  studentCount?: number;
  interventionCount?: number;
}

export interface HealthResponse {
  success: boolean;
  server: string;
  timestamp: string;
  database: DatabaseHealth;
}

// Generic fetch wrapper with timeout & automatic Bearer Authorization injection
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errMessage = `API request failed with status ${res.status}`;
      try {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          if (json?.message) errMessage = json.message;
        } catch {
          if (res.status === 404) {
            errMessage = 'API endpoint not found (404). Backend server is offline or unreachable.';
          } else if (res.status === 405) {
            errMessage = 'API method not allowed (405). Backend server is offline or unreachable.';
          }
        }
      } catch (e) {}
      throw new Error(errMessage);
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export const api = {
  // Authentication & Session
  async login(credentials: {
    role: 'admin' | 'faculty' | 'student' | 'tpo';
    username?: string;
    email?: string;
    password?: string;
    student_id?: string;
  }): Promise<{ success: boolean; token: string; user: AuthUserProfile; student?: UnifiedStudent }> {
    const res = await request<{ success: boolean; token: string; user: AuthUserProfile; student?: UnifiedStudent }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  async getMe(): Promise<{ success: boolean; user: AuthUserProfile }> {
    return request<{ success: boolean; user: AuthUserProfile }>('/auth/me');
  },

  logout(): void {
    setAuthToken(null);
  },

  // Health & connection inspection
  async checkHealth(): Promise<HealthResponse> {
    return request<HealthResponse>('/health');
  },

  // Students API (Access-scoped by backend role)
  async getStudents(params?: { department?: string; search?: string }): Promise<UnifiedStudent[]> {
    const query = new URLSearchParams();
    if (params?.department && params.department !== 'All') query.set('department', params.department);
    if (params?.search) query.set('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await request<{ success: boolean; data: UnifiedStudent[]; scope?: string }>(`/students${qs}`);
    return res.data;
  },

  async getStudent(id: string): Promise<UnifiedStudent> {
    const res = await request<{ success: boolean; data: UnifiedStudent }>(`/students/${id}`);
    return res.data;
  },

  async saveStudent(student: UnifiedStudent): Promise<UnifiedStudent> {
    const res = await request<{ success: boolean; data: UnifiedStudent }>('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    });
    return res.data;
  },

  async bulkUpsertStudents(students: UnifiedStudent[]): Promise<any> {
    return request('/students/bulk', {
      method: 'POST',
      body: JSON.stringify({ students }),
    });
  },

  // Secure Backend Spreadsheet Upload (Admin Only)
  async uploadSpreadsheetFile(payload: {
    fileName: string;
    fileData: string;
    format: 'xlsx' | 'csv';
    conflictMode?: 'merge' | 'overwrite' | 'preserve';
  }): Promise<any> {
    return request('/students/upload', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteStudent(id: string): Promise<any> {
    return request(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  // Interventions API
  async getInterventions(params?: { student_id?: string; status?: string }): Promise<InterventionItem[]> {
    const query = new URLSearchParams();
    if (params?.student_id) query.set('student_id', params.student_id);
    if (params?.status && params.status !== 'All') query.set('status', params.status);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await request<{ success: boolean; data: InterventionItem[] }>(`/interventions${qs}`);
    return res.data;
  },

  async createIntervention(item: {
    student_id: string;
    student_name: string;
    department: string;
    category: any;
    title: string;
    description: string;
    faculty_assigned: string;
    target_date: string;
  }): Promise<InterventionItem> {
    const res = await request<{ success: boolean; data: InterventionItem }>('/interventions', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return res.data;
  },

  async updateIntervention(
    id: string,
    payload: { status?: InterventionStatus; followUpNote?: string; outcome_notes?: string }
  ): Promise<InterventionItem> {
    const res = await request<{ success: boolean; data: InterventionItem }>(`/interventions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // Settings API
  async getSettings(): Promise<{
    weights: ScoreWeights;
    academicThresholds: AcademicRiskThresholds;
    placementThresholds: PlacementRiskThresholds;
  } | null> {
    const res = await request<{ success: boolean; data: any }>('/settings');
    return res.data;
  },

  async saveSettings(settings: {
    weights?: ScoreWeights;
    academicThresholds?: AcademicRiskThresholds;
    placementThresholds?: PlacementRiskThresholds;
  }): Promise<any> {
    return request('/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },

  // Database Seed API
  async seedDatabase(): Promise<any> {
    return request('/health/seed', {
      method: 'POST',
    });
  },
};

export default api;

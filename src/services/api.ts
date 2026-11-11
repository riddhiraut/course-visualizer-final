/**
 * API client service for talking to the Express backend database.
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface PlannerData {
  programs: string[];
  completed: string[];
  electives: string[];
  updatedAt?: string;
}

const TOKEN_KEY = 'uga_planner_auth_token';
const USER_KEY = 'uga_planner_auth_user';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  setSession(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async register(email: string, password: string, name?: string): Promise<{ user: AuthUser; planner: PlannerData }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to register account');
    }

    this.setSession(data.token, data.user);
    return { user: data.user, planner: data.planner };
  },

  async login(email: string, password: string): Promise<{ user: AuthUser; planner: PlannerData }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to sign in');
    }

    this.setSession(data.token, data.user);
    return { user: data.user, planner: data.planner };
  },

  async getCurrentUser(): Promise<{ user: AuthUser; planner: PlannerData } | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        this.clearSession();
        return null;
      }

      const data = await res.json();
      this.setSession(token, data.user);
      return { user: data.user, planner: data.planner };
    } catch {
      return null;
    }
  },

  async savePlanner(plannerData: PlannerData): Promise<void> {
    const token = this.getToken();
    if (!token) {
      // If not logged in, persist to local storage
      localStorage.setItem('uga_planner_offline_data', JSON.stringify(plannerData));
      return;
    }

    const res = await fetch('/api/planner/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(plannerData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save to database');
    }
  },

  async loadPlanner(): Promise<PlannerData | null> {
    const token = this.getToken();
    if (!token) {
      const offline = localStorage.getItem('uga_planner_offline_data');
      return offline ? JSON.parse(offline) : null;
    }

    try {
      const res = await fetch('/api/planner/load', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data.planner;
    } catch {
      return null;
    }
  },
};

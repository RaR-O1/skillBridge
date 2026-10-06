const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('sb_token');
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || 'An error occurred';
      const error = new Error(errorMsg);
      (error as any).code = data.error?.code;
      (error as any).details = data.error?.details;
      throw error;
    }

    return data.data;
  }

  // Auth endpoints
  auth = {
    login: (body: { email: string; role?: string; name?: string }) =>
      this.request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    onboard: (body: any) =>
      this.request('/auth/onboard', { method: 'POST', body: JSON.stringify(body) }),
    getMe: () => this.request('/auth/me'),
    sendCollegeVerification: (collegeEmail: string) =>
      this.request('/auth/verify-college/send', {
        method: 'POST',
        body: JSON.stringify({ collegeEmail }),
      }),
    confirmCollegeVerification: (collegeEmail: string, code: string) =>
      this.request('/auth/verify-college/confirm', {
        method: 'POST',
        body: JSON.stringify({ collegeEmail, code }),
      }),
  };

  // Teams endpoints
  teams = {
    list: (params?: { skill?: string; search?: string; status?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.request(`/teams${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => this.request(`/teams/${id}`),
    create: (body: any) => this.request('/teams', { method: 'POST', body: JSON.stringify(body) }),
    apply: (id: string, note?: string) =>
      this.request(`/teams/${id}/apply`, { method: 'POST', body: JSON.stringify({ note }) }),
    getApplications: (id: string) => this.request(`/teams/${id}/applications`),
    updateApplication: (teamId: string, appId: string, status: 'accepted' | 'rejected') =>
      this.request(`/teams/${teamId}/applications/${appId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  };

  // Projects endpoints
  projects = {
    list: (params?: Record<string, any>) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/projects${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => this.request(`/projects/${id}`),
    create: (body: any) =>
      this.request('/projects', { method: 'POST', body: JSON.stringify(body) }),
    apply: (id: string, body: { proposedBudgetINR: number; coverNote: string }) =>
      this.request(`/projects/${id}/apply`, { method: 'POST', body: JSON.stringify(body) }),
    getApplications: (id: string) => this.request(`/projects/${id}/applications`),
    submitDeliverable: (id: string, body: { workUrl: string; notes?: string }) =>
      this.request(`/projects/${id}/submit`, { method: 'POST', body: JSON.stringify(body) }),
    approveDeliverable: (id: string) =>
      this.request(`/projects/${id}/approve`, { method: 'POST' }),
    cancel: (id: string, reason?: string) =>
      this.request(`/projects/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
  };

  // Agreements endpoints
  agreements = {
    getByProject: (projectId: string) => this.request(`/agreements/project/${projectId}`),
    selectStudent: (projectId: string, body: { studentId: string; agreedAmountINR?: number; paymentMethodNote?: string }) =>
      this.request(`/agreements/select/${projectId}`, { method: 'POST', body: JSON.stringify(body) }),
    confirm: (agreementId: string) =>
      this.request(`/agreements/${agreementId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ confirmed: true }),
      }),
    confirmPaymentReceived: (projectId: string) =>
      this.request(`/agreements/confirm-payment/${projectId}`, { method: 'POST' }),
  };

  // Portfolio & Reviews
  portfolio = {
    getMyPortfolio: () => this.request('/portfolio/me'),
    addItem: (body: any) => this.request('/portfolio/items', { method: 'POST', body: JSON.stringify(body) }),
    updateItem: (id: string, body: any) =>
      this.request(`/portfolio/items/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteItem: (id: string) => this.request(`/portfolio/items/${id}`, { method: 'DELETE' }),
    createReview: (body: { targetUserId: string; projectId?: string; rating: number; comment: string }) =>
      this.request('/portfolio/reviews', { method: 'POST', body: JSON.stringify(body) }),
  };

  // Users & Profiles
  users = {
    getProfile: (idOrUid: string) => this.request(`/users/profile/${idOrUid}`),
    updateProfile: (body: any) => this.request('/users/profile', { method: 'PATCH', body: JSON.stringify(body) }),
    searchTalent: (params?: any) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/users/talent${query ? `?${query}` : ''}`);
    },
  };

  // Chat
  chat = {
    getMessages: (roomId: string, limit = 50) =>
      this.request(`/chat/rooms/${roomId}/messages?limit=${limit}`),
    sendMessage: (roomId: string, body: { content: string; fileUrl?: string; fileName?: string }) =>
      this.request(`/chat/rooms/${roomId}/messages`, { method: 'POST', body: JSON.stringify(body) }),
  };

  // Notifications
  notifications = {
    getAll: (unreadOnly = false) =>
      this.request(`/notifications${unreadOnly ? '?unread=true' : ''}`),
    markAsRead: (id: string) => this.request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: () => this.request('/notifications/read-all', { method: 'POST' }),
  };

  // Reports
  reports = {
    create: (body: any) => this.request('/reports', { method: 'POST', body: JSON.stringify(body) }),
    list: (params?: any) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/reports${query ? `?${query}` : ''}`);
    },
    updateStatus: (id: string, body: any) =>
      this.request(`/reports/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
  };

  // Admin
  admin = {
    getQueue: () => this.request('/admin/queue'),
    verifyUser: (userId: string, body: { type: 'college' | 'business'; approved: boolean; reason?: string }) =>
      this.request(`/admin/verify/${userId}`, { method: 'POST', body: JSON.stringify(body) }),
    moderateUser: (userId: string, body: { action: 'warn' | 'suspend' | 'ban' | 'reactivate'; reason: string }) =>
      this.request(`/admin/users/${userId}/moderate`, { method: 'POST', body: JSON.stringify(body) }),
    getAuditLogs: (limit = 100) => this.request(`/admin/audit-logs?limit=${limit}`),
    getMetrics: () => this.request('/admin/metrics'),
  };
}

export const api = new ApiClient();

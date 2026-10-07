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

  private buildQuery(params?: Record<string, any>): string {
    if (!params) return '';
    const cleanParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '' && value !== 'undefined') {
        cleanParams[key] = String(value);
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    return query ? `?${query}` : '';
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
      return this.request(`/teams${this.buildQuery(params)}`);
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
      return this.request(`/projects${this.buildQuery(params)}`);
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
      return this.request(`/users/talent${this.buildQuery(params)}`);
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
      return this.request(`/reports${this.buildQuery(params)}`);
    },
    updateStatus: (id: string, body: any) =>
      this.request(`/reports/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
  };

  // Admin
  admin = {
    getQueue: () => this.request('/admin/queue'),
    verifyUser: (userId: string, body: { type: 'college' | 'business'; approved: boolean; reason?: string }) =>
      this.request(`/admin/verify/${userId}`, { method: 'POST', body: JSON.stringify(body) }),
    verifyCompany: (companyId: string, approved: boolean) =>
      this.request(`/admin/verify-company/${companyId}`, { method: 'POST', body: JSON.stringify({ approved }) }),
    moderateUser: (userId: string, body: { action: 'warn' | 'suspend' | 'ban' | 'reactivate'; reason: string }) =>
      this.request(`/admin/users/${userId}/moderate`, { method: 'POST', body: JSON.stringify(body) }),
    getAuditLogs: (limit = 100) => this.request(`/admin/audit-logs?limit=${limit}`),
    getMetrics: () => this.request('/admin/metrics'),
  };

  // Jobs, Companies & Recruiter Pipeline (Stage 2A)
  jobs = {
    list: (params?: Record<string, any>) => this.request(`/jobs${this.buildQuery(params)}`),
    getById: (id: string) => this.request(`/jobs/${id}`),
    create: (body: any) => this.request('/jobs', { method: 'POST', body: JSON.stringify(body) }),
    apply: (id: string, note?: string) =>
      this.request(`/jobs/${id}/apply`, { method: 'POST', body: JSON.stringify({ note }) }),
    getMyApplications: () => this.request('/jobs/applications/my'),
    getApplications: (jobId: string) => this.request(`/jobs/${jobId}/applications`),
    updateStage: (appId: string, stage: string) =>
      this.request(`/jobs/applications/${appId}/stage`, { method: 'PATCH', body: JSON.stringify({ stage }) }),
    addNote: (appId: string, text: string) =>
      this.request(`/jobs/applications/${appId}/notes`, { method: 'POST', body: JSON.stringify({ text }) }),
    bulkUpdateStage: (applicationIds: string[], stage: string) =>
      this.request('/jobs/applications/bulk-stage', {
        method: 'POST',
        body: JSON.stringify({ applicationIds, stage }),
      }),
    companies: {
      list: () => this.request('/jobs/companies'),
      getById: (id: string) => this.request(`/jobs/companies/${id}`),
      create: (body: any) => this.request('/jobs/companies', { method: 'POST', body: JSON.stringify(body) }),
    },
  };

  // Startups & Co-Founder Matching (Stage 2B)
  startups = {
    list: (params?: Record<string, any>) => this.request(`/startups${this.buildQuery(params)}`),
    getById: (id: string) => this.request(`/startups/${id}`),
    create: (body: any) => this.request('/startups', { method: 'POST', body: JSON.stringify(body) }),
    addRole: (startupId: string, body: any) =>
      this.request(`/startups/${startupId}/roles`, { method: 'POST', body: JSON.stringify(body) }),
    updateRoleStatus: (startupId: string, roleId: string, status: string) =>
      this.request(`/startups/${startupId}/roles/${roleId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    applyToRole: (startupId: string, roleId: string, coverLetter?: string) =>
      this.request(`/startups/${startupId}/roles/${roleId}/apply`, {
        method: 'POST',
        body: JSON.stringify({ coverLetter }),
      }),
    getApplications: (startupId: string) => this.request(`/startups/${startupId}/applications`),
    updateApplicationStatus: (appId: string, status: string) =>
      this.request(`/startups/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    listCoFounders: (params?: Record<string, any>) =>
      this.request(`/startups/cofounders${this.buildQuery(params)}`),
    getMyCoFounderProfile: () => this.request('/startups/cofounders/me'),
    upsertCoFounderProfile: (body: any) =>
      this.request('/startups/cofounders/profile', { method: 'POST', body: JSON.stringify(body) }),
  };

  // Mentorship & Learning Resources & Alumni Referrals (Stage 2B)
  mentorship = {
    listMentors: (params?: Record<string, any>) =>
      this.request(`/mentorship/mentors${this.buildQuery(params)}`),
    getMentorById: (id: string) => this.request(`/mentorship/mentors/${id}`),
    upsertProfile: (body: any) =>
      this.request('/mentorship/mentors/profile', { method: 'POST', body: JSON.stringify(body) }),
    listSessions: () => this.request('/mentorship/sessions'),
    requestSession: (mentorId: string, body: { topic: string; notes?: string; proposedTimes: string[] }) =>
      this.request(`/mentorship/sessions/request/${mentorId}`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    proposeTimes: (sessionId: string, proposedTimes: string[]) =>
      this.request(`/mentorship/sessions/${sessionId}/propose-times`, {
        method: 'PATCH',
        body: JSON.stringify({ proposedTimes }),
      }),
    confirmSession: (sessionId: string, body: { confirmedTime: string; meetingLink?: string }) =>
      this.request(`/mentorship/sessions/${sessionId}/confirm`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    submitFeedback: (sessionId: string, body: { rating: number; review: string }) =>
      this.request(`/mentorship/sessions/${sessionId}/feedback`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    listResources: (params?: { category?: string; tag?: string }) =>
      this.request(`/mentorship/resources${this.buildQuery(params)}`),
    createResource: (body: any) =>
      this.request('/mentorship/resources', { method: 'POST', body: JSON.stringify(body) }),
    listReferrals: () => this.request('/mentorship/referrals'),
    requestReferral: (body: { mentorId: string; companyName: string; role: string; resumeUrl: string; note?: string }) =>
      this.request('/mentorship/referrals', { method: 'POST', body: JSON.stringify(body) }),
    updateReferral: (referralId: string, body: { status: string; feedback?: string }) =>
      this.request(`/mentorship/referrals/${referralId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
  };

  // Recommendations & Vector Matching (Stage 2C)
  recommendations = {
    get: (params?: Record<string, any>) =>
      this.request(`/recommendations${this.buildQuery(params)}`),
    recordFeedback: (body: { entityId: string; entityType: string; action: 'thumbs_up' | 'thumbs_down' | 'dismiss' }) =>
      this.request('/recommendations/feedback', { method: 'POST', body: JSON.stringify(body) }),
  };

  // AI Helpers (Stage 2C)
  ai = {
    getProfileFeedback: () => this.request('/ai/profile-feedback'),
    generateProjectScope: (body: { prompt: string; category?: string; targetTimelineWeeks?: number }) =>
      this.request('/ai/scope-helper', { method: 'POST', body: JSON.stringify(body) }),
    getChatSummary: (roomId: string) => this.request(`/ai/chat-summary/${roomId}`),
  };
}

export const api = new ApiClient();

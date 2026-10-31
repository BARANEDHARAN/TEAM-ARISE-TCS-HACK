import axios from 'axios';

export const API_BASE_URL = 'http://127.0.0.1:8000/api';
export const BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE_URL,
});

// ==============================================================
// THREE-PORTAL API CLIENT
// ==============================================================
export const portalApi = {
  // Authentication & Role Switching
  register: async (data: { name: string; email: string; mobile?: string; password: string; role?: string }) =>
    (await api.post('/api/auth/register', data)).data,

  login: async (data: { email: string; password: string }) =>
    (await api.post('/api/auth/login', data)).data,

  quickLogin: async (role: 'claimant' | 'ai_investigator' | 'human_investigator') =>
    (await api.post(`/api/auth/quick-login?role=${role}`)).data,

  // 1. Claimant / Customer Portal
  submitClaim: async (data: { personal: any; vehicle: any; accident: any; user_id?: number }) =>
    (await api.post('/api/customer/claims', data)).data,

  uploadCustomerEvidence: async (claimId: string, formData: FormData) =>
    (await api.post(`/api/customer/claims/${claimId}/upload-evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data,

  getCustomerClaims: async (userId?: number) =>
    (await api.get('/api/customer/claims', { params: { user_id: userId } })).data,

  getCustomerClaimDossier: async (claimId: string) =>
    (await api.get(`/api/customer/claims/${claimId}`)).data,

  sendCustomerClarification: async (claimId: string, messageText: string) =>
    (await api.post(`/api/customer/claims/${claimId}/clarification`, { message_text: messageText })).data,

  submitCustomerFeedback: async (claimId: string, feedbackText: string, rating: number) =>
    (await api.post(`/api/customer/claims/${claimId}/feedback`, { feedback_text: feedbackText, rating })).data,

  getCustomerNotifications: async (userId?: number) =>
    (await api.get('/api/customer/notifications', { params: { user_id: userId } })).data,

  markNotificationRead: async (notifId: number) =>
    (await api.put(`/api/customer/notifications/${notifId}/read`)).data,

  // 2. AI Investigator Portal
  getAiDashboardKpis: async () =>
    (await api.get('/api/ai/dashboard')).data,

  getAiClaims: async () =>
    (await api.get('/api/ai/claims')).data,

  getAiClaimDossier: async (claimId: string) =>
    (await api.get(`/api/ai/claims/${claimId}`)).data,

  runAiProcessing: async (claimId: string) =>
    (await api.post(`/api/ai/claims/${claimId}/process`)).data,

  // 3. Human Investigator Portal
  getHumanDashboardKpis: async () =>
    (await api.get('/api/human/dashboard')).data,

  getHumanClaims: async (filterStatus?: string) =>
    (await api.get('/api/human/claims', { params: { filter_status: filterStatus } })).data,

  reviewAiFinding: async (findingId: string, action: 'accepted' | 'rejected' | 'flagged', remarks?: string) =>
    (await api.post(`/api/human/findings/${findingId}/review`, { action, remarks })).data,

  submitHumanDecision: async (claimId: string, decisionData: {
    decision: 'APPROVE' | 'REJECT' | 'REQUEST_EVIDENCE';
    remarks?: string;
    rejection_reason?: string;
    requested_items?: string[];
    approved_amount?: number;
  }) =>
    (await api.post(`/api/human/claims/${claimId}/decision`, decisionData)).data,

  sendHumanMessage: async (claimId: string, messageText: string) =>
    (await api.post(`/api/human/claims/${claimId}/message`, { message_text: messageText })).data,

  getClaimMessages: async (claimId: string) =>
    (await api.get(`/api/human/claims/${claimId}/messages`)).data,

  // PDF Report URL Helper
  getReportUrl: (claimId: string, reportType: 'ai' | 'final' = 'ai') =>
    `${BASE_URL}/api/reports/download/${claimId}/${reportType}`,
};

// Focused Investigation API Client (Backward-compatibility)
export const focusedApi = {
  createInvestigation: async (data: { claimant: any; accident: any }) =>
    (await api.post('/api/focused/investigations', data)).data,

  listInvestigations: async () =>
    (await api.get('/api/focused/investigations')).data,

  getInvestigation: async (accidentId: string) =>
    (await api.get(`/api/focused/investigations/${accidentId}`)).data,

  uploadEvidence: async (accidentId: string, formData: FormData) =>
    (await api.post(`/api/focused/investigations/${accidentId}/upload-evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data,

  processImage: async (accidentId: string) =>
    (await api.post(`/api/focused/investigations/${accidentId}/process-image`)).data,

  processOCR: async (accidentId: string) =>
    (await api.post(`/api/focused/investigations/${accidentId}/process-ocr`)).data,

  runAnalysis: async (accidentId: string, editableOcr?: any) =>
    (await api.post(`/api/focused/investigations/${accidentId}/run-analysis`, editableOcr || {})).data,
};

// Stubs for Unused Legacy Pages
export const authApi: any = {
  login: async () => ({ access_token: 'mock-token', user: { id: '1', role: 'admin' } }),
  me: async () => ({ id: '1', role: 'admin' }),
};

export const claimsApi: any = {
  list: async () => ({ data: [] }),
  get: async () => ({ data: {} }),
  getClaims: async () => [],
  getClaim: async () => ({}),
  create: async () => ({ data: {} }),
  createClaim: async () => ({}),
  update: async () => ({ data: {} }),
  start: async () => ({}),
};

export const investigationApi: any = {
  get: async () => ({ data: {} }),
  getStatus: async () => ({ status: 'COMPLETED' }),
  run: async () => ({ data: {} }),
  start: async () => ({}),
  getGraph: async () => ({ nodes: [], edges: [] }),
  getReport: async () => ({}),
  pdfUrl: () => '',
};

export const evidenceApi: any = {
  upload: async () => ({ data: {} }),
  list: async () => ({ data: [] }),
  getEvidence: async () => [],
  deleteEvidence: async () => ({}),
  downloadUrl: () => '',
};

export const modulesApi: any = {
  getDamage: async () => ({ damage_records: [] }),
  getContradictions: async () => ({}),
  getPolicy: async () => ({}),
  getRepair: async () => ({}),
  getForensics: async () => ({}),
  getReconstruction: async () => ({}),
  getPatterns: async () => ({}),
  getGaps: async () => ({}),
  getGapLetter: async () => ({}),
  requestGap: async () => ({}),
  getSettlement: async () => ({}),
  recordReview: async () => ({}),
  submitFeedback: async () => ({}),
};

export const analyticsApi: any = {
  getOverview: async () => ({ data: {} }),
  getStats: async () => ({ data: {} }),
  getAuditLogs: async () => [],
  getDashboardKpis: async () => ({}),
};

export const usersApi: any = {
  list: async () => ({ data: [] }),
  getUsers: async () => [],
  createUser: async () => ({}),
  toggleUserActive: async () => ({}),
};

export default api;

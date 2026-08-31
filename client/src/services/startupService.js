import api from './api';

export const startupService = {
  // Fetch startups with search, filters, and sorting
  getStartups: async (params = {}) => {
    const res = await api.get('/startups', { params });
    return res.data;
  },

  // Get single startup by ID
  getStartupById: async (id) => {
    const res = await api.get(`/startups/${id}`);
    return res.data;
  },

  // Create new startup profile
  createStartup: async (startupData) => {
    const res = await api.post('/startups', startupData);
    return res.data;
  },

  // Bulk create startups from Excel/CSV
  bulkCreateStartups: async (startupsArray) => {
    const res = await api.post('/startups/bulk', { startups: startupsArray });
    return res.data;
  },


  // Update existing startup profile
  updateStartup: async (id, startupData) => {
    const res = await api.put(`/startups/${id}`, startupData);
    return res.data;
  },

  // Delete startup profile
  deleteStartup: async (id) => {
    const res = await api.delete(`/startups/${id}`);
    return res.data;
  },

  // Update founder evaluation
  updateEvaluation: async (id, evaluationData) => {
    const res = await api.put(`/startups/${id}/evaluation`, evaluationData);
    return res.data;
  },

  // Update investment analysis
  updateAnalysis: async (id, analysisData) => {
    const res = await api.put(`/startups/${id}/analysis`, analysisData);
    return res.data;
  },

  // Record investment decision
  updateDecision: async (id, decisionData) => {
    const res = await api.put(`/startups/${id}/decision`, decisionData);
    return res.data;
  },

  // Get aggregated dashboard metrics
  getDashboardMetrics: async () => {
    const res = await api.get('/dashboard');
    return res.data;
  },
};

export default startupService;

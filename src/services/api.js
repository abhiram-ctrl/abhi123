import apiClient from './apiClient';

// Volunteer API endpoints
export const volunteerAPI = {
  submitApplication: async (applicationData) => {
    const response = await apiClient.post('/volunteers/apply', applicationData);
    return response.data;
  },

  getProfile: async (userId) => {
    const response = await apiClient.get(`/volunteers/profile/${userId}`);
    return response.data;
  },

  getAssignedIncidents: async (userId) => {
    const response = await apiClient.get(`/volunteers/user/${userId}/incidents`);
    const incidents = Array.isArray(response.data?.data)
      ? response.data.data
      : response.data?.incidents || [];
    return { success: true, data: incidents };
  },

  getNewIncidents: async () => {
    const response = await apiClient.get('/volunteers/incidents/new');
    const incidents = Array.isArray(response.data?.data)
      ? response.data.data
      : response.data?.incidents || [];
    return { success: true, data: incidents };
  },

  acceptIncident: async (incidentId, volunteerId) => {
    const response = await apiClient.post(
      `/volunteers/incidents/${incidentId}/accept`,
      { volunteerId }
    );
    return response.data;
  },

  updateIncidentStatus: async (incidentId, status) => {
    const response = await apiClient.put(
      `/volunteers/incidents/${incidentId}/status`,
      { status }
    );
    return response.data;
  },

  // ✅ ADDED — REQUIRED FOR INCIDENT DETAIL PAGE
  getIncidentById: async (incidentId) => {
    const response = await apiClient.get(
      `/volunteers/incidents/${incidentId}`
    );
    return response;
  }
};

// Admin API endpoints
export const adminAPI = {
  getIncidents: async () => {
    try {
      const response = await apiClient.get('/incidents');
      if (Array.isArray(response.data)) {
        return { success: true, data: response.data };
      }
      if (Array.isArray(response.data?.data)) {
        return { success: true, data: response.data.data };
      }
      return { success: true, data: [] };
    } catch (error) {
      console.error('Get incidents error:', error);
      return { success: false, data: [], message: error.message };
    }
  },

  getIncidentById: async (incidentId) => {
    const response = await apiClient.get(
      `/volunteers/incidents/${incidentId}`
    );
    return response.data;
  },

  updateIncidentStatus: async (incidentId, status) => {
    const response = await apiClient.put(`/incidents/${incidentId}`, {
      status: String(status).toLowerCase()
    });
    return response.data;
  },

  getVolunteers: async () => {
    const response = await apiClient.get('/volunteers');
    return response.data;
  },

  getAvailableVolunteers: async () => {
    const response = await apiClient.get('/volunteers', {
      params: { status: 'verified' }
    });
    const volunteers = Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    return { success: true, data: volunteers };
  },

  getOfficers: async () => {
    try {
      const response = await apiClient.get('/officers');
      // normalize response
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      if (Array.isArray(response.data?.data)) {
        return { data: response.data.data };
      }
      if (Array.isArray(response.data?.officers)) {
        return { data: response.data.officers };
      }
      return { data: [] };
    } catch (error) {
      console.error('Get officers error:', error);
      return { data: [] };
    }
  },

  getDonations: async () => {
    try {
      const response = await apiClient.get('/donations');
      // normalize response
      if (Array.isArray(response.data)) {
        return { success: true, data: response.data };
      }
      if (Array.isArray(response.data?.data)) {
        return { success: true, data: response.data.data };
      }
      return { success: true, data: [] };
    } catch (error) {
      console.error('Get donations error:', error);
      return { success: false, data: [] };
    }
  },

  getDonationStats: async () => {
    try {
      const response = await apiClient.get('/donations/stats');
      if (response.data?.data) {
        return { success: true, data: response.data.data };
      }
      return { success: true, data: response.data || {} };
    } catch (error) {
      console.error('Get donation stats error:', error);
      return { success: false, data: {} };
    }
  },

  getIncidentDetail: async (incidentId) => {
    try {
      const response = await apiClient.get(`/incidents/${incidentId}`);
      if (response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, message: 'Incident not found' };
    } catch (error) {
      console.error('Get incident detail error:', error);
      return { success: false, message: error.message };
    }
  },

  getAvailableOfficers: async () => {
    try {
      const response = await apiClient.get('/officers/available/list');
      if (Array.isArray(response.data)) {
        return { success: true, data: response.data };
      }
      if (Array.isArray(response.data?.data)) {
        return { success: true, data: response.data.data };
      }
      return { success: true, data: [] };
    } catch (error) {
      console.error('Get available officers error:', error);
      return { success: false, data: [], message: error.message };
    }
  },

  bulkAssignOfficers: async (incidentId, officerIds, riskZone) => {
    try {
      const response = await apiClient.post('/officers/bulk/assign-to-incident', {
        incidentId,
        officerIds,
        riskZone
      });
      if (response.data?.success) {
        return { success: true, data: response.data };
      }
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Bulk assign officers error:', error);
      return { success: false, message: error.message };
    }
  },

  assignVolunteer: async (incidentId, volunteerId) => {
    try {
      const response = await apiClient.put(`/incidents/${incidentId}`, {
        assignedVolunteerId: volunteerId,
        status: 'assigned'
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Assign volunteer error:', error);
      return { success: false, message: error.message };
    }
  }
};

export default apiClient;

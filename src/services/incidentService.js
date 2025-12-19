// src/services/incidentService.js
import apiClient from './apiClient';

export const incidentService = {
  reportSOS: (incidentData) => apiClient.post('/incidents', incidentData),
  reportRisk: (incidentData) => apiClient.post('/incidents', incidentData),
  getIncidentHistory: async (userId) => {
    const response = await apiClient.get('/incidents', { params: { reporterId: userId } });
    const incidents = Array.isArray(response.data?.data) ? response.data.data : response.data?.incidents || [];
    return { success: true, data: incidents, incidents };
  },
  getUserIncidents: async (userId) => {
    const response = await apiClient.get('/incidents', { params: { reporterId: userId } });
    const incidents = Array.isArray(response.data?.data) ? response.data.data : response.data?.incidents || [];
    return { success: true, data: incidents, incidents };
  },
  getAllIncidents: async () => {
    const response = await apiClient.get('/incidents');
    const incidents = Array.isArray(response.data?.data) ? response.data.data : response.data?.incidents || [];
    return { success: true, data: incidents, incidents };
  },
  getAvailableVolunteers: async () => {
    const response = await apiClient.get('/volunteers', { params: { status: 'verified' } });
    const volunteers = Array.isArray(response.data?.data) ? response.data.data : [];
    return { success: true, data: volunteers };
  },
  getAvailableHelpers: async (_userId) => {
    // Currently maps to verified volunteers; can be replaced with dedicated helpers endpoint
    const response = await apiClient.get('/volunteers', { params: { status: 'verified' } });
    const helpers = Array.isArray(response.data?.data) ? response.data.data : [];
    return { success: true, data: helpers };
  },
  getIncidentById: async (id) => {
    const response = await apiClient.get(`/incidents/${id}`);
    const incident = response.data?.data || response.data;
    return { success: true, data: incident };
  },
};

// src/services/contactService.js
export const contactService = {
  getContacts: (userId) => apiClient.get(`/contacts/${userId}`),
  addContact: (contactData) => apiClient.post('/contacts', contactData),
  updateContact: (contactId, contactData) => apiClient.put(`/contacts/${contactId}`, contactData),
  deleteContact: (contactId) => apiClient.delete(`/contacts/${contactId}`),
};
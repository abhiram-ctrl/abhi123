// src/services/adminService.js
import apiClient from './apiClient';

/*
  This file is ONLY for admin dashboard.
  It does NOT affect any existing pages.
*/

export const adminService = {
  // INCIDENTS
  getAllIncidents: async () => {
    const res = await apiClient.get('/incidents');
    return res.data.data || [];
  },

  getIncidentById: async (id) => {
    const res = await apiClient.get(`/incidents/${id}`);
    return res.data.data;
  },

  updateIncident: async (id, payload) => {
    const res = await apiClient.put(`/incidents/${id}`, payload);
    return res.data;
  },

  // DONATIONS
  getAllDonations: async () => {
    const res = await apiClient.get('/donations');
    return res.data.data || [];
  },

  getDonationStats: async () => {
    const res = await apiClient.get('/donations/stats');
    return res.data.data;
  },

  // OFFICERS
  getAvailableOfficers: async () => {
    const res = await apiClient.get('/officers/available/list');
    return res.data.officers || [];
  },

  bulkAssignOfficers: async (incidentId, officerIds, riskZone) => {
    const res = await apiClient.post('/officers/bulk/assign-to-incident', {
      incidentId,
      officerIds,
      riskZone
    });
    return res.data;
  },

  // VOLUNTEERS
  getPendingVolunteers: async () => {
    const res = await apiClient.get('/volunteers/pending');
    return res.data || [];
  },

  verifyVolunteer: async (volunteerId, status) => {
    const res = await apiClient.put(`/volunteers/${volunteerId}/verify`, { status });
    return res.data;
  }
};

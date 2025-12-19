import api from './api';

export const backendAPI = {
  // SOS emergency endpoint
  sendSOS: async (sosData) => {
    try {
      const response = await api.post('/sos/emergency', sosData);
      return response.data;
    } catch (error) {
      console.error('SOS send error:', error);
      throw error;
    }
  },

  // Report risk endpoint
  reportRisk: async (riskData) => {
    try {
      const response = await api.post('/risks/report', riskData);
      return response.data;
    } catch (error) {
      console.error('Risk report error:', error);
      throw error;
    }
  },

  // Get all cases for dashboard
  getAllCases: async () => {
    try {
      const response = await api.get('/cases');
      return response.data;
    } catch (error) {
      console.error('Get cases error:', error);
      throw error;
    }
  },

  // Get risk zones
  getRiskZones: async () => {
    try {
      const response = await api.get('/risk-zones');
      return response.data;
    } catch (error) {
      console.error('Get risk zones error:', error);
      throw error;
    }
  }
};

export default backendAPI;
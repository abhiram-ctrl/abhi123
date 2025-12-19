// src/services/userService.js
import apiClient from './apiClient';

export const userService = {
  // Get current user data - this should match your backend endpoint
  getCurrentUser: () => apiClient.get('/users/me'),
  
  // Get dashboard-specific data
  getDashboardData: () => apiClient.get('/citizen/dashboard'),
  
  // Alternative: Get all data in one call
  getCitizenProfile: () => apiClient.get('/citizen/profile'),
  
  // Logout user
  logout: () => apiClient.post('/auth/logout'),
};

// If your backend doesn't have these exact endpoints, you can adjust:
// Example 1: If backend returns all data from /users/me
export const userServiceAlt = {
  getCurrentUser: () => apiClient.get('/users/me'),
  
  // If backend doesn't have specific endpoints, you might need to call multiple
  getUserData: async () => {
    const [userResponse, statsResponse] = await Promise.all([
      apiClient.get('/users/me'),
      apiClient.get('/citizen/stats')
    ]);
    
    return {
      data: {
        ...userResponse.data,
        ...statsResponse.data
      }
    };
  }
};
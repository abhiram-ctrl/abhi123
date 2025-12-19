// src/services/authService.js
import apiClient from './apiClient';

export const authService = {
  // Login with email/phone/password
  login: (credentials) => 
    apiClient.post('/auth/login', credentials),
  
  // Login with OTP
  loginWithOTP: (otpData) => 
    apiClient.post('/auth/login/otp', otpData),
  
  // Request OTP
  requestOTP: (contactInfo) => 
    apiClient.post('/auth/otp/request', contactInfo),
  
  // Verify OTP
  verifyOTP: (verificationData) => 
    apiClient.post('/auth/otp/verify', verificationData),
  
  // Logout
  logout: () => 
    apiClient.post('/auth/logout'),
  
  // Refresh token
  refreshToken: () => 
    apiClient.post('/auth/refresh'),
  
  // Forgot Password - Request OTP
  forgotPasswordRequestOTP: (payload) => 
    apiClient.post('/forgot-password/request-otp', payload),
  
  // Forgot Password - Verify OTP
  forgotPasswordVerifyOTP: (payload) => 
    apiClient.post('/forgot-password/verify-otp', payload),
  
  // Forgot Password - Reset Password
  forgotPasswordReset: (payload) => 
    apiClient.post('/forgot-password/reset-password', payload),
};
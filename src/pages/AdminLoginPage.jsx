import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowLeft, UserCog, Server } from 'lucide-react';
import apiClient from '../services/apiClient';
import './AdminLoginPage.css';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Validate inputs
      if (!formData.email || !formData.password) {
        throw new Error('Please enter both email and password');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Call real backend API for login
      const response = await apiClient.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      // Check if role is admin
      if (response.data.role !== 'admin') {
        throw new Error('Invalid admin credentials. Only admins can access this panel.');
      }

      // Store admin authentication data
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify({
        id: response.data.id,
        email: formData.email,
        role: response.data.role,
        accessLevel: 'administrator'
      }));

      console.log('Admin login successful:', {
        email: formData.email,
        timestamp: new Date().toISOString()
      });

      // Navigate to admin dashboard
      navigate('/admin/dashboard');
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred during login');
      console.error('Admin login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          {/* Security Header */}
          <div className="admin-security-header">
            <Shield className="admin-security-icon" size={16} />
            <span>SECURE ADMINISTRATIVE ACCESS // AUTHORIZED PERSONNEL ONLY</span>
          </div>

          {/* Header */}
          <div className="admin-login-header">
            <button 
              className="admin-back-button"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              <ArrowLeft size={20} />
              Public Portal
            </button>
            
            <div className="admin-header-content">
              <div className="admin-badge">
                <UserCog size={18} />
                <span>ADMINISTRATOR PORTAL</span>
              </div>
              <h2>System Control Access</h2>
              <p>Disaster Guardian Administration v3.2.1</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            {/* Email Field */}
            <div className="admin-input-group">
              <Mail size={20} className="admin-input-icon" />
              <input
                type="email"
                placeholder="Administrator Email Address"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                disabled={isLoading}
                className="admin-login-input"
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="admin-input-group">
              <Lock size={20} className="admin-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Administrator Password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                disabled={isLoading}
                className="admin-login-input"
                autoComplete="current-password"
              />
              <button 
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <div className="admin-error-message">
                <span className="error-text">⚠️ {error}</span>
              </div>
            )}

            {/* Login Button */}
            <button 
              type="submit" 
              className={`admin-login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="admin-spinner"></span>
                  AUTHENTICATING...
                </>
              ) : (
                'ACCESS ADMIN DASHBOARD'
              )}
            </button>
          </form>

          {/* Security Info */}
          <div className="admin-security-info">
            <h4>Security Notice</h4>
            <p>
              <span className="admin-security-highlight">All access attempts are logged</span> and monitored.
              Unauthorized access to this system is strictly prohibited.
            </p>
            <p>
              For assistance, contact <span className="admin-security-highlight">System Administrator</span> 
              or <span className="admin-security-highlight">Security Team (Ext. 911)</span>
            </p>
          </div>

          {/* System Status */}
          <div className="admin-system-status">
            <div className="admin-status-dot"></div>
            <Server size={16} color="rgba(255, 255, 255, 0.6)" />
            <span>SYSTEM STATUS: OPERATIONAL • ENCRYPTION: ACTIVE • SURVEILLANCE: ENABLED</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
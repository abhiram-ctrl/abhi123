import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { authService } from '../services/authService';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedRole = queryParams.get('role') || 'citizen'; // Get role from URL
  
  const [formData, setFormData] = useState({
    role: selectedRole, // Set role from query param
    email: '',
    phone: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [useOTP, setUseOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Show unauthorized message when redirected from protected routes
  useEffect(() => {
    const qp = new URLSearchParams(location.search);
    if (qp.get('error') === 'unauthorized') {
      setError('You are not authorized to access that section. Please login with the correct role.');
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        throw new Error('Please fill all required fields');
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Call real backend API
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      // Enforce role match with selected login form
      const loggedInRole = response.data.role;
      if (selectedRole && loggedInRole !== selectedRole) {
        // Wrong role credentials used for this login form
        setError(`Please sign in as ${selectedRole}. You are registered as ${loggedInRole}.`);
        return; // do not persist token nor redirect
      }

      // Store authentication data from backend
      if (response.data && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify({
          id: response.data.id,
          email: formData.email,
          role: loggedInRole,
          phone: formData.phone
        }));
        localStorage.setItem('userId', response.data.id);
        if (formData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('savedEmail', formData.email);
        }
      }

      // Redirect based on role
      if (loggedInRole === 'citizen') {
        navigate('/citizen/dashboard');
      } else if (loggedInRole === 'volunteer') {
        // Request location permission for volunteers
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            () => {
              // Location granted, proceed to dashboard
              navigate('/volunteer/dashboard');
            },
            (error) => {
              console.warn('Location error:', error);
              // Show warning but still allow navigation - user can enable later
              navigate('/volunteer/dashboard?locationWarning=true');
            },
            { enableHighAccuracy: true }
          );
        } else {
          navigate('/volunteer/dashboard');
        }
      } else if (loggedInRole === 'admin') {
        navigate('/admin/dashboard');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const rememberMe = localStorage.getItem('rememberMe');
    
    if (savedEmail && rememberMe === 'true') {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }));
    }
  }, []);

  // Render role indicator based on selected role from landing page
  const renderRoleIndicator = () => {
    return (
      <div className="role-indicator">
        <div className={`role-badge ${selectedRole}`}>
          {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
        </div>
        <p className="role-message">
          {selectedRole === 'citizen' 
            ? 'Login as a Citizen to report emergencies and request help'
            : 'Login as a Volunteer to respond to emergencies and help your community'}
        </p>
      </div>
    );
  };

  return (
    <div className="login-container">
      <div className="login-background" />
      
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Access your {selectedRole} account</p>
          </div>

          {/* Show role indicator instead of tabs when coming from landing page */}
          {renderRoleIndicator()}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <Phone size={20} className="input-icon" />
              <input
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                disabled={isLoading}
              />
            </div>

            {!useOTP ? (
              <div className="input-group">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!useOTP}
                  disabled={isLoading}
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            ) : (
              <div className="input-group">
                <Lock size={20} className="input-icon" />
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  pattern="\d{6}"
                  title="Please enter 6-digit OTP"
                  disabled={isLoading}
                  className="otp-input"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                  }}
                />
              </div>
            )}

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                  disabled={isLoading}
                />
                <span>Remember me</span>
              </label>
              
              <button 
                type="button"
                className="otp-toggle"
                onClick={() => {
                  setUseOTP(!useOTP);
                  if (!useOTP) {
                    // When switching to OTP mode, show a message
                    mockAuthService.requestOTP();
                    alert(`Mock: OTP sent to ${formData.phone}`);
                  }
                }}
                disabled={isLoading}
              >
                {useOTP ? 'Use Password' : 'Use OTP'}
              </button>
            </div>

            {error && (
              <div className="error-message">
                <span style={{color: '#ff4757'}}>⚠️ {error}</span>
              </div>
            )}

            <button 
              type="submit" 
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Logging In...' : `Log In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
            </button>

            <div className="login-footer">
              <p>
                New to Disaster Guardian?{' '}
                <button 
                  type="button"
                  className="link-button"
                  onClick={() => navigate(`/signup?role=${selectedRole}`)}
                  disabled={isLoading}
                >
                  Create {selectedRole === 'citizen' ? 'Citizen' : 'Volunteer'} Account
                </button>
              </p>
              <button 
                type="button" 
                className="link-button" 
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>
          </form>
          
          {/* Back button to choose different role */}
          <div className="back-to-roles">
            <button 
              type="button"
              className="link-button small"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              ← Back to choose different role
            </button>
          </div>
          
          {/* ADD SEPARATE ADMIN ACCESS SECTION BELOW THE FORM */}
          
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
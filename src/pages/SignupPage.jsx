import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Shield, Languages, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import apiClient from '../services/apiClient';
import './SignupPage.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedRole = queryParams.get('role') || 'citizen'; // Get role from URL
  
  const [step, setStep] = useState(1); // Now only 2 steps: 1. Personal Details, 2. Account Setup
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    role: selectedRole, // Set role from URL parameter
    fullName: '',
    email: '',
    phone: '',
    address: '',
    language: 'en',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  // Update formData when role changes in URL
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      role: selectedRole
    }));
  }, [selectedRole]);

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    if (stepNumber === 1) { // Personal Details
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Phone number must be 10 digits';
      }
    }
    
    if (stepNumber === 2) { // Account Setup
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = 'You must agree to the terms';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 2) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Validate all required fields
      if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
        throw new Error('Please fill all required fields');
      }

      console.log('Sending signup data:', {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      });

      // Call real backend API to signup
      const response = await apiClient.post('/auth/signup', {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        language: formData.language,
        password: formData.password,
        role: formData.role
      });

      console.log('Signup successful:', response.data);

      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify({
        id: response.data.id,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        language: formData.language,
        role: formData.role
      }));
      
      // Show success message
      setErrors({ success: 'Signup successful! Redirecting to login...' });
      
      // Redirect to role-specific login after short success notice
      setTimeout(() => {
        if (formData.role === 'volunteer') {
          navigate(`/login?role=volunteer`);
        } else if (formData.role === 'citizen') {
          navigate(`/login?role=citizen`);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Signup failed:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Signup failed. Please try again.';
      setErrors({ submit: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Role badge component
  const RoleBadge = () => (
    <div className="role-badge-container">
      <div className={`role-badge ${selectedRole}`}>
        {selectedRole === 'citizen' ? (
          <>
            <User size={16} />
            <span>Signing up as Citizen</span>
          </>
        ) : (
          <>
            <Shield size={16} />
            <span>Signing up as Volunteer</span>
          </>
        )}
      </div>
      <p className="role-description">
        {selectedRole === 'citizen' 
          ? 'Request emergency assistance, report incidents, receive alerts'
          : 'Provide help, respond to emergencies, assist in rescue operations'
        }
      </p>
     
    </div>
  );

  return (
    <div className="signup-container">
      <div className="signup-background" />
      
      <div className="signup-wrapper">
        <div className="signup-card">
          <div className="signup-header">
            <button 
              className="back-button"
              onClick={() => navigate('/login')}
              disabled={isLoading}
            >
              <ArrowLeft size={20} />
              Back to Login
            </button>
            
            <h2>Join Disaster Guardian</h2>
            <p>Step {step} of 2: {['Personal Details', 'Account Setup'][step - 1]}</p>
          </div>

          {/* Progress Indicator - Now only 2 steps */}
          <div className="step-indicator">
            {[1, 2].map((num) => (
              <div key={num} className={`step ${step >= num ? 'active' : ''}`}>
                <div className="step-number">{num}</div>
                <span>{['Details', 'Account'][num - 1]}</span>
              </div>
            ))}
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((step - 1) / 1) * 100}%` }}
              />
            </div>
          </div>

          {/* Error/Success Messages */}
          {errors.submit && (
            <div className="alert alert-error">
              ❌ {errors.submit}
            </div>
          )}
          {errors.success && (
            <div className="alert alert-success">
              ✅ {errors.success}
            </div>
          )}

          {/* Role Badge - Shows selected role from landing page */}
          <RoleBadge />

          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="signup-form">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="step-content">
                <h3>Personal Information</h3>
                <p className="step-description">
                  {selectedRole === 'volunteer' 
                    ? 'This information will be used for your volunteer application' 
                    : 'Tell us about yourself'}
                </p>
                
                <div className="input-grid">
                  <div className="input-group">
                    <User size={20} className="input-icon" />
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className={errors.fullName ? 'error' : ''}
                      disabled={isLoading}
                    />
                    {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                  </div>
                  
                  <div className="input-group">
                    <Mail size={20} className="input-icon" />
                    <input
                      type="email"
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={errors.email ? 'error' : ''}
                      disabled={isLoading}
                    />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>
                  
                  <div className="input-group">
                    <Phone size={20} className="input-icon" />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className={errors.phone ? 'error' : ''}
                      disabled={isLoading}
                    />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </div>
                  
                  <div className="input-group">
                    <MapPin size={20} className="input-icon" />
                    <input
                      type="text"
                      placeholder="Address (Optional)"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="input-group">
                    <Languages size={20} className="input-icon" />
                    <select
                      value={formData.language}
                      onChange={(e) => handleChange('language', e.target.value)}
                      disabled={isLoading}
                    >
                      <option value="en">🇬🇧 English</option>
                      <option value="hi">🇮🇳 Hindi</option>
                      <option value="te">🇮🇳 Telugu</option>
                      <option value="ta">🇮🇳 Tamil</option>
                      <option value="bn">🇮🇳 Bengali</option>
                    </select>
                  </div>

                </div>
                
                {/* Volunteer Info Box */}
                {selectedRole === 'volunteer' && (
                  <div className="volunteer-info-box">
                    <div className="info-header">
                      <Shield size={18} />
                      <span>Volunteer Process</span>
                    </div>
                    <div className="info-steps">
                      <div className="info-step">
                        <span className="step-number">1</span>
                        <span>Complete signup (you are here)</span>
                      </div>
                      <div className="info-step">
                        <span className="step-number">2</span>
                        <span>Fill volunteer application form after login</span>
                      </div>
                      <div className="info-step">
                        <span className="step-number">3</span>
                        <span>Wait for admin verification</span>
                      </div>
                      <div className="info-step">
                        <span className="step-number">4</span>
                        <span>Start receiving incidents</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Account Setup */}
            {step === 2 && (
              <div className="step-content">
                <h3>Account Security</h3>
                <p className="step-description">Create a secure password for your account</p>
                
                <div className="input-grid">
                  <div className="input-group">
                    <Lock size={20} className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create Password *"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={errors.password ? 'error' : ''}
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
                    {errors.password && <span className="field-error">{errors.password}</span>}
                  </div>
                  
                  <div className="input-group">
                    <Lock size={20} className="input-icon" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password *"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className={errors.confirmPassword ? 'error' : ''}
                      disabled={isLoading}
                    />
                    <button 
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                  </div>
                </div>
                
                <div className="terms-section">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                      disabled={isLoading}
                      className={errors.agreeTerms ? 'error' : ''}
                    />
                    <span>
                      I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                    </span>
                  </label>
                  {errors.agreeTerms && <div className="error-message">{errors.agreeTerms}</div>}
                </div>
                
                {/* Final Step Info */}
                <div className="final-step-info">
                  {selectedRole === 'volunteer' ? (
                    <div className="volunteer-final-info">
                      <Shield size={18} />
                      <div>
                        <p><strong>Next Step:</strong> After account creation, you'll be redirected to complete your volunteer application.</p>
                        <p className="note">You need to complete the application before accessing the volunteer dashboard.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="citizen-final-info">
                      <User size={18} />
                      <div>
                        <p><strong>Ready to go!</strong> You'll be redirected to your citizen dashboard immediately after signup.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="form-navigation">
              {step > 1 && (
                <button 
                  type="button" 
                  className="secondary-button"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  Back
                </button>
              )}
              
              <button 
                type="submit" 
                className={`primary-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : (step === 2 ? 'Create Account' : 'Continue')}
              </button>
            </div>

            {/* Step Indicator Dots (Mobile) */}
            <div className="step-dots">
              {[1, 2].map((dot) => (
                <div 
                  key={dot} 
                  className={`step-dot ${step === dot ? 'active' : ''}`}
                  onClick={() => step > dot && setStep(dot)}
                />
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Key, ArrowLeft, Shield, CheckCircle, Clock, Smartphone } from 'lucide-react';
import apiClient from '../services/apiClient';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
    method: 'email' // 'email' or 'phone'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes = 300 seconds
  const [resetRole, setResetRole] = useState(null);

  // Simulate OTP timer
  const startOtpTimer = () => {
    setOtpTimer(60);
    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Validation
      if (formData.method === 'email' && !formData.email) {
        throw new Error('Email is required');
      }
      if (formData.method === 'phone' && !formData.phone) {
        throw new Error('Phone number is required');
      }
      
      // Email validation
      if (formData.method === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          throw new Error('Please enter a valid email address');
        }
      }
      
      // Phone validation
      if (formData.method === 'phone') {
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
          throw new Error('Please enter a valid phone number');
        }
      }
      
      // Call backend API to send OTP
      const payload = {
        method: formData.method,
        ...(formData.method === 'email' ? { email: formData.email } : { phone: formData.phone })
      };

      const response = await apiClient.post('/forgot-password/request-otp', payload);
      
      // Log OTP to console (dev mode)
      if (response.data.devOtp) {
        console.log('🔐 OTP for testing:', response.data.devOtp);
      }

      // Capture role from backend (volunteer/citizen)
      if (response.data.role) {
        setResetRole(response.data.role);
      }
      
      setOtpSent(true);
      startOtpTimer();
      setSuccess(`Verification code sent to your ${formData.method === 'email' ? 'email' : 'phone'}`);
      
      // Move to OTP step
      setStep(2);
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (!formData.otp) {
        throw new Error('Please enter the verification code');
      }
      
      if (formData.otp.length !== 6) {
        throw new Error('Verification code must be 6 digits');
      }
      
      // Call backend API to verify OTP
      const payload = {
        method: formData.method,
        otp: formData.otp,
        ...(formData.method === 'email' ? { email: formData.email } : { phone: formData.phone })
      };

      const response = await apiClient.post('/forgot-password/verify-otp', payload);
      
      if (response.data.verified) {
        setSuccess('Verification successful! Set your new password.');
        setStep(3);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Validation
      if (!formData.newPassword) {
        throw new Error('New password is required');
      }
      
      if (formData.newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Call backend API to reset password
      const payload = {
        method: formData.method,
        otp: formData.otp,
        newPassword: formData.newPassword,
        ...(formData.method === 'email' ? { email: formData.email } : { phone: formData.phone })
      };

      const response = await apiClient.post('/forgot-password/reset-password', payload);
      
      if (response.data.success) {
        setSuccess('Password reset successful! Redirecting to login...');
        
        // Redirect to role-specific login after delay
        setTimeout(() => {
          const role = response?.data?.role || resetRole || 'citizen';
          navigate(`/login?role=${role}`);
        }, 2000);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleResendOtp = async () => {
    if (otpTimer === 0) {
      setIsLoading(true);
      setError('');
      
      try {
        const payload = {
          method: formData.method,
          ...(formData.method === 'email' ? { email: formData.email } : { phone: formData.phone })
        };

        const response = await apiClient.post('/forgot-password/resend-otp', payload);
        
        // Log OTP to console (dev mode)
        if (response.data.devOtp) {
          console.log('🔐 Resent OTP for testing:', response.data.devOtp);
        }
        
        startOtpTimer();
        setSuccess('New verification code sent');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-background" />
      
      <div className="forgot-password-wrapper">
        <div className="forgot-password-card">
          {/* Security Badge */}
          <div className="security-header">
            <div className="security-icon">
              <Shield size={24} />
            </div>
            <span>Secure Password Reset</span>
          </div>

          <div className="forgot-password-header">
            <button 
              className="back-button"
              onClick={() => navigate('/login')}
              disabled={isLoading}
            >
              <ArrowLeft size={20} />
              Back to Login
            </button>
            
            <div className="header-content">
              <h2>Reset Your Password</h2>
              <p>Follow these steps to regain access to your account</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="progress-steps">
            {[
              { number: 1, label: 'Verify Identity', active: step >= 1 },
              { number: 2, label: 'Enter Code', active: step >= 2 },
              { number: 3, label: 'New Password', active: step >= 3 }
            ].map((stepItem) => (
              <div key={stepItem.number} className={`step-item ${stepItem.active ? 'active' : ''}`}>
                <div className="step-number">
                  {stepItem.active && step > stepItem.number ? (
                    <CheckCircle size={20} />
                  ) : (
                    stepItem.number
                  )}
                </div>
                <span>{stepItem.label}</span>
              </div>
            ))}
            <div className="progress-line">
              <div 
                className="progress-fill" 
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>
          </div>

          <div className="forgot-password-form">
            {/* Step 1: Identity Verification */}
            {step === 1 && (
              <div className="step-content">
                <div className="method-selection">
                  <h3>How would you like to reset your password?</h3>
                  <p>Choose a method to receive a verification code</p>
                  
                  <div className="method-options">
                    <div 
                      className={`method-option ${formData.method === 'email' ? 'selected' : ''}`}
                      onClick={() => handleChange('method', 'email')}
                    >
                      <div className="method-icon">
                        <Mail size={24} />
                      </div>
                      <div className="method-info">
                        <h4>Email Verification</h4>
                        <p>Send code to your registered email</p>
                      </div>
                    </div>
                    
                    <div 
                      className={`method-option ${formData.method === 'phone' ? 'selected' : ''}`}
                      onClick={() => handleChange('method', 'phone')}
                    >
                      <div className="method-icon">
                        <Smartphone size={24} />
                      </div>
                      <div className="method-info">
                        <h4>SMS Verification</h4>
                        <p>Send code to your registered phone</p>
                      </div>
                    </div>
                  </div>
                </div>

                {formData.method === 'email' ? (
                  <div className="input-group">
                    <Mail size={20} className="input-icon" />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      disabled={isLoading}
                      className="forgot-input"
                    />
                  </div>
                ) : (
                  <div className="input-group">
                    <Smartphone size={20} className="input-icon" />
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      disabled={isLoading}
                      className="forgot-input"
                    />
                  </div>
                )}

                <button 
                  type="button"
                  className="send-otp-button"
                  onClick={handleSendOtp}
                  disabled={isLoading || (formData.method === 'email' ? !formData.email : !formData.phone)}
                >
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </button>

                <div className="recovery-tip">
                  <p>💡 Check your spam folder if you don't see the email</p>
                </div>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <div className="step-content">
                <h3>Enter Verification Code</h3>
                <p>We sent a 6-digit code to your {formData.method === 'email' ? 'email' : 'phone'}</p>
                
                <div className="otp-container">
                  <div className="input-group otp-group">
                    <Key size={20} className="input-icon" />
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={formData.otp}
                      onChange={(e) => handleChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      disabled={isLoading}
                      className="otp-input"
                      maxLength="6"
                    />
                  </div>
                  
                  <div className="otp-timer">
                    {otpTimer > 0 ? (
                      <>
                        <Clock size={16} />
                        <span>Resend code in {otpTimer}s</span>
                      </>
                    ) : (
                      <button 
                        type="button"
                        className="resend-button"
                        onClick={handleResendOtp}
                        disabled={isLoading}
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>

                <div className="verification-actions">
                  <button 
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setStep(1);
                      setOtpSent(false);
                    }}
                    disabled={isLoading}
                  >
                    Use Different Method
                  </button>
                  
                  <button 
                    type="button"
                    className="verify-button"
                    onClick={handleVerifyOtp}
                    disabled={isLoading || !formData.otp || formData.otp.length !== 6}
                  >
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>

                <div className="demo-note">
                  <p>💡 Dev Mode: Check your browser console for the OTP code</p>
                </div>
              </div>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <div className="step-content">
                <h3>Set New Password</h3>
                <p>Create a strong password for your account</p>
                
                <div className="password-inputs">
                  <div className="input-group">
                    <Key size={20} className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="New password"
                      value={formData.newPassword}
                      onChange={(e) => handleChange('newPassword', e.target.value)}
                      disabled={isLoading}
                      className="forgot-input"
                    />
                    <button 
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  
                  <div className="input-group">
                    <Key size={20} className="input-icon" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      disabled={isLoading}
                      className="forgot-input"
                    />
                    <button 
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="password-requirements">
                  <h4>Password Requirements:</h4>
                  <ul>
                    <li className={formData.newPassword.length >= 6 ? 'met' : ''}>
                      At least 6 characters long
                    </li>
                    <li className={formData.newPassword === formData.confirmPassword && formData.confirmPassword ? 'met' : ''}>
                      Passwords match
                    </li>
                  </ul>
                </div>

                <button 
                  type="button"
                  className="reset-button"
                  onClick={handleResetPassword}
                  disabled={isLoading || !formData.newPassword || !formData.confirmPassword}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            )}

            {/* Error & Success Messages */}
            {error && (
              <div className="error-message">
                <span>⚠️ {error}</span>
              </div>
            )}

            {success && (
              <div className="success-message">
                <span>✅ {success}</span>
              </div>
            )}

            {/* Help Section */}
            <div className="help-section">
              <h4>Need Help?</h4>
              <p>
                Contact support at{' '}
                <button 
                  type="button"
                  className="support-link"
                  onClick={() => alert('support@disasterguardian.com')}
                >
                  support@disasterguardian.com
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Car, UserCheck, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { volunteerAPI } from '../../services/api';
import LanguageSwitcher from '../LanguageSwitcher';
import './VolunteerApply.css';

const VolunteerApply = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const [hasAlreadyApplied, setHasAlreadyApplied] = useState(false);

  const [formData, setFormData] = useState({
    skills: '',
    vehicle: 'none',
    document: null,
    documentPreview: null
  });

  // Load user data and check if already applied
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserData(parsed);
      
      // Check if volunteer has already submitted application
      const applications = JSON.parse(localStorage.getItem('volunteerApplications') || '[]');
      const hasApplication = applications.some(app => app.userId === parsed.id);
      
      if (hasApplication) {
        setHasAlreadyApplied(true);
        setMessage('error: You have already submitted an application. Please check your Application Status in the dashboard.');
      }
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setMessage('Please upload only JPEG, PNG, or PDF files');
        return;
      }

      if (file.size > maxSize) {
        setMessage('File size should be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        document: file,
        documentPreview: URL.createObjectURL(file)
      }));
      setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      if (!userData?.id) {
        throw new Error('User session missing. Please log in again.');
      }

      // Validate all required fields
      if (!formData.skills.trim()) {
        throw new Error('Skills field is required. Please list your skills');
      }
      
      if (formData.vehicle === 'none') {
        throw new Error('Vehicle selection is required. Please select a vehicle option');
      }

      if (!formData.document) {
        throw new Error('Document upload is required. Please upload your supporting documents (JPEG, PNG, or PDF)');
      }

      // Prepare form data for submission
      const applicationData = {
        userId: userData.id,
        name: userData?.name || 'Unknown',
        email: userData?.email || 'unknown@example.com',
        phone: userData?.phone || '0000000000',
        skills: formData.skills,
        vehicle: formData.vehicle,
        documentName: formData.document?.name || '',
        documentSize: formData.document?.size,
        documentType: formData.document?.type,
        appliedAt: new Date().toISOString()
      };

      console.log('Submitting application:', applicationData);

      let response;
      try {
        response = await volunteerAPI.submitApplication(applicationData);
        console.log('API Response:', response);
      } catch (apiError) {
        console.log('API call failed, using mock response:', apiError);
        response = {
          success: false,
          message: apiError.message || 'Application submission failed'
        };
      }

      // Check if response indicates success - either by success flag or by presence of profile data
      const isSuccessful = response?.success || response?.profile || response?.data || (response?.message && response.message.includes('saved'));
      
      if (!isSuccessful) {
        throw new Error(response?.message || 'Submission failed');
      }

      // Save application to localStorage for offline fallback
      const existingApplications = JSON.parse(localStorage.getItem('volunteerApplications') || '[]');
      const storedApplication = {
        ...(response.data || applicationData),
        status: response.data?.status || 'pending',
        appliedAt: applicationData.appliedAt
      };
      existingApplications.push(storedApplication);
      localStorage.setItem('volunteerApplications', JSON.stringify(existingApplications));
      
      // Update user data with volunteer application info
      const updatedUserData = {
        ...userData,
        role: 'volunteer',
        volunteerStatus: storedApplication.status || 'pending',
        applicationId: storedApplication.applicationId,
        appliedAt: storedApplication.appliedAt,
        skills: formData.skills,
        vehicle: formData.vehicle
      };
      
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      localStorage.setItem('volunteerActiveTab', 'status');
      
      console.log('Updated user data:', updatedUserData);

      setMessage('success: Application submitted successfully! Redirecting to dashboard...');
      setHasAlreadyApplied(true);
      
      // Redirect to dashboard using React Router navigate
      setTimeout(() => {
        navigate('/volunteer/dashboard', { replace: true });
      }, 300);
    } catch (error) {
      console.error('Application error:', error);
      setMessage(`error: ${error.message || 'Failed to submit application. Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="volunteer-apply-container">
      <div className="volunteer-apply-background" />
      
      <div className="volunteer-apply-wrapper">
        <div className="volunteer-apply-card">
          <div className="volunteer-apply-header">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
              <button 
                className="back-button"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                <ArrowLeft size={20} />
                {t('Back')}
              </button>
              <LanguageSwitcher />
            </div>
            
            <h2>{t('Volunteer Application')}</h2>
            <p>{t('Complete your application to become a verified volunteer')}</p>
          </div>

          <form onSubmit={handleSubmit} className="volunteer-apply-form">
            {hasAlreadyApplied && (
              <div className="alert-box error-alert">
                <p>{t('You have already submitted your application. You can view your application status in the dashboard.')}</p>
                <button 
                  type="button"
                  className="dashboard-button"
                  onClick={() => navigate('/volunteer/dashboard')}
                >
                  {t('Go to Dashboard')}
                </button>
              </div>
            )}
            {/* User Info Display */}
            {userData && (
              <div className="user-info-display">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{userData.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{userData.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{userData.phone}</span>
                </div>
              </div>
            )}

            {/* Skills Input */}
            <div className="input-group">
              <UserCheck size={20} className="input-icon" />
              <textarea
                placeholder="List your skills (e.g., First Aid, Rescue Operations, Medical Training, Communication, etc.)"
                value={formData.skills}
                onChange={(e) => handleChange('skills', e.target.value)}
                disabled={isLoading}
                rows="3"
                required
                className="skills-textarea"
              />
            </div>

            {/* Vehicle Selection */}
            <div className="input-group">
              <Car size={20} className="input-icon" />
              <select
                value={formData.vehicle}
                onChange={(e) => handleChange('vehicle', e.target.value)}
                disabled={isLoading}
                required
                className="vehicle-select"
              >
                <option value="none">{t('No Vehicle')}</option>
                <option value="car">{t('Car')}</option>
                <option value="bike">{t('Bike')}</option>
                <option value="truck">Truck</option>
                <option value="boat">Boat</option>
                <option value="other">{t('Other')}</option>
              </select>
            </div>

            {/* Document Upload - Required */}
            <div className="upload-section">
              <div className="upload-header">
                <FileText size={20} />
                <span>Upload Document (ID Proof) - <strong style={{color: '#ff6b6b'}}>Required</strong></span>
              </div>
              <p className="upload-note">Please upload your ID proof (Aadhar, Driving License, etc.) in JPG, PNG or PDF format (max 5MB)</p>
              
              <label className="upload-area">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  required
                />
                <div className="upload-content">
                  <Upload size={40} />
                  <div>
                    <p className="upload-text">Click to upload or drag and drop</p>
                    <p className="upload-subtext">JPEG, PNG, PDF up to 5MB</p>
                  </div>
                </div>
              </label>

              {/* Document Preview */}
              {formData.documentPreview && (
                <div className="document-preview">
                  <div className="preview-header">
                    <FileText size={16} />
                    <span>{formData.document?.name}</span>
                    <button 
                      type="button"
                      className="remove-file"
                      onClick={() => setFormData(prev => ({ ...prev, document: null, documentPreview: null }))}
                    >
                      ×
                    </button>
                  </div>
                  {formData.document?.type.startsWith('image/') ? (
                    <img 
                      src={formData.documentPreview} 
                      alt="Document preview" 
                      className="preview-image"
                    />
                  ) : (
                    <div className="pdf-preview">
                      <FileText size={48} />
                      <span>PDF Document</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Message Display */}
            {message && (
              <div className={`message-box ${message.startsWith('success') ? 'success' : 'error'}`}>
                {message.startsWith('success') ? '✅' : '❌'} 
                {message.split(':')[1] || message}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`submit-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || hasAlreadyApplied}
            >
              {isLoading ? t('Submitting...') : hasAlreadyApplied ? 'Already Submitted' : t('Submit Application')}
            </button>

            {/* Terms Note */}
            <div className="terms-note">
              <p>By submitting this application, you agree to:</p>
              <ul>
                <li>Provide accurate information</li>
                <li>Respond promptly to emergency calls</li>
                <li>Follow guidelines provided by administrators</li>
                <li>Maintain confidentiality of sensitive information</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VolunteerApply;
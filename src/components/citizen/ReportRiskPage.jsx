// src/components/citizen/ReportRiskPage.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  MapPin, 
  Camera, 
  FileText, 
  Clock, 
  Users,
  Shield,
  Send,
  ArrowLeft,
  X,
  CheckCircle,
  CloudUpload,
  Mic,
  Square
} from 'lucide-react';
import './ReportRiskPage.css';
import { incidentService } from '../../services/incidentService';
import { useTranslation } from 'react-i18next';

const ReportRiskPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    riskType: 'suspicious',
    locationText: '',
    coords: null,
    description: '',
    severity: 'medium',
    peopleInvolved: 0,
    estimatedRiskTime: '',
    additionalNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Prepare speech recognition for voice-to-text on description
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.continuous = true;
    recog.interimResults = true;

    recog.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setFormData(prev => ({ ...prev, description: `${prev.description} ${transcript}`.trim() }));
    };

    recog.onend = () => setIsRecording(false);
    recognitionRef.current = recog;

    return () => {
      recog.abort();
    };
  }, []);

  const toggleRecording = () => {
    const recog = recognitionRef.current;
    if (!recog) {
      alert('Voice input is not supported in this browser.');
      return;
    }
    if (isRecording) {
      recog.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recog.start();
    }
  };

  // Risk types with icons
  const riskTypes = [
    { id: 'suspicious', label: t('Suspicious Activity'), icon: '🚨', color: '#ff6b6b' },
    { id: 'infrastructure', label: t('Infrastructure Risk'), icon: '🏗️', color: '#4ecdc4' },
    { id: 'environmental', label: t('Environmental Hazard'), icon: '🌳', color: '#1dd1a1' },
    { id: 'crowd', label: t('Crowd Control Issue'), icon: '👥', color: '#feca57' },
    { id: 'fire', label: t('Fire Hazard'), icon: '🔥', color: '#ff9f43' },
    { id: 'flood', label: t('Flooding Risk'), icon: '🌊', color: '#54a0ff' },
    { id: 'security', label: t('Security Breach'), icon: '🔒', color: '#5f27cd' },
    { id: 'other', label: t('Other Risk'), icon: '⚠️', color: '#8395a7' }
  ];

  // Get current device location
  const getCurrentLocation = () => {
    setIsLocationLoading(true);
    if (!navigator.geolocation) {
      setIsLocationLoading(false);
      alert('Geolocation is not supported on this device. Please type the location.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const txt = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        setFormData(prev => ({ ...prev, coords: { lat: latitude, lng: longitude }, locationText: txt }));
        setIsLocationLoading(false);
      },
      (err) => {
        console.warn('Geolocation error', err);
        setIsLocationLoading(false);
        alert('Unable to get GPS location. You can type the location manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  // Handle image upload (mock)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const mockImages = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      url: URL.createObjectURL(file),
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    }));
    
    setUploadedImages(prev => [...prev, ...mockImages].slice(0, 6)); // Max 6 images
  };

  // Remove uploaded image
  const removeImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const reporterId = (JSON.parse(localStorage.getItem('userData') || '{}').id) || localStorage.getItem('userId') || 'guest-user';
      const payload = {
        type: 'RISK',
        reporterId,
        description: formData.description,
        location: formData.coords ? { ...formData.coords, address: formData.locationText } : formData.locationText,
        riskType: formData.riskType,
        severity: formData.severity,
        peopleInvolved: formData.peopleInvolved,
        estimatedRiskTime: formData.estimatedRiskTime,
        additionalNotes: formData.additionalNotes,
        images: uploadedImages.map(i => i.name)
      };
      await incidentService.reportRisk(payload);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/citizen/dashboard');
      }, 1800);
    } catch (err) {
      console.error('Risk submit failed', err);
      alert('Failed to submit risk report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-risk-page">
      {/* Background gradient */}
      <div className="risk-background"></div>
      
      {/* Success Modal */}
      {showSuccess && (
        <div className="success-modal">
          <div className="success-content">
            <CheckCircle size={80} className="success-icon" />
            <h2>{t('Risk Report Submitted Successfully!', { defaultValue: 'Risk Report Submitted Successfully!' })}</h2>
            <p>{t('Thank you for reporting this risk', { defaultValue: 'Thank you for reporting this risk. Your report has been sent to authorities for review and preventive action.' })}</p>
            <button 
              className="modal-close-btn"
              onClick={() => {
                setShowSuccess(false);
                navigate('/citizen/dashboard');
              }}
            >
              {t('Return to Dashboard', { defaultValue: 'Return to Dashboard' })}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="risk-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/citizen/dashboard')}
          disabled={isSubmitting}
        >
          <ArrowLeft size={24} />
          {t('Back to Safety')}
        </button>
        
        <div className="risk-title">
          <h1>{t('Report Risk')}</h1>
          <p className="subtitle">Identify and report potential risks to prevent emergencies</p>
        </div>
        
        <div className="header-actions">
          <div className="risk-badge">
            <Shield size={20} />
            <span>PREVENTIVE ALERT</span>
          </div>
        </div>
      </header>

      <div className="risk-container">
        {/* Left Panel - Report Form */}
        <div className="risk-form-container">
          <div className="form-card">
            <div className="form-header">
              <h2>{t('Risk Assessment')}</h2>
             
            </div>

            <form onSubmit={handleSubmit} className="risk-form">
              {/* Risk Type Selection */}
              <div className="form-group">
                <label className="form-label">
                  <AlertTriangle size={18} />
                  {t('Risk Type')}
                </label>
                <div className="risk-types-grid">
                  {riskTypes.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      className={`risk-type-btn ${formData.riskType === type.id ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, riskType: type.id }))}
                      disabled={isSubmitting}
                      style={{
                        '--type-color': type.color
                      }}
                    >
                      <span className="risk-type-icon">{type.icon}</span>
                      <span className="risk-type-label">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={18} />
                  {t('Risk Location')}
                </label>
                
                <div className="location-section">
                  <div className="location-input">
                    <input
                      type="text"
                      value={formData.locationText}
                      onChange={(e) => setFormData(prev => ({ ...prev, locationText: e.target.value, coords: null }))}
                      placeholder={t('Enter the exact location or landmark', { defaultValue: 'Enter the exact location or landmark' })}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="location-btn"
                      onClick={getCurrentLocation}
                      disabled={isLocationLoading || isSubmitting}
                    >
                      {isLocationLoading ? (
                        <>
                          <div className="spinner-small"></div>
                          {t('Locating...', { defaultValue: 'Locating...' })}
                        </>
                      ) : (
                        <>
                          <MapPin size={18} />
                          {t('Use My Location')}
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="location-hint">
                    <MapPin size={14} />
                    {t('Be as specific as possible')}
                  </div>
                </div>
              </div>

              

              {/* People Involved */}
              <div className="form-group">
                <label className="form-label">
                  <Users size={18} />
                  {t('People at Risk')}
                </label>
                
                <div className="people-input">
                  <div className="people-counter">
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        peopleInvolved: Math.max(0, prev.peopleInvolved - 1) 
                      }))}
                      disabled={isSubmitting}
                    >
                      -
                    </button>
                    
                    <div className="counter-display">
                      <span className="counter-value">{formData.peopleInvolved}</span>
                      <span className="counter-label">{t('People')}</span>
                    </div>
                    
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        peopleInvolved: prev.peopleInvolved + 1 
                      }))}
                      disabled={isSubmitting}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="people-hint">
                    {t('Estimate the number of people')}
                  </div>
                </div>
              </div>

              {/* Estimated Risk Time */}
              <div className="form-group">
                <label className="form-label">
                  <Clock size={18} />
                  {t('When is the risk expected')}
                </label>
                
                <div className="time-input">
                  <input
                    type="text"
                    value={formData.estimatedRiskTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedRiskTime: e.target.value }))}
                    placeholder={t("e.g., 'In the next hour', 'Tonight', 'This weekend'", { defaultValue: "e.g., 'In the next hour', 'Tonight', 'This weekend'" })}
                    disabled={isSubmitting}
                  />
                  <div className="time-examples">
                    {t('Examples: "Immediately", "Within 2 hours", "This afternoon", "Tonight", "This weekend"', { defaultValue: 'Examples: "Immediately", "Within 2 hours", "This afternoon", "Tonight", "This weekend"' })}
                  </div>
                </div>
              </div>

              {/* Photo Evidence */}
              <div className="form-group">
                <label className="form-label">
                  <Camera size={18} />
                  {t('Photo Evidence', { defaultValue: 'Photo Evidence' })}
                </label>
                
                <div className="upload-section">
                  <div className="upload-area">
                    <label htmlFor="image-upload" className="upload-btn">
                      <CloudUpload size={24} />
                      <span>{t('Upload Photos')}</span>
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isSubmitting || uploadedImages.length >= 6}
                        hidden
                      />
                    </label>
                    <p className="upload-hint">{t('Upload clear photos')}</p>
                  </div>
                  
                  {uploadedImages.length > 0 && (
                    <div className="uploaded-images">
                      <div className="images-header">
                        <span>{t('Uploaded Images')} ({uploadedImages.length}/6)</span>
                      </div>
                      <div className="images-grid">
                        {uploadedImages.map(image => (
                          <div key={image.id} className="image-preview">
                            <img src={image.url} alt={image.name} />
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => removeImage(image.id)}
                              disabled={isSubmitting}
                            >
                              <X size={16} />
                            </button>
                            <div className="image-info">
                              <span className="image-name">{image.name}</span>
                              <span className="image-size">{image.size}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">
                  <FileText size={18} />
                  {t('Detailed Description')}
                </label>
                
                <div className="description-input">
                  <textarea
                    placeholder={t('Describe the risk in detail', { defaultValue: 'Describe the risk in detail. Include what you observed, why it\'s dangerous, and any immediate concerns...' })}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows="5"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className={`voice-btn ${isRecording ? 'recording' : ''}`}
                    onClick={toggleRecording}
                    disabled={isSubmitting}
                    aria-label="Record description"
                  >
                    {isRecording ? <Square size={18} /> : <Mic size={18} />}
                    {isRecording ? t('Stop', { defaultValue: 'Stop' }) : t('Voice to text', { defaultValue: 'Voice to text' })}
                  </button>
                  <div className="char-count">
                    {formData.description.length}/1000 characters
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="form-group">
                <label className="form-label">
                  <FileText size={18} />
                  {t('Additional Notes')}
                </label>
                
                <textarea
                  placeholder={t('Any other information')}
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  rows="3"
                  disabled={isSubmitting}
                  className="notes-input"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="risk-submit-btn"
                disabled={isSubmitting || !(formData.coords || formData.locationText) || !formData.description}
              >
                {isSubmitting ? (
                  <>
                    <div className="submit-spinner"></div>
                    {t('Submitting Report')}...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    {t('Submit Risk Report')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel - Risk Assessment Info */}
        <div className="risk-info-panel">
          {/* Risk Assessment Card */}
          <div className="info-card">
            <h3>{t('Risk Assessment')}</h3>
            
            <div className="assessment-summary">
              <div className="summary-item">
                <div className="summary-label">{t('Current Risk Level')}</div>
                <div className={`summary-value risk-${formData.severity}`}>
                  {formData.severity.toUpperCase()}
                </div>
              </div>
              
              <div className="summary-item">
                <div className="summary-label">{t('People at Risk')}</div>
                <div className="summary-value people-count">
                  {formData.peopleInvolved}
                </div>
              </div>
              
              <div className="summary-item">
                <div className="summary-label">{t('Photos Uploaded')}</div>
                <div className="summary-value photos-count">
                  {uploadedImages.length}
                </div>
              </div>
            </div>

            {/* Risk Timeline */}
            <div className="risk-timeline">
              <h4>{t('Response Timeline')}</h4>
              <div className="timeline-steps">
                <div className="timeline-step active">
                  <div className="step-dot"></div>
                  <div className="step-content">
                    <div className="step-title">{t('Report Submitted')}</div>
                    <div className="step-time">{t('Immediate')}</div>
                  </div>
                </div>
                
                <div className="timeline-step">
                  <div className="step-dot"></div>
                  <div className="step-content">
                    <div className="step-title">{t('Authority Review')}</div>
                    <div className="step-time">{t('5-15 minutes')}</div>
                  </div>
                </div>
                
                <div className="timeline-step">
                  <div className="step-dot"></div>
                  <div className="step-content">
                    <div className="step-title">{t('Preventive Action')}</div>
                    <div className="step-time">{t('15-60 minutes')}</div>
                  </div>
                </div>
                
                <div className="timeline-step">
                  <div className="step-dot"></div>
                  <div className="step-content">
                    <div className="step-title">{t('Risk Resolution')}</div>
                    <div className="step-time">{t('Varies by severity')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info Card (Replacement for removed sections) */}
       
              
              
        </div>
      </div>

      {/* Footer */}
      <footer className="risk-footer">
        <div className="footer-content">
          <div className="disclaimer">
            <AlertTriangle size={16} />
            <span>{t('Risk prevention helps')}</span>
          </div>
          <div className="footer-stats">
            <span className="stat">{t('Risk Prevention')}</span>
            <span className="stat">{t('Community Safety')}</span>
            <span className="stat">{t('Early Detection')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ReportRiskPage;
// src/components/citizen/SOSPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertCircle, Send, ArrowLeft } from 'lucide-react';
import './SOSPage.css';
import { incidentService } from '../../services/incidentService';
import { useTranslation } from 'react-i18next';

const SOSPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    description: '',
    locationText: '',
    coords: null,
    emergencyType: 'medical',
    priority: 'high'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // Get current location
  const getCurrentLocation = () => {
    setIsLocationLoading(true);
    if (!navigator.geolocation) {
      setIsLocationLoading(false);
      alert('Geolocation is not supported on this device. Please type your location.');
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
        alert('Unable to get GPS location. You can type your location manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  // Auto-get location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const reporterId = (JSON.parse(localStorage.getItem('userData') || '{}').id) || localStorage.getItem('userId') || 'guest-user';
      const payload = {
        type: 'SOS',
        reporterId,
        description: formData.description || 'SOS Emergency',
        location: formData.coords ? { ...formData.coords, address: formData.locationText } : formData.locationText,
        emergencyType: formData.emergencyType,
        priority: formData.priority
      };
      await incidentService.reportSOS(payload);
      alert('Emergency alert sent successfully! Help is on the way.');
      navigate('/citizen/dashboard');
    } catch (err) {
      console.error('SOS submit failed', err);
      alert('Failed to send SOS. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sos-page">
      {/* Background gradient */}
      <div className="sos-background"></div>
      
      {/* Header */}
      <header className="sos-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/citizen/dashboard')}
          disabled={isSubmitting}
        >
          <ArrowLeft size={24} />
          {t('Back to Safety')}
        </button>
        
        <div className="sos-title">
          <h1>{t('SOS Emergency')}</h1>
          <p className="subtitle">Send immediate distress signal to emergency contacts and authorities</p>
        </div>
        
        <div className="header-actions">
          <div className="emergency-badge">
            <AlertCircle size={20} />
            <span>LIVE ALERT</span>
          </div>
        </div>
      </header>

      <div className="sos-container">
        {/* Left Panel - Emergency Form */}
        <div className="sos-form-container">
          <div className="form-card">
            <div className="form-header">
              <h2>{t('Emergency Details')}</h2>
              
            </div>

            <form onSubmit={handleSubmit} className="sos-form">
              {/* Emergency Type */}
              <div className="form-group">
                <label className="form-label">
                  <AlertCircle size={18} />
                  {t('Emergency Type')}
                </label>
                <div className="emergency-types">
                  {[
                    { id: 'medical', label: t('Medical Emergency'), icon: '🚑' },
                    { id: 'fire', label: t('Fire'), icon: '🔥' },
                    { id: 'crime', label: t('Crime in Progress'), icon: '🚔' },
                    { id: 'accident', label: t('Accident'), icon: '🚗' },
                    { id: 'natural', label: t('Natural Disaster'), icon: '🌪️' },
                    { id: 'other', label: t('Other'), icon: '⚠️' }
                  ].map(type => (
                    <button
                      key={type.id}
                      type="button"
                      className={`type-btn ${formData.emergencyType === type.id ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, emergencyType: type.id }))}
                      disabled={isSubmitting}
                    >
                      <span className="type-icon">{type.icon}</span>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              

              {/* Location */}
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={18} />
                  {t('Your Location')}
                </label>
                
                <div className="location-input">
                  <input
                    type="text"
                    value={formData.locationText}
                    onChange={(e) => setFormData(prev => ({ ...prev, locationText: e.target.value, coords: null }))}
                    placeholder={t('Enter your location or use GPS')}
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
                        {t('Refresh Location', { defaultValue: 'Refresh Location' })}
                      </>
                    )}
                  </button>
                </div>
                
                <div className="location-status">
                  <div className={`status-dot ${formData.location ? 'active' : 'inactive'}`}></div>
                  <span>{(formData.coords || formData.locationText) ? t('Location acquired') : t('Locating...', { defaultValue: 'Acquiring location...' })}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="sos-submit-btn emergency-pulse"
                disabled={isSubmitting || !(formData.coords || formData.locationText)}
              >
                {isSubmitting ? (
                  <>
                    <div className="submit-spinner"></div>
                    {t('Sending Alert...', { defaultValue: 'Sending Alert...' })}
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    {t('Send Emergency Alert')}
                  </>
                )}
              </button>

              {/* Emergency Warning */}
              <div className="emergency-warning">
                <AlertCircle size={20} />
                <div>
                  <strong>{t('Important')}:</strong> {t('Only use for genuine emergencies')}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Panel - Emergency Info */}
        <div className="emergency-info">
          <div className="info-card">
            
            
            
              
              
              
              
              
              

            {/* Emergency Contacts */}
            <div className="contacts-section">
              <h4>{t('Emergency Contacts')}</h4>
              <div className="contact-list">
                <div className="contact-item">
                  <span className="contact-name">{t('Police')}</span>
                  <span className="contact-number">100</span>
                </div>
                <div className="contact-item">
                  <span className="contact-name">{t('Fire Department')}</span>
                  <span className="contact-number">101</span>
                </div>
                <div className="contact-item">
                  <span className="contact-name">{t('Ambulance')}</span>
                  <span className="contact-number">102</span>
                </div>
                <div className="contact-item">
                  <span className="contact-name">{t('Women Helpline')}</span>
                  <span className="contact-number">1091</span>
                </div>
              </div>
            </div>

            {/* Response ETA */}
            <div className="response-eta">
              <h4>{t('Estimated Response Time')}</h4>
              <div className="eta-display">
                <span className="eta-time">{t('5-15 minutes')}</span>
                <span className="eta-label">{t('Based on your location and emergency type')}</span>
              </div>
            </div>
          </div>

          {/* Emergency Tips */}
          
        </div>
      </div>

      {/* Emergency Footer */}
      <footer className="sos-footer">
        <div className="footer-content">
          <div className="disclaimer">
            <AlertCircle size={16} />
            <span>{t('Mock emergency system disclaimer')}</span>
          </div>
          <div className="footer-stats">
            <span className="stat">🔴 {t('LIVE SYSTEM')}</span>
            <span className="stat">📡 {t('GPS ACTIVE')}</span>
            <span className="stat">🛰️ {t('SATELLITE CONNECTED')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SOSPage;
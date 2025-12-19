import React from 'react';
import { MapPin, AlertTriangle, Clock, User, Phone, CheckCircle, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './IncidentCard.css';

const IncidentCard = ({ incident, type, onAccept, isVerified = true }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Handle both old and new field names
  const incidentId = incident._id || incident.id;
  const incidentType = incident.type || incident.emergencyType || incident.riskType || 'unknown';
  const priority = incident.priority || (incident.severity === 'high' ? 'high' : incident.severity === 'low' ? 'low' : 'medium');
  const description = incident.description || '';
  const location = typeof incident.location === 'string' 
    ? incident.location 
    : incident.location?.address || t('Location not specified');
  const timestamp = incident.createdAt || incident.timestamp || new Date().toISOString();

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/volunteer/incident/${incidentId}`);
  };

  const handleAccept = (e) => {
    e.stopPropagation();
    if (onAccept && isVerified) {
      onAccept(incidentId);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#a4b0be';
    }
  };

  const getTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'sos': return '🚨';
      case 'risk': return '⚠️';
      case 'fire': return '🔥';
      case 'medical': return '🚑';
      case 'rescue': return '🚨';
      case 'flood': return '🌊';
      case 'earthquake': return '🏚️';
      case 'crime': return '🚔';
      case 'accident': return '🚗';
      case 'natural': return '🌪️';
      default: return '⚠️';
    }
  };

  const handleUpdateStatus = (e) => {
    e.stopPropagation();
    alert(t('Update status coming soon'));
  };

  const handleNavigate = (e) => {
    e.stopPropagation();
    alert(t('Navigation coming soon'));
  };

  return (
    <div className="incident-card">
      <div className="incident-header">
        <div className="incident-type">
          <span className="type-icon">{getTypeIcon(incidentType)}</span>
          <h3>{incident.title || t('Emergency Request')}</h3>
        </div>
        <div 
          className="priority-badge"
          style={{ backgroundColor: getPriorityColor(priority) }}
        >
          {priority?.toUpperCase() || 'NORMAL'}
        </div>
      </div>

      <div className="incident-description">
        <p>{description || t('No description available')}</p>
      </div>

      <div className="incident-details">
        <div className="detail-item">
          <MapPin size={16} />
          <span className="detail-text">{location}</span>
        </div>

        <div className="detail-item">
          <Clock size={16} />
          <span className="detail-text">
            {new Date(timestamp).toLocaleString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>

        {incident.reporterName && (
          <>
            <div className="detail-item">
              <User size={16} />
              <span className="detail-text">{t('Reporter')}: {incident.reporterName || 'Anonymous'}</span>
            </div>

            {incident.reporterPhone && (
              <div className="detail-item">
                <Phone size={16} />
                <span className="detail-text">{incident.reporterPhone}</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="incident-footer">
        {type === 'new' && (
          <div className="incident-actions">
            <button 
              className={`accept-button ${!isVerified ? 'disabled' : ''}`}
              onClick={handleAccept}
              disabled={!isVerified}
            >
              <CheckCircle size={18} />
              {isVerified ? t('Accept Incident') : t('Verify Required')}
            </button>
            
            <button className="details-button" onClick={handleViewDetails}>
              {t('View Details')}
            </button>
          </div>
        )}
        
        {type === 'assigned' && (
          <div className="assigned-actions">
            
            <button className="details-button" onClick={handleViewDetails}>
              View Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentCard;
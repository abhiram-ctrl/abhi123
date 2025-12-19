import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './IncidentDetail.css';
import { adminAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import { 
  FaMapMarkerAlt, 
  FaUser, 
  FaPhone, 
  FaEnvelope,
  FaUserShield,
  FaCheckCircle,
  FaArrowLeft,
  FaExclamationTriangle,
  FaShieldAlt,
  FaClock,
  FaHistory,
  FaMapPin
} from 'react-icons/fa';

const IncidentDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [volunteers, setVolunteers] = useState([]);
  const [showAssignSuccess, setShowAssignSuccess] = useState(false);
  const [showResolveSuccess, setShowResolveSuccess] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const getLocationString = (location) => {
    if (!location) return 'Location not specified';
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && location.address) return location.address;
    return 'Location not specified';
  };

  // Fetch incident and volunteers from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch incident details and available volunteers in parallel
        const [incidentResult, volunteersResult] = await Promise.all([
          adminAPI.getIncidentDetail(id),
          adminAPI.getAvailableVolunteers()
        ]);

        // Check incident result
        if (!incidentResult) {
          throw new Error('No response from incident API');
        }

        if (!incidentResult.success) {
          throw new Error(incidentResult.message || 'Failed to load incident details');
        }

        if (incidentResult.data) {
          setIncident(incidentResult.data);
        } else {
          throw new Error('Incident not found');
        }

        // Set volunteers safely
        if (volunteersResult && volunteersResult.success && volunteersResult.data) {
          setVolunteers(Array.isArray(volunteersResult.data) ? volunteersResult.data : []);
        } else {
          setVolunteers([]);
        }

      } catch (err) {
        console.error('Error fetching incident details:', err);
        setError(err.message || 'Failed to load incident details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAssignVolunteer = async () => {
    if (!selectedVolunteer) return;
    
    try {
      setIsAssigning(true);
      const result = await adminAPI.assignVolunteer(id, selectedVolunteer);
      
      if (result.success) {
        const volunteer = volunteers.find(v => v.id === selectedVolunteer || v._id === selectedVolunteer);
        setIncident(prev => ({
          ...prev,
          status: 'Assigned',
          assignedVolunteer: volunteer
        }));
        setShowAssignSuccess(true);
        setTimeout(() => setShowAssignSuccess(false), 3000);
      } else {
        alert(result.message || 'Failed to assign volunteer');
      }
    } catch (err) {
      console.error('Error assigning volunteer:', err);
      alert('Failed to assign volunteer');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleResolveIncident = async () => {
    try {
      setIsResolving(true);
      const result = await adminAPI.updateIncidentStatus(id, 'Resolved');
      
      if (result.success) {
        setIncident(prev => ({
          ...prev,
          status: 'Resolved'
        }));
        setShowResolveSuccess(true);
        setTimeout(() => setShowResolveSuccess(false), 3000);
      } else {
        alert(result.message || 'Failed to resolve incident');
      }
    } catch (err) {
      console.error('Error resolving incident:', err);
      alert('Failed to resolve incident');
    } finally {
      setIsResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>{t('Loading incidents...')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="incident-not-found">
        <h2>{t('Failed to load data')}</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/admin/incidents')} className="back-btn">
          <FaArrowLeft /> {t('Back to Incidents')}
        </button>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="incident-not-found">
        <h2>{t('No incidents found')}</h2>
        <button onClick={() => navigate('/admin/incidents')} className="back-btn">
          <FaArrowLeft /> {t('Back to Incidents')}
        </button>
      </div>
    );
  }

  return (
    <div className="incident-detail-admin">
      {/* Header with Back Button */}
      <header className="admin-page-header">
        <div className="header-left">
          <button onClick={() => navigate('/admin/incidents')} className="back-btn">
            <FaArrowLeft />
            {t('Back to Incidents')}
          </button>
          <div className="header-content">
            <h1 className="page-title">{t('Incident Detail')} #{id}</h1>
            <p className="page-subtitle">{t('Monitor and manage all reported incidents')}</p>
          </div>
        </div>
        <div className="header-actions">
          <div className={`incident-status-badge ${(incident.status || 'open').toLowerCase()}`}>
            {t(incident.status || 'Open')}
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="incident-detail-grid">
        {/* Left Column - Incident Details */}
        <div className="detail-section glass-effect">
          <div className="section-header">
            <h2>
              {incident.type === 'SOS' ? <FaExclamationTriangle className="type-icon sos" /> : <FaShieldAlt className="type-icon risk" />}
              {incident.type} {t('Incident Details')}
            </h2>
            <span className="priority-badge">{incident.priority} {t('Priority')}</span>
          </div>

          <div className="detail-content">
            <div className="detail-row">
              <label>{t('Type')}</label>
              <span className="category-tag">{incident.category}</span>
            </div>

            <div className="detail-row">
              <label>{t('Description')}</label>
              <p className="description-text">{incident.description}</p>
            </div>

            <div className="detail-row">
              <label>{t('Location')}</label>
              <div className="location-details">
                <FaMapPin className="location-icon" />
                <div>
                  <p className="location-address">{getLocationString(incident.location)}</p>
                  {typeof incident.location === 'object' && incident.location?.lat && incident.location?.lng && (
                    <p className="location-coords">
                      {incident.location.lat}°, {incident.location.lng}°
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="detail-row">
              <label>{t('Reported Time')}</label>
              <div className="timestamp">
                <FaClock className="time-icon" />
                <span>{incident.timestamp || new Date(incident.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {incident.severity && (
              <div className="detail-row">
                <label>{t('Severity')}</label>
                <span className={`severity-badge ${incident.severity.toLowerCase()}`}>{t(incident.severity)}</span>
              </div>
            )}

            {incident.peopleInvolved > 0 && (
              <div className="detail-row">
                <label>{t('Total Incidents')}</label>
                <span className="people-count">{incident.peopleInvolved}</span>
              </div>
            )}

            {incident.notes && (
              <div className="detail-row">
                <label>{t('Notes')}</label>
                <p className="notes-text">{incident.notes}</p>
              </div>
            )}

            {incident.images && incident.images.length > 0 && (
              <div className="detail-row">
                <label>Attached Images</label>
                <div className="images-gallery">
                  {incident.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Evidence ${idx + 1}`} className="incident-image" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Actions and Info */}
        <div className="action-section">
          {/* Assigned Officers */}
          <div className="info-card glass-effect">
            <h3>
              <FaShieldAlt className="info-icon" />
              {t('Assigned Officers')}
            </h3>
            {incident.assignedOfficers && incident.assignedOfficers.length > 0 ? (
              <ul className="officers-list">
                {incident.assignedOfficers.map((o, idx) => (
                  <li key={idx} className="officer-item">
                    <div className="officer-row">
                      <span className="officer-type">{o.type}</span>
                      <span className="officer-name">{o.name}</span>
                    </div>
                    <div className="officer-row">
                      <span className="officer-zone">{t('Risk Zone')}: {o.riskZone || '—'}</span>
                      <span className="officer-time">{new Date(o.assignedAt).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-volunteer">{t('No officers assigned yet')}</p>
            )}
          </div>
          {/* Reporter Info */}
          <div className="info-card glass-effect">
            <h3>
              <FaUser className="info-icon" />
              {t('Contact')}
            </h3>
            <div className="reporter-details">
              <div className="reporter-row">
                <FaUser className="icon" />
                <div>
                  <span className="label">{t('Type')}</span>
                  <span className="value">{incident.reporter?.name || incident.reporterName || 'Unknown'}</span>
                </div>
                {incident.reporter?.isVerified && (
                  <span className="verified-badge">{t('Yes')}</span>
                )}
              </div>
              {(incident.reporter?.phone || incident.reporterPhone) && (
                <div className="reporter-row">
                  <FaPhone className="icon" />
                  <div>
                    <span className="label">{t('Phone')}</span>
                    <span className="value">{incident.reporter?.phone || incident.reporterPhone}</span>
                  </div>
                </div>
              )}
              {(incident.reporter?.email || incident.reporterEmail) && (
                <div className="reporter-row">
                  <FaEnvelope className="icon" />
                  <div>
                    <span className="label">{t('Email')}</span>
                    <span className="value">{incident.reporter?.email || incident.reporterEmail}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Volunteer */}
          <div className="info-card glass-effect">
            <h3>
              <FaUserShield className="info-icon" />
              Assigned Volunteer
            </h3>
            {incident.assignedVolunteer ? (
              <div className="volunteer-assigned">
                <div className="volunteer-info">
                  <h4>{incident.assignedVolunteer.name}</h4>
                  <div className="volunteer-skills">
                    {Array.isArray(incident.assignedVolunteer?.skills)
                      ? incident.assignedVolunteer.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))
                      : (incident.assignedVolunteer?.skills
                          ? <span className="skill-tag">{incident.assignedVolunteer.skills}</span>
                          : <span className="skill-tag">No skills listed</span>)}
                  </div>
                  <div className="volunteer-stats">
                    <span className="stat">Status: <strong>{incident.assignedVolunteer.status}</strong></span>
                    <span className="stat">Distance: <strong>{incident.assignedVolunteer.distance}</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="no-volunteer">No volunteer assigned yet</p>
            )}
          </div>

          {/* Admin Actions */}
          <div className="actions-card glass-effect">
            <h3>Admin Actions</h3>
            
            {/* Assign Volunteer */}
            <div className="action-group">
              <h4>Assign Volunteer</h4>
              <div className="volunteer-select">
                <select 
                  value={selectedVolunteer}
                  onChange={(e) => setSelectedVolunteer(e.target.value)}
                  className="select-input"
                  disabled={isAssigning || (incident.status || '').toLowerCase() === 'resolved'}
                >
                  <option value="">Select a volunteer...</option>
                  {volunteers.map(volunteer => (
                    <option key={volunteer.id || volunteer._id} value={volunteer.id || volunteer._id}>
                      {volunteer.name} - {volunteer.distance || 'Distance unknown'} away
                    </option>
                  ))}
                </select>
                <button 
                  onClick={handleAssignVolunteer}
                  disabled={!selectedVolunteer || isAssigning || (incident.status || '').toLowerCase() === 'resolved'}
                  className="action-btn assign-btn"
                >
                  {isAssigning ? 'Assigning...' : 'Assign'}
                </button>
                <button
                  onClick={() => navigate(`/admin/incidents/${id}/assign-volunteers`)}
                  disabled={(incident.status || '').toLowerCase() === 'resolved'}
                  className="action-btn assign-btn"
                  title="Open Assign Volunteers page"
                >
                  Advanced Assign & Notify
                </button>
              </div>
              {showAssignSuccess && (
                <div className="success-message">
                  <FaCheckCircle /> Volunteer assigned successfully!
                </div>
              )}
            </div>

            {/* Resolve Incident */}
            <div className="action-group">
              <h4>Resolve Incident</h4>
              <p className="action-description">
                Assign officers to risk zones or mark as resolved.
              </p>
              <div className="resolve-actions">
                <button 
                  onClick={() => navigate(`/admin/incidents/${id}/assign-officers`)}
                  disabled={(incident.status || '').toLowerCase() === 'resolved'}
                  className="action-btn resolve-btn assign-officers-btn"
                  title="Assign NDRF, Firefighters, NGOs and other officers"
                >
                  <FaShieldAlt />
                  Assign Officers
                </button>
                <button 
                  onClick={handleResolveIncident}
                  disabled={(incident.status || '').toLowerCase() === 'resolved' || isResolving}
                  className="action-btn resolve-btn"
                >
                  <FaCheckCircle />
                  {isResolving ? 'Resolving...' : 'Mark as Resolved'}
                </button>
              </div>
              {showResolveSuccess && (
                <div className="success-message">
                  <FaCheckCircle /> Incident marked as resolved!
                </div>
              )}
            </div>
          </div>

          {/* Incident History */}
          <div className="history-card glass-effect">
            <h3>
              <FaHistory className="info-icon" />
              Incident History
            </h3>
            <ul className="history-list">
              <li className="history-item">
                <span className="history-time">
                  {new Date(incident.createdAt || incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="history-text">
                  Incident reported by {incident.reporter?.name || incident.reporterName || 'Unknown'}
                </span>
              </li>
              <li className="history-item">
                <span className="history-time">
                  {new Date(new Date(incident.createdAt || incident.timestamp).getTime() + 2 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="history-text">Alert sent to nearby volunteers</span>
              </li>
              {incident.assignedVolunteer && (
                <li className="history-item">
                  <span className="history-time">
                    {new Date(new Date(incident.createdAt || incident.timestamp).getTime() + 10 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="history-text">Assigned to {incident.assignedVolunteer.name}</span>
                </li>
              )}
              {(incident.status || '').toLowerCase() === 'resolved' && (
                <li className="history-item resolved">
                  <span className="history-time">
                    {incident.resolvedAt
                      ? new Date(incident.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Now'}
                  </span>
                  <span className="history-text">Incident resolved</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;
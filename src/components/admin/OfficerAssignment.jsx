import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OfficerAssignment.css';
import { adminAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import { 
  FaArrowLeft,
  FaCheckCircle,
  FaTimes,
  FaFilter,
  FaMapPin,
  FaPhone,
  FaShieldAlt,
  FaTools,
  FaClipboardList,
  FaCheck
} from 'react-icons/fa';

const OfficerAssignment = () => {
  const { t } = useTranslation();
  const { id: incidentId } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedOfficers, setSelectedOfficers] = useState([]);
  const [riskZone, setRiskZone] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const officerTypes = [t('NDRF'), t('Firefighter'), t('NGO'), t('Police'), t('Medical'), t('Other')];

  // Fetch incident and available officers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get incident details
        const incidentResult = await adminAPI.getIncidentDetail(incidentId);
        if (incidentResult.success) {
          setIncident(incidentResult.data);
        } else {
          throw new Error(incidentResult.message || 'Failed to load incident');
        }

        // Get available officers
        const officersResult = await adminAPI.getAvailableOfficers();
        if (officersResult.success) {
          setOfficers(officersResult.data || []);
        } else {
          console.warn('Could not fetch officers:', officersResult.message);
          setOfficers([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [incidentId]);

  const filteredOfficers = filterType
    ? officers.filter(officer => officer.type === filterType)
    : officers;

  const handleSelectOfficer = (officerId) => {
    setSelectedOfficers(prev => {
      if (prev.includes(officerId)) {
        return prev.filter(id => id !== officerId);
      } else {
        return [...prev, officerId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedOfficers.length === filteredOfficers.length) {
      setSelectedOfficers([]);
    } else {
      setSelectedOfficers(filteredOfficers.map(o => o._id));
    }
  };

  const handleAssignOfficers = async () => {
    if (!riskZone.trim()) {
      alert('Please specify the risk zone');
      return;
    }

    if (selectedOfficers.length === 0) {
      alert(t('Select at least one officer'));
      return;
    }

    try {
      setIsAssigning(true);
      const result = await adminAPI.bulkAssignOfficers(incidentId, selectedOfficers, riskZone);

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate(`/admin/incidents/${incidentId}`);
        }, 2000);
      } else {
        alert(result.message || 'Failed to assign officers');
      }
    } catch (err) {
      console.error('Error assigning officers:', err);
      alert('Failed to assign officers');
    } finally {
      setIsAssigning(false);
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
      <div className="officer-assignment-error">
        <h2>{t('Failed to load data')}</h2>
        <p>{error}</p>
        <button onClick={() => navigate(`/admin/incidents/${incidentId}`)} className="back-btn">
          <FaArrowLeft /> {t('Back to Incidents')}
        </button>
      </div>
    );
  }

  return (
    <div className="officer-assignment-page">
      {/* Header */}
      <header className="assignment-header">
        <div className="header-left">
          <button onClick={() => navigate(`/admin/incidents/${incidentId}`)} className="back-btn">
            <FaArrowLeft />
            {t('Back to Incidents')}
          </button>
          <div className="header-content">
            <h1>{t('Assign officers to incident')}</h1>
            <LanguageSwitcher />
            {incident && (
              <div className="incident-summary">
                <span className="incident-id">Incident #{incidentId}</span>
                <span className="incident-location">
                  <FaMapPin /> {incident.location?.address || incident.location || 'Location'}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="assignment-container">
        {/* Left Panel - Risk Zone Input */}
        <div className="risk-zone-panel glass-effect">
          <h2>
            <FaMapPin /> {t('Risk Zone')}
          </h2>
          <p className="description">
            {t('Assign officers to incident')}
          </p>
          
          <div className="form-group">
            <label htmlFor="risk-zone">{t('Risk Zone')}</label>
            <textarea
              id="risk-zone"
              value={riskZone}
              onChange={(e) => setRiskZone(e.target.value)}
              placeholder={t('Risk Zone')}
              className="risk-zone-input"
              rows="4"
            />
            <small className="helper-text">{t('Assign officers to incident')}</small>
          </div>

          <div className="assignment-summary">
            <div className="summary-item">
              <span className="label">{t('Selected Officers')}:</span>
              <span className="value">{selectedOfficers.length}</span>
            </div>
            <div className="summary-item">
              <span className="label">{t('Risk Zone')}:</span>
              <span className="value">{riskZone ? t('Selected') : t('Not specified')}</span>
            </div>
          </div>

          <button
            onClick={handleAssignOfficers}
            disabled={selectedOfficers.length === 0 || !riskZone.trim() || isAssigning}
            className="assign-btn"
          >
            {isAssigning ? t('Assigning...') : (
              <>
                <FaCheck /> {t('Assign Officers')} ({selectedOfficers.length})
              </>
            )}
          </button>

          {showSuccess && (
            <div className="success-message">
              <FaCheckCircle /> {t('Officers Assigned Successfully!')}
            </div>
          )}
        </div>

        {/* Right Panel - Officers List */}
        <div className="officers-panel">
          {/* Filter Section */}
          <div className="filter-section glass-effect">
            <h3>
              <FaFilter /> {t('Filter by Type')}
            </h3>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterType === '' ? 'active' : ''}`}
                onClick={() => setFilterType('')}
              >
                {t('All Types')}
              </button>
              {officerTypes.map(type => (
                <button
                  key={type}
                  className={`filter-btn ${filterType === type ? 'active' : ''}`}
                  onClick={() => setFilterType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Officers List */}
          <div className="officers-list-section glass-effect">
            <div className="list-header">
              <h3>{t('Available Officers')}</h3>
              <span className="count">{filteredOfficers.length} {t('officers selected')}</span>
            </div>

            {filteredOfficers.length === 0 ? (
              <div className="empty-state">
                <FaShieldAlt className="empty-icon" />
                <p>No officers available</p>
                <small>Try changing the filter or check officer availability</small>
              </div>
            ) : (
              <>
                <div className="select-all-bar">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedOfficers.length === filteredOfficers.length && filteredOfficers.length > 0}
                      onChange={handleSelectAll}
                      className="checkbox"
                    />
                    Select All
                  </label>
                </div>

                <div className="officers-grid">
                  {filteredOfficers.map(officer => (
                    <div
                      key={officer._id}
                      className={`officer-card ${selectedOfficers.includes(officer._id) ? 'selected' : ''}`}
                      onClick={() => handleSelectOfficer(officer._id)}
                    >
                      <div className="officer-header">
                        <div className="officer-type-badge">{officer.type}</div>
                        <input
                          type="checkbox"
                          checked={selectedOfficers.includes(officer._id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectOfficer(officer._id);
                          }}
                          className="checkbox"
                        />
                      </div>

                      <div className="officer-info">
                        <h4 className="officer-name">{officer.name}</h4>
                        {officer.organizationName && (
                          <p className="organization">
                            <FaShieldAlt /> {officer.organizationName}
                          </p>
                        )}
                      </div>

                      <div className="officer-details">
                        {officer.phone && (
                          <div className="detail-row">
                            <FaPhone className="icon" />
                            <span>{officer.phone}</span>
                          </div>
                        )}
                        {officer.location?.address && (
                          <div className="detail-row">
                            <FaMapPin className="icon" />
                            <span>{officer.location.address}</span>
                          </div>
                        )}
                        {officer.vehicleType && (
                          <div className="detail-row">
                            <span className="vehicle-tag">{officer.vehicleType}</span>
                          </div>
                        )}
                      </div>

                      {officer.skills && officer.skills.length > 0 && (
                        <div className="officer-skills">
                          {officer.skills.map((skill, idx) => (
                            <span key={idx} className="skill-tag">
                              <FaTools /> {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {officer.equipmentAvailable && officer.equipmentAvailable.length > 0 && (
                        <div className="officer-equipment">
                          <div className="equipment-label">
                            <FaClipboardList /> Equipment:
                          </div>
                          <div className="equipment-items">
                            {officer.equipmentAvailable.map((equipment, idx) => (
                              <span key={idx} className="equipment-item">{equipment}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={`status-badge ${officer.status}`}>
                        {officer.status === 'available' && <FaCheckCircle />}
                        {officer.status === 'assigned' && <FaClipboardList />}
                        {officer.status}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerAssignment;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './IncidentList.css';
import { adminAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import { 
  FaEye, 
  FaExclamationTriangle, 
  FaShieldAlt,
  FaClock,
  FaUserCheck,
  FaCheckCircle,
  FaSearch,
  FaFilter,
  FaSort
} from 'react-icons/fa';

const IncidentList = () => {
  const { t } = useTranslation();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  // Fetch real data from database
  useEffect(() => {
    const loadIncidents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminAPI.getIncidents().catch(err => ({ 
          success: false, 
          data: [], 
          message: err.message 
        }));
        
        if (response.success && Array.isArray(response.data)) {
          setIncidents(response.data);
        } else {
          console.warn('No incidents data received:', response.message);
          setIncidents([]);
        }
      } catch (err) {
        console.error('Load incidents error:', err);
        setError(err.message || 'Failed to load incidents');
        setIncidents([]);
      } finally {
        setLoading(false);
      }
    };

    loadIncidents();
  }, []);

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'open': return <FaClock className="status-open" />;
      case 'assigned': return <FaUserCheck className="status-assigned" />;
      case 'resolved': return <FaCheckCircle className="status-resolved" />;
      default: return <FaClock />;
    }
  };

  const getTypeIcon = (type) => {
    return type === 'SOS' || type === 'sos'
      ? <FaExclamationTriangle className="type-sos" /> 
      : <FaShieldAlt className="type-risk" />;
  };

  const getPriorityBadge = (priority) => {
    const normalizedPriority = priority?.toLowerCase() || 'medium';
    return normalizedPriority === 'critical' || normalizedPriority === 'high';
  };

  const getLocationString = (location) => {
    if (!location) return '';
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && location.address) return location.address;
    return '';
  };

  const filteredIncidents = incidents.filter(incident => {
    const locationStr = getLocationString(incident.location);
    const matchesSearch = locationStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (incident.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || (incident.status?.toLowerCase() || '') === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>{t('Loading incidents...')}</p>
      </div>
    );
  }

  return (
    <div className="incident-list-admin">
      {/* Header */}
      <header className="admin-page-header">
        <div className="header-content">
          <h1 className="page-title">{t('Incident Management')}</h1>
          <p className="page-subtitle">{t('Monitor and manage all reported incidents')}</p>
        </div>
        <div className="header-actions">
          <span className="total-count">{incidents.length} {t('Total Incidents')}</span>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="error-alert">
          <p>{error}</p>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="search-filter-bar glass-effect">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('Search incidents by location or description')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t('All Status')}</option>
              <option value="open">{t('Open')}</option>
              <option value="assigned">{t('Assigned')}</option>
              <option value="resolved">{t('Resolved')}</option>
            </select>
          </div>
          
          <div className="sort-group">
            <FaSort className="sort-icon" />
            <select className="sort-select">
              <option value="newest">{t('Newest First')}</option>
              <option value="oldest">{t('Oldest First')}</option>
              <option value="priority">{t('Priority')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="incidents-table-container glass-effect">
        <table className="incidents-table">
          <thead>
            <tr>
              <th>
                <div className="table-header-cell">
                  {t('Type')}
                  <FaSort className="sort-arrow" />
                </div>
              </th>
              <th>
                <div className="table-header-cell">
                  {t('Description')}
                </div>
              </th>
              <th>
                <div className="table-header-cell">
                  {t('Location')}
                </div>
              </th>
              <th>
                <div className="table-header-cell">
                  {t('Status')}
                  <FaSort className="sort-arrow" />
                </div>
              </th>
              <th>
                <div className="table-header-cell">
                  {t('Time')}
                  <FaSort className="sort-arrow" />
                </div>
              </th>
              <th>{t('Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map(incident => (
                <tr key={incident.id || incident._id} className="incident-row">
                  <td>
                    <div className="type-cell">
                      {getTypeIcon(incident.type)}
                      <span className={`type-badge ${(incident.type || '').toLowerCase()}`}>
                        {incident.type || 'Unknown'}
                      </span>
                      {getPriorityBadge(incident.priority) && (
                        <span className="priority-badge critical">!</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="description-cell">
                      <p className="description-text">{incident.description || 'No description'}</p>
                    </div>
                  </td>
                  <td>
                    <div className="location-cell">
                      <span className="location-text">{getLocationString(incident.location) || 'Unknown location'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="status-cell">
                      {getStatusIcon(incident.status)}
                      <span className={`status-indicator ${(incident.status || '').toLowerCase()}`}>
                        {incident.status || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="time-cell">
                      <span className="time-text">
                        {new Date(incident.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <Link to={`/admin/incidents/${incident.id || incident._id}`} className="view-btn">
                        <FaEye />
                        <span>{t('View Details')}</span>
                      </Link>
                      <Link 
                        to={`/admin/incidents/${incident.id || incident._id}/assign-officers`} 
                        className="view-btn assign-officers-link"
                        title={t('Assign officers to incident')}
                      >
                        <FaShieldAlt />
                        <span>{t('Resolve with Officers')}</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data-cell">
                  <p className="no-data-message">{t('No incidents found')}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="table-footer glass-effect">
        <div className="footer-info">
          Showing {filteredIncidents.length} of {incidents.length} incidents
        </div>
        <div className="pagination">
          <button className="pagination-btn disabled">← Previous</button>
          <span className="page-numbers">1 of 1</span>
          <button className="pagination-btn">Next →</button>
        </div>
      </div>
    </div>
  );
};

export default IncidentList;
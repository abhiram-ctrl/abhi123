import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  X,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  BarChart3,
  ChevronRight,
  FileText,
  Users,
  Flame,
  Car,
  Shield,
  Activity
} from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import './IncidentHistoryPage.css';
import { incidentService } from '../../services/incidentService';

const IncidentHistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedIncident, setExpandedIncident] = useState(null);
  const [selectedIncidents, setSelectedIncidents] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeSeverityFilter, setActiveSeverityFilter] = useState('all');

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Incidents' },
    { value: 'Traffic Accident', label: 'Traffic Accidents', icon: <Car size={16} /> },
    { value: 'Medical Emergency', label: 'Medical Emergencies', icon: <Activity size={16} /> },
    { value: 'Fire', label: 'Fire Incidents', icon: <Flame size={16} /> },
    { value: 'Public Safety', label: 'Public Safety', icon: <Shield size={16} /> },
    { value: 'Hazardous Material', label: 'Hazardous Material', icon: <AlertTriangle size={16} /> },
    { value: 'Search & Rescue', label: 'Search & Rescue', icon: <Users size={16} /> }
  ];

  // Severity options
  const severityOptions = [
    { value: 'all', label: 'All Severities' },
    { value: 'Critical', label: 'Critical', color: '#ef5350' },
    { value: 'High', label: 'High', color: '#ff9800' },
    { value: 'Medium', label: 'Medium', color: '#ffb74d' },
    { value: 'Low', label: 'Low', color: '#4caf50' }
  ];

  // Load incidents from backend
  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setIsRefreshing(true);
      setLoading(true);
      const storedUserData = localStorage.getItem('userData');
      const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;
      const userId = parsedUserData?.id || localStorage.getItem('userId');
      
      if (!userId) {
        console.log('No user ID found');
        setIncidents([]);
        return;
      }

      const response = await incidentService.getUserIncidents(userId);
      // Normalize various response shapes into an array
      const arr = Array.isArray(response?.data)
        ? response.data
        : (response?.incidents || response?.data?.incidents || response?.data?.data || []);
      if (arr && Array.isArray(arr)) {
        // Transform backend data to match UI format
        const transformedIncidents = arr.map((inc, index) => ({
          id: inc._id || inc.id || index,
          title: `${inc.type} - ${inc.emergencyType || inc.riskType || 'Emergency'}`,
          type: inc.type === 'SOS' ? 'Medical Emergency' : 'Public Safety',
          severity: inc.severity || inc.priority || 'Medium',
          location: typeof inc.location === 'string' ? inc.location : (inc.location?.address || 'Location not specified'),
          date: new Date(inc.createdAt).toISOString().split('T')[0],
          time: new Date(inc.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          status: inc.status || 'Pending',
          description: inc.description || 'No description available',
          responseTime: inc.responseTime || '--',
          unitsInvolved: inc.assignedVolunteerId ? ['Volunteer', 'Emergency Services'] : ['Emergency Services'],
          casualties: inc.casualties || 0,
          damage: inc.damage || 'Unknown',
          coordinates: typeof inc.location === 'object' && inc.location.lat ? `${inc.location.lat}° N, ${inc.location.lng}° W` : 'N/A',
          priority: inc.type === 'SOS' ? 'Emergency Response' : 'Risk Assessment'
        }));
        setIncidents(transformedIncidents);
      } else {
        setIncidents([]);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading incidents:', error);
      setIncidents([]);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  // Fallback mock data for demo
  const getMockIncidents = () => [
    {
      id: 1,
      title: "Traffic Accident - Highway 401",
      type: "Traffic Accident",
      severity: "High",
      location: "Highway 401, KM 350",
      date: "2024-03-15",
      time: "14:30",
      status: "Resolved",
      description: "Two-vehicle collision causing temporary lane closure. Emergency services responded within 15 minutes. No major injuries reported.",
      responseTime: "12 minutes",
      unitsInvolved: ["Police", "Ambulance", "Fire Dept"],
      casualties: 0,
      damage: "Moderate",
      coordinates: "43.6532° N, 79.3832° W",
      priority: "Emergency Response"
    },
    {
      id: 2,
      title: "Medical Emergency - Downtown",
      type: "Medical Emergency",
      severity: "Medium",
      location: "123 Main Street",
      date: "2024-03-14",
      time: "10:45",
      status: "Resolved",
      description: "Cardiac emergency. CPR performed by bystanders. Patient transported to hospital in stable condition.",
      responseTime: "8 minutes",
      unitsInvolved: ["Ambulance", "Paramedics"],
      casualties: 0,
      damage: "None",
      coordinates: "43.6519° N, 79.3817° W",
      priority: "Life-threatening"
    },
    {
      id: 3,
      title: "Fire Outbreak - Residential Area",
      type: "Fire",
      severity: "High",
      location: "456 Oak Avenue",
      date: "2024-03-13",
      time: "03:15",
      status: "Investigation",
      description: "Kitchen fire in apartment building. Fire contained to one unit. All residents evacuated safely.",
      responseTime: "6 minutes",
      unitsInvolved: ["Fire Dept", "Police", "Ambulance"],
      casualties: 0,
      damage: "Significant",
      coordinates: "43.6545° N, 79.3808° W",
      priority: "Fire Response"
    },
    {
      id: 4,
      title: "Public Disturbance - Park",
      type: "Public Safety",
      severity: "Low",
      location: "Central Park",
      date: "2024-03-12",
      time: "19:30",
      status: "Resolved",
      description: "Large gathering causing noise complaints. Police mediated and dispersed crowd peacefully.",
      responseTime: "25 minutes",
      unitsInvolved: ["Police"],
      casualties: 0,
      damage: "Minor",
      coordinates: "43.6525° N, 79.3855° W",
      priority: "Public Safety"
    },
    {
      id: 5,
      title: "Natural Gas Leak - Commercial",
      type: "Hazardous Material",
      severity: "Critical",
      location: "789 Business Blvd",
      date: "2024-03-11",
      time: "11:20",
      status: "Resolved",
      description: "Gas leak detected in office building. Area evacuated. Gas company responded and repaired leak.",
      responseTime: "15 minutes",
      unitsInvolved: ["Fire Dept", "Police", "Gas Company"],
      casualties: 0,
      damage: "None",
      coordinates: "43.6500° N, 79.3870° W",
      priority: "Hazard Containment"
    },
    {
      id: 6,
      title: "Missing Person - Elderly",
      type: "Search & Rescue",
      severity: "Medium",
      location: "Forest Area",
      date: "2024-03-10",
      time: "16:45",
      status: "Resolved",
      description: "Elderly person reported missing from care facility. Found safe by search team 2 hours later.",
      responseTime: "30 minutes",
      unitsInvolved: ["Police", "Search & Rescue", "Volunteers"],
      casualties: 0,
      damage: "None",
      coordinates: "43.6550° N, 79.3900° W",
      priority: "Search Operation"
    }
  ];

  // Refresh function - reload from backend
  const handleRefresh = async () => {
    await loadIncidents();
  };

  // Filter incidents based on search, type filter, and severity filter
  const filteredIncidents = incidents.filter(incident => {
    // Type filter
    if (filter !== 'all' && incident.type !== filter) return false;
    
    // Severity filter
    if (activeSeverityFilter !== 'all' && incident.severity !== activeSeverityFilter) return false;
    
    // Search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const locationStr = typeof incident.location === 'string' 
        ? incident.location 
        : (incident.location?.address || '');
      return (
        (incident.title?.toLowerCase() || '').includes(searchLower) ||
        locationStr.toLowerCase().includes(searchLower) ||
        (incident.type?.toLowerCase() || '').includes(searchLower) ||
        (incident.description?.toLowerCase() || '').includes(searchLower)
      );
    }
    
    return true;
  });

  // Statistics
  const stats = {
    totalIncidents: incidents.length,
    resolved: incidents.filter(i => i.status === 'Resolved').length,
    avgResponseTime: (() => {
      const totalMinutes = incidents.reduce((sum, incident) => {
        const minutes = parseInt(incident.responseTime);
        return sum + (isNaN(minutes) ? 12 : minutes);
      }, 0);
      const avg = incidents.length > 0 ? totalMinutes / incidents.length : 12.8;
      return `${avg.toFixed(1)} minutes`;
    })(),
    active: incidents.filter(i => i.status === 'Investigation' || i.status === 'Pending').length,
    bySeverity: {
      Critical: incidents.filter(i => i.severity === 'Critical').length,
      High: incidents.filter(i => i.severity === 'High').length,
      Medium: incidents.filter(i => i.severity === 'Medium').length,
      Low: incidents.filter(i => i.severity === 'Low').length
    }
  };

  // Severity colors
  const severityColors = {
    Critical: '#ef5350',
    High: '#ff9800',
    Medium: '#ffb74d',
    Low: '#4caf50'
  };

  // Status colors
  const statusColors = {
    Resolved: '#4caf50',
    Investigation: '#ff9800',
    Pending: '#2196f3',
    Active: '#ef5350'
  };

  const toggleIncident = (id) => {
    setExpandedIncident(expandedIncident === id ? null : id);
  };

  const toggleSelectIncident = (id) => {
    setSelectedIncidents(prev =>
      prev.includes(id)
        ? prev.filter(incidentId => incidentId !== id)
        : [...prev, id]
    );
  };

  const exportData = () => {
    const data = incidents.filter(incident => selectedIncidents.includes(incident.id));
    alert(`Exporting ${data.length} incidents...`);
  };

  const formatLastUpdated = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleResetData = () => {
    if (window.confirm('Reset all data to initial state?')) {
      setIncidents(getInitialIncidents());
      setSelectedIncidents([]);
      setExpandedIncident(null);
      setLastUpdated(new Date());
      alert('Data reset to initial state!');
    }
  };

  return (
    <div className="incident-history-page">
      {/* Header */}
      <header className="incident-header">
        <div className="header-main">
          <div className="header-left">
            <button 
              className="back-btn"
                onClick={() => navigate('/citizen/dashboard')}
            >
                <ArrowLeft size={18} />
                {t('Back')}
            </button>
            <div className="header-title">
              <h1>{t('Incident History')}</h1>
              <p className="subtitle">{t('Track and analyze emergencies')} • {incidents.length} {t('total incidents')}</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <RefreshCw size={18} className="spinning" />
                  {t('Refreshing...')}
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  {t('Refresh')}
                </>
              )}
            </button>
            <button 
              className="export-btn"
              onClick={exportData}
              disabled={selectedIncidents.length === 0}
            >
              <Download size={18} />
              {t('Export')} ({selectedIncidents.length})
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(255, 71, 87, 0.2)', color: '#ef5350' }}>
              <AlertTriangle size={22} />
            </div>
            <div className="stat-info">
              <h3>{stats.totalIncidents}</h3>
              <p>{t('Total Incidents')}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' }}>
              <CheckCircle size={22} />
            </div>
            <div className="stat-info">
              <h3>{stats.resolved}</h3>
              <p>{t('Resolved')}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(33, 150, 243, 0.2)', color: '#2196f3' }}>
              <Clock size={22} />
            </div>
            <div className="stat-info">
              <h3>{stats.avgResponseTime}</h3>
              <p>{t('Avg Response')}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(255, 152, 0, 0.2)', color: '#ff9800' }}>
              <BarChart3 size={22} />
            </div>
            <div className="stat-info">
              <h3>{stats.active}</h3>
              <p>{t('Active Cases')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="incident-main">
        {/* Filters Bar */}
        <div className="filters-bar">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t('Search incidents placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <Filter size={18} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="type-filter-dropdown"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="dropdown-arrow" />
            </div>

            <div className="filter-group">
              <AlertTriangle size={18} />
              <select
                value={activeSeverityFilter}
                onChange={(e) => setActiveSeverityFilter(e.target.value)}
                className="severity-filter-dropdown"
              >
                {severityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="dropdown-arrow" />
            </div>

            <button 
              className="reset-filters-btn"
              onClick={() => {
                setFilter('all');
                setActiveSeverityFilter('all');
                setSearchTerm('');
              }}
            >
              {t('Clear Filters')}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stats-card">
            <h3>{t('Severity Distribution')}</h3>
            <div className="severity-stats">
              <div className="severity-stat">
                <span className="severity-dot" style={{ backgroundColor: '#ef5350' }}></span>
                <span className="severity-label">Critical</span>
                <span className="severity-count">{stats.bySeverity.Critical}</span>
              </div>
              <div className="severity-stat">
                <span className="severity-dot" style={{ backgroundColor: '#ff9800' }}></span>
                <span className="severity-label">High</span>
                <span className="severity-count">{stats.bySeverity.High}</span>
              </div>
              <div className="severity-stat">
                <span className="severity-dot" style={{ backgroundColor: '#ffb74d' }}></span>
                <span className="severity-label">Medium</span>
                <span className="severity-count">{stats.bySeverity.Medium}</span>
              </div>
              <div className="severity-stat">
                <span className="severity-dot" style={{ backgroundColor: '#4caf50' }}></span>
                <span className="severity-label">Low</span>
                <span className="severity-count">{stats.bySeverity.Low}</span>
              </div>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-header">
              <TrendingUp size={20} />
              <h3>{t('Quick Insights')}</h3>
            </div>
            <div className="info-content">
              <p>• Avg Response Time: <strong>{stats.avgResponseTime}</strong></p>
              <p>• Resolution Rate: <strong>{stats.totalIncidents > 0 ? ((stats.resolved / stats.totalIncidents) * 100).toFixed(1) : '0'}%</strong></p>
              <p>• Last Updated: <strong>{formatLastUpdated(lastUpdated)}</strong></p>
            </div>
          </div>
        </div>

        {/* Incidents List */}
        <div className="incidents-container">
          <div className="incidents-header">
            <h2>
              <FileText size={24} />
              {t('Recent Incidents')}
              <span className="results-count">
                ({filteredIncidents.length} of {incidents.length})
              </span>
            </h2>
            <div className="header-actions">
              <button 
                className="select-all-btn"
                onClick={() => {
                  if (selectedIncidents.length === filteredIncidents.length) {
                    setSelectedIncidents([]);
                  } else {
                    setSelectedIncidents(filteredIncidents.map(incident => incident.id));
                  }
                }}
              >
                {selectedIncidents.length === filteredIncidents.length && filteredIncidents.length > 0 
                  ? t('Deselect All') 
                  : t('Select All')}
              </button>
            </div>
          </div>

          {filteredIncidents.length === 0 ? (
            <div className="empty-state">
              <AlertTriangle size={48} />
              <h3>{t('No incidents found')}</h3>
              <p>{t('Try adjusting search or filters')}</p>
              <button 
                className="reset-search-btn"
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                  setActiveSeverityFilter('all');
                }}
              >
                {t('Clear Filters')}
              </button>
            </div>
          ) : (
            <div className="incidents-list">
              {filteredIncidents.map(incident => (
                <div 
                  key={incident.id} 
                  className={`incident-card ${expandedIncident === incident.id ? 'expanded' : ''}`}
                >
                  <div className="incident-summary">
                    <div className="summary-left">
                      <input
                        type="checkbox"
                        checked={selectedIncidents.includes(incident.id)}
                        onChange={() => toggleSelectIncident(incident.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="incident-checkbox"
                      />
                      <div 
                        className="incident-type-icon"
                        style={{ backgroundColor: `${severityColors[incident.severity]}20`, color: severityColors[incident.severity] }}
                      >
                        {incident.type === 'Traffic Accident' ? <Car size={20} /> :
                         incident.type === 'Medical Emergency' ? <Activity size={20} /> :
                         incident.type === 'Fire' ? <Flame size={20} /> :
                         incident.type === 'Public Safety' ? <Shield size={20} /> :
                         incident.type === 'Search & Rescue' ? <Users size={20} /> :
                         <AlertTriangle size={20} />}
                      </div>
                      <div className="incident-info">
                        <div className="info-header">
                          <h3 className="incident-title">{incident.title}</h3>
                          <div className="incident-badges">
                            <span 
                              className="severity-badge"
                              style={{ backgroundColor: severityColors[incident.severity] }}
                            >
                              {incident.severity}
                            </span>
                            <span 
                              className="status-badge"
                              style={{ backgroundColor: statusColors[incident.status] }}
                            >
                              {incident.status}
                            </span>
                          </div>
                        </div>
                        <div className="info-meta">
                          <span className="meta-item">
                            <Calendar size={14} />
                            {incident.date} at {incident.time}
                          </span>
                          <span className="meta-item">
                            <MapPin size={14} />
                            {incident.location}
                          </span>
                          <span className="meta-item">
                            <Clock size={14} />
                            Response: {incident.responseTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="summary-right">
                      <button 
                        className="expand-btn"
                        onClick={() => toggleIncident(incident.id)}
                      >
                        {expandedIncident === incident.id ? 
                          <ChevronUp size={20} /> : 
                          <ChevronDown size={20} />
                        }
                      </button>
                    </div>
                  </div>

                  {expandedIncident === incident.id && (
                    <div className="incident-details">
                      <div className="details-section">
                        <h4>Incident Details</h4>
                        <p className="incident-description">{incident.description}</p>
                      </div>
                      
                      <div className="details-grid">
                        <div className="detail-group">
                          <div className="detail-item">
                            <span className="detail-label">Priority:</span>
                            <span className="detail-value">{incident.priority}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Response Time:</span>
                            <span className="detail-value">{incident.responseTime}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Casualties:</span>
                            <span className="detail-value">{incident.casualties}</span>
                          </div>
                        </div>
                        
                        <div className="detail-group">
                          <div className="detail-item">
                            <span className="detail-label">Units Involved:</span>
                            <div className="units-list">
                              {incident.unitsInvolved.map((unit, index) => (
                                <span key={index} className="unit-tag">{unit}</span>
                              ))}
                            </div>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Damage Level:</span>
                            <span className="detail-value">{incident.damage}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Coordinates:</span>
                            <span className="detail-value">{incident.coordinates}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="details-actions">
                        <button className="action-btn view-btn">
                          <Eye size={16} />
                          {t('View Full Report')}
                        </button>
                        <button className="action-btn map-btn">
                          <MapPin size={16} />
                          {t('View on Map')}
                        </button>
                        <button className="action-btn share-btn">
                          {t('Share')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="incident-footer">
        <div className="footer-content">
          <div className="footer-info">
            <span className="update-info">
              {t('Last updated')}: {t('Today at')} {formatLastUpdated(lastUpdated)}
            </span>
            <span className="selection-info">
              {selectedIncidents.length > 0 && `${selectedIncidents.length} ${t('selected')}`}
            </span>
          </div>
          <div className="footer-actions">
            <button 
              className="reset-data-btn"
              onClick={handleResetData}
            >
              {t('Reset Data')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IncidentHistoryPage;
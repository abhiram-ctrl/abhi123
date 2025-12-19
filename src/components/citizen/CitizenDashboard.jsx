import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './CitizenDashboard.css';
import { useTranslation } from 'react-i18next';
import { incidentService } from '../../services/incidentService';
import { socketService } from '../../services/socket';
import LanguageSwitcher from '../LanguageSwitcher';
import HeatMap from '../HeatMap';
import { FaMap, FaList } from 'react-icons/fa';

function CitizenDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [helpers, setHelpers] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        const storedUserData = localStorage.getItem('userData');
        const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;
        const userId = parsedUserData?.id || localStorage.getItem('userId') || 'user-123';
        
        setUserData({
          id: userId,
          name: parsedUserData?.name || 'Demo User',
          email: parsedUserData?.email || 'user@demo.com'
        });
        
        // Fetch real incidents from backend
        try {
          const response = await incidentService.getUserIncidents(userId);
          // Backend returns { success: true, data: [...] }
          const list = response?.data || [];
          if (Array.isArray(list)) {
            setRecentIncidents(list.slice(0, 5));
          } else {
            setRecentIncidents([]);
          }
        } catch (incidentErr) {
          console.log('Could not fetch incidents:', incidentErr.message);
          setRecentIncidents([]);
        }

        // Fetch helpers (volunteers available to help nearby)
        try {
          const helpersResponse = await incidentService.getAvailableHelpers?.(userId);
          const helpersList = helpersResponse?.data || [];
          if (Array.isArray(helpersList)) {
            setHelpers(helpersList.slice(0, 10));
          } else {
            setHelpers([]);
          }
        } catch (helpersErr) {
          console.log('Could not fetch helpers:', helpersErr.message);
          setHelpers([]);
        }
        
      } catch (err) {
        console.error('Error:', err);
        setError('Demo mode active - using local data');
        
        const storedUserData = localStorage.getItem('userData');
        const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;
        
        setUserData({
          name: parsedUserData?.name || 'Demo User',
          email: parsedUserData?.email || 'demo@example.com'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Socket connection for real-time volunteer notifications
  useEffect(() => {
    if (!userData?.id) return;

    try {
      const socket = socketService.connect();
      
      socket.on('connect', () => {
        console.log('Citizen dashboard connected to socket');
      });

      // Listen for volunteer assignment notifications
      socket.on(`citizen-notification-${userData.id}`, (notificationData) => {
        console.log('Received volunteer notification:', notificationData);
        setNotification(notificationData);
        
        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Volunteer Assigned!', {
            body: notificationData.message,
            icon: '/logo.png'
          });
        }
        
        // Auto-hide notification after 10 seconds
        setTimeout(() => {
          setNotification(null);
        }, 10000);
      });

      return () => {
        socketService.disconnect();
      };
    } catch (error) {
      console.log('Socket connection error (non-critical):', error);
    }
  }, [userData?.id]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('savedEmail');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>{t('Loading...')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>{t('Retry')}</button>
      </div>
    );
  }

  return (
    <div className="citizen-dashboard">
      {/* Volunteer Notification Banner */}
      {notification && (
        <div className="volunteer-notification-banner">
          <div className="notification-content">
            <div className="notification-icon">🚨</div>
            <div className="notification-message">
              <h3>Help is on the way!</h3>
              <p>{notification.message}</p>
              {notification.volunteerPhone && (
                <p className="volunteer-contact">
                  <strong>Contact Volunteer:</strong> 
                  <a href={`tel:${notification.volunteerPhone}`}>{notification.volunteerPhone}</a>
                </p>
              )}
            </div>
            <button 
              className="notification-close"
              onClick={() => setNotification(null)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <header className="dashboard-header">
        <div className="user-info">
          <h1>{t('Citizen Dashboard')}</h1>
          {userData && (
            <div className="user-details">
              <p>{t('Welcome')}, <strong>{userData.name || userData.email}</strong></p>
              <p className="user-status">
                {t('Status')}: <span className="status-active">{t('Active')}</span>
              </p>
            </div>
          )}
        </div>
        <div className="header-actions">
          <button 
            className={`view-toggle-btn ${showHeatMap ? 'active' : ''}`}
            onClick={() => setShowHeatMap(!showHeatMap)}
            title="Toggle heatmap view"
          >
            {showHeatMap ? <FaList /> : <FaMap />}
            {showHeatMap ? 'List View' : 'Map View'}
          </button>
          <LanguageSwitcher />
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            aria-label="Logout"
          >
            {t('Logout')}
          </button>
        </div>
      </header>

      {/* HeatMap View */}
      {showHeatMap && (
        <div className="heatmap-view">
          <HeatMap 
            mode="citizen"
            incidents={recentIncidents}
            helpers={helpers}
            height="70vh"
          />
        </div>
      )}

      <div className="quick-actions">
        <div className="action-card sos-action" onClick={() => navigate('/citizen/sos')}>
          <div className="action-icon">🚨</div>
          <h2>{t('SOS Emergency')}</h2>
          <p>{t('Send immediate distress signal')}</p>
          <button className="action-btn sos-btn">{t('Activate SOS')}</button>
        </div>

        <div className="action-card" onClick={() => navigate('/citizen/report-risk')}>
          <div className="action-icon">⚠️</div>
          <h2>{t('Report Risk')}</h2>
          <p>{t('Report suspicious activity')}</p>
          <button className="action-btn risk-btn">{t('Report Now')}</button>
        </div>

        <div className="action-card" onClick={() => navigate('/citizen/contacts')}>
          <div className="action-icon">📞</div>
          <h2>{t('Emergency Contacts')}</h2>
          <p>{t('Manage your emergency contacts')}</p>
          <button className="action-btn contacts-btn">{t('Manage Contacts')}</button>
        </div>

        <div className="action-card" onClick={() => navigate('/citizen/incident-history')}>
          <div className="action-icon">📜</div>
          <h2>{t('Incident History')}</h2>
          <p>{t('View your past incidents')}</p>
          <button className="action-btn history-btn">{t('View History')}</button>
        </div>
      </div>

      {recentIncidents && recentIncidents.length > 0 && (
        <div className="recent-activity">
          <h3>{t('Recent Activity')}</h3>
          <ul>
            {recentIncidents.slice(0, 5).map((incident) => (
              <li key={incident._id || incident.id} className="activity-item" onClick={() => navigate('/citizen/incident-history')}>
                <span className={`status-indicator status-${(incident.status || 'pending').toLowerCase()}`}></span>
                <div className="activity-details">
                  <p className="activity-title">
                    <strong>{incident.type === 'SOS' ? t('SOS Emergency') : t('Risk Report')}</strong> - {incident.description?.substring(0, 50) || t('No description')}...
                  </p>
                  <p className="activity-time">
                    {incident.createdAt ? new Date(incident.createdAt).toLocaleDateString() : t('Recently')}
                    {' • '}
                    <span className={`status-badge ${incident.status}`}>{incident.status ? t(incident.status.charAt(0).toUpperCase() + incident.status.slice(1)) : t('Pending')}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <button className="view-all-btn" onClick={() => navigate('/citizen/incident-history')}>
            {t('View All Incidents')} →
          </button>
        </div>
      )}
    </div>
  );
}

export default CitizenDashboard;